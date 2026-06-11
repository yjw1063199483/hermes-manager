"""静态文件服务 — 用于会话详情中渲染图片"""
from __future__ import annotations

from pathlib import Path
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

router = APIRouter(prefix="/files", tags=["Files"])


@router.get("/{path:path}")
def serve_file(path: str):
    """安全地提供本地文件（仅限 hermes images 目录）"""
    allowed_dirs = [
        Path.home() / "AppData" / "Local" / "hermes" / "images",
    ]
    # 也允许常见图片路径
    resolved = Path(path)
    if not resolved.is_absolute():
        # 尝试在 hermes images 目录下查找
        for d in allowed_dirs:
            candidate = d / resolved
            if candidate.exists() and candidate.is_file():
                return FileResponse(str(candidate))

    # 绝对路径安全检查
    if not resolved.exists():
        raise HTTPException(404)
    if not any(str(resolved).startswith(str(d)) for d in allowed_dirs):
        raise HTTPException(403, "Access denied")
    return FileResponse(str(resolved))
