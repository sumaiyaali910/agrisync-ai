import os
import sys
import uuid
import sqlite3
import tempfile
from datetime import datetime
from typing import Optional

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, Response, JSONResponse
from pydantic import BaseModel

# Ensure api/ and root are in sys.path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(CURRENT_DIR)
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

try:
    from static_assets import INDEX_HTML, STYLES_CSS, SCRIPT_JS
except Exception:
    try:
        from api.static_assets import INDEX_HTML, STYLES_CSS, SCRIPT_JS
    except Exception:
        INDEX_HTML = b"<h1>AgriSync AI Loading...</h1>"
        STYLES_CSS = b""
        SCRIPT_JS = b""

app = FastAPI(title="AgriSync AI Enterprise API", version="3.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DEFAULT_LABOURERS = [
    {
        "id": "LBR-SD-001",
        "name": "Allah Dino Mallah",
        "phone": "0301-3458910",
        "cnic": "41304-8829104-1",
        "district": "Hyderabad",
        "address": "Village Tando Qaiser, Taluka Hyderabad Rural",
        "skill": "harvesting",
        "skill_label": "Wheat & Rice Harvesting (Katai)",
        "wage": 1200,
        "experience": "9 Years",
        "team_size": 6,
        "availability": "Available Now",
        "verified": True
    },
    {
        "id": "LBR-SD-002",
        "name": "Ghulam Mustafa Khoso",
        "phone": "0312-9087123",
        "cnic": "43203-1192837-3",
        "district": "Larkana",
        "address": "Near Dokri Canal Road, Larkana",
        "skill": "tractor",
        "skill_label": "Tractor & Laser Leveller Operator",
        "wage": 1800,
        "experience": "12 Years",
        "team_size": 1,
        "availability": "Available Now",
        "verified": True
    },
    {
        "id": "LBR-SD-003",
        "name": "Mai Bhagi Solangi (Group Leader)",
        "phone": "0333-2198450",
        "cnic": "44201-5549201-2",
        "district": "Mirpurkhas",
        "address": "Deh 114, Digri Road, Mirpurkhas",
        "skill": "cotton_picking",
        "skill_label": "Cotton Picking Group (Chunai)",
        "wage": 1000,
        "experience": "14 Years",
        "team_size": 12,
        "availability": "Available Now",
        "verified": True
    },
    {
        "id": "LBR-SD-004",
        "name": "Manzoor Hussain Jatoi",
        "phone": "0300-7761920",
        "cnic": "45402-6610293-5",
        "district": "Shaheed Benazirabad",
        "address": "Kazi Ahmed Stop, Nawabshah",
        "skill": "thresher",
        "skill_label": "Thresher Machine Operator",
        "wage": 2000,
        "experience": "11 Years",
        "team_size": 3,
        "availability": "Available Now",
        "verified": True
    },
    {
        "id": "LBR-SD-005",
        "name": "Sajjad Ali Panhwar",
        "phone": "0345-8823109",
        "cnic": "41101-9930182-7",
        "district": "Badin",
        "address": "Matli Bypass, District Badin",
        "skill": "spraying",
        "skill_label": "Pesticide & Boom Spray Specialist",
        "wage": 1400,
        "experience": "7 Years",
        "team_size": 2,
        "availability": "Available Now",
        "verified": True
    },
    {
        "id": "LBR-SD-006",
        "name": "Wazir Ahmed Chachar",
        "phone": "0302-4410982",
        "cnic": "45504-3381920-9",
        "district": "Sukkur",
        "address": "Pano Akil National Highway, Sukkur",
        "skill": "irrigation",
        "skill_label": "Canal & Tube-Well Water Management (Kassi)",
        "wage": 1100,
        "experience": "15 Years",
        "team_size": 2,
        "availability": "Available Now",
        "verified": True
    }
]

SQLITE_DB_PATH = os.path.join(tempfile.gettempdir(), "agrisync_production.db")
_mongo_collection = None
_mongo_checked = False


def _get_mongo_collection():
    global _mongo_collection, _mongo_checked
    if _mongo_checked:
        return _mongo_collection
    _mongo_checked = True
    mongo_uri = os.environ.get("MONGODB_URI", "").strip()
    if not mongo_uri:
        return None
    try:
        from pymongo import MongoClient
        client = MongoClient(mongo_uri, serverSelectionTimeoutMS=3500)
        client.admin.command("ping")
        db = client["agrisync_sindh"]
        _mongo_collection = db["labourers"]
        if _mongo_collection.count_documents({}) == 0:
            _mongo_collection.insert_many([dict(item) for item in DEFAULT_LABOURERS])
        return _mongo_collection
    except Exception:
        _mongo_collection = None
        return None


def _get_sqlite_conn():
    conn = sqlite3.connect(SQLITE_DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("""
        CREATE TABLE IF NOT EXISTS labourers (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            phone TEXT NOT NULL,
            cnic TEXT,
            district TEXT NOT NULL,
            address TEXT,
            skill TEXT NOT NULL,
            skill_label TEXT NOT NULL,
            wage INTEGER NOT NULL,
            experience TEXT,
            team_size INTEGER DEFAULT 1,
            availability TEXT DEFAULT 'Available Now',
            verified INTEGER DEFAULT 1,
            created_at TEXT
        )
    """)
    cursor = conn.execute("SELECT COUNT(*) as cnt FROM labourers")
    if cursor.fetchone()["cnt"] == 0:
        for item in DEFAULT_LABOURERS:
            conn.execute("""
                INSERT INTO labourers (
                    id, name, phone, cnic, district, address, skill,
                    skill_label, wage, experience, team_size, availability, verified, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                item["id"], item["name"], item["phone"], item["cnic"],
                item["district"], item["address"], item["skill"],
                item["skill_label"], item["wage"], item["experience"],
                item["team_size"], item["availability"],
                1 if item["verified"] else 0,
                datetime.utcnow().isoformat()
            ))
        conn.commit()
    return conn


def get_all_labourers(district=None, skill=None):
    col = _get_mongo_collection()
    if col is not None:
        query = {}
        if district and district != "all":
            query["district"] = district
        if skill and skill != "all":
            query["skill"] = skill
        docs = list(col.find(query, {"_id": 0}).sort("created_at", -1))
        return docs, "MongoDB Atlas Cloud"

    try:
        conn = _get_sqlite_conn()
        sql = "SELECT * FROM labourers WHERE 1=1"
        params = []
        if district and district != "all":
            sql += " AND LOWER(district) = LOWER(?)"
            params.append(district)
        if skill and skill != "all":
            sql += " AND LOWER(skill) = LOWER(?)"
            params.append(skill)
        sql += " ORDER BY rowid DESC"
        rows = conn.execute(sql, params).fetchall()
        conn.close()
        result = []
        for r in rows:
            d = dict(r)
            d["verified"] = bool(d.get("verified", 1))
            result.append(d)
        return result, "SQLite Persistent DB"
    except Exception:
        return list(DEFAULT_LABOURERS), "In-Memory Fallback"


def create_labourer(payload: dict):
    skill_labels = {
        "harvesting": "Wheat & Rice Harvesting (Katai)",
        "cotton_picking": "Cotton Picking Group (Chunai)",
        "tractor": "Tractor & Laser Leveller Operator",
        "thresher": "Thresher Machine Operator",
        "spraying": "Pesticide & Boom Spray Specialist",
        "irrigation": "Canal & Tube-Well Water Management (Kassi)"
    }
    skill_code = payload.get("skill", "harvesting")
    record = {
        "id": f"LBR-SD-{str(uuid.uuid4())[:6].upper()}",
        "name": str(payload.get("name", "")).strip(),
        "phone": str(payload.get("phone", "")).strip(),
        "cnic": str(payload.get("cnic", "") or "Not Provided").strip(),
        "district": str(payload.get("district", "Hyderabad")).strip(),
        "address": str(payload.get("address", "") or f"District {payload.get('district', 'Hyderabad')}, Sindh").strip(),
        "skill": skill_code,
        "skill_label": payload.get("skill_label") or skill_labels.get(skill_code, "General Farm Labour"),
        "wage": int(payload.get("wage", 1200)),
        "experience": str(payload.get("experience", "5+ Years")),
        "team_size": int(payload.get("team_size", 1)),
        "availability": "Available Now",
        "verified": True,
        "created_at": datetime.utcnow().isoformat()
    }

    col = _get_mongo_collection()
    if col is not None:
        col.insert_one(dict(record))
        return record, "MongoDB Atlas Cloud"

    try:
        conn = _get_sqlite_conn()
        conn.execute("""
            INSERT INTO labourers (
                id, name, phone, cnic, district, address, skill,
                skill_label, wage, experience, team_size, availability, verified, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            record["id"], record["name"], record["phone"], record["cnic"],
            record["district"], record["address"], record["skill"],
            record["skill_label"], record["wage"], record["experience"],
            record["team_size"], record["availability"], 1, record["created_at"]
        ))
        conn.commit()
        conn.close()
        return record, "SQLite Persistent DB"
    except Exception:
        DEFAULT_LABOURERS.insert(0, record)
        return record, "In-Memory Fallback"


class LabourRegistrationRequest(BaseModel):
    name: str
    phone: str
    cnic: Optional[str] = "Not Provided"
    district: str
    address: Optional[str] = ""
    skill: str
    skill_label: Optional[str] = ""
    wage: int = 1200
    experience: Optional[str] = "5+ Years"
    team_size: int = 1


@app.get("/api/health")
def health_check():
    _, engine = get_all_labourers()
    return {
        "status": "healthy",
        "service": "AgriSync AI Enterprise API",
        "region": "Sindh, Pakistan",
        "database_engine": engine
    }


@app.get("/api/labour")
def list_labourers(district: Optional[str] = None, skill: Optional[str] = None):
    records, engine = get_all_labourers(district=district, skill=skill)
    return {
        "status": "success",
        "database_engine": engine,
        "count": len(records),
        "labourers": records
    }


@app.post("/api/labour")
def register_labourer(payload: LabourRegistrationRequest):
    record, engine = create_labourer(payload.dict())
    return {
        "status": "success",
        "database_engine": engine,
        "message": f"{record['name']} registered in Sindh Kisan Mazdoor Directory ({engine}).",
        "labourer": record
    }


@app.get("/api/marketplace")
def get_marketplace_forecasts():
    return {
        "status": "success",
        "updated_at": "Live Sindh Wholesale Mandi Feed",
        "currency": "PKR per 40kg (Maund)",
        "crops": [
            {
                "crop": "Wheat (Gandum)",
                "mandi": "Hyderabad & Nawabshah Grain Mandi",
                "current_price_40kg": 4150,
                "predicted_peak_40kg": 4520,
                "best_sell_window": "Hold 18 Days (Mid-May Peak)",
                "signal": "HOLD",
                "confidence": 93,
                "trend_pct": "+8.9%",
                "reason": "Post-harvest arrivals in Sanghar & Nawabshah are peaking this week; prices recover strongly after PASSCO procurement accelerates."
            },
            {
                "crop": "Phutti / Seed Cotton (Kapas)",
                "mandi": "Mirpurkhas & Sanghar Cotton Exchange",
                "current_price_40kg": 8900,
                "predicted_peak_40kg": 9650,
                "best_sell_window": "Sell in 10 Days (spinning mill restock)",
                "signal": "HOLD",
                "confidence": 89,
                "trend_pct": "+8.4%",
                "reason": "Karachi textile mills increasing lint orders ahead of export shipments; dry-grade Phutti commands premium."
            },
            {
                "crop": "IRRI-6 / Basmati Paddy (Chawal)",
                "mandi": "Larkana & Jacobabad Rice Market",
                "current_price_40kg": 3750,
                "predicted_peak_40kg": 3620,
                "best_sell_window": "Sell Immediately (At Peak Now)",
                "signal": "SELL NOW",
                "confidence": 95,
                "trend_pct": "-3.5%",
                "reason": "Export container backlog at Port Qasim is easing; new upper-Sindh stock will soften spot rates next week."
            },
            {
                "crop": "Sugarcane (Kamad)",
                "mandi": "Tando Allahyar & Badin Sugar Zone",
                "current_price_40kg": 465,
                "predicted_peak_40kg": 510,
                "best_sell_window": "Sell Immediately to Mill Gate",
                "signal": "SELL NOW",
                "confidence": 96,
                "trend_pct": "+9.6%",
                "reason": "Sucrose recovery drops rapidly in rising heat; immediate crushing avoids weight loss."
            },
            {
                "crop": "Sindhri Mango (Aam)",
                "mandi": "Mirpurkhas & Tando Allahyar Fruit Mandi",
                "current_price_40kg": 6400,
                "predicted_peak_40kg": 7200,
                "best_sell_window": "Hold 6 Days (GCC Export Window)",
                "signal": "HOLD",
                "confidence": 91,
                "trend_pct": "+12.5%",
                "reason": "Hot-water treatment plants opening full capacity for Dubai & Riyadh air-freight shipments."
            },
            {
                "crop": "Red Onion (Piyaz / Basar)",
                "mandi": "Hyderabad & Matiari Sabzi Mandi",
                "current_price_40kg": 3200,
                "predicted_peak_40kg": 2850,
                "best_sell_window": "Sell Immediately",
                "signal": "SELL NOW",
                "confidence": 90,
                "trend_pct": "-10.9%",
                "reason": "Balochistan crop arrivals starting next week; current Hyderabad mandi rates are at seasonal high."
            }
        ]
    }


@app.get("/styles.css")
def serve_css():
    return Response(content=STYLES_CSS, media_type="text/css; charset=utf-8")


@app.get("/script.js")
def serve_js():
    return Response(content=SCRIPT_JS, media_type="application/javascript; charset=utf-8")


@app.get("/", response_class=HTMLResponse)
@app.get("/index.html", response_class=HTMLResponse)
@app.get("/api/index.py", response_class=HTMLResponse)
def serve_index():
    return Response(content=INDEX_HTML, media_type="text/html; charset=utf-8")


@app.get("/{full_path:path}")
def catch_all(full_path: str):
    if full_path.endswith("styles.css"):
        return Response(content=STYLES_CSS, media_type="text/css; charset=utf-8")
    if full_path.endswith("script.js"):
        return Response(content=SCRIPT_JS, media_type="application/javascript; charset=utf-8")
    return Response(content=INDEX_HTML, media_type="text/html; charset=utf-8")
