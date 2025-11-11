import os
from dotenv import load_dotenv
from google import genai
from google.genai.errors import APIError

    # --- 1. CARGAR LA CLAVE DE FORMA SEGURA (desde .env) ---
    # Esta línea busca tu archivo .env y carga GEMINI_API_KEY
load_dotenv("api.env") 

# 2. Verificar que la clave se cargó
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("❌ ERROR: La variable GEMINI_API_KEY no se encontró en el entorno.")
    print("Asegúrate de que tu archivo .env existe y tiene el formato: GEMINI_API_KEY=\"TU_CLAVE\"")
    # Salir si la clave no está, para no intentar la conexión
    exit()

# --- 3. INICIALIZAR Y USAR EL MODELO GEMINI 2.5 FLASH ---
try:
    # El cliente de Gemini detecta la clave automáticamente
    client = genai.Client()
    model_name = 'gemini-2.5-flash'
    
    # 🧠 PRUEBA: Una solicitud simple a la IA
    prompt = "Eres el motor de un videojuego. Genera una pequeña descripción para un jefe de nivel llamado 'El Devorador de Tokens'."
    
    print(f"✅ Cliente inicializado correctamente. Llamando al modelo: {model_name}...")
    
    response = client.models.generate_content(
        model=model_name,
        contents=prompt,
    )

    # --- 4. CONFIRMACIÓN Y RESULTADO ---
    print("\n---------------------------------------------------")
    print("🚀 ¡PRUEBA EXITOSA! La API de Gemini está funcionando.")
    print(f"Modelo utilizado: {model_name} (ideal para el Free Tier).")
    print("---------------------------------------------------")
    
    print("\n📜 Respuesta de Gemini (Descripción del Jefe):")
    print(response.text)
    print("\n---------------------------------------------------")
    
except APIError as e:
    # Esto ocurre si la clave es inválida o si superaste tu cuota
    print(f"\n❌ ERROR de la API: {e}")
    print("Posibles problemas: Clave incorrecta, la clave ha sido revocada o has superado tu límite de uso (cuota).")
except Exception as e:
    print(f"\n❌ ERROR General: {e}")
    print("Revisa tu conexión a internet o la instalación de las librerías.")