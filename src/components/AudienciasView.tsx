import React, { useState } from 'react';
import { AudienciaExpediente, Expediente, PersonaCitada, EstadoNotificacionAudiencia, TipoAudiencia } from '../types';
import { Calendar, UserCheck, Video, MapPin, Plus, CheckCircle2, Clock, XCircle, FileText, Send } from 'lucide-react';

interface AudienciasViewProps {
  audiencias: AudienciaExpediente[];
  expedientes: Expediente[];
  onAgregarAudiencia: (nuevaAudiencia: AudienciaExpediente) => void;
  onActualizarNotificacionPersona: (audienciaId: string, personaId: string, nuevoEstado: EstadoNotificacionAudiencia, obs?: string) => void;
}

export const AudienciasView: React.FC<AudienciasViewProps> = ({
  audiencias,
  expedientes,
  onAgregarAudiencia,
  onActualizarNotificacionPersona,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  // Form State
  const [expedienteId, setExpedienteId] = useState(expedientes[0]?.id || '');
  const [tipo, setTipo] = useState<TipoAudiencia>('Testimonial');
  const [fechaHora, setFechaHora] = useState('2026-08-20 10:00');
  const [juzgadoSala, setJuzgadoSala] = useState('Juzgado Civil y Comercial N° 1 - Sala 2');
  const [modalidad, setModalidad] = useState<'Presencial' | 'Virtual (SIGED Webex)' | 'Híbrida'>('Presencial');
  const [nombreCitado, setNombreCitado] = useState('');
  const [rolCitado, setRolCitado] = useState<'Testigo' | 'Perito' | 'Absolvente / Parte' | 'Mediador/a'>('Testigo');

  const handleCrearAudiencia = (e: React.FormEvent) => {
    e.preventDefault();
    const expSelected = expedientes.find((e) => e.id === expedienteId);

    const personaInicial: PersonaCitada = {
      id: `CIT-${Date.now()}`,
      nombre: nombreCitado || 'Persona Citada',
      rolCitado,
      estadoNotificacion: 'Cédula Confeccionada',
    };

    const nueva: AudienciaExpediente = {
      id: `AUD-${Math.floor(Math.random() * 9000 + 1000)}`,
      expediente_id: expedienteId,
      caratula_expte: expSelected ? `${expSelected.numero} - ${expSelected.caratula.substring(0, 35)}...` : 'Expediente Misiones',
      tipo,
      fecha_hora: fechaHora,
      juzgado_sala: juzgadoSala,
      modalidad,
      personas_citadas: [personaInicial],
      pruebas_vinculadas_ids: [],
      estado: 'Programada',
    };

    onAgregarAudiencia(nueva);
    setIsModalOpen(false);
    setNombreCitado('');
  };

  const getBadgeEstadoNotificacion = (estado: EstadoNotificacionAudiencia) => {
    switch (estado) {
      case 'Diligenciada / Notificado':
        return 'bg-emerald-950 text-emerald-300 border-emerald-800';
      case 'Enviada a Oficina Notificaciones':
        return 'bg-blue-950 text-blue-300 border-blue-800';
      case 'Cédula Confeccionada':
        return 'bg-amber-950 text-amber-300 border-amber-800';
      case 'Fracasada / Devuelta sin notificar':
        return 'bg-red-950 text-red-300 border-red-800';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const audienciasFiltradas = audiencias.filter((a) => {
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      return (
        a.caratula_expte.toLowerCase().includes(q) ||
        a.juzgado_sala.toLowerCase().includes(q) ||
        a.tipo.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold tracking-tight uppercase text-slate-100 flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              <span>Audiencias Judiciales & Registro de Cédulas de Notificación</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Vinculación de testimoniales, absoluciones de posiciones, periciales y estado de citación de testigos en Misiones.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold uppercase tracking-wider transition-colors flex items-center space-x-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Agendar Audiencia</span>
          </button>
        </div>

        {/* Search */}
        <div className="mt-4 pt-4 border-t border-slate-800">
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por carátula, expediente, sala o tipo de audiencia..."
            className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-100 focus:ring-1 focus:ring-blue-500 font-mono"
          />
        </div>
      </div>

      {/* Audiencias List */}
      <div className="space-y-4">
        {audienciasFiltradas.map((aud) => (
          <div key={aud.id} className="bg-slate-900 border border-slate-700/80 rounded-xl p-5 shadow-sm space-y-4">
            {/* Top Row */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-bold text-blue-400 bg-blue-600/20 border border-blue-500/30 px-2.5 py-0.5 rounded">
                    {aud.tipo}
                  </span>
                  <span className="text-[10px] font-mono text-slate-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 flex items-center space-x-1">
                    {aud.modalidad.includes('Virtual') ? <Video className="w-3 h-3 text-blue-400" /> : <MapPin className="w-3 h-3 text-emerald-400" />}
                    <span>{aud.modalidad}</span>
                  </span>
                </div>
                <h3 className="text-xs font-bold text-slate-100 mt-1">
                  {aud.caratula_expte}
                </h3>
              </div>

              <div className="text-right font-mono">
                <span className="text-xs font-bold text-amber-400 block">
                  📅 {aud.fecha_hora} HS
                </span>
                <span className="text-[10px] text-slate-400 block">{aud.juzgado_sala}</span>
              </div>
            </div>

            {/* Citados & Notificaciones Table */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold tracking-wider block">
                Nómina de Personas Citadas & Estado de Notificación Cédula:
              </span>

              <div className="space-y-2">
                {aud.personas_citadas.map((cit) => (
                  <div
                    key={cit.id}
                    className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <strong className="text-slate-100">{cit.nombre}</strong>
                        <span className="text-[10px] font-mono text-slate-400">({cit.rolCitado})</span>
                      </div>
                      {cit.fechaNotificacionManual && (
                        <span className="text-[10px] font-mono text-slate-500 block">
                          Fecha Cédula: {cit.fechaNotificacionManual}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <select
                        value={cit.estadoNotificacion}
                        onChange={(e) =>
                          onActualizarNotificacionPersona(
                            aud.id,
                            cit.id,
                            e.target.value as EstadoNotificacionAudiencia
                          )
                        }
                        className={`text-xs font-mono font-bold px-2.5 py-1 rounded border focus:ring-1 focus:ring-blue-500 ${getBadgeEstadoNotificacion(
                          cit.estadoNotificacion
                        )}`}
                      >
                        <option value="Cédula Confeccionada">Cédula Confeccionada</option>
                        <option value="Enviada a Oficina Notificaciones">Enviada a Oficina Notificaciones</option>
                        <option value="Diligenciada / Notificado">Diligenciada / Notificado</option>
                        <option value="Fracasada / Devuelta sin notificar">Fracasada / Devuelta</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {aud.notas_audiencia && (
              <div className="text-xs font-mono bg-slate-950/60 p-2.5 rounded border border-slate-800 text-slate-400">
                <strong className="text-slate-300">Notas Procesales: </strong>
                {aud.notas_audiencia}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal Agendar Audiencia */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-100 uppercase tracking-tight flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              <span>Agendar Audiencia Judicial</span>
            </h3>

            <form onSubmit={handleCrearAudiencia} className="space-y-3 text-xs">
              <div>
                <label className="block font-mono text-slate-400 uppercase text-[10px] mb-1">Expediente Asignado:</label>
                <select
                  value={expedienteId}
                  onChange={(e) => setExpedienteId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100 font-mono"
                >
                  {expedientes.map((e) => (
                    <option key={e.id} value={e.id}>
                      Expte {e.numero} - {e.caratula.substring(0, 45)}...
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-slate-400 uppercase text-[10px] mb-1">Tipo de Audiencia:</label>
                  <select
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value as TipoAudiencia)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 font-mono"
                  >
                    <option value="Testimonial">Testimonial</option>
                    <option value="Confesional (Absolución de Posiciones)">Confesional</option>
                    <option value="Pericial">Pericial</option>
                    <option value="Art. 360 / Preliminar CPCCyM">Art. 360 CPCCyM</option>
                    <option value="Conciliación / Mediación Judicial">Mediación</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-slate-400 uppercase text-[10px] mb-1">Modalidad:</label>
                  <select
                    value={modalidad}
                    onChange={(e) => setModalidad(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 font-mono"
                  >
                    <option value="Presencial">Presencial</option>
                    <option value="Virtual (SIGED Webex)">Virtual (SIGED Webex)</option>
                    <option value="Híbrida">Híbrida</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-mono text-slate-400 uppercase text-[10px] mb-1">Fecha y Hora:</label>
                <input
                  type="text"
                  required
                  placeholder="ej: 2026-08-25 09:30"
                  value={fechaHora}
                  onChange={(e) => setFechaHora(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block font-mono text-slate-400 uppercase text-[10px] mb-1">Juzgado / Sala / Enlace:</label>
                <input
                  type="text"
                  value={juzgadoSala}
                  onChange={(e) => setJuzgadoSala(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100 font-mono"
                />
              </div>

              <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-2">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Primer Citado / Testigo:</span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Nombre completo citado"
                    value={nombreCitado}
                    onChange={(e) => setNombreCitado(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-100 font-mono"
                  />
                  <select
                    value={rolCitado}
                    onChange={(e) => setRolCitado(e.target.value as any)}
                    className="bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-slate-200 font-mono"
                  >
                    <option value="Testigo">Testigo</option>
                    <option value="Perito">Perito</option>
                    <option value="Absolvente / Parte">Absolvente / Parte</option>
                    <option value="Mediador/a">Mediador/a</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-bold uppercase text-[10px]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold uppercase text-[10px]"
                >
                  Agendar Audiencia
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
