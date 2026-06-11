"""历史会话查询 API"""
from __future__ import annotations

import sqlite3
from datetime import datetime, timezone
from pathlib import Path

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from hermes_manager.core.config import get_settings

router = APIRouter(prefix="/sessions", tags=["Sessions"])


class SessionRow(BaseModel):
    id: str
    title: str | None
    model: str | None
    started_at: str | None
    message_count: int
    input_tokens: int
    output_tokens: int
    estimated_cost_usd: float | None
    source: str | None


class MessageRow(BaseModel):
    id: int
    role: str
    content: str | None
    tool_name: str | None
    timestamp: str | None
    token_count: int


def _get_db_path() -> Path:
    return Path(get_settings().hermes_home) / "state.db"


def _ts(epoch: float | None) -> str | None:
    if epoch is None:
        return None
    return datetime.fromtimestamp(epoch, tz=timezone.utc).strftime("%Y-%m-%d %H:%M:%S")


@router.get("")
def list_sessions(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str = "",
):
    db = _get_db_path()
    if not db.exists():
        return {"sessions": [], "total": 0}

    conn = sqlite3.connect(str(db))
    conn.row_factory = sqlite3.Row

    where = "WHERE archived = 0"
    params: list = []
    if search:
        where += " AND (title LIKE ? OR id LIKE ?)"
        params += [f"%{search}%", f"%{search}%"]

    total = conn.execute(f"SELECT COUNT(*) FROM sessions {where}", params).fetchone()[0]

    offset = (page - 1) * page_size
    rows = conn.execute(
        f"SELECT id, title, model, started_at, message_count, input_tokens, output_tokens, estimated_cost_usd, source "
        f"FROM sessions {where} ORDER BY started_at DESC LIMIT ? OFFSET ?",
        params + [page_size, offset],
    ).fetchall()

    sessions = [{
        "id": r["id"],
        "title": r["title"],
        "model": r["model"],
        "started_at": _ts(r["started_at"]),
        "message_count": r["message_count"],
        "input_tokens": r["input_tokens"] or 0,
        "output_tokens": r["output_tokens"] or 0,
        "estimated_cost_usd": r["estimated_cost_usd"],
        "source": r["source"],
    } for r in rows]

    conn.close()
    return {"sessions": sessions, "total": total, "page": page, "page_size": page_size}


@router.delete("/{session_id}")
def delete_session(session_id: str):
    """删除单个会话及其所有消息"""
    db = _get_db_path()
    if not db.exists():
        raise HTTPException(404, "Database not found")
    conn = sqlite3.connect(str(db))
    conn.execute("DELETE FROM messages WHERE session_id = ?", (session_id,))
    conn.execute("DELETE FROM sessions WHERE id = ?", (session_id,))
    conn.commit()
    conn.close()
    return {"ok": True}


@router.post("/batch-delete")
def batch_delete(session_ids: list[str]):
    """批量删除会话"""
    db = _get_db_path()
    if not db.exists():
        raise HTTPException(404, "Database not found")
    conn = sqlite3.connect(str(db))
    for sid in session_ids:
        conn.execute("DELETE FROM messages WHERE session_id = ?", (sid,))
        conn.execute("DELETE FROM sessions WHERE id = ?", (sid,))
    conn.commit()
    conn.close()
    return {"ok": True, "deleted": len(session_ids)}


@router.get("/{session_id}")
def get_session_messages(
    session_id: str,
    search: str = "",
):
    db = _get_db_path()
    if not db.exists():
        return {"messages": [], "session_id": session_id, "session": None}

    conn = sqlite3.connect(str(db))
    conn.row_factory = sqlite3.Row

    session = conn.execute(
        "SELECT id, title, model, started_at, message_count, input_tokens, output_tokens, estimated_cost_usd "
        "FROM sessions WHERE id = ?", (session_id,)
    ).fetchone()

    if not session:
        conn.close()
        return {"messages": [], "session_id": session_id, "session": None}

    # 只返回 user + assistant，排除 tool 和空内容
    where = " WHERE session_id = ? AND active = 1 AND role IN ('user', 'assistant') AND content IS NOT NULL AND content != ''"
    params: list = [session_id]

    if search:
        where += " AND content LIKE ?"
        params.append(f"%{search}%")

    rows = conn.execute(
        f"SELECT id, role, content, tool_name, timestamp, token_count "
        f"FROM messages{where} ORDER BY id",
        params,
    ).fetchall()

    messages = [{
        "id": r["id"],
        "role": r["role"],
        "content": r["content"][:3000] if r["content"] else None,
        "tool_name": r["tool_name"],
        "timestamp": _ts(r["timestamp"]),
        "token_count": r["token_count"] or 0,
    } for r in rows]

    conn.close()
    return {
        "messages": messages,
        "session_id": session_id,
        "session": {
            "id": session["id"],
            "title": session["title"],
            "model": session["model"],
            "started_at": _ts(session["started_at"]),
            "message_count": session["message_count"],
            "input_tokens": session["input_tokens"] or 0,
            "output_tokens": session["output_tokens"] or 0,
            "estimated_cost_usd": session["estimated_cost_usd"],
        },
    }
