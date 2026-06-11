"""Market 数据模型"""
from __future__ import annotations

from pydantic import BaseModel, Field


class MarketSkill(BaseModel):
    """市场技能"""
    name: str
    description: str = ""
    source: str = ""
    trust: str = ""
    identifier: str = ""
    installed: bool = False


class MarketSkillInstall(BaseModel):
    """安装技能请求"""
    identifier: str


class MarketMCP(BaseModel):
    """市场 MCP"""
    name: str
    status: str = ""
    description: str = ""
    installed: bool = False
    is_custom: bool = False


class MarketMCPInstall(BaseModel):
    """安装 MCP 请求"""
    name: str


class MarketPlugin(BaseModel):
    """插件"""
    name: str
    status: str = "not enabled"
    version: str = ""
    description: str = ""
    source: str = ""


class PluginToggle(BaseModel):
    """插件开关请求"""
    name: str
    enable: bool = True
