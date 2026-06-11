"""Skills 数据模型"""
from __future__ import annotations

from datetime import datetime
from pydantic import BaseModel, Field


class SkillMeta(BaseModel):
    """Skill frontmatter"""
    name: str
    description: str = ""
    version: str = "1.0.0"
    author: str = ""
    tags: list[str] = Field(default_factory=list)


class SkillSummary(BaseModel):
    """列表用精简模型"""
    name: str
    dir_name: str
    category: str
    description: str = ""
    version: str = "1.0.0"
    author: str = ""
    tags: list[str] = Field(default_factory=list)
    path: str = ""
    size: int = 0
    modified: str = ""
    source: str = "user"  # "user" | "market"

    model_config = {"from_attributes": True}


class SkillDetail(BaseModel):
    """详情模型（含 body）"""
    category: str
    dir_name: str
    frontmatter: SkillMeta
    body: str = ""
    path: str = ""


class SkillCreate(BaseModel):
    """创建请求"""
    category: str = "custom"
    dir_name: str
    name: str
    description: str = ""
    tags: list[str] = Field(default_factory=list)
    body: str = ""


class SkillUpdate(BaseModel):
    """更新请求"""
    frontmatter: SkillMeta
    body: str = ""
