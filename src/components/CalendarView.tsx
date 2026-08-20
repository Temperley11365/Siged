import React, { useState } from 'react';
import { HOLIDAYS_MISIONES_2026, calcularVencimientoMisiones, isHabilJudicial, formatFechaEsp } from '../lib/misionesCalendar';
import { Calendar, Clock, AlertTriangle, CheckCircle2, Info, Sparkles, Plus, Trash2, ShieldAlert, X, Eye, FileText, CheckSquare, Square, ChevronRight, User, Scale } from 'lucide-react';
import { DiaInhabil, AudienciaExpediente, TareaEstudio, Expediente } from '../types';
import { FichaExpedienteModal } from './FichaExpedienteModal';

interface CalendarViewProps {
  diasInhabiles: DiaInhabil[];
  audiencias: AudienciaExpediente[];
  tareas: TareaEstudio[];
  expedientes?: Expediente[];
  onAgregarDiaInhabil: (dia: DiaInhabil) => void;
  onEliminarDiaInhabil: (id: string) => void;
  onActualizarEstadoTarea?: (id: string, nuevoEstado: 'Pendiente' | 'En Progreso' | 'Completada' | 'Cancelada') => void;
  onSelectTab?: (tab: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  diasInhabiles,
  audiencias,
  tareas,
  expedientes = [],
  onAgregarDiaInhabil,
  onEliminarDiaInhabil,
  onActualizarEstadoTarea,
  onSelectTab,
}) => {
  const [vista, setVista] = useState<'calculador' | 'mes' | 'semana' | 'ferias'>('mes');
  const [fechaNotif, setFechaNotif] = useState(new Date().toISOString().split('T')[0]);
  const [plazoDias, setPlazoDias] = useState<number>(5);
  const [tipoPlazo, setTipoPlazo] = useState<'hábiles' | 'corridos'>('hábiles');

  // Selected Day Modal State
  const [diaSeleccionadoStr, setDiaSeleccionadoStr] = useState<string | null>(null);
  const [expedienteParaVer, setExpedienteParaVer] = useState<Expediente | null>(null);

  // Modal Custom Dia Inhabil
  const [isModalInhabilOpen, setIsModalInhabilOpen] = useState(false);
  const [fechaInhabil, setFechaInhabil] = useState('2026-08-14');
  const [motivoInhabil, setMotivoInhabil] = useState('');
  const [ambitoInhabil, setAmbitoInhabil] = useState<'Provincial' | 'Nacional' | 'Estudio Posadas' | 'Paro Judicial'>('Paro Judicial');

  const resultadoCalc = calcularVencimientoMisiones(fechaNotif, plazoDias, tipoPlazo, diasInhabiles);

  const handleCrearInhabil = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fechaInhabil || !motivoInhabil) return;

    const nuevo: DiaInhabil = {
      id: `INH-${Date.now()}`,
      fecha: fechaInhabil,
      descripcion: motivoInhabil,
      tipo: ambitoInhabil,
      motivo: motivoInhabil,
      ambito: ambitoInhabil,
    };

    onAgregarDiaInhabil(nuevo);
    setIsModalInhabilOpen(false);
    setMotivoInhabil('');
  };

  // Selected Day computed items
  const audienciasDelDia = diaSeleccionadoStr 
    ? audiencias.filter((a) => a.fecha_hora.startsWith(diaSeleccionadoStr))
    : [];

  const tareasDelDia = diaSeleccionadoStr
    ? tareas.filter((t) => t.fecha_vencimiento === diaSeleccionadoStr)
    : [];

  const inhabilDelDia = diaSeleccionadoStr
    ? diasInhabiles.find((d) => d.fecha === diaSeleccionadoStr)
    : null;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold tracking-tight uppercase text-slate-100 flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              <span>Agenda Judicial, Calendario de Causas & Calculador de Plazos</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Haga clic en cualquier día de la cuadrícula mensual para ver las audiencias y tareas agendadas y acceder directamente al expediente.
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setVista('mes')}
              className={`px-3 py-1.5 rounded text-xs font-mono font-bold transition-colors ${
                vista === 'mes' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Vista Mensual
            </button>
            <button
              onClick={() => setVista('calculador')}
              className={`px-3 py-1.5 rounded text-xs font-mono font-bold transition-colors ${
                vista === 'calculador' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Calculador Plazos
            </button>
            <button
              onClick={() => setVista('ferias')}
              className={`px-3 py-1.5 rounded text-xs font-mono font-bold transition-colors ${
                vista === 'ferias' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Ferias & Inhábiles ({diasInhabiles.length})
            </button>
          </div>
        </div>
      </div>

      {/* VISTA CALCULADOR */}
      {vista === 'calculador' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Form (5 Cols) */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-700/80 rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-blue-400 pb-2 border-b border-slate-800 flex items-center space-x-2">
              <Clock className="w-4 h-4 text-blue-500" />
              <span>Simulador de Vencimientos CPCCyM</span>
            </h3>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Fecha de Notificación (Cédula/SIGED)</label>
              <input
                type="date"
                value={fechaNotif}
                onChange={(e) => setFechaNotif(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-100 focus:ring-1 focus:ring-blue-500 font-mono"
              />
              <p className="text-[10px] text-slate-500 font-mono mt-1">
                * El cómputo del plazo inicia el primer día hábil posterior a la notificación.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Cantidad de Días</label>
                <input
                  type="number"
                  min={1}
                  max={90}
                  value={plazoDias}
                  onChange={(e) => setPlazoDias(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-100 focus:ring-1 focus:ring-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Tipo de Plazo</label>
                <select
                  value={tipoPlazo}
                  onChange={(e) => setTipoPlazo(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 focus:ring-1 focus:ring-blue-500 font-mono"
                >
                  <option value="hábiles">Días Hábiles Judiciales</option>
                  <option value="corridos">Días Corridos</option>
                </select>
              </div>
            </div>

            {/* Preset Buttons */}
            <div>
              <label className="block text-[10px] font-mono text-slate-400 mb-1.5 uppercase font-bold tracking-widest">Plazos Frecuentes Misiones:</label>
              <div className="flex flex-wrap gap-1.5">
                {[3, 5, 10, 15].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setPlazoDias(d)}
                    className={`px-3 py-1 text-xs font-mono font-bold rounded transition-colors ${
                      plazoDias === d
                        ? 'bg-blue-600 text-white border border-blue-500'
                        : 'bg-slate-950 text-slate-300 border border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {d} Días
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Breakdown Result (7 Cols) */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-700/80 rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300 pb-2 border-b border-slate-800">
              Desglose del Cómputo de Plazo Procesal
            </h3>

            <div className="bg-slate-950 p-4 border border-slate-800 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-mono">FECHA DE NOTIFICACIÓN:</span>
                <span className="text-xs font-bold text-blue-400 font-mono">{fechaNotif}</span>
              </div>

              <div className="p-4 bg-slate-800 rounded-lg border-l-4 border-amber-500 space-y-3">
                <div className="text-xs text-amber-300">
                  <strong className="text-amber-400 font-bold uppercase text-[10px] tracking-widest block mb-1">📅 Vencimiento Principal:</strong>
                  <span className="text-sm font-bold text-white font-mono">{resultadoCalc.vencimientoFechaStr}</span>
                </div>

                <div className="text-xs text-emerald-300 border-t border-slate-700/80 pt-2">
                  <strong className="text-emerald-400 font-bold uppercase text-[10px] tracking-widest block mb-1">
                    ⏰ Plazo de Gracia (Art. 124 CPCCyM Misiones):
                  </strong>
                  <span className="text-xs text-slate-200 font-mono">{resultadoCalc.vencimientoGraciaStr}</span>
                </div>
              </div>

              {/* Daily breakdown */}
              <div className="space-y-1.5 pt-2">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">Días Hábiles Contados:</span>
                <div className="space-y-1">
                  {resultadoCalc.diasHabilesDesglosados.map((dh, i) => (
                    <div key={i} className="text-xs bg-slate-900 px-3 py-1.5 rounded border border-slate-800 text-slate-300 font-mono flex items-center space-x-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{dh}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Legal Notice */}
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-400 leading-relaxed flex items-start space-x-2">
              <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-300 font-bold uppercase tracking-wider text-[10px] block mb-0.5">Nota sobre Plazo de Gracia Misiones:</strong>
                En los tribunales de la Provincia de Misiones, el escrito no presentado dentro del horario judicial del día en que venciera un plazo, podrá ser entregado válidamente el día hábil inmediato posterior dentro de las <strong className="text-slate-200">dos primeras horas del despacho (07:00 a 09:00 hs)</strong> (Art. 124 CPCCyM).
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VISTA MES */}
      {vista === 'mes' && (
        <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase text-slate-100 font-mono">Agosto 2026 • Poder Judicial de Misiones</h3>
            <span className="text-xs text-slate-400 font-mono">Audiencias ({audiencias.length}) • Tareas ({tareas.length})</span>
          </div>

          <div className="grid grid-cols-7 gap-2 font-mono text-xs text-center">
            {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((d) => (
              <div key={d} className="p-2 font-bold text-slate-400 bg-slate-950 rounded border border-slate-800 uppercase">
                {d}
              </div>
            ))}

            {Array.from({ length: 31 }, (_, i) => {
              const diaNum = i + 1;
              const dateStr = `2026-08-${String(diaNum).padStart(2, '0')}`;
              const audsDia = audiencias.filter((a) => a.fecha_hora.startsWith(dateStr));
              const tareasDia = tareas.filter((t) => t.fecha_vencimiento === dateStr);
              const isWeekend = i % 7 === 5 || i % 7 === 6;
              const isInhabil = diasInhabiles.some((d) => d.fecha === dateStr);
              const tieneEventos = audsDia.length > 0 || tareasDia.length > 0;
              const isSelected = diaSeleccionadoStr === dateStr;

              return (
                <button
                  key={diaNum}
                  onClick={() => setDiaSeleccionadoStr(dateStr)}
                  className={`min-h-[95px] p-2 rounded-lg border text-left flex flex-col justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'ring-2 ring-blue-500 bg-blue-950/40 border-blue-600'
                      : isWeekend
                      ? 'bg-slate-950/40 border-slate-900 text-slate-600 hover:border-slate-700'
                      : isInhabil
                      ? 'bg-amber-950/20 border-amber-800/40 text-amber-300 hover:border-amber-600'
                      : tieneEventos
                      ? 'bg-slate-950 border-slate-700 hover:border-blue-500/60 shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className={`font-bold text-xs ${isSelected ? 'text-blue-400' : isInhabil ? 'text-amber-400' : ''}`}>
                      {diaNum}
                    </span>
                    {tieneEventos && (
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    )}
                  </div>

                  <div className="space-y-1 w-full mt-1">
                    {audsDia.slice(0, 2).map((a) => (
                      <span key={a.id} className="block text-[9px] bg-blue-900/50 text-blue-300 px-1 py-0.5 rounded truncate border border-blue-700/50 font-sans">
                        🏛️ {a.tipo}
                      </span>
                    ))}
                    {tareasDia.slice(0, 2).map((t) => (
                      <span key={t.id} className="block text-[9px] bg-amber-900/50 text-amber-300 px-1 py-0.5 rounded truncate border border-amber-700/50 font-sans">
                        📋 {t.titulo}
                      </span>
                    ))}
                    {audsDia.length + tareasDia.length > 4 && (
                      <span className="text-[8px] text-slate-400 font-mono block">
                        +{audsDia.length + tareasDia.length - 4} más...
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL DETALLE DE DÍA SELECCIONADO (AUDIENCIAS, TAREAS Y EXPEDIENTES) */}
      {diaSeleccionadoStr && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono text-blue-400 font-bold uppercase tracking-widest block">Agenda Diaria Judicial</span>
                <h3 className="text-base font-bold text-slate-100 uppercase">
                  {formatFechaEsp(diaSeleccionadoStr)} ({diaSeleccionadoStr})
                </h3>
              </div>

              <button
                onClick={() => setDiaSeleccionadoStr(null)}
                className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Inhábil Banner if any */}
            {inhabilDelDia && (
              <div className="p-3 bg-amber-950/60 border border-amber-600/50 rounded-lg text-amber-300 text-xs font-mono flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">Día Inhábil ({inhabilDelDia.ambito}):</strong>
                  <span>{inhabilDelDia.motivo || inhabilDelDia.descripcion}</span>
                </div>
              </div>
            )}

            {/* Audiencias Section */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
                <span className="flex items-center space-x-1.5">
                  <Scale className="w-4 h-4 text-blue-400" />
                  <span>Audiencias Programadas ({audienciasDelDia.length})</span>
                </span>
              </h4>

              {audienciasDelDia.length === 0 ? (
                <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 text-center text-xs text-slate-500 font-mono">
                  No hay audiencias fijadas para esta fecha.
                </div>
              ) : (
                <div className="space-y-2">
                  {audienciasDelDia.map((aud) => {
                    const exp = expedientes.find((e) => e.id === aud.expediente_id);
                    return (
                      <div
                        key={aud.id}
                        className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-0.5 bg-blue-900/60 border border-blue-600 text-blue-300 text-[10px] font-mono font-bold rounded">
                              {aud.fecha_hora.split('T')[1] || '08:00'} HS
                            </span>
                            <strong className="text-slate-100 text-xs font-bold">{aud.tipo}</strong>
                            <span className="text-[10px] text-slate-400 font-mono">({aud.modalidad})</span>
                          </div>

                          <p className="text-xs text-slate-300 font-medium">
                            {exp ? `${exp.numero} - ${exp.caratula}` : aud.juzgado}
                          </p>
                          <p className="text-[10px] text-slate-500 font-mono">Juzgado: {aud.juzgado}</p>
                        </div>

                        {exp && (
                          <button
                            onClick={() => {
                              setExpedienteParaVer(exp);
                            }}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-blue-300 border border-slate-700 text-xs font-mono font-bold rounded flex items-center space-x-1.5 shrink-0"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Ver Expediente</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Tareas / Vencimientos Section */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
                <span className="flex items-center space-x-1.5">
                  <CheckSquare className="w-4 h-4 text-emerald-400" />
                  <span>Tareas & Vencimientos Procesales ({tareasDelDia.length})</span>
                </span>
              </h4>

              {tareasDelDia.length === 0 ? (
                <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 text-center text-xs text-slate-500 font-mono">
                  No hay tareas ni plazos judiciales que venzan en este día.
                </div>
              ) : (
                <div className="space-y-2">
                  {tareasDelDia.map((t) => {
                    const exp = expedientes.find((e) => e.id === t.expediente_id);
                    const estaCompletada = t.estado === 'Completada';

                    return (
                      <div
                        key={t.id}
                        className={`bg-slate-950 p-3.5 rounded-lg border transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          estaCompletada ? 'border-slate-800/60 opacity-60' : 'border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          {onActualizarEstadoTarea && (
                            <button
                              onClick={() => {
                                const nuevo = estaCompletada ? 'Pendiente' : 'Completada';
                                onActualizarEstadoTarea(t.id, nuevo);
                              }}
                              className="mt-0.5 text-slate-400 hover:text-emerald-400"
                              title={estaCompletada ? 'Reabrir tarea' : 'Marcar como completada'}
                            >
                              {estaCompletada ? (
                                <CheckSquare className="w-4 h-4 text-emerald-400" />
                              ) : (
                                <Square className="w-4 h-4 text-slate-500" />
                              )}
                            </button>
                          )}

                          <div className="space-y-1">
                            <div className="flex items-center space-x-2 flex-wrap">
                              <strong className={`text-xs ${estaCompletada ? 'line-through text-slate-400' : 'text-slate-100'}`}>
                                {t.titulo}
                              </strong>
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                                t.prioridad === 'Urgente'
                                  ? 'bg-red-950 text-red-300 border border-red-800'
                                  : t.prioridad === 'Alta'
                                  ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                  : 'bg-slate-800 text-slate-300'
                              }`}>
                                {t.prioridad}
                              </span>
                              <span className="text-[10px] font-mono text-slate-400">
                                {t.estado}
                              </span>
                            </div>

                            {t.descripcion && (
                              <p className="text-xs text-slate-400">{t.descripcion}</p>
                            )}

                            {exp && (
                              <p className="text-[10px] text-blue-400 font-mono">
                                Causa: {exp.numero} - {exp.caratula}
                              </p>
                            )}
                          </div>
                        </div>

                        {exp && (
                          <button
                            onClick={() => {
                              setExpedienteParaVer(exp);
                            }}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-blue-300 border border-slate-700 text-xs font-mono font-bold rounded flex items-center space-x-1.5 shrink-0"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Ver Causa</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                onClick={() => setDiaSeleccionadoStr(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-mono font-bold text-xs uppercase"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ficha Completa del Expediente Modal */}
      {expedienteParaVer && (
        <FichaExpedienteModal
          isOpen={!!expedienteParaVer}
          onClose={() => setExpedienteParaVer(null)}
          expediente={expedientes.find(e => e.id === expedienteParaVer.id) || expedienteParaVer}
        />
      )}

      {/* VISTA FERIAS E INHABILES */}
      {vista === 'ferias' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold uppercase text-slate-100">Días Inhábiles y Ferias Judiciales Personalizadas</h3>
                <p className="text-xs text-slate-400">Configure paros de la AJER/Asociación de Empleados Judiciales o feriados locales que afectan los plazos.</p>
              </div>

              <button
                onClick={() => setIsModalInhabilOpen(true)}
                className="px-3.5 py-1.5 bg-blue-600 text-white rounded text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar Día Inhábil</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {diasInhabiles.map((inh) => (
                <div key={inh.id} className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 flex items-center justify-between text-xs font-mono">
                  <div>
                    <div className="flex items-center space-x-2">
                      <strong className="text-amber-400 font-bold">{inh.fecha}</strong>
                      <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">{inh.ambito}</span>
                    </div>
                    <p className="text-slate-300 text-xs mt-1">{inh.motivo}</p>
                  </div>

                  <button
                    onClick={() => onEliminarDiaInhabil(inh.id)}
                    className="text-slate-500 hover:text-red-400 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal Agregar Inhabil */}
      {isModalInhabilOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-tight flex items-center space-x-2">
              <Plus className="w-4 h-4 text-blue-500" />
              <span>Configurar Día Inhábil Especial</span>
            </h3>

            <form onSubmit={handleCrearInhabil} className="space-y-3 text-xs">
              <div>
                <label className="block font-mono text-slate-400 uppercase text-[10px] mb-1">Fecha del Inhábil:</label>
                <input
                  type="date"
                  required
                  value={fechaInhabil}
                  onChange={(e) => setFechaInhabil(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block font-mono text-slate-400 uppercase text-[10px] mb-1">Motivo / Causal:</label>
                <input
                  type="text"
                  required
                  placeholder="ej: Paro General Empleados Judiciales Misiones"
                  value={motivoInhabil}
                  onChange={(e) => setMotivoInhabil(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block font-mono text-slate-400 uppercase text-[10px] mb-1">Ámbito de Inhabilidad:</label>
                <select
                  value={ambitoInhabil}
                  onChange={(e) => setAmbitoInhabil(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 font-mono"
                >
                  <option value="Paro Judicial">Paro Judicial</option>
                  <option value="Provincial">Provincial</option>
                  <option value="Nacional">Nacional</option>
                  <option value="Estudio Posadas">Estudio Posadas</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalInhabilOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded font-bold uppercase text-[10px]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded font-bold uppercase text-[10px]"
                >
                  Guardar Día
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
