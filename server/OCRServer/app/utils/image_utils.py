"""
图像处理工具模块

提供图像读取、格式转换、base64 编解码等功能。
"""

import base64
import hashlib
import io
import tempfile
import uuid
from pathlib import Path
from typing import Optional

import numpy as np
from loguru import logger
from PIL import Image


def decode_base64_image(base64_string: str) -> np.ndarray:
    """
    将 Base64 编码的图像解码为 numpy 数组。

    Args:
        base64_string: Base64 编码的图像数据

    Returns:
        numpy 数组形式的图像

    Raises:
        ValueError: Base64 数据无效或无法解码
    """
    try:
        # 移除可能存在的 data URI 前缀
        if "," in base64_string:
            base64_string = base64_string.split(",", 1)[1]

        image_bytes = base64.b64decode(base64_string)
        image = Image.open(io.BytesIO(image_bytes))
        image = image.convert("RGB")
        return np.array(image)
    except Exception as e:
        logger.error("Base64 图像解码失败: {}", str(e))
        raise ValueError(f"无效的 Base64 图像数据: {str(e)}")


def encode_image_to_base64(image: np.ndarray, format: str = "PNG") -> str:
    """
    将 numpy 数组图像编码为 Base64 字符串。

    Args:
        image: numpy 数组形式的图像
        format: 图像格式 (PNG, JPEG 等)

    Returns:
        Base64 编码的字符串
    """
    pil_image = Image.fromarray(image)
    buffer = io.BytesIO()
    pil_image.save(buffer, format=format)
    return base64.b64encode(buffer.getvalue()).decode("utf-8")


def read_image_from_bytes(data: bytes) -> np.ndarray:
    """
    从字节数据读取图像。

    Args:
        data: 图像字节数据

    Returns:
        numpy 数组形式的图像
    """
    try:
        image = Image.open(io.BytesIO(data))
        image = image.convert("RGB")
        return np.array(image)
    except Exception as e:
        logger.error("图像字节数据读取失败: {}", str(e))
        raise ValueError(f"无法读取图像数据: {str(e)}")


def save_temp_image(data: bytes, suffix: str = ".png") -> str:
    """
    将图像字节数据保存到临时文件。

    Args:
        data: 图像字节数据
        suffix: 文件后缀名

    Returns:
        临时文件路径
    """
    temp_dir = Path(tempfile.gettempdir()) / "ocr_server"
    temp_dir.mkdir(parents=True, exist_ok=True)

    filename = f"{uuid.uuid4().hex}{suffix}"
    filepath = temp_dir / filename

    filepath.write_bytes(data)
    return str(filepath)


def save_base64_to_temp(base64_string: str, suffix: str = ".png") -> str:
    """
    将 Base64 编码的图像保存到临时文件。

    Args:
        base64_string: Base64 编码的图像数据
        suffix: 文件后缀名

    Returns:
        临时文件路径
    """
    if "," in base64_string:
        base64_string = base64_string.split(",", 1)[1]

    image_bytes = base64.b64decode(base64_string)
    return save_temp_image(image_bytes, suffix)


def validate_image_format(filename: str, allowed_extensions: list[str]) -> bool:
    """
    验证文件扩展名是否为允许的图像格式。

    Args:
        filename: 文件名
        allowed_extensions: 允许的扩展名列表

    Returns:
        是否合法
    """
    ext = Path(filename).suffix.lower()
    return ext in allowed_extensions


def get_image_info(data: bytes) -> dict:
    """
    获取图像基本信息。

    Args:
        data: 图像字节数据

    Returns:
        包含宽度、高度、格式等信息的字典
    """
    try:
        image = Image.open(io.BytesIO(data))
        return {
            "width": image.width,
            "height": image.height,
            "format": image.format,
            "mode": image.mode,
            "size_bytes": len(data),
            "md5": hashlib.md5(data).hexdigest(),
        }
    except Exception as e:
        logger.error("获取图像信息失败: {}", str(e))
        raise ValueError(f"无法获取图像信息: {str(e)}")


def cleanup_temp_file(filepath: str) -> None:
    """安全删除临时文件"""
    try:
        path = Path(filepath)
        if path.exists():
            path.unlink()
    except Exception as e:
        logger.warning("清理临时文件失败 {}: {}", filepath, str(e))
