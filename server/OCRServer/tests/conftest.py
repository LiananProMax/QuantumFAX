"""
测试配置和 fixtures
"""

import pytest
from fastapi.testclient import TestClient


@pytest.fixture(scope="session")
def app():
    """创建测试用的 FastAPI 应用"""
    import os
    os.environ["AUTH__ENABLED"] = "false"
    os.environ["RATE_LIMIT__ENABLED"] = "false"
    os.environ["MODEL__DEVICE"] = "cpu"

    from app.main import create_app
    return create_app()


@pytest.fixture(scope="session")
def client(app):
    """创建测试客户端"""
    return TestClient(app)
