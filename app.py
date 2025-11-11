from dotenv import load_dotenv
import os

# Cargar el archivo api.env
print("Intentando cargar el archivo api.env...")
load_dotenv("api.env")

# Verificar si la clave se cargó
api_key = os.getenv("GEMINI_API_KEY")
print(f"Clave cargada: {api_key}")