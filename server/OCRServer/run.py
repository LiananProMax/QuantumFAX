"""
服务启动脚本

提供便捷的服务启动方式。
"""

import uvicorn

from app.config import get_settings


def main():
    settings = get_settings()

    uvicorn.run(
        "app.main:app",
        host=settings.server.host,
        port=settings.server.port,
        workers=settings.server.workers,
        reload=settings.server.debug,
        log_level=settings.log.level.lower(),
        access_log=False,  # 使用自定义日志中间件
    )


if __name__ == "__main__":
    main()
