"""MCP 数据模型"""
from __future__ import annotations

from pydantic import BaseModel, Field


class MCPServerSummary(BaseModel):
    """MCP 服务器摘要"""
    name: str
    type: str = "stdio"          # stdio | http
    command: str = ""
    args: list[str] = Field(default_factory=list)
    url: str = ""
    env: dict[str, str] = Field(default_factory=dict)
    timeout: int = 30
    auto_approve: list[str] = Field(default_factory=list, alias="autoApprove")


class MCPServerCreate(BaseModel):
    """创建/更新 MCP 服务器"""
    name: str
    type: str = "stdio"
    command: str = ""
    args: list[str] = Field(default_factory=list)
    url: str = ""
    env: dict[str, str] = Field(default_factory=dict)
    timeout: int = 60
    auto_approve: list[str] = Field(default_factory=list, alias="autoApprove")


class MCPServerUpdate(BaseModel):
    """更新 MCP 配置"""
    config: dict
