"""Market 业务逻辑 — skills.sh 首页流式数据 + GitHub 双源"""
from __future__ import annotations

import json
import re
import subprocess

from hermes_manager.core.exceptions import CLIError
from hermes_manager.schemas.market import MarketSkill, MarketMCP, MarketPlugin
from hermes_manager.services.skill_service import SkillService


def _curl_fetch(url: str, timeout: int = 12) -> str:
    """用 curl + socks5 代理抓取"""
    r = subprocess.run(
        ["curl", "-sL", "--socks5", "127.0.0.1:7897", url, "--max-time", str(timeout)],
        capture_output=True, text=True, timeout=timeout + 5)
    return r.stdout


def _extract_skills_sh(html: str) -> list[dict]:
    """从 skills.sh 首页 Next.js 流式 HTML 中提取技能 JSON"""
    pushes = re.findall(r'self\.__next_f\.push\(\[1,"(.*?)"\]\)', html, re.DOTALL)
    for p in pushes:
        if 'skillId' not in p or 'installs' not in p or 'initialSkills' not in p:
            continue
        try:
            decoded = p.encode().decode('unicode_escape')
        except Exception:
            decoded = p.replace('\\"', '"').replace('\\n', '\n')
        idx = decoded.find('"initialSkills":[')
        if idx == -1:
            continue
        start = idx + len('"initialSkills":')
        depth, end = 0, start
        for i in range(start, len(decoded)):
            if decoded[i] == '[':
                depth += 1
            elif decoded[i] == ']':
                depth -= 1
                if depth == 0:
                    end = i + 1
                    break
        try:
            skills_data = json.loads(decoded[start:end])
            if not isinstance(skills_data, list):
                continue
            result = []
            for sk in skills_data[:500]:
                result.append(dict(
                    name=sk.get("name", ""),
                    description=f"github.com/{sk.get('source', '')} · {sk.get('installs', 0):,} installs",
                    source=sk.get("source", "skills.sh"),
                    trust="official" if sk.get("isOfficial") else "community",
                    identifier=f"{sk.get('source', '')}/{sk.get('skillId', '')}",
                ))
            return result
        except Exception:
            continue
    return []


class MarketService:
    def __init__(self, skill_service: SkillService | None = None):
        self._skill_svc = skill_service or SkillService()

    def search_skills(self, query: str = "", filter_type: str = "", page: int = 1, page_size: int = 30) -> tuple[list[MarketSkill], int]:
        raw = self._fetch_all_skills()
        if query:
            q = query.lower()
            raw = [s for s in raw if q in s.get("name", "").lower() or q in s.get("description", "").lower()]
        if filter_type == "official":
            raw = [s for s in raw if s.get("trust") == "official"]
        elif filter_type == "community":
            raw = [s for s in raw if s.get("trust") != "official"]
        total = len(raw)
        start = (page - 1) * page_size
        paged = raw[start:start + page_size]
        installed = self._skill_svc.get_installed_names()
        return [MarketSkill(**sk, installed=sk["name"] in installed) for sk in paged], total

    def install_skill(self, identifier: str) -> str:
        from hermes_manager.services.hermes_cli import get_hermes_cli
        return get_hermes_cli().install_skill(identifier)

    def get_mcp_catalog(self) -> list[MarketMCP]:
        from hermes_manager.services.hermes_cli import get_hermes_cli
        try:
            raw = get_hermes_cli().mcp_catalog()
        except CLIError:
            raw = []
        from hermes_manager.repos.config_repo import get_config_repo
        installed_names = set(get_config_repo().get_mcp_servers().keys())
        return [
            MarketMCP(name=m["name"], status=m.get("status", ""), description=m.get("description", ""),
                      installed=m["name"] in installed_names or m.get("is_custom", False),
                      is_custom=m.get("is_custom", False))
            for m in raw
        ]

    def install_mcp(self, name: str) -> str:
        from hermes_manager.services.hermes_cli import get_hermes_cli
        return get_hermes_cli().install_mcp(name)

    def get_plugins(self) -> list[MarketPlugin]:
        from hermes_manager.services.hermes_cli import get_hermes_cli
        try:
            raw = get_hermes_cli().list_plugins()
        except CLIError:
            raw = []
        return [MarketPlugin(**p) for p in raw]

    def toggle_plugin(self, name: str, enable: bool) -> str:
        from hermes_manager.services.hermes_cli import get_hermes_cli
        return get_hermes_cli().toggle_plugin(name, enable)

    def _fetch_all_skills(self) -> list[dict]:
        html = _curl_fetch("https://skills.sh", timeout=15)
        skills = _extract_skills_sh(html)
        if not skills:
            raise CLIError("skills catalog", "无法获取技能数据")
        return skills
