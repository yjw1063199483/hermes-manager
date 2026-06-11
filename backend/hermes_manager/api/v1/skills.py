"""Skills API"""
from __future__ import annotations

from fastapi import APIRouter, Depends, Query

from hermes_manager.schemas.skill import SkillCreate, SkillUpdate
from hermes_manager.services.skill_service import SkillService

router = APIRouter(prefix="/skills", tags=["Skills"])


def get_skill_service() -> SkillService:
    return SkillService()


@router.get("")
def list_skills(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=200),
    svc: SkillService = Depends(get_skill_service),
):
    all_skills = svc.list_all()
    total = len(all_skills)
    start = (page - 1) * page_size
    paged = all_skills[start:start + page_size]
    return {
        "skills": [s.model_dump() for s in paged],
        "total": total,
        "page": page,
        "page_size": page_size,
    }


@router.get("/{category}/{dir_name}")
def get_skill(category: str, dir_name: str, svc: SkillService = Depends(get_skill_service)):
    return svc.get_detail(category, dir_name).model_dump()


@router.post("", status_code=201)
def create_skill(data: SkillCreate, svc: SkillService = Depends(get_skill_service)):
    return svc.create(data)


@router.put("/{category}/{dir_name}")
def update_skill(category: str, dir_name: str, data: SkillUpdate,
                 svc: SkillService = Depends(get_skill_service)):
    svc.update(category, dir_name, data)
    return {"ok": True}


@router.delete("/{category}/{dir_name}")
def delete_skill(category: str, dir_name: str, svc: SkillService = Depends(get_skill_service)):
    svc.delete(category, dir_name)
    return {"ok": True}


@router.get("/{category}/{dir_name}/export")
def export_skill(category: str, dir_name: str, svc: SkillService = Depends(get_skill_service)):
    """导出单个 Skill 为 .md 文件"""
    detail = svc.get_detail(category, dir_name)
    content = f"---\nname: {detail.frontmatter.name}\ndescription: {detail.frontmatter.description}\n---\n\n{detail.body}"
    from fastapi.responses import Response
    filename = f"{detail.frontmatter.name}.md"
    return Response(
        content=content,
        media_type="text/markdown",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
