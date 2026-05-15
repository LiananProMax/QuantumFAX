"""
OCR API 端点测试
"""

import base64
import io

import pytest
from PIL import Image


class TestHealthCheck:
    """健康检查端点测试"""

    def test_root(self, client):
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "service" in data
        assert "version" in data

    def test_health(self, client):
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert "model_loaded" in data


class TestOCREndpoints:
    """OCR API 端点测试"""

    @staticmethod
    def _create_test_image_base64() -> str:
        """创建测试用的 base64 图像"""
        img = Image.new("RGB", (200, 100), color="white")
        buffer = io.BytesIO()
        img.save(buffer, format="PNG")
        return base64.b64encode(buffer.getvalue()).decode("utf-8")

    def test_general_ocr_missing_input(self, client):
        """测试缺少图像输入"""
        response = client.post("/api/v1/ocr/general_basic", json={})
        assert response.status_code in [400, 422]

    def test_document_parse_missing_input(self, client):
        """测试文档解析缺少输入"""
        response = client.post("/api/v1/ocr/doc_parser", json={})
        assert response.status_code in [400, 422]

    def test_table_recognition_missing_input(self, client):
        """测试表格识别缺少输入"""
        response = client.post("/api/v1/ocr/table", json={})
        assert response.status_code in [400, 422]

    def test_formula_recognition_missing_input(self, client):
        """测试公式识别缺少输入"""
        response = client.post("/api/v1/ocr/formula", json={})
        assert response.status_code in [400, 422]

    def test_seal_recognition_missing_input(self, client):
        """测试印章识别缺少输入"""
        response = client.post("/api/v1/ocr/seal", json={})
        assert response.status_code in [400, 422]


class TestModelEndpoints:
    """模型管理端点测试"""

    def test_model_info(self, client):
        """测试获取模型信息"""
        response = client.get("/api/v1/model/info")
        assert response.status_code == 200
        data = response.json()
        assert "model_loaded" in data
