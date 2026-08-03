import React, { useState } from 'react';
import { Abogado, Expediente, ActuacionSIGED } from '../types';
import { FileText, Search, ShieldCheck, ShieldAlert, Lock, UserCheck, Scale, ExternalLink, Calendar, AlertCircle } from 'lucide-react';

interface ExpedientesViewProps {
  abogadoActual: Abogado;
  expedientes: Expediente[];
  abogados: Abogado[];
  actuaciones: ActuacionSIGED[];
  onSeleccionarActuacionParaProcesar: (actuacion: ActuacionSIGED, expte: Expediente) => void;
}

export const ExpedientesView: React.FC<ExpedientesViewProps> = ({
  abogadoActual,
  expedientes,
  abogados,
  actuaciones,
  onSeleccionarActuacionParaProcesar,
}) => {
  const [busqueda, setBusqueda] = useState('');
  const [filtroFuero, setFiltroFuero] = useState('todos');

  const esSocio = abogadoActual.rol === 'Socio';

  // Filter expedientes based on security role & search
  const expedientesFiltrados = expedientes.filter((exp) => {
    // Security check
    if (!esSocio && !exp.abogados_autorizados.includes(abogadoActual.id)) {
      return false;
    }

    if (filtroFuero !== 'todos' && exp.fuero !== filtroFuero) {
      return false;
    }

    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      return (
        exp.numero.toLowerCase().includes(q) ||
        exp.caratula.toLowerCase().includes(q) ||
        exp.juzgado.toLowerCase().includes(q) ||
        exp.cliente.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold tracking-tight uppercase text-slate-100 flex items-center space-x-2">
              <FileText className="w-5 h-5 text-blue-500" />
              <span>Gestión Unificada de Expedientes <span className="text-blue-500 italic">(Estudio Posadas)</span></span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {esSocio
                ? 'Vista global de la cartera del estudio (Acceso de Socio Administrador).'
                : `Vista restringida a causas autorizadas para el abogado ${abogadoActual.nombre} (Rol Asociado).`}
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-slate-950 px-3.5 py-2 rounded border border-slate-800 text-xs shrink-0">
            <span className="text-slate-400 font-mono text-[10px] uppercase tracking-wider">Causas Accesibles:</span>
            <span className="font-bold text-blue-400 font-mono text-sm">{expedientesFiltrados.length}</span>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mt-4 pt-4 border-t border-slate-800">
          <div className="md:col-span-8 relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por N° expediente, carátula, cliente o juzgado..."
              className="w-full bg-slate-950 border border-slate-800 rounded pl-9 pr-3 py-2 text-xs text-slate-100 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-4">
            <select
              value={filtroFuero}
              onChange={(e) => setFiltroFuero(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 focus:ring-1 focus:ring-blue-500 font-mono"
            >
              <option value="todos">Todos los Fueros</option>
              <option value="Civil y Comercial">Civil y Comercial</option>
              <option value="Laboral">Laboral</option>
              <option value="Familia">Familia</option>
              <option value="Caducidades y Concursos">Caducidades y Concursos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Expedientes Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {expedientesFiltrados.map((exp) => {
          const abgsAutorizados = abogados.filter((a) => exp.abogados_autorizados.includes(a.id));
          const letradoPat = abogados.find((a) => a.id === exp.letrado_patrocinante);
          const apoderado = abogados.find((a) => a.id === exp.apoderado);
          const actuacionExpte = actuaciones.find((act) => act.expediente_id === exp.id);

          return (
            <div
              key={exp.id}
              className="bg-slate-900 border border-slate-700/80 rounded-xl p-5 shadow-sm space-y-4 hover:border-slate-600 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header Badge & Number */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-mono font-bold text-blue-400 bg-blue-600/20 border border-blue-500/30 px-2 py-0.5 rounded">
                      EXPTE N° {exp.numero}
                    </span>
                    <span className="text-[10px] text-slate-400 ml-2 font-mono uppercase tracking-wider">
                      {exp.circunscripcion}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      exp.estado === 'Con plazo pendiente'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : exp.estado === 'Dictamen pendiente'
                        ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {exp.estado}
                  </span>
                </div>

                {/* Caratula */}
                <h3 className="text-xs font-bold text-slate-100 uppercase leading-snug">
                  {exp.caratula}
                </h3>

                {/* Juzgado */}
                <p className="text-xs text-slate-300 italic flex items-center space-x-1">
                  <span>🏛️ {exp.juzgado}</span>
                </p>

                {/* Cliente */}
                <div className="text-xs text-slate-400 pt-1 border-t border-slate-800/80">
                  <span className="font-mono text-[10px] uppercase text-slate-500">Cliente: </span>
                  <strong className="text-slate-200 font-semibold">{exp.cliente}</strong>
                </div>

                {/* Authorized Lawyers list */}
                <div className="bg-slate-950 p-2.5 rounded border border-slate-800 text-xs space-y-1">
                  <div className="text-[10px] uppercase font-mono text-slate-500 flex items-center justify-between">
                    <span>Legitimas Autorizaciones (SIGED):</span>
                    <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {abgsAutorizados.map((a) => (
                      <span
                        key={a.id}
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                          a.id === abogadoActual.id
                            ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40 font-bold'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {a.nombre.split(' ')[1]} ({a.rol})
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button to Process Actuacion */}
              {actuacionExpte && (
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono text-slate-400 truncate max-w-[200px]">
                    Última: {actuacionExpte.tipo_actuacion}
                  </span>

                  <button
                    onClick={() => onSeleccionarActuacionParaProcesar(actuacionExpte, exp)}
                    className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/40 text-[10px] font-bold uppercase tracking-wider rounded transition-all flex items-center space-x-1 cursor-pointer"
                  >
                    <span>Procesar</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
