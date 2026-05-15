"""
应用配置管理模块

使用 pydantic-settings 管理所有配置项，支持环境变量和 .env 文件。
"""

from functools import lru_cache
from typing import List, Optional

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class ServerSettings(BaseSettings):
    """服务器相关配置"""

    host: str = Field(default="0.0.0.0", description="服务监听地址")
    port: int = Field(default=8000, description="服务监听端口")
    workers: int = Field(default=1, description="工作进程数")
    debug: bool = Field(default=False, description="调试模式")
    api_prefix: str = Field(default="/api/v1", description="API 路径前缀")
    cors_origins: List[str] = Field(
        default=["*"], description="允许的 CORS 来源"
    )


class ModelSettings(BaseSettings):
    """模型相关配置"""

    device: str = Field(default="gpu:0", description="推理设备 (gpu:0, cpu 等)")
    pipeline_version: str = Field(
        default="v1.5", description="PaddleOCR-VL 版本 (v1 / v1.5)"
    )
    use_doc_orientation_classify: bool = Field(
        default=False, description="是否使用文档方向分类"
    )
    use_doc_unwarping: bool = Field(
        default=False, description="是否使用文档矫正"
    )
    use_layout_detection: bool = Field(
        default=True, description="是否使用版面检测"
    )
    use_seal_recognition: bool = Field(
        default=False, description="是否使用印章识别"
    )
    use_chart_recognition: bool = Field(
        default=False, description="是否使用图表识别"
    )
    precision: str = Field(default="fp16", description="推理精度 (fp32 / fp16)")
    enable_hpi: bool = Field(default=False, description="是否启用高性能推理")
    use_tensorrt: bool = Field(
        default=False, description="是否使用 TensorRT 加速"
    )
    model_warmup: bool = Field(default=True, description="启动时是否预热模型")
    max_pixels: Optional[int] = Field(
        default=None, description="VL模型预处理图像时允许的最大像素数"
    )
    min_pixels: Optional[int] = Field(
        default=None, description="VL模型预处理图像时允许的最小像素数"
    )


class AuthSettings(BaseSettings):
    """认证相关配置"""

    enabled: bool = Field(default=True, description="是否启用 API Key 认证")
    api_keys: List[str] = Field(
        default=[], description="允许的 API Key 列表"
    )
    api_key_header: str = Field(
        default="X-API-Key", description="API Key 请求头名称"
    )


class RateLimitSettings(BaseSettings):
    """限流相关配置"""

    enabled: bool = Field(default=True, description="是否启用限流")
    requests_per_minute: int = Field(
        default=60, description="每分钟最大请求数"
    )
    requests_per_day: int = Field(
        default=10000, description="每天最大请求数"
    )
    burst_size: int = Field(default=10, description="突发请求数上限")


class LogSettings(BaseSettings):
    """日志相关配置"""

    level: str = Field(default="INFO", description="日志级别")
    format: str = Field(
        default="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        description="日志格式",
    )
    file: Optional[str] = Field(
        default="logs/ocr_server.log", description="日志文件路径"
    )
    rotation: str = Field(
        default="10 MB", description="日志轮转大小"
    )
    retention: str = Field(
        default="30 days", description="日志保留时间"
    )


class StorageSettings(BaseSettings):
    """存储相关配置"""

    temp_dir: str = Field(default="temp", description="临时文件目录")
    output_dir: str = Field(default="output", description="输出文件目录")
    max_upload_size: int = Field(
        default=20 * 1024 * 1024, description="最大上传文件大小 (字节)"
    )
    allowed_extensions: List[str] = Field(
        default=[".jpg", ".jpeg", ".png", ".bmp", ".tiff", ".tif", ".pdf", ".webp"],
        description="允许的文件扩展名",
    )


class Settings(BaseSettings):
    """应用总配置"""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        env_nested_delimiter="__",
        case_sensitive=False,
        extra="ignore",
    )

    app_name: str = Field(default="PaddleOCR-VL Server", description="应用名称")
    app_version: str = Field(default="1.0.0", description="应用版本号")

    server: ServerSettings = Field(default_factory=ServerSettings)
    model: ModelSettings = Field(default_factory=ModelSettings)
    auth: AuthSettings = Field(default_factory=AuthSettings)
    rate_limit: RateLimitSettings = Field(default_factory=RateLimitSettings)
    log: LogSettings = Field(default_factory=LogSettings)
    storage: StorageSettings = Field(default_factory=StorageSettings)


@lru_cache()
def get_settings() -> Settings:
    """获取全局配置单例"""
    return Settings()
