# Views for the minigame app
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.models import User
from dotenv import load_dotenv
import os
import json
from google import genai
from google.genai.errors import APIError

# Cargar la clave desde api.env
# Buscar el archivo api.env en el directorio padre (donde está el archivo api.env)
import os
from pathlib import Path

# Obtener la ruta al directorio raíz del proyecto (donde está api.env)
BASE_DIR = Path(__file__).resolve().parent.parent.parent
api_env_path = BASE_DIR / "api.env"

load_dotenv(api_env_path)

def get_user_sector(user_id):
    """
    Obtiene el primer sector seleccionado por el usuario desde su perfil.
    """
    try:
        # Importar aquí para evitar problemas de importación circular
        from core.models import PerfilUsuario
        
        # Usar 'id' en lugar de 'usuario_id' según el error mostrado
        perfil = PerfilUsuario.objects.get(id=user_id)
        
        print(f"DEBUG: Usuario ID {user_id} encontrado: {perfil.username}")
        print(f"DEBUG: Tipo del campo sectors: {type(perfil.sectors)}")
        
        # El campo sectors es una relación Many-to-Many, necesitamos usar .all() para obtener los sectores
        sectores_queryset = perfil.sectors.all()
        print(f"DEBUG: Sectores queryset: {sectores_queryset}")
        print(f"DEBUG: Cantidad de sectores: {sectores_queryset.count()}")
        
        if sectores_queryset.exists():
            # Obtener el primer sector
            primer_sector = sectores_queryset.first()
            sector_nombre = primer_sector.name if hasattr(primer_sector, 'name') else str(primer_sector)
            print(f"DEBUG: Primer sector encontrado: {sector_nombre}")
            return sector_nombre
        else:
            print(f"DEBUG: Usuario no tiene sectores asignados, usando valor por defecto")
            return "Tecnología"
        
    except PerfilUsuario.DoesNotExist:
        print(f"ERROR: Usuario con ID {user_id} no encontrado")
        return "Tecnología"
    except Exception as e:
        print(f"ERROR obteniendo sector del usuario {user_id}: {e}")
        import traceback
        print(f"DEBUG: Traceback completo: {traceback.format_exc()}")
        return "Tecnología"  # Valor por defecto

def generate_questions_with_gemini(sector):
    """
    Genera preguntas usando Gemini AI basadas en el sector del usuario.
    """
    try:
        # Verificar que la clave se cargó
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise Exception("GEMINI_API_KEY no encontrada")

        # Plantilla del prompt con marcador de posición
        plantilla_prompt = (
            "Genera 3 preguntas sector {sector}: 1 'Conocimiento', 1 'Habilidades', 1 'Mercado'. "
            "Cada pregunta con 1 respuesta correcta (c) y 3 distractores (d1, d2, d3). "
            "Output: Sólo el array JSON con etiquetas cortas: q, tipo, c, d1, d2, d3. "
            "Asegúrate de que el JSON sea válido y esté bien formateado."
        )
        
        # Construcción automática del prompt final
        prompt_final = plantilla_prompt.format(sector=sector)
        
        # Inicializar cliente de Gemini
        client = genai.Client()
        model_name = 'gemini-2.5-flash'
        
        # Llamada a la API con parámetros optimizados
        response = client.models.generate_content(
            model=model_name,
            contents=prompt_final,
        )
        
        # Extraer el texto de la respuesta
        response_text = response.text.strip()
        
        # Intentar parsear el JSON
        try:
            # Limpiar la respuesta si tiene markdown
            if response_text.startswith('```json'):
                response_text = response_text.replace('```json', '').replace('```', '')
            elif response_text.startswith('```'):
                response_text = response_text.replace('```', '')
            
            preguntas = json.loads(response_text)
            return preguntas
            
        except json.JSONDecodeError as e:
            print(f"Error parseando JSON: {e}")
            print(f"Respuesta recibida: {response_text}")
            # Retornar preguntas de ejemplo en caso de error
            return get_fallback_questions(sector)
            
    except APIError as e:
        print(f"Error de API de Gemini: {e}")
        return get_fallback_questions(sector)
    except Exception as e:
        print(f"Error general generando preguntas: {e}")
        return get_fallback_questions(sector)

def get_fallback_questions(sector):
    """
    Retorna preguntas de respaldo en caso de error con la API.
    """
    return [
        {
            "q": f"¿Cuál es una habilidad importante en el sector de {sector}?",
            "tipo": "Conocimiento",
            "c": "Análisis de datos",
            "d1": "Cocinar",
            "d2": "Bailar",
            "d3": "Cantar"
        },
        {
            "q": f"¿Qué harías si un proyecto en {sector} se retrasa?",
            "tipo": "Habilidades",
            "c": "Analizar las causas y replantear el cronograma",
            "d1": "Ignorar el problema",
            "d2": "Culpar a otros",
            "d3": "Renunciar al proyecto"
        },
        {
            "q": f"¿Cuál es una tendencia actual en {sector}?",
            "tipo": "Mercado",
            "c": "Transformación digital",
            "d1": "Máquinas de escribir",
            "d2": "Teléfonos fijos",
            "d3": "Fax"
        }
    ]

@csrf_exempt
def generate_minigame_questions(request):
    """
    Vista principal para generar preguntas del minijuego basadas en el sector del usuario.
    """
    if request.method != 'POST':
        return JsonResponse({"error": "Método no permitido"}, status=405)
    
    try:
        # Obtener datos del request
        data = json.loads(request.body)
        user_id = data.get('user_id')
        
        print(f"DEBUG: Recibida petición para user_id: {user_id}")
        
        if not user_id:
            return JsonResponse({"error": "ID de usuario requerido"}, status=400)
        
        # Obtener el sector del usuario
        sector = get_user_sector(user_id)
        
        print(f"DEBUG: Sector obtenido para el usuario: '{sector}'")
        
        # Generar preguntas con Gemini
        preguntas = generate_questions_with_gemini(sector)
        
        print(f"DEBUG: Generadas {len(preguntas)} preguntas para sector '{sector}'")
        
        return JsonResponse({
            "success": True,
            "sector": sector,
            "user_id": user_id,  # Incluir para debugging
            "preguntas": preguntas,
            "total_preguntas": len(preguntas)
        })
        
    except json.JSONDecodeError:
        return JsonResponse({"error": "JSON inválido"}, status=400)
    except Exception as e:
        print(f"ERROR en generate_minigame_questions: {e}")
        return JsonResponse({"error": f"Error interno: {str(e)}"}, status=500)

def gemini_test_view(request):
    """
    Vista para probar la lógica de conexión con la API de Gemini.
    """
    # Verificar que la clave se cargó
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return JsonResponse({
            "error": "La variable GEMINI_API_KEY no se encontró en el entorno."
        }, status=500)

    # Respuesta simulada
    return JsonResponse({
        "message": "La clave GEMINI_API_KEY se cargó correctamente.",
        "api_key_length": len(api_key)  # No mostrar la clave completa por seguridad
    })
