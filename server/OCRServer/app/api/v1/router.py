"""
API v1 路由模块

注册所有 v1 版本的 API 端点。
"""

from fastapi import APIRouter

from app.api.v1.ocr import router as ocr_router

router = APIRouter(prefix="/api/v1")

# 注册子路由
router.include_router(ocr_router, tags=["OCR"])
