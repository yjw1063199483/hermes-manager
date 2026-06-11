"""翻译 API — 跳过代码块和命令"""
from __future__ import annotations

import urllib.request
import urllib.parse
import json
import ssl
import re

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/translate", tags=["Translate"])

# 需要保留不翻译的占位符模式
PLACEHOLDER = "§§{}§§"

class TranslateRequest(BaseModel):
    text: str


def _google_translate(text: str) -> str:
    """调用 Google 翻译"""
    url = "https://translate.googleapis.com/translate_a/single"
    params = urllib.parse.urlencode({
        "client": "gtx",
        "sl": "en",
        "tl": "zh-CN",
        "dt": "t",
        "q": text,
    })
    proxy = urllib.request.ProxyHandler({
        "http": "socks5://127.0.0.1:7897",
        "https": "socks5://127.0.0.1:7897",
    })
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    opener = urllib.request.build_opener(proxy, urllib.request.HTTPSHandler(context=ctx))

    with opener.open(f"{url}?{params}", timeout=10) as resp:
        data = json.loads(resp.read())

    result = ""
    for segment in data[0]:
        if segment[0]:
            result += segment[0]
    return result


@router.post("")
def translate(req: TranslateRequest):
    text = req.text[:8000]  # 限长
    placeholders: list[str] = []

    # 1. 保护代码块 (```...```)
    def save_fence(m):
        placeholders.append(m.group(0))
        return PLACEHOLDER.format(len(placeholders) - 1)
    text = re.sub(r'```[\s\S]*?```', save_fence, text)

    # 2. 保护行内代码 (`...`)
    def save_inline(m):
        placeholders.append(m.group(0))
        return PLACEHOLDER.format(len(placeholders) - 1)
    text = re.sub(r'`[^`]+`', save_inline, text)

    # 3. 保护 URL
    def save_url(m):
        placeholders.append(m.group(0))
        return PLACEHOLDER.format(len(placeholders) - 1)
    text = re.sub(r'https?://[^\s<>"]+', save_url, text)

    # 4. 保护命令行示例（以 $ 或 > 开头的行）
    def save_cmd(m):
        placeholders.append(m.group(0))
        return PLACEHOLDER.format(len(placeholders) - 1)
    text = re.sub(r'^[>\$]\s+.+$', save_cmd, text, flags=re.MULTILINE)

    # 5. 翻译剩余文本
    translated = _google_translate(text)

    # 6. 还原占位符
    for i, ph in enumerate(placeholders):
        translated = translated.replace(PLACEHOLDER.format(i), ph)

    return {"text": translated}
