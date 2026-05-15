"""
依赖注入模块

集中管理所有依赖项的创建和注入。
"""

from functools import lru_cache

from app.config import Settings, get_settings
from app.middleware.auth import AuthManager
from app.middleware.rate_limiter import RateLimiter
from app.services.model_manager import ModelManager
from app.services.ocr_service import OCRService


@lru_cache()
def get_model_manager() -> ModelManager:
    """获取模型管理器单例"""
    settings = get_settings()
    return ModelManager(settings.model)


@lru_cache()
def get_ocr_service() -> OCRService:
    """获取 OCR 服务单例"""
    model_manager = get_model_manager()
    return OCRService(model_manager)


@lru_cache()
def get_auth_manager() -> AuthManager:
    """获取认证管理器单例"""
    settings = get_settings()
    return AuthManager(settings.auth)


@lru_cache()
def get_rate_limiter() -> RateLimiter:
    """获取速率限制器单例"""
    settings = get_settings()
    return RateLimiter(settings.rate_limit)
