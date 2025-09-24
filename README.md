# MAGBOOST 🧲

**MAGBOOST** es una aplicación web móvil de **gamificación** diseñada para motivar y fidelizar a los usuarios dentro de la plataforma **Magneto**.  
El objetivo es transformar las tareas del día a día en una experiencia más divertida, recompensada y social. 🚀  

---

## 👥 INTEGRANTES DEL EQUIPO
- *Samuel Herrera Galvis*  
- *Laura Indabur García*  
- *Isabela Valencia Pino*  
- *Samuel Herrera Galvis*  
- *Isaak Kerguelen Porras*  

---

## 🎮 ¿Qué hace hasta el momento?
MAGBOOST ya cuenta con las siguientes funcionalidades:  
- **Sistema de misiones** diarias y semanales.  
- **Puntos e insignias** por completar tareas.  
- **Perfil de usuario** con progreso visual.  
- **Tienda de recompensas** para canjear logros.  
- **Integración simulada** con la página web de Magneto.
-  **Ruleta diaria** para reclamar recompensas. 

✨ Aunque el **registro e inicio de sesión** aún no fueron priorizados en este sprint, desarrollamos una **simulación temporal**:  
Puedes elegir un usuario de prueba e ingresar directamente para explorar la plataforma.  

👉 Solo debes correr la app como se explica en la sección de instalación y luego acceder a:  
`http://localhost:3000/demo-selector.html`

---

## 🛠️ Tecnologías
- **Backend:** Django + Django REST Framework  
- **Frontend:** React.js  
- **Base de datos:** SQLite  
- **Estilos:** CSS y JavaScript  

---

## ⚡ Instalación rápida

### Backend
```bash
cd magboost
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
