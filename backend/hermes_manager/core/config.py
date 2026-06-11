"""应用核心配置"""
from __future__ import annotations

import os
from pathlib import Path
from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """全局配置，支持环境变量覆盖"""

    hermes_home: str = ""

    def model_post_init(self, __context):
        if not self.hermes_home:
            if os.name == "nt":
                self.hermes_home = os.path.join(
                    os.environ.get("LOCALAPPDATA", os.path.expanduser("~")), "hermes"
                )
            else:
                self.hermes_home = os.path.expanduser("~/.hermes")

    @property
    def skills_dir(self) -> Path:
        return Path(self.hermes_home) / "skills"

    @property
    def config_path(self) -> Path:
        return Path(self.hermes_home) / "config.yaml"

    @property
    def profiles_dir(self) -> Path:
        return Path(self.hermes_home) / "profiles"

    model_config = {"env_prefix": "HM_", "extra": "ignore"}


@lru_cache
def get_settings() -> Settings:
    return Settings()
