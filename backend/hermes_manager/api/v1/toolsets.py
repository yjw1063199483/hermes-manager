"""Toolsets & Stats API"""
from __future__ import annotations

from fastapi import APIRouter, Depends

from hermes_manager.core.config import get_settings
from hermes_manager.repos.config_repo import ConfigRepository, get_config_repo
from hermes_manager.services.skill_service import SkillService
from hermes_manager.repos.skill_repo import SkillRepository

router = APIRouter(tags=["Toolsets & Stats"])


def _get_skill_service() -> SkillService:
    return SkillService(SkillRepository())


@router.get("/toolsets")
def get_toolsets(repo: ConfigRepository = Depends(get_config_repo)):
    return {
        "platform_toolsets": repo.get_platform_toolsets(),
        "disabled_toolsets": repo.get_disabled_toolsets(),
    }


@router.put("/toolsets")
def update_toolsets(data: dict, repo: ConfigRepository = Depends(get_config_repo)):
    if "platform_toolsets" in data:
        repo.set_platform_toolsets(data["platform_toolsets"])
    if "disabled_toolsets" in data:
        repo.set_disabled_toolsets(data["disabled_toolsets"])
    return {"ok": True}


@router.get("/stats")
def get_stats(
    svc: SkillService = Depends(_get_skill_service),
    repo: ConfigRepository = Depends(get_config_repo),
):
    skills = svc.list_all()
    config = repo.read()
    return {
        "skills_count": len(skills),
        "mcp_count": len(repo.get_mcp_servers()),
        "categories_count": len({s.category for s in skills}),
        "model": config.get("model", {}).get("default", "unknown"),
        "hermes_home": str(get_settings().hermes_home),
    }
