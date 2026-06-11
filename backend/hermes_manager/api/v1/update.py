"""更新检查 API"""
from __future__ import annotations

import urllib.request
import json as _json

from fastapi import APIRouter

router = APIRouter(prefix="/update", tags=["Update"])

CURRENT_VERSION = "2.3.0"


@router.get("/check")
def check_update():
    """检查 GitHub 是否有新版本"""
    try:
        req = urllib.request.Request(
            "https://api.github.com/repos/yjw1063199483/hermes-manager/releases/latest",
            headers={"User-Agent": "hermes-manager", "Accept": "application/vnd.github.v3+json"},
        )
        with urllib.request.urlopen(req, timeout=8) as resp:
            latest = _json.loads(resp.read())
            latest_ver = latest.get("tag_name", "").lstrip("v")
            latest_url = latest.get("html_url", "")
            download = ""
            for asset in latest.get("assets", []):
                if asset["name"].endswith(".whl"):
                    download = asset["browser_download_url"]
                    break

        has_update = _compare_versions(latest_ver, CURRENT_VERSION) > 0
        return {
            "current": CURRENT_VERSION,
            "latest": latest_ver,
            "has_update": has_update,
            "url": latest_url,
            "download": download,
            "command": f"pip install {download}" if download else f"pip install --upgrade hermes-manager",
        }
    except Exception:
        return {"current": CURRENT_VERSION, "latest": None, "has_update": False, "error": "无法连接 GitHub"}


def _compare_versions(a: str, b: str) -> int:
    """比较语义版本，a>b 返回 1，a<b 返回 -1，相等返回 0"""
    try:
        pa = [int(x) for x in a.split(".")]
        pb = [int(x) for x in b.split(".")]
    except (ValueError, AttributeError):
        return 0
    for x, y in zip(pa, pb):
        if x > y: return 1
        if x < y: return -1
    return 1 if len(pa) > len(pb) else -1 if len(pa) < len(pb) else 0
