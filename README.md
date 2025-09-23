# MAGBOOST 🧲

Nuestra propuesta de pagina web (móvil) de gamificación para motivar el uso de la plataforma Magneto.

## 👥 INTEGRANTES DEL EQUIPO
- *Samuel Herrera Galvis*
- *Laura Indabur García*
- *Isabela Valencia Pino*
- *Samuel Herrera Galvis*
- *Isaak Kerguelen Porras*

---

## 🎮 ¿Qué hace hasta el momento?
- Sistema de misiones diarias/semanales
- Puntos e insignias por completar tareas
- Perfil de usuario con progreso
- Tienda de recompensas
- Integración con página web de Magneto (Simulado)

## 🛠️ Tecnologías
- **Backend:** Django + Django REST Framework
- **Frontend:** React.js
- **Base de datos:** SQLite
- **Estilos:** CSS y js

## ⚡ Instalación rápida

### Backend
```bash
cd magboost
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## 📱 Uso
1. Servidor Django: `http://localhost:8000`
2. App React: `http://localhost:3000`
3. Admin Django por si se quire revisar base de datos e info: `http://localhost:8000/admin`

## 📦 Apps del proyecto
- **core:** Usuarios y perfiles
- **gamification:** Misiones, puntos, insignias
- **rewards:** Tienda y recompensas
- **magnetosimulator:** Simulación de tareas web
- **social:** Sistema de amigos (futuro)
- **notifications:** Notificaciones (futuro)

---
**Proyecto Ingeniería de Software** 🎓
