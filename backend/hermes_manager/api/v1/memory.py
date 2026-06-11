"""Memory.md / User.md 分条管理 API"""
from __future__ import annotations

from pathlib import Path
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from hermes_manager.core.config import get_settings

router = APIRouter(prefix="/memory", tags=["Memory"])


class MemoryEntry(BaseModel):
    index: int
    content: str


class MemoryUpdate(BaseModel):
    content: str


class MemoryAdd(BaseModel):
    content: str
    position: int | None = None  # None = append


def _get_memory_path(memory_type: str) -> Path:
    name = "USER.md" if memory_type == "user" else "MEMORY.md"
    return Path(get_settings().hermes_home) / "memories" / name


def _parse_entries(text: str) -> list[str]:
    """按 § 分隔符拆分条目"""
    return [e.strip() for e in text.split("\n§\n") if e.strip()]


def _join_entries(entries: list[str]) -> str:
    return "\n§\n".join(entries) + "\n"


@router.get("/{memory_type}")
def list_entries(memory_type: str):
    """获取所有条目"""
    path = _get_memory_path(memory_type)
    if not path.exists():
        return {"entries": [], "type": memory_type, "path": str(path)}

    entries = _parse_entries(path.read_text(encoding="utf-8"))
    return {
        "entries": [
            {"index": i, "content": e} for i, e in enumerate(entries)
        ],
        "type": memory_type,
        "path": str(path),
    }


@router.put("/{memory_type}/{index}")
def update_entry(memory_type: str, index: int, data: MemoryUpdate):
    """更新单条"""
    path = _get_memory_path(memory_type)
    if not path.exists():
        raise HTTPException(404, f"{memory_type} not found")
    entries = _parse_entries(path.read_text(encoding="utf-8"))
    if index < 0 or index >= len(entries):
        raise HTTPException(404, f"Entry {index} not found (total: {len(entries)})")
    entries[index] = data.content.strip()
    path.write_text(_join_entries(entries), encoding="utf-8")
    return {"ok": True, "index": index}


@router.post("/{memory_type}")
def add_entry(memory_type: str, data: MemoryAdd):
    """新增条目"""
    path = _get_memory_path(memory_type)
    path.parent.mkdir(parents=True, exist_ok=True)
    entries = _parse_entries(path.read_text(encoding="utf-8")) if path.exists() else []

    pos = data.position if data.position is not None else len(entries)
    pos = max(0, min(pos, len(entries)))
    entries.insert(pos, data.content.strip())
    path.write_text(_join_entries(entries), encoding="utf-8")
    return {"ok": True, "index": pos, "total": len(entries)}


@router.delete("/{memory_type}/{index}")
def delete_entry(memory_type: str, index: int):
    """删除单条"""
    path = _get_memory_path(memory_type)
    if not path.exists():
        raise HTTPException(404, "not found")
    entries = _parse_entries(path.read_text(encoding="utf-8"))
    if index < 0 or index >= len(entries):
        raise HTTPException(404, f"Entry {index} not found")
    entries.pop(index)
    path.write_text(_join_entries(entries), encoding="utf-8")
    return {"ok": True, "total": len(entries)}
