import React, { useState } from 'react';
import { PruebaExpediente, Expediente, Abogado, TipoPrueba, EstadoPrueba, SemaforoColor } from '../types';
import { Scale, Clock, AlertTriangle, CheckCircle2, Plus, Filter, FileSpreadsheet, Send, ShieldAlert } from 'lucide-react';

interface PruebasViewProps {
  pruebas: PruebaExpediente[];
  expedientes: Expediente[];
  abogados: Abogado[];
  onAgregarPrueba: (nuevaPrueba: PruebaExpediente) => void;
  onActualizarPrueba: (pruebaActualizada: PruebaExpediente) => void;
}

export const PruebasView: React.FC<PruebasViewProps> = ({
  pruebas,
  expedientes,
  abogados,
  onAgregarPrueba,
  onActualizarPrueba,
}) => {
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [filtroSemaforo, setFiltroSemaforo] = useState<string>('todos');
  const [busqueda, setBusqueda] = useState('');

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expedienteId, setExpedienteId] = useState(expedientes[0]?.id || '');
  const [tipo, setTipo] = useState<TipoPrueba>('Informativa (Oficio)');
  const [descripcion, setDescripcion] = useState('');
  const [oferente, setOferente] = useState<'Parte Actora' | 'Parte Demandada' | 'De Oficio'>('Parte Actora');
  const [diasVencimiento, setDiasVencimiento] = useState(5);
  const [detallesOficioPericia, setDetallesOficioPericia] = useState('');

  const calcularSemaforo = (dias: number): SemaforoColor => {
    if (dias <= 2) return 'rojo';
    if (dias <= 5) return 'amarillo';
    return 'verde';
  };

  const pruebasFiltradas = pruebas.filter((p) => {
    if (filtroTipo !== 'todos' && p.tipo !== filtroTipo) return false;
    if (filtroSemaforo !== 'todos' && p.semaforo !== filtroSemaforo) return false;
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      return (
        p.descripcion.toLowerCase().includes(q) ||
        p.caratula_expte.toLowerCase().includes(q) ||
        (p.detalles_oficio_pericia && p.detalles_oficio_pericia.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleCrearPrueba = (e: React.FormEvent) => {
    e.preventDefault();
    const expSelected = expedientes.find((e) => e.id === expedienteId);
    const sem = calcularSemaforo(diasVencimiento);

    const nueva: PruebaExpediente = {
      id: `PRU-${Math.floor(Math.random() * 9000 + 1000)}`,
      expediente_id: expedienteId,
      caratula_expte: expSelected ? `${expSelected.numero} - ${expSelected.caratula.substring(0, 30)}...` : 'Expediente Misiones',
      tipo,
      descripcion,
      oferente,
      estado: 'Ofrecida',
      dias_restantes: diasVencimiento,
      semaforo: sem,
      responsable_id: expSelected?.letrado_patrocinante || 'ABG-001',
      detalles_oficio_pericia: detallesOficioPericia,
    };

    onAgregarPrueba(nueva);
    setIsModalOpen(false);
    setDescripcion('');
    setDetallesOficioPericia('');
  };

  const handleCambiarEstado = (prueba: PruebaExpediente, nuevoEstado: EstadoPrueba) => {
    const actualizada = { ...prueba, estado: nuevoEstado };
    onActualizarPrueba(actualizada);
  };

  return (
    <div className="space-y-6">
      {/* Header & Semáforo Summary Cards */}
      <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold tracking-tight uppercase text-slate-100 flex items-center space-x-2">
              <Scale className="w-5 h-5 text-blue-500" />
              <span>Gestión del Ciclo de Vida de Pruebas & Semáforo de Plazos</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Monitoreo pericial, diligenciamiento de oficios e impugnaciones procesales en Misiones.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold uppercase tracking-wider transition-colors flex items-center space-x-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Ofrecer Nueva Prueba</span>
          </button>
        </div>

        {/* Semáforo Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-800">
          <div className="bg-slate-950 p-3.5 rounded-lg border border-red-500/30 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Vencimiento Inminente (&le; 2 días)</span>
                <span className="text-xs font-bold text-red-400 uppercase">Prioridad Urgente</span>
              </div>
            </div>
            <span className="text-lg font-bold text-red-400 font-mono">
              {pruebas.filter((p) => p.semaforo === 'rojo').length}
            </span>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-lg border border-amber-500/30 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-amber-400" />
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Próximo Vencimiento (3 - 5 días)</span>
                <span className="text-xs font-bold text-amber-400 uppercase">Atención Requerida</span>
              </div>
            </div>
            <span className="text-lg font-bold text-amber-400 font-mono">
              {pruebas.filter((p) => p.semaforo === 'amarillo').length}
            </span>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-lg border border-emerald-500/30 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-emerald-400" />
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Plazo Holgado (&gt; 5 días)</span>
                <span className="text-xs font-bold text-emerald-400 uppercase">En Término Normal</span>
              </div>
            </div>
            <span className="text-lg font-bold text-emerald-400 font-mono">
              {pruebas.filter((p) => p.semaforo === 'verde').length}
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2">
          <div className="md:col-span-6 relative">
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por descripción, carátula u oficio..."
              className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-100 focus:ring-1 focus:ring-blue-500 font-mono"
            />
          </div>

          <div className="md:col-span-3">
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 focus:ring-1 focus:ring-blue-500 font-mono"
            >
              <option value="todos">Todos los Tipos de Prueba</option>
              <option value="Documental">Documental</option>
              <option value="Informativa (Oficio)">Informativa (Oficios)</option>
              <option value="Confesional (Absolución)">Confesional</option>
              <option value="Testimonial">Testimonial</option>
              <option value="Pericial">Pericial</option>
              <option value="Otras">Otras</option>
            </select>
          </div>

          <div className="md:col-span-3">
            <select
              value={filtroSemaforo}
              onChange={(e) => setFiltroSemaforo(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 focus:ring-1 focus:ring-blue-500 font-mono"
            >
              <option value="todos">Todos los Semáforos</option>
              <option value="rojo">🔴 Urgente (&le; 2 días)</option>
              <option value="amarillo">🟡 Próximo (3-5 días)</option>
              <option value="verde">🟢 Holgado (&gt; 5 días)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Pruebas List / Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pruebasFiltradas.map((prueba) => {
          const resp = abogados.find((a) => a.id === prueba.responsable_id);

          return (
            <div
              key={prueba.id}
              className={`bg-slate-900 border rounded-xl p-5 shadow-sm space-y-4 transition-all flex flex-col justify-between ${
                prueba.semaforo === 'rojo'
                  ? 'border-red-500/40 hover:border-red-500'
                  : prueba.semaforo === 'amarillo'
                  ? 'border-amber-500/40 hover:border-amber-500'
                  : 'border-slate-700 hover:border-slate-600'
              }`}
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`w-3 h-3 rounded-full shrink-0 ${
                        prueba.semaforo === 'rojo'
                          ? 'bg-red-500 animate-pulse'
                          : prueba.semaforo === 'amarillo'
                          ? 'bg-amber-400'
                          : 'bg-emerald-400'
                      }`}
                    />
                    <span className="text-xs font-mono font-bold text-blue-400 bg-blue-600/20 border border-blue-500/30 px-2 py-0.5 rounded">
                      {prueba.tipo}
                    </span>
                  </div>

                  <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    Oferente: {prueba.oferente}
                  </span>
                </div>

                <div className="text-[11px] font-mono text-slate-400 truncate">
                  Expte: {prueba.caratula_expte}
                </div>

                <h3 className="text-xs font-bold text-slate-100 leading-relaxed">
                  {prueba.descripcion}
                </h3>

                {prueba.detalles_oficio_pericia && (
                  <div className="p-2.5 bg-slate-950 rounded border border-slate-800 text-xs text-slate-300 font-mono">
                    <span className="text-slate-500 block text-[10px] uppercase">Detalle Oficio / Pericia:</span>
                    {prueba.detalles_oficio_pericia}
                  </div>
                )}
              </div>

              {/* Status and Actions */}
              <div className="pt-3 border-t border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Estado:</span>
                    <select
                      value={prueba.estado}
                      onChange={(e) => handleCambiarEstado(prueba, e.target.value as EstadoPrueba)}
                      className="bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono rounded px-2 py-1 focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="Ofrecida">Ofrecida</option>
                      <option value="Proveída">Proveída</option>
                      <option value="Diligenciada / Oficiada">Diligenciada / Oficiada</option>
                      <option value="Contestada / Rendida">Contestada / Rendida</option>
                      <option value="Impugnada / Observada">Impugnada / Observada</option>
                      <option value="Firme">Firme</option>
                    </select>
                  </div>

                  {resp && (
                    <span className="text-[10px] font-mono text-slate-400">
                      Resp: {resp.nombre.split(' ')[1]}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Ofrecer Nueva Prueba */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-100 uppercase tracking-tight flex items-center space-x-2">
              <Scale className="w-5 h-5 text-blue-500" />
              <span>Ofrecimiento de Prueba (CPCCyM Misiones)</span>
            </h3>

            <form onSubmit={handleCrearPrueba} className="space-y-3 text-xs">
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
                  <label className="block font-mono text-slate-400 uppercase text-[10px] mb-1">Tipo de Prueba:</label>
                  <select
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value as TipoPrueba)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 font-mono"
                  >
                    <option value="Documental">Documental</option>
                    <option value="Informativa (Oficio)">Informativa (Oficios)</option>
                    <option value="Confesional (Absolución)">Confesional</option>
                    <option value="Testimonial">Testimonial</option>
                    <option value="Pericial">Pericial</option>
                    <option value="Otras">Otras</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-slate-400 uppercase text-[10px] mb-1">Oferente:</label>
                  <select
                    value={oferente}
                    onChange={(e) => setOferente(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 font-mono"
                  >
                    <option value="Parte Actora">Parte Actora</option>
                    <option value="Parte Demandada">Parte Demandada</option>
                    <option value="De Oficio">De Oficio</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-mono text-slate-400 uppercase text-[10px] mb-1">Descripción de la Medida Probatoria:</label>
                <textarea
                  required
                  rows={3}
                  placeholder="ej: Oficio a la Policía de Misiones para remisión de sumario de tránsito N° 402/2025."
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-100 focus:ring-1 focus:ring-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-mono text-slate-400 uppercase text-[10px] mb-1">Días Hábiles de Plazo Procesal Estimado:</label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={diasVencimiento}
                  onChange={(e) => setDiasVencimiento(parseInt(e.target.value) || 5)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block font-mono text-slate-400 uppercase text-[10px] mb-1">Detalle de Pericias u Oficios:</label>
                <input
                  type="text"
                  placeholder="ej: Perito designado Dr. Benítez - Aceptación de cargo pendiente"
                  value={detallesOficioPericia}
                  onChange={(e) => setDetallesOficioPericia(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100 focus:ring-1 focus:ring-blue-500 font-mono"
                />
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
                  Registrar Prueba
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
