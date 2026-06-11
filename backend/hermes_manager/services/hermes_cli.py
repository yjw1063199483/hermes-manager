"""Hermes CLI 调用封装"""
from __future__ import annotations

import os
import re
import subprocess
from functools import lru_cache
from dataclasses import dataclass

from hermes_manager.core.config import get_settings
from hermes_manager.core.exceptions import CLIError


@dataclass
class CLIResult:
    stdout: str
    stderr: str
    returncode: int


class HermesCLI:
    """Hermes CLI 的安全调用封装"""

    def __init__(self, hermes_home: str | None = None):
        self._home = hermes_home or str(get_settings().hermes_home)

    def run(self, args: list[str], timeout: int = 30) -> CLIResult:
        try:
            env = {**os.environ, "HERMES_HOME": self._home}
            # 通过代理访问 GitHub/npm 等外部源
            proxy = os.environ.get("ALL_PROXY") or "socks5://127.0.0.1:7897"
            env["ALL_PROXY"] = proxy
            env["HTTPS_PROXY"] = proxy
            env["HTTP_PROXY"] = proxy
            env["npm_config_proxy"] = proxy
            env["npm_config_https_proxy"] = proxy
            result = subprocess.run(
                ["hermes"] + args,
                capture_output=True,
                text=True,
                encoding="utf-8",
                errors="replace",
                timeout=timeout,
                env=env,
                cwd=self._home,
            )
            return CLIResult(
                stdout=result.stdout or "",
                stderr=result.stderr or "",
                returncode=result.returncode,
            )
        except subprocess.TimeoutExpired:
            raise CLIError(" ".join(args), "timeout")
        except FileNotFoundError:
            raise CLIError(" ".join(args), "hermes CLI not found")

    # ─── Skills Hub ───

    def search_skills(self, query: str) -> list[dict]:
        """搜索技能：先尝试 hermes CLI，失败则直接搜 GitHub"""
        try:
            r = self.run(["skills", "search", query], timeout=10)
            if r.returncode == 0 and r.stdout.strip():
                return self._parse_skills_table(r.stdout)
        except CLIError:
            pass
        # CLI 不通，直接用 GitHub API
        return self._search_github_skills(query)

    def browse_skills(self, page: int = 1) -> list[dict]:
        """浏览技能"""
        try:
            r = self.run(["skills", "browse", "--page", str(page), "--size", "20"], timeout=10)
            if r.returncode == 0 and r.stdout.strip():
                return self._parse_skills_table(r.stdout)
        except CLIError:
            pass
        return self._browse_github_skills()

    def install_skill(self, identifier: str) -> str:
        r = self.run(["skills", "install", identifier, "--yes"], timeout=60)
        if r.returncode != 0:
            raise CLIError("skills install", r.stderr or r.stdout)
        return r.stdout.strip()

    # ─── MCP ───

    def mcp_catalog(self) -> list[dict]:
        r = self.run(["mcp", "catalog"], timeout=15)
        if r.returncode != 0:
            raise CLIError("mcp catalog", r.stderr or r.stdout)
        return self._parse_mcp_catalog(r.stdout)

    def install_mcp(self, name: str) -> str:
        r = self.run(["mcp", "install", name], timeout=60)
        if r.returncode != 0:
            raise CLIError("mcp install", r.stderr or r.stdout)
        return r.stdout.strip()

    # ─── Plugins ───

    def list_plugins(self) -> list[dict]:
        r = self.run(["plugins", "list"], timeout=15)
        if r.returncode != 0:
            raise CLIError("plugins list", r.stderr or r.stdout)
        return self._parse_plugins(r.stdout)

    def toggle_plugin(self, name: str, enable: bool) -> str:
        action = "enable" if enable else "disable"
        r = self.run(["plugins", action, name], timeout=30)
        if r.returncode != 0:
            raise CLIError(f"plugins {action}", r.stderr or r.stdout)
        return r.stdout.strip()

    # ─── 表格解析 ───

    @staticmethod
    def _parse_skills_table(text: str) -> list[dict]:
        skills = []
        for line in text.split("\n"):
            line = line.strip()
            if not line.startswith("│") or "Name" in line or "────" in line:
                continue
            if "┌" in line or "└" in line:
                continue
            parts = [p.strip() for p in line.split("│")]
            parts = [p for p in parts if p]
            if not parts:
                continue
            # browse: #|Name|Desc|Source|Trust|Identifier (6列)
            if len(parts) == 6 and parts[0].isdigit():
                skills.append(dict(name=parts[1], description=parts[2],
                                   source=parts[3], trust=parts[4], identifier=parts[5]))
            # search: Name|Desc|Source|Trust|Identifier (5列)
            elif len(parts) == 5 and not parts[0].isdigit():
                skills.append(dict(name=parts[0], description=parts[1],
                                   source=parts[2], trust=parts[3], identifier=parts[4]))
        return skills

    @staticmethod
    def _parse_mcp_catalog(text: str) -> list[dict]:
        servers = []
        for line in text.split("\n"):
            # 更宽松的正则：名字后面至少1空格，状态后面至少1空格
            m = re.match(r"^\s{2}(\S[\S ]*?)\s+(available|custom\s*[—\-\u2014\u2013]\s*\S+)\s+(.+)$", line)
            if m:
                name = m.group(1).strip()
                status = m.group(2).strip()
                servers.append(dict(
                    name=name, status=status, description=m.group(3).strip(),
                    is_custom="custom" in status
                ))
        return servers

    @staticmethod
    def _parse_plugins(text: str) -> list[dict]:
        plugins = []
        for line in text.split("\n"):
            line = line.strip()
            if not line.startswith("│") or "Name" in line or "────" in line:
                continue
            if "┌" in line or "└" in line:
                continue
            parts = [p.strip() for p in line.split("│")]
            parts = [p for p in parts if p]
            if len(parts) >= 4 and parts[0]:
                plugins.append(dict(
                    name=parts[0], status=parts[1], version=parts[2],
                    description=parts[3], source=parts[4] if len(parts) > 4 else ""
                ))
        return plugins


    # ─── GitHub 直接搜索（绕过 hermes CLI 网络问题）───

    def _search_github_skills(self, query: str) -> list[dict]:
        """直接搜 GitHub 上的 hermes-skill 标签仓库"""
        try:
            return _github_search(f"hermes-skill {query}")
        except Exception:
            return []

    def _browse_github_skills(self) -> list[dict]:
        """浏览 GitHub 上的热门 hermes 技能"""
        try:
            return _github_search("hermes-skill")
        except Exception:
            return []


# ─── GitHub API 工具函数 ───

import urllib.request
import json as _json
import urllib.parse

def _github_search(q: str) -> list[dict]:
    """搜索 GitHub 仓库"""
    url = f"https://api.github.com/search/repositories?q={urllib.parse.quote(q)}&sort=stars&per_page=30"
    req = urllib.request.Request(url, headers={"User-Agent": "hermes-manager", "Accept": "application/vnd.github.v3+json"})
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = _json.loads(resp.read())
    except Exception:
        return []

    skills = []
    for item in data.get("items", []):
        desc = (item.get("description") or "")[:200]
        skills.append({
            "name": item.get("name", ""),
            "description": desc,
            "source": "github",
            "trust": f"⭐{item.get('stargazers_count',0)}",
            "identifier": f"github:{item.get('full_name','')}",
        })
    return skills

from functools import lru_cache

@lru_cache
def get_hermes_cli() -> HermesCLI:
    return HermesCLI()
