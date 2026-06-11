"""反向代理 skills.sh — 剥离 X-Frame-Options 实现内嵌"""
from __future__ import annotations

import urllib.request
import ssl
import re
from fastapi import APIRouter, Request
from fastapi.responses import Response, StreamingResponse

router = APIRouter(prefix="/proxy/skills", tags=["Proxy"])

SKILLS_BASE = "https://skills.sh"

# 需要替换的资源路径前缀
REWRITE_RULES = [
    (b'href="/', b'href="/api/v1/proxy/skills/'),
    (b'src="/', b'src="/api/v1/proxy/skills/'),
    (b'action="/', b'action="/api/v1/proxy/skills/'),
    # 不要替换 https:// 开头的
]


def _fetch(url: str, timeout: int = 15) -> tuple[bytes, dict]:
    proxy = urllib.request.ProxyHandler({
        "http": "socks5://127.0.0.1:7897",
        "https": "socks5://127.0.0.1:7897",
    })
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    opener = urllib.request.build_opener(proxy, urllib.request.HTTPSHandler(context=ctx))

    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with opener.open(req, timeout=timeout) as resp:
        return resp.read(), dict(resp.headers)


@router.get("/{path:path}")
def proxy_skills(path: str, request: Request):
    """代理 skills.sh 页面"""
    target = f"{SKILLS_BASE}/{path}" if path else SKILLS_BASE
    if request.query_params:
        target += "?" + str(request.query_params)

    body, headers = _fetch(target, timeout=20)

    content_type = headers.get("content-type", "")

    # HTML → 剥离安全头 + 注入 base + 路径重写
    if "text/html" in content_type or path.endswith((".html", "")):
        # 注入 <base> 使所有相对路径走代理
        body = body.replace(b"<head>", b"<head><base href='/api/v1/proxy/skills/'>")
        # 替换 skills.sh 绝对 URL
        body = body.replace(b"https://skills.sh", b"/api/v1/proxy/skills")
        # 替换 og:url
        body = re.sub(rb'"url":"https://skills\.sh/', b'"url":"/api/v1/proxy/skills/', body)

    # 剥离阻止内嵌的头
    allowed = {
        "content-type", "content-length", "cache-control", "etag",
        "last-modified", "content-encoding", "set-cookie", "vary"
    }
    resp_headers = {}
    for k, v in headers.items():
        kl = k.lower()
        if kl in allowed or kl.startswith("x-vercel") or kl.startswith("x-next"):
            resp_headers[k] = v

    # 确保不阻止内嵌
    resp_headers["X-Frame-Options"] = "SAMEORIGIN"

    # 对于 HTML 直接返回（不走流式，确保资源路径已重写）
    if "text/html" in content_type:
        return Response(content=body, headers=resp_headers, media_type=content_type)

    # 静态资源流式返回
    return Response(content=body, headers=resp_headers, media_type=content_type)
