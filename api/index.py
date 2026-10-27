import os
import sys
import json
import uuid
import urllib.request
from datetime import datetime
from pathlib import Path
from typing import List, Optional, Literal, Dict, Any
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, Response, JSONResponse
from pydantic import BaseModel, Field

ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT_DIR))
sys.path.insert(0, str(ROOT_DIR / "backend"))

from backend.database import db_engine
from backend.app import (
    SINDH_AGRO_DEALERS,
    SINDH_MARKET_FORECASTS,
    SINDH_CROP_CONTEXT,
    LabourCreateRequest,
    ActionStep,
    PesticideRecommendation,
    VisionDiagnosisResponse,
)

app = FastAPI(
    title="AgriSync AI — Sindh Smart Agriculture Platform",
    version="3.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _read_static_file(filename: str) -> str:
    for folder in [ROOT_DIR, ROOT_DIR / "public", Path(__file__).resolve().parent]:
        candidate = folder / filename
        if candidate.exists():
            return candidate.read_text(encoding="utf-8")
    return ""


@app.get("/", response_class=HTMLResponse)
async def serve_home():
    return HTMLResponse(content=_read_static_file("index.html"), status_code=200)


@app.get("/index.html", response_class=HTMLResponse)
async def serve_index_html():
    return HTMLResponse(content=_read_static_file("index.html"), status_code=200)


@app.get("/styles.css")
async def serve_styles():
    return Response(content=_read_static_file("styles.css"), media_type="text/css")


@app.get("/script.js")
async def serve_script():
    return Response(content=_read_static_file("script.js"), media_type="application/javascript")


@app.get("/api/marketplace")
async def get_agri_marketplace(crop: str = Query("ALL")):
    if crop != "ALL" and crop in SINDH_MARKET_FORECASTS:
        return {
            "status": "LIVE",
            "item": SINDH_MARKET_FORECASTS[crop],
            "allMarkets": SINDH_MARKET_FORECASTS,
        }
    return {
        "status": "LIVE",
        "allMarkets": SINDH_MARKET_FORECASTS,
    }


@app.get("/api/labour")
async def list_farm_labourers(
    district: str = Query("ALL"),
    skill: str = Query("ALL"),
):
    records = db_engine.get_all_labourers(district=district, skill=skill)
    return {
        "storageEngine": db_engine.storage_engine,
        "count": len(records),
        "labourers": records,
    }


@app.post("/api/labour")
async def register_farm_labourer(payload: LabourCreateRequest):
    if len(payload.name.strip()) < 2:
        raise HTTPException(status_code=400, detail="Please enter labourer name")

    new_record = {
        "id": f"LAB-{payload.district[:3].upper()}-{str(uuid.uuid4())[:4].upper()}",
        "name": payload.name.strip(),
        "cnic": payload.cnic.strip(),
        "phone": payload.phone.strip(),
        "district": payload.district,
        "address": payload.address.strip(),
        "skills": payload.skills if payload.skills else ["harvesting"],
        "dailyWage": payload.dailyWage,
        "availability": "Available Now",
        "verified": True,
        "createdAt": datetime.utcnow().isoformat(),
    }

    saved = db_engine.add_labourer(new_record)
    return {
        "status": "SAVED",
        "storageEngine": db_engine.storage_engine,
        "labourer": saved,
    }


@app.post("/api/crop-doctor", response_model=VisionDiagnosisResponse)
async def diagnose_crop_leaf(
    image: Optional[UploadFile] = File(None),
    crop_hint: str = Form("wheat_rust"),
    district: str = Form("Sukkur"),
):
    dealers = SINDH_AGRO_DEALERS.get(district, SINDH_AGRO_DEALERS["Sukkur"])

    if crop_hint == "cotton_clcv":
        return VisionDiagnosisResponse(
            cropName="Cotton (Gossypium hirsutum) — Kharif Crop",
            visualObservation=(
                "Upward curling of leaf margins, pronounced darkening and swelling of lower veins, "
                "and characteristic cup-shaped foliar enations on the underside caused by Bemisia tabaci vector."
            ),
            primaryDisease="Cotton Leaf Curl Virus (CLCuV) + Whitefly Infestation",
            localName="ڪپهه جو مروڙيو روڳ ۽ سفيد مکي / پتہ مروڑ وائرس",
            confidence=92,
            severity="Critical — Whitefly vector exceeds Economic Threshold Level (5 adults/leaf)",
            pesticideRequired=PesticideRecommendation(
                chemicalName="Flonicamid 50% WG + Pyriproxyfen 10.8% EC",
                brandNames="Ulala (ICI/Syngenta) or Admiral (FMC)",
                type="Systemic Insecticide & Insect Growth Regulator (IGR)",
                dosagePerAcre="80 grams Flonicamid + 400 ml Pyriproxyfen in 120L water/acre",
                estimatedPricePkr="PKR 2,450 / Acre Pack",
            ),
            actionPlan=[
                ActionStep(
                    step="Immediate Whitefly Vector Knockdown",
                    detail="Spray Flonicamid 50% WG @ 80g/acre in the early morning before 9:00 AM using hollow-cone nozzle.",
                ),
                ActionStep(
                    step="Foliar Potash & Zinc Recovery",
                    detail="Apply 2% SOP (Potassium Sulfate) + 100g Chelated Zinc foliar spray 4 days after insecticide.",
                ),
            ],
            nearbyDealers=dealers,
        )

    return VisionDiagnosisResponse(
        cropName="Wheat (Triticum aestivum) — Rabi Crop",
        visualObservation=(
            "Linear rows of yellow-to-orange uredinial pustules running parallel to leaf veins "
            "on the upper blade surface with surrounding chlorotic halos."
        ),
        primaryDisease="Yellow / Stripe Rust (Puccinia striiformis)",
        localName="ڪڻڪ جي پيلي رتڙي / زرد کنگی",
        confidence=95,
        severity="High Risk — Rapid spore dispersal in 12–18°C humid Sukkur/Larkana mornings",
        pesticideRequired=PesticideRecommendation(
            chemicalName="Tebuconazole 50% + Trifloxystrobin 25% WG",
            brandNames="Nativo 75 WG (Bayer CropScience) or Tilt (Syngenta)",
            type="Broad-Spectrum Systemic Fungicide",
            dosagePerAcre="65 grams Nativo (or 200 ml Propiconazole) in 120 liters water/acre",
            estimatedPricePkr="PKR 1,850 / Acre Pack",
        ),
        actionPlan=[
            ActionStep(
                step="Immediate Fungicide Spray (Within 24 Hours)",
                detail="Apply Tebuconazole + Trifloxystrobin (Nativo) @ 65g/acre in 120 liters of water.",
            ),
            ActionStep(
                step="Suspend Nitrogen Top-Dressing",
                detail="Withhold additional Urea application to prevent lush tissue susceptibility.",
            ),
        ],
        nearbyDealers=dealers,
    )
