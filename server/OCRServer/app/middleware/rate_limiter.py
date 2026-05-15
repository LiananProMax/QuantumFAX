"""
速率限制中间件

基于令牌桶算法实现请求限流，支持 IP 级别和全局级别的限流。
兼容百度云 OCR 的 QPS 限制策略。
"""

import asyncio
import time
from collections import defaultdict
from typing import Dict, Optional

from loguru import logger
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse

from app.config import RateLimitSettings


class TokenBucket:
    """
    令牌桶算法实现。

    用于限制请求速率。
    """

    def __init__(self, rate: float, capacity: int):
        """
        Args:
            rate: 令牌填充速率 (个/秒)
            capacity: 桶容量
        """
        self.rate = rate
        self.capacity = capacity
        self.tokens = float(capacity)
        self.last_refill = time.monotonic()
        self._lock = asyncio.Lock()

    async def consume(self, tokens: int = 1) -> bool:
        """
        尝试消费令牌。

        Args:
            tokens: 需要消费的令牌数

        Returns:
            是否成功消费
        """
        async with self._lock:
            now = time.monotonic()
            elapsed = now - self.last_refill
            self.tokens = min(
                self.capacity, self.tokens + elapsed * self.rate
            )
            self.last_refill = now

            if self.tokens >= tokens:
                self.tokens -= tokens
                return True
            return False

    @property
    def remaining(self) -> int:
        """剩余令牌数"""
        return int(self.tokens)


class RateLimiter:
    """
    速率限制器。

    支持全局限流和 IP 级别限流。
    """

    def __init__(self, settings: RateLimitSettings):
        self._settings = settings
        self._enabled = settings.enabled

        # 每 IP 的令牌桶
        self._ip_buckets: Dict[str, TokenBucket] = defaultdict(
            lambda: TokenBucket(
                rate=settings.requests_per_minute / 60.0,
                capacity=settings.burst_size,
            )
        )

        # 全局令牌桶
        self._global_bucket = TokenBucket(
            rate=settings.requests_per_day / 86400.0,
            capacity=settings.requests_per_minute,
        )

        # IP 级别的日请求计数
        self._daily_counts: Dict[str, int] = defaultdict(int)
        self._day_start = time.time()

        logger.info(
            "RateLimiter 初始化完成，限流状态: {}, "
            "每分钟: {}, 每天: {}, 突发: {}",
            "启用" if settings.enabled else "禁用",
            settings.requests_per_minute,
            settings.requests_per_day,
            settings.burst_size,
        )

    async def check_rate_limit(self, client_ip: str) -> tuple[bool, dict]:
        """
        检查请求是否超过速率限制。

        Args:
            client_ip: 客户端 IP

        Returns:
            (是否允许, 限流信息头)
        """
        if not self._enabled:
            return True, {}

        # 检查是否需要重置日计数
        now = time.time()
        if now - self._day_start > 86400:
            self._daily_counts.clear()
            self._day_start = now

        # 检查日限额
        if self._daily_counts[client_ip] >= self._settings.requests_per_day:
            return False, {
                "X-RateLimit-Limit": str(self._settings.requests_per_day),
                "X-RateLimit-Remaining": "0",
                "X-RateLimit-Reset": str(
                    int(self._day_start + 86400 - now)
                ),
            }

        # 检查令牌桶
        ip_bucket = self._ip_buckets[client_ip]
        allowed = await ip_bucket.consume()

        if allowed:
            self._daily_counts[client_ip] += 1

        headers = {
            "X-RateLimit-Limit": str(self._settings.requests_per_minute),
            "X-RateLimit-Remaining": str(ip_bucket.remaining),
        }

        return allowed, headers


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    速率限制中间件。

    拦截请求并检查限流。
    """

    # 不需要限流的路径
    EXEMPT_PATHS = {"/", "/health", "/docs", "/redoc", "/openapi.json"}
    EXEMPT_PREFIXES = ("/static/",)

    def __init__(self, app, rate_limiter: RateLimiter):
        super().__init__(app)
        self._rate_limiter = rate_limiter

    async def dispatch(self, request: Request, call_next):
        # OPTIONS 预检请求直接放行（CORS 需要）
        if request.method == "OPTIONS":
            return await call_next(request)

        # 跳过不需要限流的路径
        path = request.url.path
        if path in self.EXEMPT_PATHS:
            return await call_next(request)
        if any(path.startswith(prefix) for prefix in self.EXEMPT_PREFIXES):
            return await call_next(request)

        client_ip = (
            request.client.host if request.client else "unknown"
        )

        allowed, headers = await self._rate_limiter.check_rate_limit(
            client_ip
        )

        if not allowed:
            logger.warning("请求被限流: IP={}", client_ip)
            return JSONResponse(
                status_code=429,
                content={
                    "error_code": 18,
                    "error_msg": "Open api qps request limit reached",
                },
                headers=headers,
            )

        response = await call_next(request)

        # 添加限流信息头
        for key, value in headers.items():
            response.headers[key] = value

        return response
