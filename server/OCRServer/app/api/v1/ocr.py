"""
OCR API 端点

提供类似百度云 OCR 的 RESTful API 接口。
"""

import secrets
import time
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from loguru import logger

from app.api.v1.schemas import (
    AccurateOCRRequest,
    DocumentParseRequest,
    FormulaRecognitionRequest,
    GeneralOCRRequest,
    HealthCheckResponse,
    SealRecognitionRequest,
    TableRecognitionRequest,
    TokenResponse,
)
from app.config import get_settings
from app.dependencies import get_auth_manager, get_model_manager, get_ocr_service
from app.middleware.auth import AuthManager
from app.middleware.error_handler import OCRException
from app.models.ocr_result import (
    DocumentParseResponse,
    FormulaRecognitionResponse,
    OCRResponse,
    TableRecognitionResponse,
)
from app.services.model_manager import ModelManager
from app.services.ocr_service import OCRService
from app.utils.image_utils import get_image_info, validate_image_format

router = APIRouter()


# ==================== 健康检查 ====================


@router.get(
    "/health",
    response_model=HealthCheckResponse,
    summary="健康检查",
    description="检查服务状态、模型加载状态和 GPU 可用性",
)
async def health_check(
    model_manager: ModelManager = Depends(get_model_manager),
):
    settings = get_settings()
    health = model_manager.health_check()
    return HealthCheckResponse(
        status="healthy" if health["model_loaded"] else "degraded",
        model_loaded=health["model_loaded"],
        gpu_available=health.get("gpu_available", False),
        gpu_count=health.get("gpu_count", 0),
        model_info=health.get("model_info", {}),
        version=settings.app_version,
    )


# ==================== 认证 ====================


@router.get(
    "/token",
    response_model=TokenResponse,
    summary="获取访问令牌",
    description="兼容百度云 OAuth 认证方式，获取 access_token",
)
async def get_token(
    grant_type: str = "client_credentials",
    client_id: Optional[str] = None,
    client_secret: Optional[str] = None,
    auth_manager: AuthManager = Depends(get_auth_manager),
):
    """
    获取访问令牌（兼容百度云认证流程）。

    实际使用中，API Key 直接在 .env 中配置。
    此接口提供兼容性支持。
    """
    if not auth_manager.is_enabled:
        # 认证未启用时返回一个固定的 token
        return TokenResponse(
            access_token="auth_disabled_token",
            expires_in=2592000,
            scope="all",
        )

    # 生成一个新的临时 API Key
    new_key = auth_manager.generate_key()
    auth_manager.add_key(new_key)

    return TokenResponse(
        access_token=new_key,
        expires_in=2592000,  # 30 天
        scope="all",
    )


# ==================== 通用文字识别 ====================


@router.post(
    "/ocr/general_basic",
    response_model=OCRResponse,
    summary="通用文字识别",
    description="对标百度云通用文字识别（标准版），识别图片中的文字信息",
)
async def general_basic_ocr(
    request: GeneralOCRRequest,
    ocr_service: OCRService = Depends(get_ocr_service),
):
    _validate_image_input(request.image, request.url)

    return await ocr_service.general_ocr(
        image_base64=request.image,
        image_url=request.url,
        detect_direction=request.detect_direction,
    )


@router.post(
    "/ocr/accurate_basic",
    response_model=OCRResponse,
    summary="高精度文字识别",
    description="对标百度云通用文字识别（高精度版），提供更高精度的文字识别",
)
async def accurate_basic_ocr(
    request: AccurateOCRRequest,
    ocr_service: OCRService = Depends(get_ocr_service),
):
    _validate_image_input(request.image, request.url)

    return await ocr_service.accurate_ocr(
        image_base64=request.image,
        image_url=request.url,
        detect_direction=request.detect_direction,
    )


# ==================== 文件上传方式的通用识别 ====================


@router.post(
    "/ocr/general_basic/upload",
    response_model=OCRResponse,
    summary="通用文字识别（文件上传）",
    description="通过上传文件的方式进行通用文字识别",
)
async def general_basic_ocr_upload(
    file: UploadFile = File(..., description="待识别的图像文件"),
    detect_direction: bool = Form(False, description="是否检测图像方向"),
    ocr_service: OCRService = Depends(get_ocr_service),
):
    settings = get_settings()

    # 验证文件格式
    if file.filename and not validate_image_format(
        file.filename, settings.storage.allowed_extensions
    ):
        raise OCRException(
            error_code=216201,
            error_msg=f"不支持的文件格式，允许: {', '.join(settings.storage.allowed_extensions)}",
        )

    # 读取文件
    content = await file.read()
    if len(content) == 0:
        raise OCRException(error_code=216200)
    if len(content) > settings.storage.max_upload_size:
        raise OCRException(
            error_code=216202,
            error_msg=f"文件大小超过限制 ({settings.storage.max_upload_size // 1024 // 1024} MB)",
        )

    import base64

    image_base64 = base64.b64encode(content).decode("utf-8")

    return await ocr_service.general_ocr(
        image_base64=image_base64,
        detect_direction=detect_direction,
    )


# ==================== 文档解析 ====================


@router.post(
    "/ocr/doc_parser",
    response_model=DocumentParseResponse,
    summary="文档解析",
    description="全功能文档解析，支持文字、表格、公式、图表的综合识别",
)
async def document_parse(
    request: DocumentParseRequest,
    ocr_service: OCRService = Depends(get_ocr_service),
):
    _validate_image_input(request.image, request.url)

    return await ocr_service.document_parse(
        image_base64=request.image,
        image_url=request.url,
        use_layout_detection=request.use_layout_detection,
        use_doc_orientation_classify=request.use_doc_orientation_classify,
        use_doc_unwarping=request.use_doc_unwarping,
        use_seal_recognition=request.use_seal_recognition,
        use_chart_recognition=request.use_chart_recognition,
        format_block_content=request.format_block_content,
        layout_shape_mode=request.layout_shape_mode,
    )


@router.post(
    "/ocr/doc_parser/upload",
    response_model=DocumentParseResponse,
    summary="文档解析（文件上传）",
    description="通过上传文件的方式进行文档解析",
)
async def document_parse_upload(
    file: UploadFile = File(..., description="待解析的文档文件"),
    use_layout_detection: Optional[bool] = Form(None),
    use_doc_orientation_classify: Optional[bool] = Form(None),
    use_doc_unwarping: Optional[bool] = Form(None),
    format_block_content: bool = Form(False),
    ocr_service: OCRService = Depends(get_ocr_service),
):
    settings = get_settings()

    if file.filename and not validate_image_format(
        file.filename, settings.storage.allowed_extensions
    ):
        raise OCRException(
            error_code=216201,
            error_msg=f"不支持的文件格式，允许: {', '.join(settings.storage.allowed_extensions)}",
        )

    content = await file.read()
    if len(content) == 0:
        raise OCRException(error_code=216200)
    if len(content) > settings.storage.max_upload_size:
        raise OCRException(error_code=216202)

    import base64

    image_base64 = base64.b64encode(content).decode("utf-8")

    return await ocr_service.document_parse(
        image_base64=image_base64,
        use_layout_detection=use_layout_detection,
        use_doc_orientation_classify=use_doc_orientation_classify,
        use_doc_unwarping=use_doc_unwarping,
        format_block_content=format_block_content,
    )


# ==================== 表格识别 ====================


@router.post(
    "/ocr/table",
    response_model=TableRecognitionResponse,
    summary="表格识别",
    description="识别图片中的表格内容，返回 HTML 或 Markdown 格式",
)
async def table_recognition(
    request: TableRecognitionRequest,
    ocr_service: OCRService = Depends(get_ocr_service),
):
    _validate_image_input(request.image, request.url)

    return await ocr_service.table_recognition(
        image_base64=request.image,
        image_url=request.url,
    )


# ==================== 公式识别 ====================


@router.post(
    "/ocr/formula",
    response_model=FormulaRecognitionResponse,
    summary="公式识别",
    description="识别图片中的数学公式，返回 LaTeX 格式",
)
async def formula_recognition(
    request: FormulaRecognitionRequest,
    ocr_service: OCRService = Depends(get_ocr_service),
):
    _validate_image_input(request.image, request.url)

    return await ocr_service.formula_recognition(
        image_base64=request.image,
        image_url=request.url,
    )


# ==================== 印章识别 ====================


@router.post(
    "/ocr/seal",
    response_model=OCRResponse,
    summary="印章识别",
    description="识别图片中的印章内容（PaddleOCR-VL-1.5 新增功能）",
)
async def seal_recognition(
    request: SealRecognitionRequest,
    ocr_service: OCRService = Depends(get_ocr_service),
):
    _validate_image_input(request.image, request.url)

    return await ocr_service.seal_recognition(
        image_base64=request.image,
        image_url=request.url,
    )


# ==================== 模型管理 ====================


@router.post(
    "/model/reload",
    summary="重载模型",
    description="重新加载 OCR 模型（管理接口）",
)
async def reload_model(
    model_manager: ModelManager = Depends(get_model_manager),
):
    try:
        model_manager.reload_model()
        return {"status": "success", "message": "模型重载成功"}
    except Exception as e:
        raise OCRException(
            error_code=282000,
            error_msg=f"模型重载失败: {str(e)}",
            status_code=500,
        )


@router.get(
    "/model/info",
    summary="模型信息",
    description="获取当前加载的模型详细信息",
)
async def model_info(
    model_manager: ModelManager = Depends(get_model_manager),
):
    return model_manager.health_check()


# ==================== 辅助函数 ====================


def _validate_image_input(
    image_base64: Optional[str], image_url: Optional[str]
) -> None:
    """验证图像输入参数"""
    if not image_base64 and not image_url:
        raise OCRException(
            error_code=216101,
            error_msg="必须提供 image (Base64) 或 url 参数之一",
        )
