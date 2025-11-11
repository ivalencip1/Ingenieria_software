from django.urls import path
from .views import gemini_test_view, generate_minigame_questions

urlpatterns = [
    path('gemini-test/', gemini_test_view, name='gemini_test'),
    path('generate-questions/', generate_minigame_questions, name='generate_questions'),
]
