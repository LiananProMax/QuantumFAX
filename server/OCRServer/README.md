# PaddleOCR-VL Server

基于 **PaddleOCR-VL-1.5** 的高性能 OCR 服务器，提供类似百度云 OCR 的 RESTful API 接口，支持 GPU 加速推理。

## 功能特性

- **通用文字识别** — 标准版和高精度版，对标百度云 `general_basic` / `accurate_basic`
- **文档解析** — 版面分析 + 文字/表格/公式/图表综合识别，输出 Markdown
- **表格识别** — 独立的表格结构和内容识别
- **公式识别** — 数学公式识别，输出 LaTeX 格式
- **印章识别** — PaddleOCR-VL-1.5 新增功能
- **异形框定位** — 支持倾斜、弯折、屏幕拍摄等复杂场景
- **109 种语言** — 覆盖中英日韩阿拉伯语等全球主要语言
- **GPU 加速** — NVIDIA GPU (CC >= 7.0) + CUDA >= 11.8
- **API Key 认证** — 支持 Header 和 Query 参数两种方式
- **请求限流** — 基于令牌桶算法，支持 IP 级别限流
- **Docker 部署** — 一键启动，支持 GPU 透传

## 项目架构

```
OCRServer/
├── app/
│   ├── __init__.py
│   ├── main.py                     # FastAPI 应用入口
│   ├── config.py                   # 配置管理 (pydantic-settings)
│   ├── dependencies.py             # 依赖注入
│   ├── api/
│   │   └── v1/
│   │       ├── router.py           # API v1 路由注册
│   │       ├── ocr.py              # OCR API 端点
│   │       └── schemas.py          # 请求/响应 Schema
│   ├── middleware/
│   │   ├── auth.py                 # API Key 认证中间件
│   │   ├── rate_limiter.py         # 请求限流中间件
│   │   └── error_handler.py        # 全局异常处理
│   ├── services/
│   │   ├── model_manager.py        # 模型生命周期管理 (单例)
│   │   └── ocr_service.py          # OCR 业务逻辑层
│   ├── models/
│   │   └── ocr_result.py           # 数据模型定义
│   └── utils/
│       ├── image_utils.py          # 图像处理工具
│       └── logger.py               # 日志配置
├── tests/                          # 单元测试
├── Dockerfile                      # Docker 构建文件
├── docker-compose.yml              # Docker Compose 配置
├── requirements.txt                # Python 依赖
├── .env.example                    # 环境变量模板
├── run.py                          # 启动脚本
└── README.md
```

## 快速开始

### 方式一：Docker 部署（推荐）

```bash
# 1. 克隆项目
git clone <repo-url>
cd OCRServer

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env 文件，设置 API Key 等

# 3. 启动服务
docker-compose up -d

# 4. 查看日志
docker-compose logs -f
```

### 方式二：本地安装

#### 1. 安装 PaddlePaddle GPU 版

```bash
# 创建虚拟环境
python -m venv .venv
# Windows
.venv\Scripts\activate
# Linux/Mac
source .venv/bin/activate

# 安装 PaddlePaddle (根据 CUDA 版本选择)
# CUDA 12.6
pip install paddlepaddle-gpu==3.2.1 -i https://www.paddlepaddle.org.cn/packages/stable/cu126/
# CUDA 11.8
pip install paddlepaddle-gpu==3.2.1 -i https://www.paddlepaddle.org.cn/packages/stable/cu118/

# 验证安装
python -c "import paddle; print(paddle.__version__); print(paddle.device.is_compiled_with_cuda())"
```

#### 2. 安装 PaddleOCR 和依赖

```bash
# 安装 PaddleOCR (含文档解析功能)
pip install -U "paddleocr[doc-parser]"

# Windows 需要特殊版本的 safetensors
pip install https://xly-devops.cdn.bcebos.com/safetensors-nightly/safetensors-0.6.2.dev0-cp38-abi3-win_amd64.whl

# 安装服务依赖
pip install -r requirements.txt
```

#### 3. 配置和启动

```bash
# 复制配置文件
cp .env.example .env

# 启动服务
python run.py
```

服务启动后，访问 http://localhost:8000/docs 查看 API 文档。

## API 接口

### 认证方式

所有 API 调用需要携带 API Key，支持两种方式：

```bash
# 方式一：Header
curl -H "X-API-Key: YOUR_API_KEY" http://localhost:8000/api/v1/ocr/general_basic

# 方式二：Query 参数 (兼容百度云)
curl http://localhost:8000/api/v1/ocr/general_basic?access_token=YOUR_API_KEY
```

### 获取 Token（兼容百度云）

```bash
GET /api/v1/token?grant_type=client_credentials
```

### 通用文字识别

```bash
POST /api/v1/ocr/general_basic
Content-Type: application/json

{
    "image": "<base64_encoded_image>",
    "detect_direction": false
}
```

**响应示例：**
```json
{
    "log_id": "a1b2c3d4e5f6g7h8",
    "words_result_num": 3,
    "words_result": [
        {
            "words": "PaddleOCR-VL",
            "location": {"left": 10, "top": 20, "width": 200, "height": 30}
        },
        {
            "words": "高性能文字识别",
            "location": {"left": 10, "top": 60, "width": 180, "height": 30}
        }
    ],
    "processing_time_ms": 245.67
}
```

### 高精度文字识别

```bash
POST /api/v1/ocr/accurate_basic
```

### 文档解析

```bash
POST /api/v1/ocr/doc_parser
Content-Type: application/json

{
    "image": "<base64_encoded_image>",
    "use_layout_detection": true,
    "use_seal_recognition": false,
    "format_block_content": true
}
```

### 表格识别

```bash
POST /api/v1/ocr/table
```

### 公式识别

```bash
POST /api/v1/ocr/formula
```

### 印章识别

```bash
POST /api/v1/ocr/seal
```

### 文件上传方式

```bash
# 通用识别（文件上传）
POST /api/v1/ocr/general_basic/upload
Content-Type: multipart/form-data

# 文档解析（文件上传）
POST /api/v1/ocr/doc_parser/upload
Content-Type: multipart/form-data
```

### 使用 URL 方式

```bash
POST /api/v1/ocr/general_basic
Content-Type: application/json

{
    "url": "https://example.com/image.png"
}
```

### 模型管理

```bash
# 查看模型信息
GET /api/v1/model/info

# 重新加载模型
POST /api/v1/model/reload

# 健康检查
GET /api/v1/health
```

## Python 客户端调用示例

```python
import base64
import requests

API_URL = "http://localhost:8000/api/v1"
API_KEY = "your_api_key_here"

headers = {"X-API-Key": API_KEY}

# --- 通用文字识别 ---
with open("test.png", "rb") as f:
    image_base64 = base64.b64encode(f.read()).decode()

response = requests.post(
    f"{API_URL}/ocr/general_basic",
    headers=headers,
    json={"image": image_base64}
)

result = response.json()
for word in result["words_result"]:
    print(word["words"])

# --- 文件上传方式 ---
with open("test.png", "rb") as f:
    response = requests.post(
        f"{API_URL}/ocr/general_basic/upload",
        headers=headers,
        files={"file": ("test.png", f, "image/png")}
    )

# --- 文档解析 ---
response = requests.post(
    f"{API_URL}/ocr/doc_parser",
    headers=headers,
    json={
        "image": image_base64,
        "use_layout_detection": True,
    }
)
doc_result = response.json()
print(doc_result["markdown"])
```

## 配置说明

所有配置通过环境变量或 `.env` 文件管理，详细说明参见 `.env.example`。

| 配置项 | 说明 | 默认值 |
|--------|------|--------|
| `MODEL__DEVICE` | 推理设备 | `gpu:0` |
| `MODEL__PIPELINE_VERSION` | 模型版本 | `v1.5` |
| `MODEL__PRECISION` | 推理精度 | `fp16` |
| `AUTH__ENABLED` | 启用认证 | `true` |
| `RATE_LIMIT__REQUESTS_PER_MINUTE` | 每分钟限流 | `60` |
| `SERVER__PORT` | 服务端口 | `8000` |

## GPU 要求

| 推理方式 | GPU CC | CUDA 版本 |
|----------|--------|-----------|
| PaddlePaddle | >= 7.0 | >= 11.8 |
| vLLM | >= 8.0 | >= 12.6 |
| TensorRT | >= 8.0 | >= 12.6 |

常见支持的显卡：RTX 30/40/50 系列、A10、A100、V100 等。

## 错误码

采用与百度云 OCR 兼容的错误码体系：

| 错误码 | 说明 |
|--------|------|
| 110 | Access token 无效 |
| 216100 | 参数无效 |
| 216101 | 缺少必要参数 |
| 216200 | 空图像 |
| 216201 | 图像格式错误 |
| 216202 | 图像尺寸超限 |
| 282000 | 服务内部错误 |

## License

Apache License 2.0
