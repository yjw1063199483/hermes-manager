# Hermes Manager

Hermes Agent 的 Web 管理后台，提供可视化的 Skills、MCP、Memory、History 等管理能力。

## 安装

```bash
pip install hermes-manager
```

## 启动

```bash
hermes-manager
```

自动打开浏览器访问 http://127.0.0.1:9527

**参数：**
- `--port 8080` — 自定义端口
- `--no-browser` — 不自动打开浏览器

## 功能

| 面板 | 说明 |
|------|------|
| Skills | 技能列表/管理/预览 |
| MCP | MCP 服务器配置管理 |
| Memory | MEMORY.md / USER.md 编辑 |
| History | 会话查看/搜索/删除，Session ID 一键复制 |
| Toolsets | 工具组开关 |
| 市场 | Skills Hub + MCP 目录 |
| 人设 | SOUL.md 编辑 |

## 系统要求

- Python 3.10+
- Hermes Agent 已安装
