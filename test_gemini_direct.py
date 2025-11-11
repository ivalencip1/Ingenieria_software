#!/usr/bin/env python
"""
Prueba directa de la funcionalidad de Gemini para generar preguntas
Sin usar Django shell, solo probando la lógica de Gemini
"""
import os
from dotenv import load_dotenv
from google import genai
from google.genai.errors import APIError
import json

# Cargar la clave desde api.env
load_dotenv("api.env")

def test_gemini_questions(sector="Tecnología"):
    """
    Prueba directa de generación de preguntas con Gemini
    """
    try:
        # Verificar que la clave se cargó
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            print("❌ GEMINI_API_KEY no encontrada")
            return None

        print(f"✅ API Key cargada (longitud: {len(api_key)})")
        
        # Plantilla del prompt
        plantilla_prompt = (
            "Genera 3 preguntas sector {sector}: 1 'Conocimiento', 1 'Habilidades', 1 'Mercado'. "
            "Cada pregunta con 1 respuesta correcta (c) y 3 distractores (d1, d2, d3). "
            "Output: Sólo el array JSON con etiquetas cortas: q, tipo, c, d1, d2, d3. "
            "Asegúrate de que el JSON sea válido y esté bien formateado."
        )
        
        # Construir prompt final
        prompt_final = plantilla_prompt.format(sector=sector)
        print(f"\n📝 Prompt enviado:")
        print(prompt_final)
        
        # Inicializar cliente
        print(f"\n🔄 Inicializando cliente Gemini...")
        client = genai.Client()
        model_name = 'gemini-2.5-flash'
        
        # Hacer llamada a la API
        print(f"🚀 Llamando a {model_name}...")
        response = client.models.generate_content(
            model=model_name,
            contents=prompt_final,
        )
        
        # Procesar respuesta
        response_text = response.text.strip()
        print(f"\n📥 Respuesta recibida:")
        print(response_text)
        
        # Limpiar y parsear JSON
        if response_text.startswith('```json'):
            response_text = response_text.replace('```json', '').replace('```', '')
        elif response_text.startswith('```'):
            response_text = response_text.replace('```', '')
        
        print(f"\n🧹 Respuesta limpia:")
        print(response_text)
        
        # Parsear JSON
        try:
            preguntas = json.loads(response_text)
            print(f"\n✅ JSON parseado correctamente!")
            print(f"Total preguntas: {len(preguntas)}")
            
            # Mostrar preguntas formateadas
            for i, pregunta in enumerate(preguntas, 1):
                print(f"\n--- Pregunta {i} ({pregunta.get('tipo', 'N/A')}) ---")
                print(f"P: {pregunta.get('q', 'N/A')}")
                print(f"✓ Correcta: {pregunta.get('c', 'N/A')}")
                print(f"✗ Distractores:")
                print(f"   - {pregunta.get('d1', 'N/A')}")
                print(f"   - {pregunta.get('d2', 'N/A')}")
                print(f"   - {pregunta.get('d3', 'N/A')}")
            
            return preguntas
            
        except json.JSONDecodeError as e:
            print(f"❌ Error parseando JSON: {e}")
            return None
            
    except APIError as e:
        print(f"❌ Error de API de Gemini: {e}")
        return None
    except Exception as e:
        print(f"❌ Error general: {e}")
        return None

def main():
    """Función principal"""
    print("🎮 Probando generación de preguntas con Gemini")
    print("=" * 50)
    
    # Probar con diferentes sectores
    sectores = ["Tecnología", "Salud", "Educación", "Finanzas"]
    
    for sector in sectores:
        print(f"\n🔍 Probando sector: {sector}")
        print("-" * 30)
        
        result = test_gemini_questions(sector)
        
        if result:
            print(f"✅ Éxito para sector {sector}")
        else:
            print(f"❌ Error para sector {sector}")
        
        print("\n" + "=" * 50)

if __name__ == "__main__":
    main()