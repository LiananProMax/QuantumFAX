"""
全局异常处理中间件

统一处理所有未捕获的异常，返回标准化的错误响应。
错误码设计兼容百度云 OCR API 的错误码规范。
"""

import traceback
import uuid

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from loguru import logger
from starlette.exceptions import HTTPException as StarletteHTTPException
from starlette.responses import JSONResponse


# 自定义错误码映射（兼容百度云）
ERROR_CODES = {
    # 通用错误
    1: "Unknown error",
    2: "Service temporarily unavailable",
    3: "Unsupported openapi method",
    4: "Open api request limit reached",
    6: "No permission to access data",
    13: "Get service token failed",
    14: "IAM Certification failed",
    17: "Open api daily request limit reached",
    18: "Open api qps request limit reached",
    19: "Open api total request limit reached",
    100: "Invalid parameter",
    110: "Access token invalid or no longer valid",
    111: "Access token expired",
    # OCR 特有错误
    216100: "Invalid param",
    216101: "Not enough param",
    216102: "Service not support",
    216110: "Appid not exist",
    216200: "Empty image",
    216201: "Image format error",
    216202: "Image size error",
    216203: "Image recognition error",
    216630: "Recognize error",
    216631: "Recognize bank card error",
    216633: "Recognize idcard error",
    216634: "Detect error",
    282000: "Internal error",
    282003: "Missing parameters: {parameter}",
    282005: "Batch processing error",
    282006: "Batch task limit reached",
    282110: "URL download timeout",
    282111: "URL response invalid",
    282112: "URL size error",
    282113: "URL download error",
    282114: "Image URL invalid",
}


class OCRException(Exception):
    """OCR 业务异常"""

    def __init__(
        self,
        error_code: int,
        error_msg: str | None = None,
        status_code: int = 400,
        **kwargs,
    ):
        self.error_code = error_code
        self.error_msg = error_msg or ERROR_CODES.get(
            error_code, "Unknown error"
        )
        # 支持消息中的参数替换
        if kwargs:
            self.error_msg = self.error_msg.format(**kwargs)
        self.status_code = status_code
        super().__init__(self.error_msg)


def setup_exception_handlers(app: FastAPI) -> None:
    """注册全局异常处理器"""

    @app.exception_handler(OCRException)
    async def ocr_exception_handler(
        request: Request, exc: OCRException
    ):
        log_id = uuid.uuid4().hex[:16]
        logger.error(
            "OCR 业务异常 [{}]: code={}, msg={}",
            log_id,
            exc.error_code,
            exc.error_msg,
        )
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "error_code": exc.error_code,
                "error_msg": exc.error_msg,
                "log_id": log_id,
            },
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(
        request: Request, exc: RequestValidationError
    ):
        log_id = uuid.uuid4().hex[:16]
        logger.warning(
            "请求参数验证失败 [{}]: {}", log_id, str(exc.errors())
        )
        errors = exc.errors()
        error_details = []
        for error in errors:
            field = " -> ".join(str(loc) for loc in error["loc"])
            error_details.append(f"{field}: {error['msg']}")

        return JSONResponse(
            status_code=400,
            content={
                "error_code": 216100,
                "error_msg": f"Invalid param: {'; '.join(error_details)}",
                "log_id": log_id,
            },
        )

    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(
        request: Request, exc: StarletteHTTPException
    ):
        log_id = uuid.uuid4().hex[:16]
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "error_code": exc.status_code,
                "error_msg": str(exc.detail),
                "log_id": log_id,
            },
        )

    @app.exception_handler(Exception)
    async def general_exception_handler(
        request: Request, exc: Exception
    ):
        log_id = uuid.uuid4().hex[:16]
        logger.error(
            "未捕获异常 [{}]: {}\n{}",
            log_id,
            str(exc),
            traceback.format_exc(),
        )
        return JSONResponse(
            status_code=500,
            content={
                "error_code": 282000,
                "error_msg": "Internal error",
                "log_id": log_id,
            },
        )
