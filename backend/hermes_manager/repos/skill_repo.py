"""Skill 文件读写"""
from __future__ import annotations

import shutil
from datetime import datetime
from pathlib import Path
from typing import Iterator

import yaml

from hermes_manager.core.config import get_settings
from hermes_manager.schemas.skill import SkillSummary


class SkillRepository:
    """SKILL.md 文件系统的 CRUD"""

    def __init__(self, base_dir: Path | None = None):
        self._base = base_dir or get_settings().skills_dir

    def list_all(self) -> list[SkillSummary]:
        skills: list[SkillSummary] = []
        if not self._base.exists():
            return skills

        for md_path in self._base.rglob("SKILL.md"):
            rel = md_path.relative_to(self._base)
            parts = rel.parts
            category = parts[0] if len(parts) > 1 else ""
            dir_name = parts[-2] if len(parts) >= 2 else ""

            stat = md_path.stat()
            fm = self._parse_frontmatter(md_path.read_text(encoding="utf-8"))[0]

            skills.append(SkillSummary(
                name=fm.get("name", dir_name),
                dir_name=dir_name,
                category=category,
                description=fm.get("description", ""),
                version=fm.get("version", "1.0.0"),
                author=fm.get("author", ""),
                tags=fm.get("metadata", {}).get("hermes", {}).get("tags", []),
                path=str(md_path),
                size=stat.st_size,
                modified=datetime.fromtimestamp(stat.st_mtime).isoformat(),
                source="market" if category == dir_name else "user",
            ))

        skills.sort(key=lambda s: (s.category, s.name))
        return skills

    def get(self, category: str, dir_name: str) -> tuple[dict, str] | None:
        """返回 (frontmatter_dict, body) 或 None"""
        # 标准路径: category/dir_name/SKILL.md
        path = self._base / category / dir_name / "SKILL.md"
        if path.exists():
            return self._parse_frontmatter(path.read_text(encoding="utf-8"))
        # 根目录安装: dir_name/SKILL.md
        path = self._base / dir_name / "SKILL.md"
        if path.exists():
            return self._parse_frontmatter(path.read_text(encoding="utf-8"))
        return None

    def create(self, category: str, dir_name: str, frontmatter: dict, body: str) -> Path:
        skill_dir = self._base / category / dir_name
        if skill_dir.exists():
            raise FileExistsError(f"Skill already exists: {category}/{dir_name}")
        skill_dir.mkdir(parents=True, exist_ok=True)
        content = self._build_content(frontmatter, body)
        md_path = skill_dir / "SKILL.md"
        md_path.write_text(content, encoding="utf-8")
        return md_path

    def update(self, category: str, dir_name: str, frontmatter: dict, body: str) -> None:
        path = self._base / category / dir_name / "SKILL.md"
        if not path.exists():
            raise FileNotFoundError(f"Skill not found: {category}/{dir_name}")
        path.write_text(self._build_content(frontmatter, body), encoding="utf-8")

    def delete(self, category: str, dir_name: str) -> None:
        # 标准路径
        skill_dir = self._base / category / dir_name
        if skill_dir.exists():
            shutil.rmtree(skill_dir)
            return
        # 根目录安装
        skill_dir = self._base / dir_name
        if skill_dir.exists():
            shutil.rmtree(skill_dir)
            return
        raise FileNotFoundError(f"Skill not found: {category}/{dir_name}")

    @staticmethod
    def _parse_frontmatter(content: str) -> tuple[dict, str]:
        if content.startswith("---\n"):
            parts = content.split("---\n", 2)
            if len(parts) >= 3:
                return yaml.safe_load(parts[1]) or {}, parts[2]
        return {}, content

    @staticmethod
    def _build_content(fm: dict, body: str) -> str:
        fm_yaml = yaml.safe_dump(
            fm, allow_unicode=True, default_flow_style=False, sort_keys=False
        ).strip()
        return f"---\n{fm_yaml}\n---\n{body}"
