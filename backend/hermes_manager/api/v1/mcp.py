"""MCP API"""
from __future__ import annotations

from fastapi import APIRouter, Depends, Query

from hermes_manager.core.exceptions import ConflictError, NotFoundError
from hermes_manager.repos.config_repo import ConfigRepository, get_config_repo
from hermes_manager.schemas.mcp import MCPServerCreate, MCPServerUpdate

router = APIRouter(prefix="/mcp", tags=["MCP"])


def _summarize(name: str, cfg: dict) -> dict:
    return {
        "name": name,
        "type": "http" if "url" in cfg else "stdio",
        "command": cfg.get("command", ""),
        "args": cfg.get("args", []),
        "url": cfg.get("url", ""),
        "env": cfg.get("env", {}),
        "timeout": cfg.get("timeout", 30),
        "autoApprove": cfg.get("autoApprove", []),
    }


@router.get("")
def list_mcp(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    repo: ConfigRepository = Depends(get_config_repo),
):
    servers = repo.get_mcp_servers()
    all_items = [_summarize(name, cfg) for name, cfg in servers.items()]
    total = len(all_items)
    start = (page - 1) * page_size
    paged = all_items[start:start + page_size]
    return {
        "servers": paged,
        "total": total,
        "page": page,
        "page_size": page_size,
    }


@router.post("", status_code=201)
def add_mcp(data: MCPServerCreate, repo: ConfigRepository = Depends(get_config_repo)):
    if data.name in repo.get_mcp_servers():
        raise ConflictError(f"MCP server '{data.name}' already exists")

    cfg: dict = {}
    if data.type == "stdio":
        cfg["command"] = data.command
        cfg["args"] = data.args
        if data.env:
            cfg["env"] = data.env
    else:
        cfg["url"] = data.url

    cfg["autoApprove"] = data.auto_approve
    cfg["timeout"] = data.timeout
    repo.set_mcp_server(data.name, cfg)
    return {"ok": True, "name": data.name}


@router.put("/{name}")
def update_mcp(name: str, data: MCPServerUpdate, repo: ConfigRepository = Depends(get_config_repo)):
    if name not in repo.get_mcp_servers():
        raise NotFoundError("MCP", name)
    repo.set_mcp_server(name, data.config)
    return {"ok": True}


@router.delete("/{name}")
def delete_mcp(name: str, repo: ConfigRepository = Depends(get_config_repo)):
    if name not in repo.get_mcp_servers():
        raise NotFoundError("MCP", name)
    repo.remove_mcp_server(name)
    return {"ok": True}


@router.get("/{name}/export")
def export_mcp(name: str, repo: ConfigRepository = Depends(get_config_repo)):
    """导出单个 MCP 配置为 YAML"""
    servers = repo.get_mcp_servers()
    if name not in servers:
        raise NotFoundError("MCP", name)
    import yaml
    from fastapi.responses import Response
    yml = yaml.safe_dump({name: servers[name]}, allow_unicode=True, default_flow_style=False)
    return Response(
        content=yml,
        media_type="text/yaml",
        headers={"Content-Disposition": f'attachment; filename="{name}.yaml"'},
    )
