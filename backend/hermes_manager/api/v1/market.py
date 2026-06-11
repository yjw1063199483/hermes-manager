"""Market API"""
from __future__ import annotations

from fastapi import APIRouter, Depends, Query

from hermes_manager.schemas.market import MarketSkillInstall, MarketMCPInstall, PluginToggle
from hermes_manager.services.market_service import MarketService

router = APIRouter(prefix="/market", tags=["Market"])


def get_market_service() -> MarketService:
    return MarketService()


@router.get("/skills")
def search_skills(
    search: str = Query(default=""),
    filter_type: str = Query(default=""),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=30, ge=10, le=100),
    svc: MarketService = Depends(get_market_service),
):
    skills, total = svc.search_skills(search, filter_type, page, page_size)
    return {"skills": [s.model_dump() for s in skills], "total": total, "page": page, "page_size": page_size}


@router.post("/skills/install")
def install_skill(data: MarketSkillInstall, svc: MarketService = Depends(get_market_service)):
    try:
        output = svc.install_skill(data.identifier)
        return {"ok": True, "output": output}
    except Exception as e:
        from fastapi.responses import JSONResponse
        return JSONResponse(status_code=500, content={"error": str(e)})


@router.get("/mcp")
def mcp_catalog(svc: MarketService = Depends(get_market_service)):
    servers = svc.get_mcp_catalog()
    return {"servers": [s.model_dump() for s in servers]}


@router.post("/mcp/install")
def install_mcp(data: MarketMCPInstall, svc: MarketService = Depends(get_market_service)):
    output = svc.install_mcp(data.name)
    return {"ok": True, "output": output}


@router.get("/plugins")
def list_plugins(svc: MarketService = Depends(get_market_service)):
    plugins = svc.get_plugins()
    return {"plugins": [p.model_dump() for p in plugins]}


@router.post("/plugins/toggle")
def toggle_plugin(data: PluginToggle, svc: MarketService = Depends(get_market_service)):
    output = svc.toggle_plugin(data.name, data.enable)
    return {"ok": True, "output": output}
