"""数据导出 API"""
from __future__ import annotations

import io
import zipfile
from pathlib import Path

import yaml
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse

from hermes_manager.core.config import get_settings
from hermes_manager.repos.config_repo import ConfigRepository, get_config_repo

router = APIRouter(prefix="/export", tags=["Export"])


@router.get("")
def export_all(repo: ConfigRepository = Depends(get_config_repo)):
    """导出所有可迁移数据为 zip"""
    buf = io.BytesIO()
    settings = get_settings()

    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
        # 1. Skills
        skills_dir = settings.skills_dir
        if skills_dir.exists():
            for md_path in skills_dir.rglob("SKILL.md"):
                arcname = "skills/" + str(md_path.relative_to(skills_dir))
                zf.write(md_path, arcname)

        # 2. SOUL.md
        soul_path = Path(settings.hermes_home) / "SOUL.md"
        if soul_path.exists():
            zf.write(soul_path, "SOUL.md")

        # 3. MCP 配置（仅导出 mcp_servers 部分）
        config = repo.read()
        mcp_config = config.get("mcp_servers", {})
        if mcp_config:
            mcp_yaml = yaml.safe_dump(mcp_config, allow_unicode=True, default_flow_style=False)
            zf.writestr("config/mcp_servers.yaml", mcp_yaml)

        # 4. Toolsets 配置
        toolsets = config.get("platform_toolsets", {})
        if toolsets:
            ts_yaml = yaml.safe_dump(toolsets, allow_unicode=True, default_flow_style=False)
            zf.writestr("config/toolsets.yaml", ts_yaml)

        # 5. 导入说明
        readme = """# Hermes 配置迁移包

## 还原方式

1. Skills: 将 skills/ 目录复制到目标 Hermes 的 ~/.hermes/skills/
2. SOUL.md: 复制到 ~/.hermes/SOUL.md
3. MCP: 将 config/mcp_servers.yaml 内容合并到目标 ~/.hermes/config.yaml 的 mcp_servers 字段
4. Toolsets: 同上，合并到 platform_toolsets 字段

## 生效

执行 /reload-skills 和 /reload-mcp 或 /reset 新会话即可。
"""
        zf.writestr("README.txt", readme)

    buf.seek(0)
    return StreamingResponse(
        buf,
        media_type="application/zip",
        headers={"Content-Disposition": "attachment; filename=hermes-export.zip"},
    )
