"""SOUL.md 人设文件 API"""
from __future__ import annotations

from pathlib import Path
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from hermes_manager.core.config import get_settings

router = APIRouter(prefix="/soul", tags=["SOUL"])


class SoulContent(BaseModel):
    content: str
    path: str
    size: int


class SoulUpdate(BaseModel):
    content: str


def _get_soul_path() -> Path:
    return Path(get_settings().hermes_home) / "SOUL.md"


@router.get("")
def get_soul() -> SoulContent:
    path = _get_soul_path()
    if not path.exists():
        raise HTTPException(404, "SOUL.md not found")
    content = path.read_text(encoding="utf-8")
    return SoulContent(content=content, path=str(path), size=path.stat().st_size)


@router.put("")
def update_soul(data: SoulUpdate):
    path = _get_soul_path()
    path.write_text(data.content, encoding="utf-8")
    return {"ok": True, "size": path.stat().st_size}
