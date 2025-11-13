import React, { useEffect, useState, useRef } from "react";

export default function NotificacionesBell({ usuarioId }) {
  const [list, setList] = useState([]);
  const [noLeidas, setNoLeidas] = useState(0);
  const [open, setOpen] = useState(false);
  const [marking, setMarking] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!usuarioId) return;

   
    Promise.all([
      fetch(`http://localhost:8000/api/notifications/usuario/${usuarioId}/bienvenida/`, { method: "POST" }).catch(()=>{}),
      fetch(`http://localhost:8000/api/notifications/usuario/${usuarioId}/verificar-misiones/`, { method: "POST" }).catch(()=>{}),
    ]).finally(() => {
      cargar();
    });

    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("click", onDoc);
  
    const onRefresh = () => cargar();
    window.addEventListener('magboost:new-notifications', onRefresh);
    return () => {
      document.removeEventListener("click", onDoc);
      window.removeEventListener('magboost:new-notifications', onRefresh);
    };
  }, [usuarioId]);

  async function cargar(){
    try {
      const res = await fetch(`http://localhost:8000/api/notifications/usuario/${usuarioId}/`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setList(data.notificaciones || []);
      setNoLeidas(data.no_leidas || 0);
    } catch(err){
      console.warn("No se pudieron cargar las notificaciones", err.message);
    }
  }

  async function marcarTodas(){
    if (marking) return;
    setMarking(true);
    try{
      const res = await fetch(`http://localhost:8000/api/notifications/usuario/${usuarioId}/marcar-todas-leidas/`, { method: "POST" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      
      setList((xs)=>xs.map(n=>({...n, leida:true})));
      setNoLeidas(0);
    }catch(err){
      console.warn("No se pudieron marcar como leídas:", err?.message || err);
    } finally {
      setMarking(false);
    }
  }

  async function marcarUna(notif){
    if (!notif || notif.leida) return;

    const prevList = list;
    const prevNoLeidas = noLeidas;
    setList((xs)=>xs.map(n=> n.id===notif.id ? ({...n, leida:true}) : n));
    setNoLeidas((c)=> Math.max(0, c-1));
    try{
      const res = await fetch(`http://localhost:8000/api/notifications/notificacion/${notif.id}/marcar-leida/`, { method: "POST" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    }catch(err){
      
      console.warn("No se pudo marcar la notificación:", err?.message || err);
      setList(prevList);
      setNoLeidas(prevNoLeidas);
    }
  }

  return (
    
    <div ref={ref} style={{ position: "relative" }}>
      <button onClick={()=>{ setOpen(v=>!v); if(!open) cargar(); }}
        aria-label="Notificaciones" style={{ width:50, height:50, borderRadius:999, border:"1px solid rgba(255,255,255,.5)", background:"rgba(255,255,255,0.15)", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", position:"relative", backdropFilter:"blur(2px)" }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {noLeidas>0 && (
          <span style={{ position:"absolute", top:-4, right:-4, minWidth:18, height:18, background:"#ef4444", color:"#fff", borderRadius:9, padding:"0 5px", fontSize:12, display:"flex", alignItems:"center", justifyContent:"center", border:"2px solid white" }}>{noLeidas}</span>
        )}
      </button>

      {open && (
        <div style={{ position:"absolute", right:0, top:"calc(100% + 8px)", width:340, maxHeight:380, overflowY:"auto", background:"#fff", color:"#111", borderRadius:12, boxShadow:"0 10px 28px rgba(0,0,0,.18)", zIndex:1000 }}>
          <div style={{ padding:"10px 12px", display:"flex", alignItems:"center", justifyContent:"space-between", background:"linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color:"white", borderTopLeftRadius:12, borderTopRightRadius:12 }}>
            <strong>Notificaciones</strong>
            <button onClick={marcarTodas} disabled={marking} style={{ background:"transparent", color:"white", border:"1px solid rgba(255,255,255,.6)", borderRadius:8, padding:"4px 8px", cursor: marking?"not-allowed":"pointer", opacity: marking?0.7:1 }}>
              {marking ? "Marcando..." : "Marcar todas"}
            </button>
          </div>
          <div style={{ padding:10 }}>
            {list.filter(n=>!n.leida).length===0 ? (
              <div style={{ padding:16, color:"#555" }}>No tienes notificaciones</div>
            ) : (
             
              list.filter(n=>!n.leida).slice(0,5).map(n=> {
                const isTip = n.tipo === 'tip_perfil';
                return (
                  <button
                    key={n.id}
                    onClick={()=>marcarUna(n)}
                    style={{
                      width:"100%",
                      textAlign:"left",
                      background: isTip ? "#fff7d6" : "transparent",
                      border:"none",
                      cursor:"pointer",
                      padding:"10px 8px",
                      borderBottom:"1px solid #eee",
                      borderLeft: isTip ? "4px solid #f59e0b" : "4px solid transparent"
                    }}
                  >
                    <div style={{ fontWeight:700, marginBottom:4, color: isTip ? "#8a4b00" : undefined }}>
                      {n.icono || ""} {n.titulo}
                    </div>
                    <div style={{ fontSize:13, color: isTip ? "#6b4e16" : "#444" }}>{n.mensaje}</div>
                  </button>
                );
              })
            )}
            {list.filter(n=>!n.leida).length>5 && (
              <div style={{ padding:8, textAlign:"center", color:"#666", fontSize:12 }}>Hay más notificaciones...</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
