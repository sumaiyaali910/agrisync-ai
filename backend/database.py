"""
AgriSync AI — Production Multi-Engine Database Layer (database.py)
Supports:
1. MongoDB Atlas (via MONGODB_URI environment variable)
2. Firebase Realtime Database / Firestore REST API (via FIREBASE_DB_URL)
3. Built-in SQLite3 Persistent Database (agrisync_production.db) — Zero-config default
   so all Labour Registrations and Gov Subsidy Registrations are permanently stored on disk
   and immediately visible to all users.
"""

import os
import json
import sqlite3
import urllib.request
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Any

DB_FILE = Path(__file__).resolve().parent / "agrisync_production.db"
ENV_FILE = Path(__file__).resolve().parent / ".env"

# Automatically load backend/.env if present on local machine
if ENV_FILE.exists():
    for line in ENV_FILE.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            k, v = line.split("=", 1)
            os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))

# Optional MongoDB driver
try:
    from pymongo import MongoClient
    PYMONGO_AVAILABLE = True
except ImportError:
    PYMONGO_AVAILABLE = False

MONGODB_URI = os.getenv("MONGODB_URI", "").strip()
FIREBASE_DB_URL = os.getenv("FIREBASE_DB_URL", "").strip()

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


class AgriSyncDatabase:
    def __init__(self):
        self.mongo_client = None
        self.mongo_db = None
        self.storage_engine = "SQLite3 (Persistent Disk) + Cloud Ready"

        if PYMONGO_AVAILABLE and MONGODB_URI:
            try:
                self.mongo_client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=3000)
                self.mongo_client.server_info()
                self.mongo_db = self.mongo_client["agrisync_sindh"]
                self.storage_engine = "MongoDB Atlas Cloud"
            except Exception as exc:
                print(f"MongoDB connection fallback to SQLite: {exc}")

        if FIREBASE_DB_URL and self.storage_engine.startswith("SQLite"):
            self.storage_engine = "Firebase Realtime DB + SQLite Mirror"

        self._init_sqlite()

    def _init_sqlite(self):
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS labourers (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                cnic TEXT NOT NULL,
                phone TEXT NOT NULL,
                district TEXT NOT NULL,
                address TEXT NOT NULL,
                skills_json TEXT NOT NULL,
                daily_wage INTEGER NOT NULL,
                availability TEXT NOT NULL,
                verified INTEGER DEFAULT 1,
                created_at TEXT NOT NULL
            )
            """
        )
        cursor.execute("SELECT COUNT(*) FROM labourers")
        count = cursor.fetchone()[0]
        if count == 0:
            for item in DEFAULT_SINDH_LABOURERS:
                cursor.execute(
                    """
                    INSERT INTO labourers
                    (id, name, cnic, phone, district, address, skills_json, daily_wage, availability, verified, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        item["id"],
                        item["name"],
                        item["cnic"],
                        item["phone"],
                        item["district"],
                        item["address"],
                        json.dumps(item["skills"]),
                        item["dailyWage"],
                        item["availability"],
                        1 if item["verified"] else 0,
                        item["createdAt"],
                    ),
                )
        conn.commit()
        conn.close()

    def get_all_labourers(self, district: str = "ALL", skill: str = "ALL") -> List[Dict[str, Any]]:
        # 1. Try MongoDB Atlas if connected
        if self.mongo_db is not None:
            query: Dict[str, Any] = {}
            if district and district != "ALL":
                query["district"] = district
            if skill and skill != "ALL":
                query["skills"] = skill
            docs = list(self.mongo_db.labourers.find(query, {"_id": 0}).sort("createdAt", -1))
            if docs:
                return docs

        # 2. Fetch from persistent SQLite database
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT id, name, cnic, phone, district, address, skills_json, daily_wage, availability, verified, created_at
            FROM labourers
            ORDER BY created_at DESC
            """
        )
        rows = cursor.fetchall()
        conn.close()

        results = []
        for r in rows:
            skills_list = json.loads(r[6])
            if district and district != "ALL" and r[4].lower() != district.lower():
                continue
            if skill and skill != "ALL" and skill not in skills_list:
                continue
            results.append(
                {
                    "id": r[0],
                    "name": r[1],
                    "cnic": r[2],
                    "phone": r[3],
                    "district": r[4],
                    "address": r[5],
                    "skills": skills_list,
                    "dailyWage": r[7],
                    "availability": r[8],
                    "verified": bool(r[9]),
                    "createdAt": r[10],
                }
            )
        return results

    def add_labourer(self, record: Dict[str, Any]) -> Dict[str, Any]:
        # Save to SQLite persistent disk
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT OR REPLACE INTO labourers
            (id, name, cnic, phone, district, address, skills_json, daily_wage, availability, verified, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                record["id"],
                record["name"],
                record["cnic"],
                record["phone"],
                record["district"],
                record["address"],
                json.dumps(record["skills"]),
                int(record["dailyWage"]),
                record.get("availability", "Available Now"),
                1,
                record["createdAt"],
            ),
        )
        conn.commit()
        conn.close()

        # Mirror to MongoDB Atlas if configured
        if self.mongo_db is not None:
            try:
                self.mongo_db.labourers.insert_one(dict(record))
            except Exception as exc:
                print(f"MongoDB insert warning: {exc}")

        # Mirror to Firebase Realtime DB if configured
        if FIREBASE_DB_URL:
            try:
                fb_endpoint = f"{FIREBASE_DB_URL.rstrip('/')}/labourers/{record['id']}.json"
                req = urllib.request.Request(
                    fb_endpoint,
                    data=json.dumps(record).encode("utf-8"),
                    headers={"Content-Type": "application/json"},
                    method="PUT",
                )
                urllib.request.urlopen(req, timeout=4)
            except Exception as exc:
                print(f"Firebase sync warning: {exc}")

        return record


db_engine = AgriSyncDatabase()
