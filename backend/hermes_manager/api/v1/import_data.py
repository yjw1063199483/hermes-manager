"""数据导入 API"""
from __future__ import annotations

import io
import shutil
import zipfile
from pathlib import Path

import yaml
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from hermes_manager.core.config import get_settings
from hermes_manager.repos.config_repo import ConfigRepository, get_config_repo

router = APIRouter(prefix="/import", tags=["Import"])


@router.post("")
async def import_all(
    file: UploadFile = File(...),
    repo: ConfigRepository = Depends(get_config_repo),
):
    """从导出的 zip 包导入配置"""
    if not file.filename or not file.filename.endswith(".zip"):
        raise HTTPException(400, "请上传 hermes-export.zip 文件")

    content = await file.read()
    buf = io.BytesIO(content)
    settings = get_settings()

    imported = {"skills": 0, "soul": False, "mcp": 0, "toolsets": False}
    skipped = {"skills": 0}

    try:
        with zipfile.ZipFile(buf, "r") as zf:
            names = zf.namelist()

            # 1. Skills
            skills_dir = settings.skills_dir
            for name in names:
                if name.startswith("skills/") and name.endswith("/SKILL.md"):
                    rel = name[len("skills/"):]
                    dest = skills_dir / rel
                    dest.parent.mkdir(parents=True, exist_ok=True)
                    if dest.exists():
                        skipped["skills"] += 1
                    else:
                        dest.write_bytes(zf.read(name))
                        imported["skills"] += 1

            # 2. SOUL.md
            if "SOUL.md" in names:
                soul_path = Path(settings.hermes_home) / "SOUL.md"
                soul_path.write_bytes(zf.read("SOUL.md"))
                imported["soul"] = True

            # 3. MCP 配置
            if "config/mcp_servers.yaml" in names:
                mcp_raw = zf.read("config/mcp_servers.yaml").decode("utf-8")
                new_mcp = yaml.safe_load(mcp_raw) or {}
                config = repo.read()
                existing_mcp = config.get("mcp_servers", {})
                added = 0
                for k, v in new_mcp.items():
                    if k not in existing_mcp:
                        existing_mcp[k] = v
                        added += 1
                if added > 0:
                    config["mcp_servers"] = existing_mcp
                    repo.write(config)
                imported["mcp"] = added

            # 4. Toolsets 配置
            if "config/toolsets.yaml" in names:
                ts_raw = zf.read("config/toolsets.yaml").decode("utf-8")
                new_ts = yaml.safe_load(ts_raw) or {}
                config = repo.read()
                existing_ts = config.get("platform_toolsets", {})
                merged = False
                for platform, tools in new_ts.items():
                    if isinstance(tools, dict):
                        existing_ts.setdefault(platform, {}).update(tools)
                        merged = True
                if merged:
                    config["platform_toolsets"] = existing_ts
                    repo.write(config)
                imported["toolsets"] = True

    except zipfile.BadZipFile:
        raise HTTPException(400, "无效的 zip 文件")

    return {
        "ok": True,
        "imported": imported,
        "skipped": skipped,
        "message": (
            f"导入完成：{imported['skills']} 个技能"
            + (f"（跳过 {skipped['skills']} 个已存在）" if skipped['skills'] else "")
            + (", SOUL.md" if imported['soul'] else "")
            + (f", {imported['mcp']} 个 MCP" if imported['mcp'] else "")
            + (", Toolsets" if imported['toolsets'] else "")
        ),
    }
