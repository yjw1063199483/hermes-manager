"""Market 详情 API — skills.sh 元数据 + GitHub raw 正文"""
from __future__ import annotations

import re
import subprocess

from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/market", tags=["Market"])


def _curl(url: str, timeout: int = 10) -> str:
    r = subprocess.run(
        ["curl", "-sL", "--socks5", "127.0.0.1:7897", url, "--max-time", str(timeout)],
        capture_output=True, text=True, timeout=timeout + 5)
    return r.stdout


def _parse_skill_md(content: str) -> dict:
    if content.startswith("---\n"):
        parts = content.split("---\n", 2)
        if len(parts) >= 3:
            try:
                import yaml
                fm = yaml.safe_load(parts[1]) or {}
                return {"fm": fm, "body": parts[2].strip()}
            except Exception:
                pass
    return {"fm": {}, "body": content.strip()}


def _scrape_skills_sh(owner: str, repo: str, skill_id: str) -> dict:
    """从 skills.sh 抓取元数据"""
    url = f"https://skills.sh/{owner}/{repo}/{skill_id}"
    html = _curl(url, timeout=10)
    result = {"desc": "", "installs": 0, "is_official": False, "url": url}

    # og:description
    m = re.search(r'<meta[^>]+property="og:description"[^>]+content="([^"]+)"', html)
    if m:
        result["desc"] = m.group(1).replace("&quot;", '"').replace("&apos;", "'").replace("&amp;", "&")

    # installs + isOfficial (Next.js 流式数据)
    clean = html.replace('\\"', '"')
    m = re.search(r'"installs":(\d+)', clean)
    if m:
        result["installs"] = int(m.group(1))
    m = re.search(r'"isOfficial":(true|false)', clean)
    if m:
        result["is_official"] = m.group(1) == "true"

    # 尝试从流式数据中提取更完整的描述
    m = re.search(r'"description":"([^"]{50,500})"', clean)
    if m:
        d = m.group(1).replace('\\n', '\n')
        if len(d) > len(result["desc"]):
            result["desc"] = d

    return result


@router.get("/skill/{owner}/{repo}/{skill_id}")
def skill_detail(owner: str, repo: str, skill_id: str):
    # 并行抓取两个源
    import concurrent.futures
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as ex:
        f_meta = ex.submit(_scrape_skills_sh, owner, repo, skill_id)
        f_body = ex.submit(_fetch_github_raw, owner, repo, skill_id)
        meta = f_meta.result()
        body_content = f_body.result()

    if not meta["desc"] and not body_content:
        raise HTTPException(404, "Skill not found")

    parsed = _parse_skill_md(body_content) if body_content else {"fm": {}, "body": ""}
    desc = parsed["fm"].get("description", "") or meta["desc"]

    return {
        "name": parsed["fm"].get("name", skill_id.replace("-", " ").title()),
        "source": f"{owner}/{repo}",
        "description": desc,
        "body": parsed["body"] if parsed["body"] else meta["desc"],
        "url": meta["url"],
        "is_official": meta["is_official"],
        "installs": meta["installs"],
    }


def _fetch_github_raw(owner: str, repo: str, skill_id: str) -> str:
    for branch in ["main", "master"]:
        for path in [
            f"https://raw.githubusercontent.com/{owner}/{repo}/{branch}/skills/{skill_id}/SKILL.md",
            f"https://raw.githubusercontent.com/{owner}/{repo}/{branch}/SKILL.md",
        ]:
            content = _curl(path, timeout=8)
            if content and "---" in content and not content.startswith("404"):
                return content
    return ""
