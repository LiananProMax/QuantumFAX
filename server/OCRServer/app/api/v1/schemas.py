"""
API 请求/响应数据模型

定义所有 API 端点的请求和响应 Schema。
"""

from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class ImageSource(str, Enum):
    """图像来源类型"""

    BASE64 = "base64"
    URL = "url"


class OCRRequestBase(BaseModel):
    """OCR 请求基类"""

    image: Optional[str] = Field(
        default=None,
        description="Base64 编码的图像数据",
    )
    url: Optional[str] = Field(
        default=None,
        description="图像 URL 地址",
    )

    def get_image_source(self) -> ImageSource:
        if self.image:
            return ImageSource.BASE64
        elif self.url:
            return ImageSource.URL
        raise ValueError("必须提供 image (Base64) 或 url 参数之一")


class GeneralOCRRequest(OCRRequestBase):
    """通用文字识别请求（兼容百度云 general_basic）"""

    detect_direction: bool = Field(
        default=False, description="是否检测图像方向"
    )
    language_type: str = Field(
        default="CHN_ENG", description="语言类型"
    )
    paragraph: bool = Field(
        default=False, description="是否输出段落信息"
    )
    probability: bool = Field(
        default=False, description="是否返回识别置信度"
    )


class AccurateOCRRequest(OCRRequestBase):
    """高精度文字识别请求（兼容百度云 accurate_basic）"""

    detect_direction: bool = Field(
        default=False, description="是否检测图像方向"
    )
    language_type: str = Field(
        default="CHN_ENG", description="语言类型"
    )
    paragraph: bool = Field(
        default=False, description="是否输出段落信息"
    )
    probability: bool = Field(
        default=False, description="是否返回识别置信度"
    )


class DocumentParseRequest(OCRRequestBase):
    """文档解析请求"""

    use_layout_detection: Optional[bool] = Field(
        default=None, description="是否使用版面检测"
    )
    use_doc_orientation_classify: Optional[bool] = Field(
        default=None, description="是否使用文档方向分类"
    )
    use_doc_unwarping: Optional[bool] = Field(
        default=None, description="是否使用文档矫正"
    )
    use_seal_recognition: Optional[bool] = Field(
        default=None, description="是否使用印章识别"
    )
    use_chart_recognition: Optional[bool] = Field(
        default=None, description="是否使用图表识别"
    )
    format_block_content: bool = Field(
        default=False, description="是否格式化为 Markdown"
    )
    layout_shape_mode: str = Field(
        default="auto",
        description="版面检测形状模式 (rect / quad / poly / auto)",
    )


class TableRecognitionRequest(OCRRequestBase):
    """表格识别请求"""

    pass


class FormulaRecognitionRequest(OCRRequestBase):
    """公式识别请求"""

    pass


class SealRecognitionRequest(OCRRequestBase):
    """印章识别请求"""

    pass


class HealthCheckResponse(BaseModel):
    """健康检查响应"""

    status: str = Field(description="服务状态")
    model_loaded: bool = Field(description="模型是否加载")
    gpu_available: bool = Field(description="GPU 是否可用")
    gpu_count: int = Field(default=0, description="GPU 数量")
    model_info: dict = Field(default_factory=dict, description="模型信息")
    version: str = Field(description="服务版本号")


class TokenResponse(BaseModel):
    """令牌响应（兼容百度云认证流程）"""

    access_token: str = Field(description="访问令牌")
    expires_in: int = Field(description="过期时间 (秒)")
    scope: str = Field(default="all", description="权限范围")
