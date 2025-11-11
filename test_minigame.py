#!/usr/bin/env python
"""
Script para probar el endpoint del minijuego desde la terminal
"""
import requests
import json

# Configuración
BASE_URL = "http://localhost:8000/api/minigame"

def test_gemini_connection():
    """Prueba la conexión con Gemini"""
    try:
        print("🧪 Probando conexión con Gemini...")
        response = requests.get(f"{BASE_URL}/gemini-test/")
        print(f"Status: {response.status_code}")
        print(f"Respuesta: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_generate_questions(user_id=1):
    """Prueba la generación de preguntas"""
    try:
        print(f"\n🎮 Generando preguntas para usuario {user_id}...")
        
        data = {"user_id": user_id}
        response = requests.post(
            f"{BASE_URL}/generate-questions/",
            headers={"Content-Type": "application/json"},
            data=json.dumps(data)
        )
        
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"\n✅ Éxito!")
            print(f"Sector: {result.get('sector', 'N/A')}")
            print(f"Total preguntas: {result.get('total_preguntas', 0)}")
            
            # Mostrar las preguntas
            preguntas = result.get('preguntas', [])
            for i, pregunta in enumerate(preguntas, 1):
                print(f"\n--- Pregunta {i} ({pregunta.get('tipo', 'N/A')}) ---")
                print(f"P: {pregunta.get('q', 'N/A')}")
                print(f"Correcta: {pregunta.get('c', 'N/A')}")
                print(f"Distractores: {pregunta.get('d1', 'N/A')}, {pregunta.get('d2', 'N/A')}, {pregunta.get('d3', 'N/A')}")
        else:
            print(f"❌ Error {response.status_code}: {response.text}")
            
    except Exception as e:
        print(f"❌ Error: {e}")

def main():
    """Función principal"""
    print("🚀 Iniciando pruebas del minijuego...")
    
    # Test 1: Conexión Gemini
    if test_gemini_connection():
        print("✅ Conexión Gemini OK")
    else:
        print("❌ Problemas con Gemini - continuando con test de preguntas...")
    
    # Test 2: Generar preguntas
    print("\n" + "="*50)
    user_id = input("Ingresa el ID del usuario para probar (default: 1): ").strip()
    if not user_id:
        user_id = 1
    else:
        user_id = int(user_id)
    
    test_generate_questions(user_id)
    
    print("\n🏁 Pruebas completadas!")

if __name__ == "__main__":
    main()