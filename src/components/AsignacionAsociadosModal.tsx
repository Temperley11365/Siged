import React, { useState, useEffect } from 'react';
import { X, Users, Lock, CheckCircle2, Shield, Search, FileText, UserCheck, UserX, AlertCircle, Save } from 'lucide-react';
import { Abogado, Expediente } from '../types';

interface AsignacionAsociadosModalProps {
  isOpen: boolean;
  onClose: () => void;
  expedientes: Expediente[];
  abogados: Abogado[];
  abogadoActual: Abogado;
  onGuardarAutorizaciones: (expedienteId: string, asociadosAutorizadosIds: string[]) => Promise<void>;
  expedienteInicial?: Expediente | null;
}

export const AsignacionAsociadosModal: React.FC<AsignacionAsociadosModalProps> = ({
  isOpen,
  onClose,
  expedientes,
  abogados,
  abogadoActual,
  onGuardarAutorizaciones,
  expedienteInicial,
}) => {
  const [expedienteSeleccionadoId, setExpedienteSeleccionadoId] = useState<string>('');
  const [autorizadosMap, setAutorizadosMap] = useState<Record<string, string[]>>({});
  const [busqueda, setBusqueda] = useState('');
  const [filtroModo, setFiltroModo] = useState<'por_expediente' | 'por_asociado'>('por_expediente');
  const [asociadoSeleccionadoId, setAsociadoSeleccionadoId] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [mensajeExito, setMensajeExito] = useState('');

  // Initialize selected values on open
  useEffect(() => {
    if (isOpen && expedientes.length > 0) {
      const map: Record<string, string[]> = {};
      expedientes.forEach((e) => {
        map[e.id] = [...(e.abogados_autorizados || [])];
      });
      setAutorizadosMap(map);

      if (expedienteInicial) {
        setExpedienteSeleccionadoId(expedienteInicial.id);
      } else if (!expedienteSeleccionadoId) {
        setExpedienteSeleccionadoId(expedientes[0].id);
      }

      // Default first associate
      const asociados = abogados.filter((a) => a.rol === 'Asociado');
      if (asociados.length > 0 && !asociadoSeleccionadoId) {
        setAsociadoSeleccionadoId(asociados[0].id);
      }
    }
  }, [isOpen, expedientes, expedienteInicial, abogados]);

  if (!isOpen) return null;

  const expteActual = expedientes.find((e) => e.id === expedienteSeleccionadoId) || expedientes[0];
  const listAutorizadosExpteActual = autorizadosMap[expteActual?.id] || [];

  const handleToggleAccesoExpte = (abogadoId: string) => {
    if (!expteActual) return;
    setAutorizadosMap((prev) => {
      const actual = prev[expteActual.id] || [];
      const existe = actual.includes(abogadoId);
      const nuevo = existe
        ? actual.filter((id) => id !== abogadoId)
        : [...actual, abogadoId];

      return {
        ...prev,
        [expteActual.id]: nuevo,
      };
    });
  };

  const handleToggleAccesoAsociadoMatriz = (expteId: string, abogadoId: string) => {
    setAutorizadosMap((prev) => {
      const actual = prev[expteId] || [];
      const existe = actual.includes(abogadoId);
      const nuevo = existe
        ? actual.filter((id) => id !== abogadoId)
        : [...actual, abogadoId];

      return {
        ...prev,
        [expteId]: nuevo,
      };
    });
  };

  const handleGuardarCambios = async () => {
    setSaving(true);
    setMensajeExito('');
    try {
      if (filtroModo === 'por_expediente' && expteActual) {
        const nuevos = autorizadosMap[expteActual.id] || [];
        await onGuardarAutorizaciones(expteActual.id, nuevos);
        setMensajeExito(`¡Permisos guardados para el expediente ${expteActual.numero}!`);
      } else {
        // Save all modified expedientes
        for (const exp of expedientes) {
          const nuevos = autorizadosMap[exp.id] || [];
          await onGuardarAutorizaciones(exp.id, nuevos);
        }
        setMensajeExito('¡Permisos de asignación de asociados actualizados en todo el estudio!');
      }

      setTimeout(() => {
        setMensajeExito('');
      }, 3000);
    } catch (err) {
      console.error('Error guardando autorizaciones:', err);
    } finally {
      setSaving(false);
    }
  };

  const abogadosAsociados = abogados.filter((a) => a.rol === 'Asociado' || a.rol === 'Socio');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl font-mono text-slate-100 flex flex-col h-[85vh]">
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-100 uppercase tracking-wide">
                Selección y Asignación de Accesos para Asociados
              </h3>
              <p className="text-[11px] text-slate-400">
                Otorga o revoca permisos a los abogados del estudio sobre causas judiciales
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* View Mode Switcher & Actions */}
        <div className="bg-slate-950/60 border-b border-slate-800 px-6 py-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setFiltroModo('por_expediente')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                filtroModo === 'por_expediente'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Vista Por Expediente
            </button>
            <button
              onClick={() => setFiltroModo('por_asociado')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                filtroModo === 'por_asociado'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Vista Por Abogado Asociado
            </button>
          </div>

          <div className="flex items-center space-x-3">
            {mensajeExito && (
              <span className="text-[11px] text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-500/40 px-3 py-1.5 rounded-xl flex items-center space-x-1.5 animate-in fade-in">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{mensajeExito}</span>
              </span>
            )}

            <button
              onClick={handleGuardarCambios}
              disabled={saving}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center space-x-2 shadow-lg shadow-emerald-900/30 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Guardando...' : 'Aplicar Cambios'}</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {filtroModo === 'por_expediente' ? (
            <>
              {/* Left Column: Expediente Selector List */}
              <div className="w-full md:w-5/12 border-b md:border-b-0 md:border-r border-slate-800 bg-slate-950/40 p-4 flex flex-col">
                <div className="relative mb-3">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Buscar expte por número o carátula..."
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                  {expedientes
                    .filter((e) =>
                      busqueda.trim() === ''
                        ? true
                        : e.numero.toLowerCase().includes(busqueda.toLowerCase()) ||
                          e.caratula.toLowerCase().includes(busqueda.toLowerCase())
                    )
                    .map((exp) => {
                      const isSelected = exp.id === expteActual?.id;
                      const autorizadosCount = (autorizadosMap[exp.id] || []).length;
                      return (
                        <button
                          key={exp.id}
                          onClick={() => setExpedienteSeleccionadoId(exp.id)}
                          className={`w-full text-left p-3 rounded-xl border transition-all ${
                            isSelected
                              ? 'bg-blue-950/50 border-blue-500 text-white shadow-md'
                              : 'bg-slate-900/80 border-slate-800/80 hover:bg-slate-800/60 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-xs text-blue-400">{exp.numero}</span>
                            <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                              {autorizadosCount} {autorizadosCount === 1 ? 'autorizado' : 'autorizados'}
                            </span>
                          </div>
                          <div className="text-[11px] font-medium text-slate-200 line-clamp-2 leading-tight">
                            {exp.caratula}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-1 truncate">
                            {exp.juzgado}
                          </div>
                        </button>
                      );
                    })}
                </div>
              </div>

              {/* Right Column: Associate Checkboxes for selected Expediente */}
              <div className="flex-1 p-6 overflow-y-auto bg-slate-900 space-y-5">
                {expteActual ? (
                  <>
                    <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20">
                          Expte. N° {expteActual.numero}
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                          Fuero: {expteActual.fuero}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-100 leading-snug">
                        {expteActual.caratula}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">{expteActual.juzgado}</p>
                    </div>

                    <div>
                      <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center space-x-2">
                        <UserCheck className="w-4 h-4 text-emerald-400" />
                        <span>Abogados con Acceso Autorizado</span>
                      </h5>

                      <div className="space-y-3">
                        {abogadosAsociados.map((abg) => {
                          const tieneAcceso = listAutorizadosExpteActual.includes(abg.id);
                          const esSocioDirecto = abg.rol === 'Socio';
                          return (
                            <div
                              key={abg.id}
                              onClick={() => handleToggleAccesoExpte(abg.id)}
                              className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                                tieneAcceso
                                  ? 'bg-emerald-950/20 border-emerald-500/50 text-slate-100'
                                  : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                              }`}
                            >
                              <div className="flex items-center space-x-3">
                                <img
                                  src={abg.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                                  alt={abg.nombre}
                                  className="w-10 h-10 rounded-full object-cover border border-slate-700"
                                />
                                <div>
                                  <div className="font-bold text-xs text-slate-100 flex items-center space-x-2">
                                    <span>{abg.nombre}</span>
                                    <span
                                      className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                                        abg.rol === 'Socio'
                                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                      }`}
                                    >
                                      {abg.rol}
                                    </span>
                                  </div>
                                  <div className="text-[11px] text-slate-400 mt-0.5">
                                    {abg.matricula} • {abg.email}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={tieneAcceso}
                                  onChange={() => handleToggleAccesoExpte(abg.id)}
                                  className="w-5 h-5 rounded border-slate-700 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900 bg-slate-900"
                                />
                                <span
                                  className={`text-[10px] font-bold uppercase px-2 py-1 rounded border ${
                                    tieneAcceso
                                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                                      : 'bg-slate-800 text-slate-400 border-slate-700'
                                  }`}
                                >
                                  {tieneAcceso ? 'AUTORIZADO' : 'SIN ACCESO'}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12 text-slate-500 text-xs">
                    Seleccione un expediente de la lista para gestionar accesos.
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Matrix mode: Por Abogado Asociado */
            <div className="flex-1 p-6 overflow-y-auto bg-slate-900 space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1">
                    Seleccionar Abogado Asociado:
                  </label>
                  <select
                    value={asociadoSeleccionadoId}
                    onChange={(e) => setAsociadoSeleccionadoId(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-xs font-bold text-slate-100 focus:outline-none focus:border-blue-500"
                  >
                    {abogadosAsociados.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.nombre} ({a.rol} - {a.matricula})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                    Causas Asignadas:
                  </span>
                  <span className="text-lg font-bold text-blue-400">
                    {
                      expedientes.filter((e) =>
                        (autorizadosMap[e.id] || []).includes(asociadoSeleccionadoId)
                      ).length
                    }{' '}
                    de {expedientes.length}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-blue-400" />
                  <span>Listado de Expedientes del Estudio</span>
                </h5>

                <div className="grid grid-cols-1 gap-3">
                  {expedientes.map((exp) => {
                    const autorizados = autorizadosMap[exp.id] || [];
                    const tieneAcceso = autorizados.includes(asociadoSeleccionadoId);
                    return (
                      <div
                        key={exp.id}
                        onClick={() =>
                          handleToggleAccesoAsociadoMatriz(exp.id, asociadoSeleccionadoId)
                        }
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                          tieneAcceso
                            ? 'bg-blue-950/20 border-blue-500/50 text-slate-100'
                            : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex-1 pr-4">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-bold text-xs text-blue-400">{exp.numero}</span>
                            <span className="text-[10px] text-slate-400">• {exp.juzgado}</span>
                          </div>
                          <div className="text-xs font-bold text-slate-200">{exp.caratula}</div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={tieneAcceso}
                            onChange={() =>
                              handleToggleAccesoAsociadoMatriz(exp.id, asociadoSeleccionadoId)
                            }
                            className="w-5 h-5 rounded border-slate-700 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900 bg-slate-900"
                          />
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-1 rounded border ${
                              tieneAcceso
                                ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                                : 'bg-slate-800 text-slate-400 border-slate-700'
                            }`}
                          >
                            {tieneAcceso ? 'ACCESO OTORGADO' : 'DENEGADO'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
