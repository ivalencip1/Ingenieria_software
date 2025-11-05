import React, { useEffect, useState } from 'react';
import { vacantesAPI } from '../services/apiVacantes';
import UserHeader from '../components/UserHeader';
import './VacantesPage.css';

function VacancyCard({ vacante, index = 0 }) {
  const share = () => {
    const url = `${window.location.origin}/vacantes/${vacante.slug}`;
    const text = `${vacante.titulo} - ${vacante.empresa}\n${url}`;
    try {
      if (navigator.share) {
        navigator.share({ title: vacante.titulo, text, url });
      } else {
        navigator.clipboard && navigator.clipboard.writeText(url);
        window.open(`mailto:?subject=${encodeURIComponent(vacante.titulo)}&body=${encodeURIComponent(text)}`);
        alert('Enlace copiado al portapapeles y listo para compartir por email');
      }
    } catch (e) { console.error(e); }
  };

  const formatTimeAgo = (iso) => {
    if (!iso) return '';
    try {
      const then = new Date(iso);
      const now = new Date();
      const diff = Math.floor((now - then) / 1000);
      if (diff < 60) return `Hace ${diff} segundos`;
      if (diff < 3600) return `Hace ${Math.floor(diff/60)} minutos`;
      if (diff < 86400) return `Hace ${Math.floor(diff/3600)} horas`;
      return `Hace ${Math.floor(diff/86400)} días`;
    } catch (e) { return ''; }
  };

  const colors = ['#10B981','#8B5CF6','#F97316','#06B6D4','#F43F5E','#EA580C'];
  const accent = colors[index % colors.length];

  return (
    <div className="vacancy-card vacancy-card-vertical" style={{borderLeft: `6px solid ${accent}`}}>
      <div className="vacancy-top">
        <div className="vacancy-circle" />
        <div className="vacancy-top-text">
          {vacante.sector && <div className="sector-chip">{vacante.sector.name}</div>}
          <h3 className="vacancy-title">{vacante.titulo}</h3>
          <div className="vacancy-meta">{vacante.empresa}{vacante.sector ? ` · ${vacante.sector.name}` : ''}</div>
        </div>
      </div>

      <div className="vacancy-time">{formatTimeAgo(vacante.fecha_publicacion)}</div>

      {vacante.descripcion && <p className="vacancy-desc">{vacante.descripcion}</p>}

      <div className="vacancy-actions-row">
        <div style={{flex:1}} />
        <div style={{display:'flex', gap:8}}>
          <a className="vacancy-apply primary" href={vacante.external_url || '#'} target="_blank" rel="noreferrer">Ver oferta</a>
          <button onClick={share} className="vacancy-share outline">Compartir</button>
        </div>
      </div>
    </div>
  );
}

function VacantesPage({ onVolver, usuarioActual }) {
  const [vacantes, setVacantes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      setLoading(true);
      try {
        // `usuarioActual.sectors` puede venir como lista de strings (['Tecnología'])
        // o como lista de objetos [{name:'Tecnología',...}]. Normalizamos a strings.
        const sectorsArr = (usuarioActual && usuarioActual.sectors) ? usuarioActual.sectors.map(s => (typeof s === 'string' ? s : (s.name || ''))).filter(Boolean) : [];
        const sectors = sectorsArr.join(',');
        const res = await vacantesAPI.listar(sectors);
        setVacantes(res.data.results || res.data);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    cargar();
  }, [usuarioActual]);

  return (
    <div className="vacantes-page">
      <UserHeader usuarioActual={usuarioActual} />
      <div className="vacantes-header">
        <button onClick={onVolver} className="vacantes-back">← Volver</button>
        <h1>Vacantes</h1>
      </div>
      <div className="vacantes-list">
        {loading ? (
          <div className="vacantes-loading">Cargando vacantes...</div>
        ) : (
          (vacantes.length > 0) ? (
            <div className="vacantes-grid">
              {vacantes.map((v, idx) => (
                <VacancyCard key={v.id} vacante={v} index={idx} />
              ))}
            </div>
          ) : (
            <div className="vacantes-empty">No hay vacantes para tus sectores todavía.</div>
          )
        )}
      </div>
    </div>
  );
}

export default VacantesPage;
