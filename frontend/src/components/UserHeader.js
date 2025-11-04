import React from "react";
import NotificacionesBell from "./NotificacionesBell";


function UserHeader({ usuarioActual }) {
  const usuario = usuarioActual || null;

  return (
    <header style={{
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "white",
      padding: "40px 20px",
      borderRadius: "0",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      boxShadow: "0 4px 20px rgba(0,0,0,0.15)"
    }}>
      <div>
        <h1 style={{margin: "0 0 5px 0", fontSize: "22px", fontWeight: "bold"}}>
          ¡Hola {usuario?.username || "Usuario"}!
        </h1>
        <p style={{margin: 0, opacity: 0.9, fontSize: "14px"}}>
          Bienvenido a MagBoost
        </p>
      </div>
      <div style={{display: "flex", alignItems: "center", gap: "15px"}}>
        <div style={{
          background: "linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)",
          padding: "8px 15px",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          gap: "5px"
        }}>
          <span style={{fontWeight: "bold", fontSize: "16px"}}>
            {usuario?.puntos_totales || 0}
          </span>
          <span style={{fontSize: "12px", opacity: 0.9}}>pts</span>
        </div>
        <div style={{
          width: "50px",
          height: "50px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "24px",
          overflow: "hidden",
          color: "#fff",
          fontWeight: 700,
          letterSpacing: 0.5
        }}>
          {usuario?.avatar ? (
            <img 
              src={`http://localhost:8000/media/${usuario.avatar}`}
              alt="Avatar"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "flex";
              }}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover"
              }}
            />
          ) : null}
          <div style={{
            display: usuario?.avatar ? "none" : "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%"
          }}>
            {(usuario?.first_name?.[0] || usuario?.username?.[0] || "").toUpperCase()}
            {(usuario?.last_name?.[0] || "").toUpperCase()}
          </div>
        </div>
        {usuario?.id && <NotificacionesBell usuarioId={usuario.id} />}
      </div>
    </header>
  );
}

export default UserHeader;
