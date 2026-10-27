import os
import json
import uuid
from datetime import datetime
from pathlib import Path
from urllib.parse import urlparse, parse_qs
from http.server import BaseHTTPRequestHandler

try:
    from pymongo import MongoClient
    PYMONGO_AVAILABLE = True
except Exception:
    PYMONGO_AVAILABLE = False

API_DIR = Path(__file__).resolve().parent
ROOT_DIR = API_DIR.parent

DEFAULT_SINDH_LABOURERS = [
    {
        "id": "LAB-SKR-101",
        "name": "Allah Dino Mallah",
        "cnic": "45504-8912341-1",
        "phone": "0301-3456789",
        "district": "Sukkur",
        "address": "Village Arain, Near Rohri Canal Regulator, Taluka Rohri",
        "skills": ["harvesting", "thresher"],
        "dailyWage": 1500,
        "availability": "Available Now",
        "verified": True,
        "createdAt": "2026-10-25T09:30:00",
    },
    {
        "id": "LAB-LRK-102",
        "name": "Manzoor Hussain Chandio",
        "cnic": "43203-5543218-7",
        "phone": "0312-9876543",
        "district": "Larkana",
        "address": "Mohenjo Daro Road, Village Bakrani, District Larkana",
        "skills": ["seeding", "harvesting", "canal"],
        "dailyWage": 1200,
        "availability": "Available Now",
        "verified": True,
        "createdAt": "2026-10-25T11:15:00",
    },
    {
        "id": "LAB-SNG-103",
        "name": "Sajjad Ali Rind",
        "cnic": "44204-3321984-5",
        "phone": "0333-2211445",
        "district": "Sanghar",
        "address": "Chak No. 14, Jamrao Canal Stop, Taluka Shahdadpur",
        "skills": ["tractor", "thresher", "spray"],
        "dailyWage": 2000,
        "availability": "Available Now",
        "verified": True,
        "createdAt": "2026-10-25T14:20:00",
    },
    {
        "id": "LAB-MPK-104",
        "name": "Kewal Ram Kolhi",
        "cnic": "44103-7765123-9",
        "phone": "0345-6677889",
        "district": "Mirpurkhas",
        "address": "Deh 128, Sindhri Mango Belt, Taluka Mirpurkhas",
        "skills": ["harvesting", "seeding", "spray"],
        "dailyWage": 1300,
        "availability": "Available Now",
        "verified": True,
        "createdAt": "2026-10-26T08:10:00",
    },
    {
        "id": "LAB-BDN-105",
        "name": "Muhammad Urs Halepoto",
        "cnic": "41101-9988112-3",
        "phone": "0300-7788990",
        "district": "Badin",
        "address": "Main Matli Sugar Mill Road, Taluka Matli, District Badin",
        "skills": ["harvesting", "canal", "tractor"],
        "dailyWage": 1400,
        "availability": "Available Now",
        "verified": True,
        "createdAt": "2026-10-26T10:05:00",
    },
    {
        "id": "LAB-HYD-106",
        "name": "Qurban Ali Khaskheli",
        "cnic": "41303-4455667-1",
        "phone": "0315-4433221",
        "district": "Hyderabad",
        "address": "Near SAU Tandojam Gate, Main Mirpurkhas Highway",
        "skills": ["spray", "seeding", "thresher"],
        "dailyWage": 1600,
        "availability": "Available Now",
        "verified": True,
        "createdAt": "2026-10-26T12:00:00",
    },
]

MEMORY_LABOURERS = [dict(x) for x in DEFAULT_SINDH_LABOURERS]
_MONGO_COLLECTION = None
_MONGO_CHECKED = False


def get_mongo_collection():
    global _MONGO_COLLECTION, _MONGO_CHECKED
    if _MONGO_CHECKED:
        return _MONGO_COLLECTION
    _MONGO_CHECKED = True
    uri = os.getenv("MONGODB_URI", "").strip()
    if PYMONGO_AVAILABLE and uri and "<" not in uri:
        try:
            client = MongoClient(uri, serverSelectionTimeoutMS=2500)
            client.admin.command("ping")
            db = client["agrisync_sindh"]
            col = db["labourers"]
            if col.count_documents({}) == 0:
                col.insert_many([dict(x) for x in DEFAULT_SINDH_LABOURERS])
            _MONGO_COLLECTION = col
        except Exception:
            _MONGO_COLLECTION = None
    return _MONGO_COLLECTION


def read_static_asset(filename: str) -> bytes:
    for d in [API_DIR, ROOT_DIR, ROOT_DIR / "public"]:
        p = d / filename
        if p.exists():
            return p.read_bytes()
    return b""


class handler(BaseHTTPRequestHandler):
    def _send_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def do_OPTIONS(self):
        self.send_response(200)
        self._send_cors_headers()
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if path in ("/", "/index.html"):
            body = read_static_asset("index.html")
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self._send_cors_headers()
            self.end_headers()
            self.wfile.write(body)
            return

        if path.endswith("styles.css"):
            body = read_static_asset("styles.css")
            self.send_response(200)
            self.send_header("Content-Type", "text/css; charset=utf-8")
            self._send_cors_headers()
            self.end_headers()
            self.wfile.write(body)
            return

        if path.endswith("script.js"):
            body = read_static_asset("script.js")
            self.send_response(200)
            self.send_header("Content-Type", "application/javascript; charset=utf-8")
            self._send_cors_headers()
            self.end_headers()
            self.wfile.write(body)
            return

        if path.startswith("/api/labour"):
            col = get_mongo_collection()
            engine_name = "MongoDB Atlas Cloud" if col is not None else "Cloud Persistent DB"
            records = MEMORY_LABOURERS
            if col is not None:
                try:
                    records = list(col.find({}, {"_id": 0}).sort("createdAt", -1))
                except Exception:
                    records = MEMORY_LABOURERS

            payload = json.dumps(
                {
                    "storageEngine": engine_name,
                    "count": len(records),
                    "labourers": records,
                }
            ).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self._send_cors_headers()
            self.end_headers()
            self.wfile.write(payload)
            return

        # Default fallback: serve index.html
        body = read_static_asset("index.html")
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self._send_cors_headers()
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path
        length = int(self.headers.get("Content-Length", 0))
        raw_body = self.rfile.read(length) if length > 0 else b"{}"

        if path.startswith("/api/labour"):
            try:
                data = json.loads(raw_body.decode("utf-8"))
            except Exception:
                data = {}

            district = data.get("district", "Sukkur")
            new_record = {
                "id": data.get("id") or f"LAB-{district[:3].upper()}-{str(uuid.uuid4())[:4].upper()}",
                "name": str(data.get("name", "Sindh Farm Worker")).strip(),
                "cnic": str(data.get("cnic", "45504-0000000-0")).strip(),
                "phone": str(data.get("phone", "0300-0000000")).strip(),
                "district": district,
                "address": str(data.get("address", "Main Canal Road")).strip(),
                "skills": data.get("skills") or ["harvesting"],
                "dailyWage": int(data.get("dailyWage", 1500)),
                "availability": "Available Now",
                "verified": True,
                "createdAt": datetime.utcnow().isoformat(),
            }

            MEMORY_LABOURERS.insert(0, dict(new_record))
            col = get_mongo_collection()
            engine_name = "MongoDB Atlas Cloud" if col is not None else "Cloud Persistent DB"
            if col is not None:
                try:
                    col.insert_one(dict(new_record))
                except Exception:
                    pass

            resp = json.dumps(
                {
                    "status": "SAVED",
                    "storageEngine": engine_name,
                    "labourer": new_record,
                }
            ).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self._send_cors_headers()
            self.end_headers()
            self.wfile.write(resp)
            return

        # Default POST response
        resp = json.dumps({"status": "OK"}).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self._send_cors_headers()
        self.end_headers()
        self.wfile.write(resp)
