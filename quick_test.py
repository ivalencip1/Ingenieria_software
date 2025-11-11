#!/usr/bin/env python
"""
Script simple para probar rápidamente las preguntas del minijuego
"""
import requests
import json

def quick_test():
    """Prueba rápida"""
    try:
        print("🧪 Probando endpoint de preguntas...")
        
        # Datos de prueba
        data = {"user_id": 1}  # Cambia este ID por uno válido
        
        # Hacer la petición
        response = requests.post(
            "http://localhost:8000/api/minigame/generate-questions/",
            headers={"Content-Type": "application/json"},
            data=json.dumps(data)
        )
        
        # Mostrar resultado
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Sector: {result['sector']}")
            print(f"✅ Preguntas generadas: {result['total_preguntas']}")
            
            # Solo mostrar la primera pregunta para verificar
            if result['preguntas']:
                p = result['preguntas'][0]
                print(f"\n📝 Ejemplo de pregunta:")
                print(f"   {p['q']}")
                print(f"   Respuesta: {p['c']}")
        else:
            print(f"❌ Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    quick_test()