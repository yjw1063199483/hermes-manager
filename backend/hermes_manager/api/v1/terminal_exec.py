"""终端命令执行 API — 自动安装到 Hermes"""
from __future__ import annotations

import subprocess
import os
import re
import yaml
from pathlib import Path

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/terminal", tags=["Terminal"])


class ExecRequest(BaseModel):
    command: str


def _get_proxy_env() -> dict:
    proxy = os.environ.get("ALL_PROXY") or "socks5://127.0.0.1:7897"
    return {
        **os.environ,
        "ALL_PROXY": proxy, "HTTPS_PROXY": proxy, "HTTP_PROXY": proxy,
        "npm_config_proxy": proxy, "npm_config_https_proxy": proxy,
    }


def _parse_mcp_cmd(cmd: str) -> dict | None:
    """解析 MCP 安装命令，提取 command/args/server_name"""
    # npx -y @scope/name [args...]
    m = re.match(r'npx\s+(?:-y\s+)?(@?[\w@\-/.]+)(.*)', cmd)
    if m:
        pkg = m.group(1)
        extra = m.group(2).strip()
        args = ["-y", pkg] + (extra.split() if extra else [])
        name = pkg.split("/")[-1].replace("server-", "").replace("mcp-", "")
        return {"command": "npx", "args": args, "name": name}

    # uvx package [args...]
    m = re.match(r'uvx\s+([\w\-]+)(.*)', cmd)
    if m:
        pkg = m.group(1)
        extra = m.group(2).strip()
        args = [pkg] + (extra.split() if extra else [])
        return {"command": "uvx", "args": args, "name": pkg.replace("mcp-server-", "").replace("mcp-", "")}

    return None


def _register_to_hermes(parsed: dict) -> tuple[bool, str]:
    """将 MCP 服务器注册到 hermes config.yaml"""
    config_path = Path(os.path.expanduser("~/AppData/Local/hermes/config.yaml"))
    if not config_path.exists():
        return False, "config.yaml 未找到"

    with open(config_path, "r", encoding="utf-8") as f:
        config = yaml.safe_load(f) or {}

    mcp_servers = config.get("mcp_servers", {})
    name = parsed["name"]

    if name in mcp_servers:
        return True, f"{name} 已存在"

    mcp_servers[name] = {
        "type": "stdio",
        "command": parsed["command"],
        "args": parsed["args"],
    }
    config["mcp_servers"] = mcp_servers

    with open(config_path, "w", encoding="utf-8") as f:
        yaml.safe_dump(config, f, allow_unicode=True, default_flow_style=False)

    return True, f"{name} 已注册到 Hermes"


@router.post("/exec")
def exec_command(req: ExecRequest):
    cmd = req.command.strip()
    if not cmd:
        return {"ok": False, "output": "请输入命令"}

    # npx skills add → hermes skills install
    if not cmd.startswith("hermes "):
        npx_match = re.match(r'npx\s+skills\s+add\s+(?:https://github\.com/)?([^/\s]+/[^/\s]+)(?:\s+--skill\s+(\S+))?', cmd)
        if npx_match:
            repo = npx_match.group(1)
            skill = npx_match.group(2)
            if skill:
                cmd = f"hermes skills install {repo}/{skill} --yes"
            else:
                cmd = f"hermes skills install skills-sh/{repo} --yes"
        elif cmd.startswith("npx ") or cmd.startswith("npm ") or cmd.startswith("uvx ") or cmd.startswith("pip "):
            pass
        else:
            return {"ok": False, "output": "仅支持 hermes / npx / npm / uvx / pip 命令"}

    if " --yes" not in cmd and " -y" not in cmd:
        cmd += " --yes"

    env = _get_proxy_env()

    # 执行安装
    try:
        r = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=120, env=env)
        output = (r.stdout + r.stderr).strip()
        clean = re.sub(r'\x1b\[[0-9;]*m', '', output)

        if r.returncode != 0:
            return {"ok": False, "output": clean[-500:]}

        # 如果是 MCP 安装命令，自动注册到 Hermes
        messages = [clean[-500:] if clean else "安装完成"]
        parsed = _parse_mcp_cmd(req.command.strip())
        if parsed:
            registered, msg = _register_to_hermes(parsed)
            messages.append(msg)

        return {"ok": True, "output": "\n".join(messages)}
    except subprocess.TimeoutExpired:
        return {"ok": False, "output": "命令超时（120秒）"}
    except Exception as e:
        return {"ok": False, "output": str(e)}
