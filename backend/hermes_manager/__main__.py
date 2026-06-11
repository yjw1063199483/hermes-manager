"""Hermes Manager — CLI entry point.

Usage:
    python -m hermes_manager              # start server + open browser
    python -m hermes_manager --no-browser # start server only
    python -m hermes_manager --port 8080  # custom port
"""

import sys
import webbrowser
from pathlib import Path

import uvicorn


def main() -> None:
    port = 9527
    open_browser = True

    args = sys.argv[1:]
    for i, arg in enumerate(args):
        if arg == "--port" and i + 1 < len(args):
            port = int(args[i + 1])
        elif arg == "--no-browser":
            open_browser = False

    if open_browser:
        webbrowser.open(f"http://127.0.0.1:{port}")

    uvicorn.run(
        "hermes_manager.main:app",
        host="127.0.0.1",
        port=port,
        log_level="info",
    )


if __name__ == "__main__":
    main()
