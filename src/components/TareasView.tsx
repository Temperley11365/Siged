import React, { useState } from 'react';
import { TareaEstudio, Expediente, Abogado, EstadoTarea, PrioridadTarea } from '../types';
import { LayoutGrid, List, Plus, CheckSquare, Clock, AlertCircle, MessageSquare, User, Filter } from 'lucide-react';

interface TareasViewProps {
  tareas: TareaEstudio[];
  expedientes: Expediente[];
  abogados: Abogado[];
  onAgregarTarea: (nuevaTarea: TareaEstudio) => void;
  onActualizarEstadoTarea: (tareaId: string, nuevoEstado: EstadoTarea) => void;
  onAgregarComentario: (tareaId: string, autor: string, texto: string) => void;
}

export const TareasView: React.FC<TareasViewProps> = ({
  tareas,
  expedientes,
  abogados,
  onAgregarTarea,
  onActualizarEstadoTarea,
  onAgregarComentario,
}) => {
  const [vista, setVista] = useState<'kanban' | 'lista'>('kanban');
  const [filtroResponsable, setFiltroResponsable] = useState<string>('todos');
  const [filtroPrioridad, setFiltroPrioridad] = useState<string>('todos');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Task Form
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [expedienteId, setExpedienteId] = useState('');
  const [responsableId, setResponsableId] = useState(abogados[0]?.id || 'ABG-001');
  const [prioridad, setPrioridad] = useState<PrioridadTarea>('Alta');
  const [fechaVencimiento, setFechaVencimiento] = useState('2026-08-10');

  // Comment Modal state
  const [tareaComentario, setTareaComentario] = useState<TareaEstudio | null>(null);
  const [nuevoTextoComentario, setNuevoTextoComentario] = useState('');

  const columnasKanban: EstadoTarea[] = ['Por Hacer', 'En Progreso', 'En Revisión', 'Completada'];

  const tareasFiltradas = tareas.filter((t) => {
    if (filtroResponsable !== 'todos' && t.responsable_id !== filtroResponsable) return false;
    if (filtroPrioridad !== 'todos' && t.prioridad !== filtroPrioridad) return false;
    return true;
  });

  const handleCrearTarea = (e: React.FormEvent) => {
    e.preventDefault();
    const expObj = expedientes.find((e) => e.id === expedienteId);

    const nueva: TareaEstudio = {
      id: `TAR-${Math.floor(Math.random() * 9000 + 1000)}`,
      titulo,
      descripcion,
      expediente_id: expedienteId || undefined,
      expediente_caratula: expObj ? `${expObj.numero} - ${expObj.caratula.substring(0, 30)}...` : undefined,
      responsable_id: responsableId,
      prioridad,
      estado: 'Por Hacer',
      fecha_vencimiento: fechaVencimiento,
      creada_por: 'Dr. Juan Manuel Posadas',
      fecha_creacion: new Date().toISOString().split('T')[0],
      comentarios: [],
    };

    onAgregarTarea(nueva);
    setIsModalOpen(false);
    setTitulo('');
    setDescripcion('');
  };

  const handleEnviarComentario = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tareaComentario || !nuevoTextoComentario.trim()) return;

    onAgregarComentario(tareaComentario.id, 'Dr. Juan Manuel Posadas', nuevoTextoComentario);
    setNuevoTextoComentario('');
    setTareaComentario(null);
  };

  const getBadgePrioridad = (p: PrioridadTarea) => {
    switch (p) {
      case 'Urgente':
        return 'bg-red-950 text-red-300 border-red-800';
      case 'Alta':
        return 'bg-amber-950 text-amber-300 border-amber-800';
      case 'Media':
        return 'bg-blue-950 text-blue-300 border-blue-800';
      case 'Baja':
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold tracking-tight uppercase text-slate-100 flex items-center space-x-2">
              <CheckSquare className="w-5 h-5 text-blue-500" />
              <span>Tareas del Estudio & Gestión Global Consolidada</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Asignación de tareas procesales, tablero Kanban, prioridades e historial de comentarios.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {/* Toggle View */}
            <div className="bg-slate-950 p-1 rounded-lg border border-slate-800 flex items-center space-x-1">
              <button
                onClick={() => setVista('kanban')}
                className={`px-3 py-1.5 rounded text-xs font-mono font-bold flex items-center space-x-1 transition-colors ${
                  vista === 'kanban' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Tablero</span>
              </button>
              <button
                onClick={() => setVista('lista')}
                className={`px-3 py-1.5 rounded text-xs font-mono font-bold flex items-center space-x-1 transition-colors ${
                  vista === 'lista' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>Lista</span>
              </button>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold uppercase tracking-wider transition-colors flex items-center space-x-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Crear Tarea</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-slate-800">
          <div>
            <select
              value={filtroResponsable}
              onChange={(e) => setFiltroResponsable(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 font-mono focus:ring-1 focus:ring-blue-500"
            >
              <option value="todos">Todos los Responsables</option>
              {abogados.map((a) => (
                <option key={a.id} value={a.id}>{a.nombre} ({a.rol})</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={filtroPrioridad}
              onChange={(e) => setFiltroPrioridad(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 font-mono focus:ring-1 focus:ring-blue-500"
            >
              <option value="todos">Todas las Prioridades</option>
              <option value="Urgente">Urgente</option>
              <option value="Alta">Alta</option>
              <option value="Media">Media</option>
              <option value="Baja">Baja</option>
            </select>
          </div>
        </div>
      </div>

      {/* KANBAN VIEW */}
      {vista === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {columnasKanban.map((col) => {
            const tareasCol = tareasFiltradas.filter((t) => t.estado === col);
            return (
              <div key={col} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 flex flex-col justify-between min-h-[400px]">
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800 font-mono">
                    <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">{col}</span>
                    <span className="text-xs bg-slate-950 px-2 py-0.5 rounded text-blue-400 font-bold border border-slate-800">
                      {tareasCol.length}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {tareasCol.map((tarea) => {
                      const resp = abogados.find((a) => a.id === tarea.responsable_id);
                      return (
                        <div
                          key={tarea.id}
                          className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-3 shadow-sm hover:border-slate-700 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${getBadgePrioridad(tarea.prioridad)}`}>
                              {tarea.prioridad}
                            </span>
                            <span className="text-[10px] font-mono text-slate-500">
                              Vence: {tarea.fecha_vencimiento}
                            </span>
                          </div>

                          <h4 className="text-xs font-bold text-slate-100 leading-snug">
                            {tarea.titulo}
                          </h4>

                          {tarea.expediente_caratula && (
                            <div className="text-[10px] font-mono text-slate-400 truncate bg-slate-900 p-1.5 rounded border border-slate-800/80">
                              Expte: {tarea.expediente_caratula}
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-2 border-t border-slate-900 text-[10px] font-mono">
                            <span className="text-slate-400 flex items-center space-x-1">
                              <User className="w-3 h-3 text-blue-400" />
                              <span>{resp?.nombre.split(' ')[1]}</span>
                            </span>

                            <button
                              onClick={() => setTareaComentario(tarea)}
                              className="text-slate-400 hover:text-blue-400 flex items-center space-x-1"
                            >
                              <MessageSquare className="w-3 h-3" />
                              <span>({tarea.comentarios.length})</span>
                            </button>
                          </div>

                          {/* Quick Change State */}
                          <div className="pt-1">
                            <select
                              value={tarea.estado}
                              onChange={(e) => onActualizarEstadoTarea(tarea.id, e.target.value as EstadoTarea)}
                              className="w-full bg-slate-900 border border-slate-800 text-[10px] text-slate-300 font-mono rounded px-2 py-1"
                            >
                              {columnasKanban.map((c) => (
                                <option key={c} value={c}>{c}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* LIST VIEW */}
      {vista === 'lista' && (
        <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-5 shadow-sm space-y-3">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                  <th className="py-2.5 px-3">Estado</th>
                  <th className="py-2.5 px-3">Prioridad</th>
                  <th className="py-2.5 px-3">Título Tarea</th>
                  <th className="py-2.5 px-3">Expediente</th>
                  <th className="py-2.5 px-3">Responsable</th>
                  <th className="py-2.5 px-3">Vencimiento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {tareasFiltradas.map((tarea) => {
                  const resp = abogados.find((a) => a.id === tarea.responsable_id);
                  return (
                    <tr key={tarea.id} className="hover:bg-slate-950/60 transition-colors">
                      <td className="py-3 px-3">
                        <select
                          value={tarea.estado}
                          onChange={(e) => onActualizarEstadoTarea(tarea.id, e.target.value as EstadoTarea)}
                          className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded px-2 py-1"
                        >
                          {columnasKanban.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded border uppercase ${getBadgePrioridad(tarea.prioridad)}`}>
                          {tarea.prioridad}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-100">{tarea.titulo}</td>
                      <td className="py-3 px-3 text-slate-400">{tarea.expediente_caratula || 'General Studio'}</td>
                      <td className="py-3 px-3 text-blue-400">{resp?.nombre || 'Abogado'}</td>
                      <td className="py-3 px-3 text-amber-400">{tarea.fecha_vencimiento}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Crear Tarea */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-100 uppercase tracking-tight flex items-center space-x-2">
              <CheckSquare className="w-5 h-5 text-blue-500" />
              <span>Alta de Nueva Tarea del Estudio</span>
            </h3>

            <form onSubmit={handleCrearTarea} className="space-y-3 text-xs">
              <div>
                <label className="block font-mono text-slate-400 uppercase text-[10px] mb-1">Título de la Tarea:</label>
                <input
                  type="text"
                  required
                  placeholder="ej: Presentar alegatos en Expte 1420"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block font-mono text-slate-400 uppercase text-[10px] mb-1">Descripción / Instrucciones:</label>
                <textarea
                  rows={3}
                  placeholder="Detalles sobre las tareas a realizar..."
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-100 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-slate-400 uppercase text-[10px] mb-1">Responsable Asignado:</label>
                  <select
                    value={responsableId}
                    onChange={(e) => setResponsableId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 font-mono"
                  >
                    {abogados.map((a) => (
                      <option key={a.id} value={a.id}>{a.nombre}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-slate-400 uppercase text-[10px] mb-1">Prioridad:</label>
                  <select
                    value={prioridad}
                    onChange={(e) => setPrioridad(e.target.value as PrioridadTarea)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 font-mono"
                  >
                    <option value="Urgente">Urgente</option>
                    <option value="Alta">Alta</option>
                    <option value="Media">Media</option>
                    <option value="Baja">Baja</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-slate-400 uppercase text-[10px] mb-1">Expediente Asociado (Opcional):</label>
                  <select
                    value={expedienteId}
                    onChange={(e) => setExpedienteId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 font-mono"
                  >
                    <option value="">Sin expediente (General)</option>
                    {expedientes.map((e) => (
                      <option key={e.id} value={e.id}>{e.numero} - {e.cliente}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-slate-400 uppercase text-[10px] mb-1">Fecha Vencimiento:</label>
                  <input
                    type="date"
                    value={fechaVencimiento}
                    onChange={(e) => setFechaVencimiento(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100 font-mono"
                  />
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
                  Guardar Tarea
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Comentarios */}
      {tareaComentario && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-tight flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-blue-500" />
              <span>Comentarios: {tareaComentario.titulo}</span>
            </h3>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {tareaComentario.comentarios.length === 0 ? (
                <p className="text-xs text-slate-500 font-mono">Sin comentarios registrados.</p>
              ) : (
                tareaComentario.comentarios.map((c) => (
                  <div key={c.id} className="bg-slate-950 p-2.5 rounded border border-slate-800 text-xs font-mono space-y-1">
                    <div className="flex items-center justify-between text-blue-400 font-bold">
                      <span>{c.autor}</span>
                      <span className="text-[10px] text-slate-500">{c.fecha}</span>
                    </div>
                    <p className="text-slate-300">{c.texto}</p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleEnviarComentario} className="space-y-2">
              <input
                type="text"
                required
                placeholder="Escribe un comentario o actualización..."
                value={nuevoTextoComentario}
                onChange={(e) => setNuevoTextoComentario(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-100 font-mono"
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setTareaComentario(null)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 text-xs font-bold rounded"
                >
                  Cerrar
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded"
                >
                  Comentar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
