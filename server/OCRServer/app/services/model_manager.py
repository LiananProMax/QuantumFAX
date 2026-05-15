"""
模型管理器模块

负责 PaddleOCR-VL 模型的生命周期管理，包括加载、预热和释放。
使用单例模式确保模型只加载一次。
"""

import threading
import time
from typing import Optional

from loguru import logger

from app.config import ModelSettings


class ModelManager:
    """
    PaddleOCR-VL 模型管理器。

    采用线程安全的单例模式管理模型实例。
    """

    _instance: Optional["ModelManager"] = None
    _lock: threading.Lock = threading.Lock()

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self, settings: Optional[ModelSettings] = None):
        if hasattr(self, "_initialized") and self._initialized:
            return
        self._initialized = True

        self._settings = settings or ModelSettings()
        self._pipeline = None
        self._model_loaded = False
        self._load_lock = threading.Lock()
        self._model_info: dict = {}

        logger.info("ModelManager 初始化完成")

    @property
    def is_loaded(self) -> bool:
        """模型是否已加载"""
        return self._model_loaded

    @property
    def model_info(self) -> dict:
        """获取模型信息"""
        return self._model_info

    def load_model(self) -> None:
        """
        加载 PaddleOCR-VL 模型。

        线程安全，多次调用不会重复加载。
        """
        if self._model_loaded:
            logger.info("模型已加载，跳过重复加载")
            return

        with self._load_lock:
            if self._model_loaded:
                return

            logger.info("开始加载 PaddleOCR-VL 模型...")
            logger.info("设备: {}", self._settings.device)
            logger.info("版本: {}", self._settings.pipeline_version)
            logger.info("精度: {}", self._settings.precision)

            start_time = time.time()

            try:
                from inspect import signature

                from paddleocr import PaddleOCRVL

                # 构建初始化参数
                raw_init_kwargs = {
                    "device": self._settings.device,
                    "pipeline_version": self._settings.pipeline_version,
                    "use_doc_orientation_classify": self._settings.use_doc_orientation_classify,
                    "use_doc_unwarping": self._settings.use_doc_unwarping,
                    "use_layout_detection": self._settings.use_layout_detection,
                    "use_seal_recognition": self._settings.use_seal_recognition,
                    "use_chart_recognition": self._settings.use_chart_recognition,
                    "precision": self._settings.precision,
                    "enable_hpi": self._settings.enable_hpi,
                    "use_tensorrt": self._settings.use_tensorrt,
                }

                # PaddleOCRVL 的初始化参数会随 paddleocr 版本变化，部署时按当前库能力过滤。
                supported_params = set(signature(PaddleOCRVL).parameters)
                common_params = {"device", "precision", "enable_hpi", "use_tensorrt"}
                allowed_params = supported_params | common_params
                init_kwargs = {
                    key: value
                    for key, value in raw_init_kwargs.items()
                    if key in allowed_params
                }
                skipped_params = sorted(set(raw_init_kwargs) - set(init_kwargs))
                if skipped_params:
                    logger.warning(
                        "当前 PaddleOCRVL 不支持以下初始化参数，已跳过: {}",
                        ", ".join(skipped_params),
                    )

                self._pipeline = PaddleOCRVL(**init_kwargs)

                elapsed = time.time() - start_time
                self._model_loaded = True

                self._model_info = {
                    "model_name": "PaddleOCR-VL",
                    "pipeline_version": self._settings.pipeline_version,
                    "device": self._settings.device,
                    "precision": self._settings.precision,
                    "load_time_seconds": round(elapsed, 2),
                    "features": {
                        "doc_orientation_classify": self._settings.use_doc_orientation_classify,
                        "doc_unwarping": self._settings.use_doc_unwarping,
                        "layout_detection": self._settings.use_layout_detection,
                        "seal_recognition": self._settings.use_seal_recognition,
                        "chart_recognition": self._settings.use_chart_recognition,
                    },
                }

                logger.info(
                    "PaddleOCR-VL 模型加载成功，耗时 {:.2f} 秒", elapsed
                )

            except ImportError as e:
                logger.error(
                    "PaddleOCR 未安装。请运行: "
                    "pip install paddlepaddle-gpu paddleocr[doc-parser]"
                )
                raise RuntimeError(
                    f"PaddleOCR 依赖未安装: {e}"
                ) from e
            except Exception as e:
                logger.error("模型加载失败: {}", str(e))
                raise RuntimeError(f"模型加载失败: {e}") from e

    def warmup(self) -> None:
        """
        模型预热 — 执行一次空白图像推理以触发 JIT 编译。
        """
        if not self._model_loaded:
            logger.warning("模型未加载，无法预热")
            return

        logger.info("开始模型预热...")
        try:
            import numpy as np

            # 创建一个小的测试图像
            dummy_image = np.ones((100, 300, 3), dtype=np.uint8) * 255
            # 保存为临时文件进行推理
            from PIL import Image as PILImage
            import tempfile
            import os

            temp_path = os.path.join(tempfile.gettempdir(), "warmup_test.png")
            PILImage.fromarray(dummy_image).save(temp_path)

            output = self._pipeline.predict(temp_path)
            # 消费生成器
            for _ in output:
                pass

            # 清理
            if os.path.exists(temp_path):
                os.remove(temp_path)

            logger.info("模型预热完成")
        except Exception as e:
            logger.warning("模型预热时出现异常 (可忽略): {}", str(e))

    def get_pipeline(self):
        """
        获取 PaddleOCR-VL pipeline 实例。

        Returns:
            PaddleOCRVL 实例

        Raises:
            RuntimeError: 模型未加载
        """
        if not self._model_loaded or self._pipeline is None:
            raise RuntimeError(
                "模型尚未加载，请先调用 load_model()"
            )
        return self._pipeline

    def unload_model(self) -> None:
        """释放模型资源"""
        with self._load_lock:
            if self._pipeline is not None:
                del self._pipeline
                self._pipeline = None
                self._model_loaded = False
                self._model_info = {}
                logger.info("模型已释放")

                # 尝试释放 GPU 显存
                try:
                    import paddle

                    paddle.device.cuda.empty_cache()
                except Exception:
                    pass

    def reload_model(self, settings: Optional[ModelSettings] = None) -> None:
        """
        重新加载模型（可选新配置）。

        Args:
            settings: 新的模型配置，None 表示使用原配置
        """
        logger.info("开始重新加载模型...")
        self.unload_model()
        if settings:
            self._settings = settings
        self.load_model()
        if self._settings.model_warmup:
            self.warmup()
        logger.info("模型重新加载完成")

    def health_check(self) -> dict:
        """
        模型健康检查。

        Returns:
            健康状态信息字典
        """
        status = {
            "model_loaded": self._model_loaded,
            "model_info": self._model_info,
        }

        if self._model_loaded:
            try:
                # 检查 GPU 状态
                import paddle

                if paddle.device.is_compiled_with_cuda():
                    gpu_count = paddle.device.cuda.device_count()
                    status["gpu_available"] = True
                    status["gpu_count"] = gpu_count
                else:
                    status["gpu_available"] = False
            except Exception:
                status["gpu_available"] = False

        return status
