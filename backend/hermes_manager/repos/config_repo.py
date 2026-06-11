"""配置读写（单例注入）"""
from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from typing import Any

import yaml

from hermes_manager.core.config import get_settings


class ConfigRepository:
    """config.yaml 的读写封装"""

    def __init__(self, path: Path | None = None):
        self._path = path or get_settings().config_path

    def read(self) -> dict:
        with open(self._path, "r", encoding="utf-8") as f:
            return yaml.safe_load(f)

    def write(self, config: dict) -> None:
        with open(self._path, "w", encoding="utf-8") as f:
            yaml.safe_dump(
                config, f, allow_unicode=True, default_flow_style=False, sort_keys=False
            )

    def get_mcp_servers(self) -> dict[str, Any]:
        return self.read().get("mcp_servers", {})

    def set_mcp_server(self, name: str, cfg: dict) -> None:
        config = self.read()
        config.setdefault("mcp_servers", {})[name] = cfg
        self.write(config)

    def remove_mcp_server(self, name: str) -> None:
        config = self.read()
        config["mcp_servers"].pop(name, None)
        self.write(config)

    def get_platform_toolsets(self) -> dict:
        return self.read().get("platform_toolsets", {})

    def set_platform_toolsets(self, toolsets: dict) -> None:
        config = self.read()
        config["platform_toolsets"] = toolsets
        self.write(config)

    def get_disabled_toolsets(self) -> list[str]:
        return self.read().get("agent", {}).get("disabled_toolsets", [])

    def set_disabled_toolsets(self, toolsets: list[str]) -> None:
        config = self.read()
        config.setdefault("agent", {})["disabled_toolsets"] = toolsets
        self.write(config)

    def get_model_default(self) -> str:
        return self.read().get("model", {}).get("default", "unknown")


@lru_cache
def get_config_repo() -> ConfigRepository:
    return ConfigRepository()
