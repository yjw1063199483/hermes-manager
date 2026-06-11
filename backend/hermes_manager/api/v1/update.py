"""更新检查 API"""
from __future__ import annotations

import os
import urllib.request
import json as _json
from importlib.metadata import version as _pkg_version
from pathlib import Path

from fastapi import APIRouter

router = APIRouter(prefix="/update", tags=["Update"])

# 从已安装包读取真实版本号，无需手动改
try:
    CURRENT_VERSION = _pkg_version("hermes-manager")
except Exception:
    CURRENT_VERSION = "0.0.0"


@router.get("/version")
def get_version():
    """返回当前版本号"""
    return {"version": CURRENT_VERSION}


def _github_token() -> str | None:
    """读取 GitHub Token 用于认证 API 请求"""
    home = os.environ.get("LOCALAPPDATA") or os.path.expanduser("~")
    env_file = Path(home) / "hermes" / ".env"
    if env_file.exists():
        for raw in env_file.read_text(encoding="utf-8").splitlines():
            if "=" not in raw or raw.startswith("#"):
                continue
            k, v = raw.split("=", 1)
            if k.strip() == "GITHUB_TOKEN":
                return v.strip()
    return None


def _github_headers() -> dict:
    headers = {"User-Agent": "hermes-manager", "Accept": "application/vnd.github.v3+json"}
    token = _github_token()
    if token:
        headers["Authorization"] = f"Bearer {token}"
    return headers


@router.get("/check")
def check_update():
    """检查 GitHub 是否有新版本"""
    try:
        req = urllib.request.Request(
            "https://api.github.com/repos/yjw1063199483/hermes-manager/releases/latest",
            headers=_github_headers(),
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
        }
    except Exception as e:
        return {"current": CURRENT_VERSION, "latest": None, "has_update": False, "error": str(e)[:100]}


@router.post("/upgrade")
async def run_upgrade():
    """后台执行 pip install 升级（延迟3秒，避免替换运行中的文件）"""
    import subprocess, sys, tempfile, shutil

    try:
        req = urllib.request.Request(
            "https://api.github.com/repos/yjw1063199483/hermes-manager/releases/latest",
            headers=_github_headers(),
        )
        with urllib.request.urlopen(req, timeout=8) as resp:
            latest = _json.loads(resp.read())
            download = ""
            latest_ver = latest.get("tag_name", "").lstrip("v")
            for asset in latest.get("assets", []):
                if asset["name"].endswith(".whl"):
                    download = asset["browser_download_url"]
                    break
        if not download:
            return {"ok": False, "error": "未找到下载链接"}

        # 先下载 wheel 到临时文件
        tmpdir = tempfile.gettempdir()
        whl_path = os.path.join(tmpdir, "hermes_manager_update.whl")
        with urllib.request.urlopen(download, timeout=60) as r:
            with open(whl_path, "wb") as f:
                shutil.copyfileobj(r, f)

        # 后台延迟升级（3秒后执行，此时 HTTP 响应已返回）
        python = sys.executable
        subprocess.Popen(
            f'start /B cmd /c "timeout /t 3 >nul && {python} -m pip install --upgrade {whl_path} && del {whl_path}"',
            shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
        )

        return {
            "ok": True,
            "message": f"v{latest_ver} 将在后台升级，3秒后执行。升级完成后请重启 hermes-manager",
        }
    except Exception as e:
        return {"ok": False, "error": str(e)[:100]}


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
