"""Skill 业务逻辑"""
from __future__ import annotations

from hermes_manager.core.exceptions import NotFoundError, ConflictError
from hermes_manager.repos.skill_repo import SkillRepository
from hermes_manager.schemas.skill import SkillSummary, SkillDetail, SkillMeta, SkillCreate, SkillUpdate


class SkillService:
    """Skill CRUD 业务编排"""

    def __init__(self, repo: SkillRepository | None = None):
        self._repo = repo or SkillRepository()

    def list_all(self) -> list[SkillSummary]:
        return self._repo.list_all()

    def get_detail(self, category: str, dir_name: str) -> SkillDetail:
        result = self._repo.get(category, dir_name)
        if result is None:
            raise NotFoundError("Skill", f"{category}/{dir_name}")
        fm, body = result
        return SkillDetail(
            category=category,
            dir_name=dir_name,
            frontmatter=SkillMeta(**self._extract_meta(fm)),
            body=body,
            path=str(self._repo._base / category / dir_name / "SKILL.md"),
        )

    def create(self, data: SkillCreate) -> dict:
        fm = {
            "name": data.name,
            "description": data.description,
            "version": "1.0.0",
            "author": "Hermes Agent",
            "platforms": ["windows", "linux", "macos"],
            "metadata": {"hermes": {"tags": data.tags, "related_skills": []}},
        }
        try:
            path = self._repo.create(data.category, data.dir_name, fm, data.body)
            return {"path": str(path)}
        except FileExistsError:
            raise ConflictError(f"Skill already exists: {data.category}/{data.dir_name}")

    def update(self, category: str, dir_name: str, data: SkillUpdate) -> None:
        if self._repo.get(category, dir_name) is None:
            raise NotFoundError("Skill", f"{category}/{dir_name}")
        fm = data.frontmatter.model_dump()
        self._repo.update(category, dir_name, fm, data.body)

    def delete(self, category: str, dir_name: str) -> None:
        if self._repo.get(category, dir_name) is None:
            raise NotFoundError("Skill", f"{category}/{dir_name}")
        self._repo.delete(category, dir_name)

    def get_installed_names(self) -> set[str]:
        return {s.name for s in self.list_all()}

    @staticmethod
    def _extract_meta(fm: dict) -> dict:
        tags = fm.get("metadata", {}).get("hermes", {}).get("tags", [])
        return {
            "name": fm.get("name", ""),
            "description": fm.get("description", ""),
            "version": fm.get("version", "1.0.0"),
            "author": fm.get("author", ""),
            "tags": tags,
        }
