import React, { useEffect, useState, useRef } from "react";

export default function NotificacionesBell({ usuarioId }) {
  const [list, setList] = useState([]);
  const [noLeidas, setNoLeidas] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!usuarioId) return;

    // Disparos en background (tolerantes a fallo)
    fetch(`http://localhost:8000/api/notifications/usuario/${usuarioId}/bienvenida/`, { method: "POST" }).catch(()=>{});
    fetch(`http://localhost:8000/api/notifications/usuario/${usuarioId}/verificar-misiones/`, { method: "POST" }).catch(()=>{});

    cargar();

    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
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
    try{ await fetch(`http://localhost:8000/api/notifications/usuario/${usuarioId}/marcar-todas-leidas/`, { method: "POST" });
      setList((xs)=>xs.map(n=>({...n, leida:true})));
      setNoLeidas(0);
    }catch{}
  }

  return (
    <div ref={ref} style={{ position: "fixed", top: 16, right: 16, zIndex: 9999 }}>
      <button onClick={()=>{ setOpen(v=>!v); if(!open) cargar(); }}
        aria-label="Notificaciones" style={{ width:46, height:46, borderRadius:999, border:"1px solid rgba(255,255,255,.6)", background:"linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color:"white", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", position:"relative", boxShadow:"0 8px 22px rgba(0,0,0,.25)" }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {noLeidas>0 && (
          <span style={{ position:"absolute", top:-6, right:-6, minWidth:20, height:20, background:"#ef4444", color:"#fff", borderRadius:10, padding:"0 6px", fontSize:12, display:"flex", alignItems:"center", justifyContent:"center", border:"2px solid white", boxShadow:"0 0 0 2px rgba(239,68,68,.3)" }}>{noLeidas}</span>
        )}
      </button>

      {open && (
        <div style={{ position:"absolute", right:0, marginTop:8, width:340, maxHeight:380, overflowY:"auto", background:"#fff", color:"#111", borderRadius:12, boxShadow:"0 10px 28px rgba(0,0,0,.18)", zIndex:1000 }}>
          <div style={{ padding:"10px 12px", display:"flex", alignItems:"center", justifyContent:"space-between", background:"linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color:"white", borderTopLeftRadius:12, borderTopRightRadius:12 }}>
            <strong>Notificaciones</strong>
            <button onClick={marcarTodas} style={{ background:"transparent", color:"white", border:"1px solid rgba(255,255,255,.6)", borderRadius:8, padding:"4px 8px", cursor:"pointer" }}>Marcar todas</button>
          </div>
          <div style={{ padding:10 }}>
            {list.length===0 ? (
              <div style={{ padding:16, color:"#555" }}>No tienes notificaciones</div>
            ) : (
              list.map(n=> (
                <div key={n.id} style={{ padding:"10px 8px", borderBottom:"1px solid #eee", background: n.leida?"#fff":"#f7f8ff" }}>
                  <div style={{ fontWeight:600, marginBottom:4 }}>{n.icono || ""} {n.titulo}</div>
                  <div style={{ fontSize:13, color:"#444" }}>{n.mensaje}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
