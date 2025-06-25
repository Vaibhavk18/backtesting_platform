import os
from dotenv import load_dotenv
from pathlib import Path
from supabase import create_client

print(f"__file__: {__file__}")
print(f"parent: {Path(__file__).parent}")
print(f"parent.parent: {Path(__file__).parent.parent}")
env_path = Path(__file__).parent.parent.parent / ".env"
print(f"[Supabase] Loading .env from: {env_path}")
load_dotenv(dotenv_path=env_path)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

print(f"[Supabase] Loaded SUPABASE_URL: {SUPABASE_URL}")
print(f"[Supabase] Loaded SUPABASE_KEY: {'SET' if SUPABASE_KEY else 'NOT SET'}")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in environment variables or .env file")

try:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)  
except Exception as e:
    print(f"[Supabase] Failed to create client with URL: {SUPABASE_URL}")
    raise
