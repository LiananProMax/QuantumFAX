"""
PaddleOCR-VL Server 主应用入口

基于 FastAPI 构建的高性能 OCR 服务，使用 PaddleOCR-VL-1.5 模型。
"""

import time
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from loguru import logger

from app.api.v1.router import router as v1_router
from app.config import get_settings
from app.dependencies import get_auth_manager, get_model_manager, get_rate_limiter
from app.middleware.auth import AuthMiddleware
from app.middleware.error_handler import setup_exception_handlers
from app.middleware.rate_limiter import RateLimitMiddleware
from app.utils.logger import setup_logger


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    settings = get_settings()

    # 初始化日志
    setup_logger(
        level=settings.log.level,
        log_file=settings.log.file,
        rotation=settings.log.rotation,
        retention=settings.log.retention,
    )

    logger.info("=" * 60)
    logger.info("  {} v{}", settings.app_name, settings.app_version)
    logger.info("=" * 60)
    logger.info("启动配置:")
    logger.info("  设备: {}", settings.model.device)
    logger.info("  模型版本: {}", settings.model.pipeline_version)
    logger.info("  精度: {}", settings.model.precision)
    logger.info("  认证: {}", "启用" if settings.auth.enabled else "禁用")
    logger.info("  限流: {}", "启用" if settings.rate_limit.enabled else "禁用")

    # 加载模型
    model_manager = get_model_manager()
    try:
        model_manager.load_model()
        if settings.model.model_warmup:
            model_manager.warmup()
        logger.info("模型加载完成，服务就绪")
    except Exception as e:
        logger.error("模型加载失败: {}. 服务将在降级模式下运行", str(e))

    # 如果认证启用但没有配置 API Key，自动生成一个
    if settings.auth.enabled and not settings.auth.api_keys:
        auth_manager = get_auth_manager()
        auto_key = auth_manager.generate_key()
        auth_manager.add_key(auto_key)
        logger.info("=" * 60)
        logger.info("  自动生成的 API Key (请保存):")
        logger.info("  {}", auto_key)
        logger.info("=" * 60)

    yield

    # 关闭时释放资源
    logger.info("正在关闭服务...")
    model_manager.unload_model()
    logger.info("服务已关闭")


def create_app() -> FastAPI:
    """创建 FastAPI 应用实例"""
    settings = get_settings()

    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        description=(
            "基于 PaddleOCR-VL-1.5 的高性能 OCR 服务。\n\n"
            "提供类似百度云 OCR 的 RESTful API，支持：\n"
            "- 通用文字识别（标准/高精度）\n"
            "- 文档解析（版面分析 + 内容识别）\n"
            "- 表格识别\n"
            "- 公式识别\n"
            "- 印章识别\n\n"
            "支持 GPU 加速推理，109 种语言识别。"
        ),
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
        lifespan=lifespan,
    )

    # ========== 中间件 (注意：添加顺序为执行逆序) ==========

    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.server.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # 限流中间件
    rate_limiter = get_rate_limiter()
    app.add_middleware(RateLimitMiddleware, rate_limiter=rate_limiter)

    # 认证中间件
    auth_manager = get_auth_manager()
    app.add_middleware(AuthMiddleware, auth_manager=auth_manager)

    # 请求日志中间件
    @app.middleware("http")
    async def log_requests(request: Request, call_next):
        start_time = time.time()
        response = await call_next(request)
        elapsed = (time.time() - start_time) * 1000

        logger.info(
            "{} {} - {} - {:.2f}ms",
            request.method,
            request.url.path,
            response.status_code,
            elapsed,
        )
        return response

    # ========== 异常处理 ==========
    setup_exception_handlers(app)

    # ========== 路由 ==========
    app.include_router(v1_router)

    # ========== 静态文件 & 前端页面 ==========
    static_dir = Path(__file__).resolve().parent.parent / "static"
    if static_dir.exists():
        app.mount(
            "/static",
            StaticFiles(directory=str(static_dir)),
            name="static",
        )

    # 根路径 — 返回前端页面
    @app.get("/", include_in_schema=False)
    async def root():
        index_file = static_dir / "index.html"
        if index_file.exists():
            return FileResponse(str(index_file), media_type="text/html")
        return {
            "service": settings.app_name,
            "version": settings.app_version,
            "docs": "/docs",
            "health": "/api/v1/health",
        }

    # 全局健康检查 (不需要认证)
    @app.get("/health", include_in_schema=False)
    async def global_health():
        model_manager = get_model_manager()
        health = model_manager.health_check()
        return {
            "status": "healthy" if health["model_loaded"] else "degraded",
            "model_loaded": health["model_loaded"],
        }

    return app


# 创建应用实例
app = create_app()
