"""Hermes Manager — FastAPI Application"""
from __future__ import annotations

from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles

from hermes_manager.core.exceptions import HermesManagerError
from hermes_manager.api.v1 import skills, mcp, market, toolsets, soul, export_data, import_data, memory, sessions, files, terminal_exec


def create_app() -> FastAPI:
    app = FastAPI(
        title="Hermes Manager",
        version="2.0.0",
        docs_url="/api/docs",
    )

    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Exception handler
    @app.exception_handler(HermesManagerError)
    async def handle_domain_error(request: Request, exc: HermesManagerError):
        return JSONResponse(
            status_code=exc.status_code,
            content={"error": exc.detail},
        )

    @app.exception_handler(FileExistsError)
    async def handle_conflict(request: Request, exc: FileExistsError):
        return JSONResponse(status_code=409, content={"error": str(exc)})

    # API v1
    app.include_router(skills.router, prefix="/api/v1")
    app.include_router(mcp.router, prefix="/api/v1")
    app.include_router(market.router, prefix="/api/v1")
    app.include_router(toolsets.router, prefix="/api/v1")
    app.include_router(soul.router, prefix="/api/v1")
    app.include_router(export_data.router, prefix="/api/v1")
    app.include_router(import_data.router, prefix="/api/v1")
    app.include_router(memory.router, prefix="/api/v1")
    app.include_router(sessions.router, prefix="/api/v1")
    app.include_router(files.router, prefix="/api/v1")
    app.include_router(terminal_exec.router, prefix="/api/v1")

    # Static (frontend dist bundled in package)
    static_dir = Path(__file__).resolve().parent / "static"
    if static_dir.exists():
        app.mount("/assets", StaticFiles(directory=static_dir / "assets"), name="assets")

    @app.get("/")
    async def serve_index():
        index = static_dir / "index.html"
        if index.exists():
            return FileResponse(str(index))
        return {"message": "Frontend not built", "static_dir": str(static_dir)}

    return app


app = create_app()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("hermes_manager.main:app", host="127.0.0.1", port=9527, reload=True)
