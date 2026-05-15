"""
日志配置模块

使用 loguru 替代标准 logging，提供更强大的日志功能。
"""

import sys
from pathlib import Path

from loguru import logger


def setup_logger(
    level: str = "INFO",
    log_file: str | None = "logs/ocr_server.log",
    rotation: str = "10 MB",
    retention: str = "30 days",
) -> None:
    """
    配置全局日志。

    Args:
        level: 日志级别
        log_file: 日志文件路径，None 表示不写文件
        rotation: 日志轮转策略
        retention: 日志保留策略
    """
    # 移除默认 handler
    logger.remove()

    # 控制台输出
    logger.add(
        sys.stderr,
        level=level,
        format=(
            "<green>{time:YYYY-MM-DD HH:mm:ss.SSS}</green> | "
            "<level>{level: <8}</level> | "
            "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> | "
            "<level>{message}</level>"
        ),
        colorize=True,
        backtrace=True,
        diagnose=True,
    )

    # 文件输出
    if log_file:
        log_path = Path(log_file)
        log_path.parent.mkdir(parents=True, exist_ok=True)

        logger.add(
            str(log_path),
            level=level,
            format=(
                "{time:YYYY-MM-DD HH:mm:ss.SSS} | "
                "{level: <8} | "
                "{name}:{function}:{line} | "
                "{message}"
            ),
            rotation=rotation,
            retention=retention,
            compression="zip",
            encoding="utf-8",
            enqueue=True,  # 线程安全
        )

    logger.info("日志系统初始化完成，级别: {}", level)


def get_logger(name: str = "ocr_server"):
    """获取带模块名的 logger"""
    return logger.bind(name=name)
