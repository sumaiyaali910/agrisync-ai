import sys
from pathlib import Path

# Add project root & backend directory to Python path for Vercel Serverless
ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT_DIR))
sys.path.insert(0, str(ROOT_DIR / "backend"))

from backend.app import app
