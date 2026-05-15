"""
API Key 认证中间件

支持通过请求头或查询参数传递 API Key。
兼容百度云 OCR 的 access_token 参数认证方式。
"""

import hashlib
import secrets
import time
from typing import Optional

from fastapi import HTTPException, Request, Security
from fastapi.security import APIKeyHeader, APIKeyQuery
from loguru import logger
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

from app.config import AuthSettings


# API Key 可以通过 Header 或 Query 参数传递
api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)
api_key_query = APIKeyQuery(name="access_token", auto_error=False)


class AuthManager:
    """
    认证管理器。

    管理 API Key 的验证和生成。
    """

    def __init__(self, settings: AuthSettings):
        self._settings = settings
        self._api_keys = set(settings.api_keys)
        logger.info(
            "AuthManager 初始化完成，认证状态: {}, API Key 数量: {}",
            "启用" if settings.enabled else "禁用",
            len(self._api_keys),
        )

    @property
    def is_enabled(self) -> bool:
        return self._settings.enabled

    def validate_key(self, api_key: str) -> bool:
        """验证 API Key 是否有效"""
        if not self._settings.enabled:
            return True
        return api_key in self._api_keys

    def add_key(self, api_key: str) -> None:
        """添加新的 API Key"""
        self._api_keys.add(api_key)

    def remove_key(self, api_key: str) -> None:
        """移除 API Key"""
        self._api_keys.discard(api_key)

    @staticmethod
    def generate_key() -> str:
        """生成一个新的 API Key"""
        return secrets.token_urlsafe(32)


class AuthMiddleware(BaseHTTPMiddleware):
    """
    认证中间件。

    拦截所有需要认证的请求，验证 API Key。
    """

    # 不需要认证的路径
    EXEMPT_PATHS = {
        "/",
        "/health",
        "/docs",
        "/redoc",
        "/openapi.json",
        "/api/v1/token",
    }

    # 不需要认证的路径前缀
    EXEMPT_PREFIXES = ("/static/",)

    def __init__(self, app, auth_manager: AuthManager):
        super().__init__(app)
        self._auth_manager = auth_manager

    async def dispatch(self, request: Request, call_next):
        # OPTIONS 预检请求直接放行（CORS 需要）
        if request.method == "OPTIONS":
            return await call_next(request)

        # 跳过不需要认证的路径
        path = request.url.path
        if path in self.EXEMPT_PATHS:
            return await call_next(request)

        # 跳过不需要认证的路径前缀（静态资源等）
        if any(path.startswith(prefix) for prefix in self.EXEMPT_PREFIXES):
            return await call_next(request)

        # 如果认证未启用，直接放行
        if not self._auth_manager.is_enabled:
            return await call_next(request)

        # 从 Header 获取 API Key
        api_key = request.headers.get("X-API-Key")

        # 如果 Header 中没有，尝试从 Query 参数获取 (兼容百度云方式)
        if not api_key:
            api_key = request.query_params.get("access_token")

        if not api_key:
            return JSONResponse(
                status_code=401,
                content={
                    "error_code": 110,
                    "error_msg": "Access token invalid or no longer valid",
                },
            )

        if not self._auth_manager.validate_key(api_key):
            logger.warning(
                "无效的 API Key 请求: {} 来自 {}",
                api_key[:8] + "...",
                request.client.host if request.client else "unknown",
            )
            return JSONResponse(
                status_code=403,
                content={
                    "error_code": 111,
                    "error_msg": "Access token expired",
                },
            )

        return await call_next(request)
