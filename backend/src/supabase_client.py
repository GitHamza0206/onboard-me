# src/supabase_client.py
import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Charger les variables d'environnement du fichier .env
load_dotenv()

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_SERVICE_KEY")

# Créer un client Supabase unique qui sera utilisé par l'application
supabase: Client = create_client(url, key)