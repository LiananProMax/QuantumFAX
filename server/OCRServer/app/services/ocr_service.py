"""
OCR 服务层

封装所有 OCR 业务逻辑，包括通用文字识别、文档解析、表格识别等。
"""

import time
import uuid
from pathlib import Path
from typing import Any, Dict, List, Optional

import httpx
from loguru import logger

from app.models.ocr_result import (
    BoundingBox,
    DocumentBlock,
    DocumentParseResponse,
    FormulaRecognitionResponse,
    LayoutElement,
    OCRResponse,
    TableRecognitionResponse,
    WordResult,
)
from app.services.model_manager import ModelManager
from app.utils.image_utils import (
    cleanup_temp_file,
    save_base64_to_temp,
    save_temp_image,
)


class OCRService:
    """
    OCR 服务类。

    提供各种 OCR 识别功能，所有方法均线程安全。
    """

    def __init__(self, model_manager: ModelManager):
        self._model_manager = model_manager
        logger.info("OCRService 初始化完成")

    def _generate_log_id(self) -> str:
        """生成唯一的请求日志 ID"""
        return uuid.uuid4().hex[:16]

    async def _download_image(self, url: str) -> bytes:
        """
        从 URL 下载图像。

        Args:
            url: 图像 URL

        Returns:
            图像字节数据
        """
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(url)
                response.raise_for_status()
                return response.content
        except Exception as e:
            logger.error("下载图像失败 {}: {}", url, str(e))
            raise ValueError(f"无法从 URL 下载图像: {str(e)}")

    async def _prepare_input(
        self, image_base64: Optional[str] = None, image_url: Optional[str] = None
    ) -> str:
        """
        准备模型输入：将 base64 或 URL 图像转换为临时文件路径。

        Args:
            image_base64: Base64 编码的图像
            image_url: 图像 URL

        Returns:
            临时文件路径
        """
        if image_base64:
            return save_base64_to_temp(image_base64)
        elif image_url:
            image_bytes = await self._download_image(image_url)
            return save_temp_image(image_bytes)
        else:
            raise ValueError("必须提供 image (Base64) 或 url 参数之一")

    def _parse_layout_elements(self, layout_det_res: Any) -> List[LayoutElement]:
        """解析版面检测结果"""
        elements = []
        if layout_det_res and hasattr(layout_det_res, "boxes"):
            for box in layout_det_res.boxes:
                elements.append(
                    LayoutElement(
                        label=box.get("label", "unknown"),
                        score=float(box.get("score", 0.0)),
                        bbox=[float(c) for c in box.get("coordinate", [])],
                    )
                )
        return elements

    def _extract_words_from_result(
        self, result: Any, with_location: bool = True
    ) -> List[WordResult]:
        """
        从 PaddleOCR-VL 结果中提取文字识别结果。

        Args:
            result: PaddleOCR-VL 原始结果
            with_location: 是否包含位置信息

        Returns:
            WordResult 列表
        """
        words_result = []

        try:
            res_dict = result.get("res", result) if isinstance(result, dict) else result

            # 尝试从 layout_det_res 中提取
            if hasattr(res_dict, "layout_det_res") and res_dict.layout_det_res:
                layout_res = res_dict.layout_det_res
                if hasattr(layout_res, "boxes"):
                    for box in layout_res.boxes:
                        label = box.get("label", "")
                        coord = box.get("coordinate", [])

                        # 文本类型的元素
                        if label in ("text", "doc_title", "paragraph_title"):
                            location = None
                            if with_location and len(coord) >= 4:
                                location = BoundingBox(
                                    left=int(float(coord[0])),
                                    top=int(float(coord[1])),
                                    width=int(float(coord[2]) - float(coord[0])),
                                    height=int(float(coord[3]) - float(coord[1])),
                                )

                            # 获取内容 (如果有)
                            content = box.get("content", "")
                            if content:
                                words_result.append(
                                    WordResult(
                                        words=content,
                                        location=location,
                                        probability={
                                            "average": float(box.get("score", 0.0))
                                        }
                                        if box.get("score")
                                        else None,
                                    )
                                )

            # 如果从 layout 中没有提取到内容，尝试从 markdown 输出获取
            if not words_result:
                markdown_content = self._extract_markdown(res_dict)
                if markdown_content:
                    # 按行分割
                    for line in markdown_content.strip().split("\n"):
                        line = line.strip()
                        if line:
                            words_result.append(WordResult(words=line))

        except Exception as e:
            logger.warning("提取文字结果时出现异常: {}", str(e))

        return words_result

    def _extract_markdown(self, result: Any) -> str:
        """从结果中提取 Markdown 内容"""
        try:
            if hasattr(result, "save_to_markdown"):
                # 获取 markdown 字符串
                import io
                import tempfile
                import os

                temp_dir = tempfile.mkdtemp()
                result.save_to_markdown(save_path=temp_dir)

                # 读取生成的 markdown 文件
                md_content = ""
                for f in Path(temp_dir).rglob("*.md"):
                    md_content += f.read_text(encoding="utf-8")

                # 清理临时目录
                import shutil
                shutil.rmtree(temp_dir, ignore_errors=True)

                return md_content

            if isinstance(result, dict):
                return result.get("markdown", "")
        except Exception as e:
            logger.warning("提取 Markdown 时出现异常: {}", str(e))

        return ""

    def _extract_blocks(self, result: Any) -> List[DocumentBlock]:
        """从结果中提取文档块"""
        blocks = []
        try:
            if hasattr(result, "layout_det_res") and result.layout_det_res:
                layout_res = result.layout_det_res
                if hasattr(layout_res, "boxes"):
                    for box in layout_res.boxes:
                        blocks.append(
                            DocumentBlock(
                                block_type=box.get("label", "unknown"),
                                block_content=box.get("content", ""),
                                bbox=[float(c) for c in box.get("coordinate", [])],
                                score=float(box.get("score", 0.0)),
                            )
                        )
        except Exception as e:
            logger.warning("提取文档块时出现异常: {}", str(e))

        return blocks

    # ==================== 公开 API ====================

    async def general_ocr(
        self,
        image_base64: Optional[str] = None,
        image_url: Optional[str] = None,
        detect_direction: bool = False,
        **kwargs,
    ) -> OCRResponse:
        """
        通用文字识别（对标百度云 general_basic）。

        Args:
            image_base64: Base64 编码的图像
            image_url: 图像 URL
            detect_direction: 是否检测图像方向

        Returns:
            OCRResponse 识别结果
        """
        log_id = self._generate_log_id()
        start_time = time.time()
        temp_path = None

        try:
            temp_path = await self._prepare_input(image_base64, image_url)
            pipeline = self._model_manager.get_pipeline()

            # 执行识别
            output = pipeline.predict(
                temp_path,
                use_doc_orientation_classify=detect_direction,
            )

            words_result = []
            for res in output:
                words_result.extend(self._extract_words_from_result(res))

            elapsed_ms = (time.time() - start_time) * 1000

            return OCRResponse(
                log_id=log_id,
                words_result_num=len(words_result),
                words_result=words_result,
                processing_time_ms=round(elapsed_ms, 2),
            )

        except Exception as e:
            logger.error("通用文字识别失败 [{}]: {}", log_id, str(e))
            raise
        finally:
            if temp_path:
                cleanup_temp_file(temp_path)

    async def accurate_ocr(
        self,
        image_base64: Optional[str] = None,
        image_url: Optional[str] = None,
        detect_direction: bool = False,
        **kwargs,
    ) -> OCRResponse:
        """
        高精度文字识别（对标百度云 accurate_basic）。

        使用更高精度的设置进行识别。

        Args:
            image_base64: Base64 编码的图像
            image_url: 图像 URL
            detect_direction: 是否检测图像方向

        Returns:
            OCRResponse 识别结果
        """
        log_id = self._generate_log_id()
        start_time = time.time()
        temp_path = None

        try:
            temp_path = await self._prepare_input(image_base64, image_url)
            pipeline = self._model_manager.get_pipeline()

            # 高精度模式：启用版面检测，使用更高精度
            output = pipeline.predict(
                temp_path,
                use_doc_orientation_classify=detect_direction,
                use_layout_detection=True,
                layout_shape_mode="poly",
            )

            words_result = []
            for res in output:
                words_result.extend(
                    self._extract_words_from_result(res, with_location=True)
                )

            elapsed_ms = (time.time() - start_time) * 1000

            return OCRResponse(
                log_id=log_id,
                words_result_num=len(words_result),
                words_result=words_result,
                processing_time_ms=round(elapsed_ms, 2),
            )

        except Exception as e:
            logger.error("高精度文字识别失败 [{}]: {}", log_id, str(e))
            raise
        finally:
            if temp_path:
                cleanup_temp_file(temp_path)

    async def document_parse(
        self,
        image_base64: Optional[str] = None,
        image_url: Optional[str] = None,
        use_layout_detection: Optional[bool] = None,
        use_doc_orientation_classify: Optional[bool] = None,
        use_doc_unwarping: Optional[bool] = None,
        use_seal_recognition: Optional[bool] = None,
        use_chart_recognition: Optional[bool] = None,
        format_block_content: bool = False,
        layout_shape_mode: str = "auto",
        **kwargs,
    ) -> DocumentParseResponse:
        """
        文档解析（全能模式）。

        综合使用版面检测、文字识别、表格识别等功能。

        Returns:
            DocumentParseResponse 文档解析结果
        """
        log_id = self._generate_log_id()
        start_time = time.time()
        temp_path = None

        try:
            temp_path = await self._prepare_input(image_base64, image_url)
            pipeline = self._model_manager.get_pipeline()

            # 构建预测参数
            predict_kwargs = {
                "layout_shape_mode": layout_shape_mode,
                "format_block_content": format_block_content,
            }
            if use_layout_detection is not None:
                predict_kwargs["use_layout_detection"] = use_layout_detection
            if use_doc_orientation_classify is not None:
                predict_kwargs[
                    "use_doc_orientation_classify"
                ] = use_doc_orientation_classify
            if use_doc_unwarping is not None:
                predict_kwargs["use_doc_unwarping"] = use_doc_unwarping
            if use_seal_recognition is not None:
                predict_kwargs["use_seal_recognition"] = use_seal_recognition
            if use_chart_recognition is not None:
                predict_kwargs["use_chart_recognition"] = use_chart_recognition

            output = pipeline.predict(temp_path, **predict_kwargs)

            markdown_parts = []
            all_blocks = []
            layout_elements = []

            for res in output:
                md = self._extract_markdown(res)
                if md:
                    markdown_parts.append(md)
                all_blocks.extend(self._extract_blocks(res))
                layout_elements.extend(self._parse_layout_elements(res))

            elapsed_ms = (time.time() - start_time) * 1000

            return DocumentParseResponse(
                log_id=log_id,
                markdown="\n\n".join(markdown_parts),
                blocks=all_blocks,
                layout_elements=layout_elements if layout_elements else None,
                processing_time_ms=round(elapsed_ms, 2),
            )

        except Exception as e:
            logger.error("文档解析失败 [{}]: {}", log_id, str(e))
            raise
        finally:
            if temp_path:
                cleanup_temp_file(temp_path)

    async def table_recognition(
        self,
        image_base64: Optional[str] = None,
        image_url: Optional[str] = None,
        **kwargs,
    ) -> TableRecognitionResponse:
        """
        表格识别。

        Returns:
            TableRecognitionResponse 表格识别结果
        """
        log_id = self._generate_log_id()
        start_time = time.time()
        temp_path = None

        try:
            temp_path = await self._prepare_input(image_base64, image_url)
            pipeline = self._model_manager.get_pipeline()

            output = pipeline.predict(
                temp_path,
                use_layout_detection=False,
                prompt_label="table",
            )

            tables = []
            for res in output:
                md = self._extract_markdown(res)
                if md:
                    tables.append({"html": md, "markdown": md})

            elapsed_ms = (time.time() - start_time) * 1000

            return TableRecognitionResponse(
                log_id=log_id,
                tables_num=len(tables),
                tables_result=tables,
                processing_time_ms=round(elapsed_ms, 2),
            )

        except Exception as e:
            logger.error("表格识别失败 [{}]: {}", log_id, str(e))
            raise
        finally:
            if temp_path:
                cleanup_temp_file(temp_path)

    async def formula_recognition(
        self,
        image_base64: Optional[str] = None,
        image_url: Optional[str] = None,
        **kwargs,
    ) -> FormulaRecognitionResponse:
        """
        公式识别。

        Returns:
            FormulaRecognitionResponse 公式识别结果
        """
        log_id = self._generate_log_id()
        start_time = time.time()
        temp_path = None

        try:
            temp_path = await self._prepare_input(image_base64, image_url)
            pipeline = self._model_manager.get_pipeline()

            output = pipeline.predict(
                temp_path,
                use_layout_detection=False,
                prompt_label="formula",
            )

            formulas = []
            for res in output:
                md = self._extract_markdown(res)
                if md:
                    formulas.append({"latex": md})

            elapsed_ms = (time.time() - start_time) * 1000

            return FormulaRecognitionResponse(
                log_id=log_id,
                formulas_num=len(formulas),
                formulas_result=formulas,
                processing_time_ms=round(elapsed_ms, 2),
            )

        except Exception as e:
            logger.error("公式识别失败 [{}]: {}", log_id, str(e))
            raise
        finally:
            if temp_path:
                cleanup_temp_file(temp_path)

    async def seal_recognition(
        self,
        image_base64: Optional[str] = None,
        image_url: Optional[str] = None,
        **kwargs,
    ) -> OCRResponse:
        """
        印章识别。

        Returns:
            OCRResponse 印章识别结果
        """
        log_id = self._generate_log_id()
        start_time = time.time()
        temp_path = None

        try:
            temp_path = await self._prepare_input(image_base64, image_url)
            pipeline = self._model_manager.get_pipeline()

            output = pipeline.predict(
                temp_path,
                use_layout_detection=False,
                prompt_label="seal",
            )

            words_result = []
            for res in output:
                md = self._extract_markdown(res)
                if md:
                    for line in md.strip().split("\n"):
                        line = line.strip()
                        if line:
                            words_result.append(WordResult(words=line))

            elapsed_ms = (time.time() - start_time) * 1000

            return OCRResponse(
                log_id=log_id,
                words_result_num=len(words_result),
                words_result=words_result,
                processing_time_ms=round(elapsed_ms, 2),
            )

        except Exception as e:
            logger.error("印章识别失败 [{}]: {}", log_id, str(e))
            raise
        finally:
            if temp_path:
                cleanup_temp_file(temp_path)
