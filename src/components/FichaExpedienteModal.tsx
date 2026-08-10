import React, { useState } from 'react';
import { 
  FileText, Users, DollarSign, Clock, Paperclip, ChevronRight, X, ShieldAlert, CheckCircle2, AlertCircle, Building, Landmark, Scale,
  BookOpen, CheckSquare, Copy, Plus, Edit3, Download, ArrowRight, Sparkles, Folder
} from 'lucide-react';
import { Expediente, DocumentoEstudio, PruebaExpediente, AudienciaExpediente, ModeloEscritoRepositorio, ProgresoPasosExpediente } from '../types';

interface FichaExpedienteModalProps {
  isOpen: boolean;
  onClose: () => void;
  expediente: Expediente | null;
  documentos: DocumentoEstudio[];
  pruebas: PruebaExpediente[];
  audiencias: AudienciaExpediente[];
  modelosRepositorio?: ModeloEscritoRepositorio[];
  progresosPasos?: ProgresoPasosExpediente[];
  onTogglePasoCompletado?: (expedienteId: string, modeloId: string, pasoId: string) => void;
  onGuardarDocumentoExpediente?: (expedienteId: string, doc: DocumentoEstudio) => void;
  onAbrirEditorConTexto?: (texto: string, titulo: string, exp: Expediente) => void;
}

export const FichaExpedienteModal: React.FC<FichaExpedienteModalProps> = ({
  isOpen,
  onClose,
  expediente,
  documentos,
  pruebas,
  audiencias,
  modelosRepositorio = [],
  progresosPasos = [],
  onTogglePasoCompletado,
  onGuardarDocumentoExpediente,
  onAbrirEditorConTexto,
}) => {
  const [activeTab, setActiveTab] = useState<'resumen' | 'partes' | 'movimientos' | 'financiero' | 'documentos' | 'guias'>('resumen');
  
  // Local state for selecting model in "guias" tab
  const [modeloSeleccionadoId, setModeloSeleccionadoId] = useState<string>('');
  const [textoGeneradoModal, setTextoGeneradoModal] = useState<string>('');
  const [modeloParaGenerar, setModeloParaGenerar] = useState<ModeloEscritoRepositorio | null>(null);
  const [copiadoExito, setCopiadoExito] = useState(false);

  if (!isOpen || !expediente) return null;

  const docsCausa = documentos.filter((d) => d.expediente_id === expediente.id || d.carpeta === expediente.id);
  const pruebasCausa = pruebas.filter((p) => p.expediente_id === expediente.id);
  const audienciasCausa = audiencias.filter((a) => a.expediente_id === expediente.id);

  // Models relevant to this expediente's fuero
  const modelosFuero = modelosRepositorio.filter(m => m.fuero === expediente.fuero);
  const modelosMostrados = modelosFuero.length > 0 ? modelosFuero : modelosRepositorio;
  
  // Selected model for steps checklist
  const modeloActualGuia = modelosRepositorio.find(m => m.id === modeloSeleccionadoId) || modelosMostrados[0];
  
  // Progress for current expediente and model
  const progresoActual = progresosPasos.find(
    p => p.expediente_id === expediente.id && p.modelo_id === (modeloActualGuia?.id || '')
  );
  const pasosCompletados = progresoActual?.pasosCompletadosIds || [];

  const handleInterpolarEscrito = (modelo: ModeloEscritoRepositorio) => {
    let txt = modelo.contenidoPlantilla;
    txt = txt
      .replace(/{NUMERO_EXPTE}/g, expediente.numero)
      .replace(/{CARATULA}/g, expediente.caratula)
      .replace(/{JUZGADO}/g, expediente.juzgado)
      .replace(/{CLIENTE}/g, expediente.cliente)
      .replace(/{LETRADO_PATROCINANTE}/g, expediente.letrado_patrocinante)
      .replace(/{CIRCUNSCRIPCION}/g, expediente.circunscripcion)
      .replace(/{DEMANDADO}/g, expediente.partes.find(p => p.rol === 'Demandado/a')?.nombre || 'LA DEMANDADA')
      .replace(/{ACTOR}/g, expediente.partes.find(p => p.rol === 'Actor/a')?.nombre || expediente.cliente);
    
    setModeloParaGenerar(modelo);
    setTextoGeneradoModal(txt);
  };

  const handleCopiarTexto = (txt: string) => {
    navigator.clipboard.writeText(txt);
    setCopiadoExito(true);
    setTimeout(() => setCopiadoExito(false), 2000);
  };

  const handleConfirmarGuardarDoc = () => {
    if (!modeloParaGenerar || !onGuardarDocumentoExpediente) return;
    const nuevoDoc: DocumentoEstudio = {
      id: `DOC-${Date.now()}`,
      nombre: `${modeloParaGenerar.titulo} - Expte ${expediente.numero}`,
      expediente_id: expediente.id,
      carpeta: expediente.id,
      tipoArchivo: 'docx',
      tamanio: '32 KB',
      fecha_modificacion: new Date().toISOString().split('T')[0],
      autor: expediente.letrado_patrocinante,
      contenidoTexto: textoGeneradoModal,
    };

    onGuardarDocumentoExpediente(expediente.id, nuevoDoc);
    setModeloParaGenerar(null);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-4xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold text-blue-400 bg-blue-600/20 border border-blue-500/30 px-2.5 py-0.5 rounded">
                EXPTE N° {expediente.numero}
              </span>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                {expediente.circunscripcion}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-blue-900/40 text-blue-300 border border-blue-700/50">
                {expediente.fuero}
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-100 mt-1 line-clamp-1">
              {expediente.caratula}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tab Header Navigation */}
        <div className="bg-slate-950/80 px-6 border-b border-slate-800 flex space-x-6 text-xs font-mono shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('resumen')}
            className={`py-3 font-semibold transition-colors border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'resumen'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Resumen y Etapa</span>
          </button>
          <button
            onClick={() => setActiveTab('partes')}
            className={`py-3 font-semibold transition-colors border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'partes'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Partes Intervinientes ({expediente.partes.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('movimientos')}
            className={`py-3 font-semibold transition-colors border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'movimientos'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Historial SIGED ({expediente.movimientos.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('financiero')}
            className={`py-3 font-semibold transition-colors border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'financiero'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Estado Financiero</span>
          </button>
          <button
            onClick={() => setActiveTab('documentos')}
            className={`py-3 font-semibold transition-colors border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'documentos'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Paperclip className="w-4 h-4" />
            <span>Documentos ({docsCausa.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('guias')}
            className={`py-3 font-semibold transition-colors border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'guias'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>Guía y Escritos del Repositorio</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'resumen' && (
            <div className="space-y-6">
              {/* Top Banner Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-slate-500 block">Etapa Procesal Actual</span>
                  <div className="text-sm font-bold text-blue-400 flex items-center space-x-2">
                    <Scale className="w-4 h-4 text-blue-500" />
                    <span>{expediente.etapa_procesal}</span>
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-slate-500 block">Cliente Principal</span>
                  <div className="text-sm font-bold text-slate-200">
                    {expediente.cliente}
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-slate-500 block">Estado Actual</span>
                  <div className="text-sm font-bold text-amber-400">
                    {expediente.estado}
                  </div>
                </div>
              </div>

              {/* General Info Grid */}
              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 pb-2 border-b border-slate-800">
                  Ficha Técnica de Radicación Judicial
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">Juzgado de Radicación:</span>
                    <strong className="text-slate-200">{expediente.juzgado}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">Circunscripción Judicial:</span>
                    <strong className="text-slate-200">{expediente.circunscripcion}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">Fecha de Inicio de Causa:</span>
                    <strong className="text-slate-200">{expediente.fecha_inicio}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">Letrado Patrocinante:</span>
                    <strong className="text-blue-400">{expediente.letrado_patrocinante}</strong>
                  </div>
                  {expediente.apoderado && (
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase">Apoderado Legal:</span>
                      <strong className="text-amber-400">{expediente.apoderado}</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Related Pruebas & Audiencias Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                    Pruebas Ofrecidas ({pruebasCausa.length})
                  </span>
                  {pruebasCausa.length === 0 ? (
                    <p className="text-xs text-slate-500">Sin pruebas registradas.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {pruebasCausa.map((p) => (
                        <div key={p.id} className="text-xs bg-slate-900 p-2 rounded border border-slate-800 flex items-center justify-between">
                          <span className="text-slate-300 truncate max-w-[200px]">{p.tipo}: {p.descripcion}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${
                            p.semaforo === 'rojo' ? 'bg-red-950 text-red-400 border border-red-800' :
                            p.semaforo === 'amarillo' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                            'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          }`}>
                            {p.estado}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                    Audiencias Programadas ({audienciasCausa.length})
                  </span>
                  {audienciasCausa.length === 0 ? (
                    <p className="text-xs text-slate-500">Sin audiencias vigentes.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {audienciasCausa.map((a) => (
                        <div key={a.id} className="text-xs bg-slate-900 p-2 rounded border border-slate-800 space-y-1">
                          <div className="flex items-center justify-between font-mono text-blue-400">
                            <span>{a.tipo}</span>
                            <span className="text-slate-400">{a.fecha_hora}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 italic">{a.juzgado_sala}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'partes' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 pb-2 border-b border-slate-800">
                Nómina de Partes Intervinientes en la Causa
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {expediente.partes.map((p) => (
                  <div key={p.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-100">{p.nombre}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-600/20 text-blue-400 border border-blue-500/30 font-bold uppercase">
                        {p.rol}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 space-y-1 font-mono">
                      {p.dni_cuit && <div><span className="text-slate-500">DNI/CUIT:</span> {p.dni_cuit}</div>}
                      {p.domicilio_constituido && <div><span className="text-slate-500">Dom. Constituido:</span> {p.domicilio_constituido}</div>}
                      {p.letrado_patrocinante && <div><span className="text-slate-500">Patrocinante:</span> <span className="text-slate-200">{p.letrado_patrocinante}</span></div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'movimientos' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 pb-2 border-b border-slate-800">
                Historial de Actuaciones y Notificaciones SIGED Misiones
              </h3>

              <div className="space-y-3">
                {expediente.movimientos.map((m) => (
                  <div key={m.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-bold text-blue-400">{m.tipo}</span>
                      <span className="text-slate-500">{m.fecha}</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{m.descripcion}</p>
                    <div className="text-[11px] text-slate-500 font-mono pt-2 border-t border-slate-900 flex items-center justify-between">
                      <span>Firmante: {m.firmante}</span>
                      <span className="text-emerald-400 flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Firma Digital SIGED OK</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'financiero' && (
            <div className="space-y-6">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 pb-2 border-b border-slate-800">
                Estado Financiero, Tasas de Justicia y Caja Forense Misiones
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-slate-500 block">Honorarios Pactados / Regulados</span>
                  <div className="text-lg font-bold text-slate-100 font-mono">
                    $ {expediente.financiero.honorariosPactados.toLocaleString('es-AR')}
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono block">
                    Cobrado: $ {expediente.financiero.honorariosCobrados.toLocaleString('es-AR')}
                  </span>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-slate-500 block">Tasa de Justicia Misiones (1.5%)</span>
                  <div className="text-lg font-bold text-blue-400 font-mono">
                    $ {expediente.financiero.tasaDeJusticiaMisiones.toLocaleString('es-AR')}
                  </div>
                  <span className={`text-[10px] font-bold font-mono ${expediente.financiero.tasaJusticiaPagada ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {expediente.financiero.tasaJusticiaPagada ? '✓ TASA PAGADA EN DGR MISIONES' : '⚠️ PENDIENTE DE PAGO EN DGR'}
                  </span>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-slate-500 block">Saldo Pendiente Cliente</span>
                  <div className="text-lg font-bold text-amber-400 font-mono">
                    $ {expediente.financiero.saldoPendiente.toLocaleString('es-AR')}
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono block">Honorarios + Gastos</span>
                </div>
              </div>

              {/* Aportes breakdown */}
              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3 font-mono text-xs">
                <span className="font-bold text-slate-300 uppercase tracking-wider block border-b border-slate-800 pb-2">
                  Desglose Previsional y Contributivo Misiones (Ley N° 3144 / Caja Forense)
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Aportes Caja Forense Misiones:</span>
                    <span className="text-slate-200">$ {expediente.financiero.aportesCajaForense.toLocaleString('es-AR')}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Aportes Colegio de Abogados (CADAM):</span>
                    <span className="text-slate-200">$ {expediente.financiero.aportesCajaAbogados.toLocaleString('es-AR')}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Gastos de Diligenciamiento / Cédulas:</span>
                    <span className="text-slate-200">$ {expediente.financiero.gastosDiligenciamiento.toLocaleString('es-AR')}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'documentos' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 pb-2 border-b border-slate-800">
                Documentos y Escritos del Expediente
              </h3>

              {docsCausa.length === 0 ? (
                <div className="p-8 text-center text-slate-500 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                  No hay archivos ni cédulas adjuntas para esta causa.
                </div>
              ) : (
                <div className="space-y-2">
                  {docsCausa.map((doc) => (
                    <div key={doc.id} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-3">
                        <Paperclip className="w-4 h-4 text-blue-400" />
                        <div>
                          <strong className="text-slate-200 block">{doc.nombre}</strong>
                          <span className="text-[11px] font-mono text-slate-500">
                            {doc.tamanio} • Modificado: {doc.fecha_modificacion} por {doc.autor}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 uppercase">
                        {doc.tipoArchivo}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'guias' && (
            <div className="space-y-6">
              {/* Header and selector */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono text-blue-400 uppercase tracking-widest block font-bold">
                      Repositorio de Escritos Recomendados
                    </span>
                    <h3 className="text-sm font-bold text-slate-100">
                      Guía Procesal para Fuero {expediente.fuero}
                    </h3>
                  </div>

                  {modelosRepositorio.length > 0 && (
                    <select
                      value={modeloActualGuia?.id || ''}
                      onChange={(e) => setModeloSeleccionadoId(e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono font-bold focus:outline-none focus:border-blue-500"
                    >
                      {modelosRepositorio.map((m) => (
                        <option key={m.id} value={m.id}>
                          [{m.fuero}] {m.titulo}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {modeloActualGuia && (
                  <p className="text-xs text-slate-400 leading-relaxed pt-2 border-t border-slate-900">
                    {modeloActualGuia.descripcion}
                  </p>
                )}
              </div>

              {/* Progress bar */}
              {modeloActualGuia && (
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-300 font-bold flex items-center space-x-2">
                      <CheckSquare className="w-4 h-4 text-emerald-400" />
                      <span>Avance de Pasos Procesales ({pasosCompletados.length} / {modeloActualGuia.pasosASeguir.length})</span>
                    </span>
                    <span className="text-blue-400 font-bold">
                      {Math.round((pasosCompletados.length / (modeloActualGuia.pasosASeguir.length || 1)) * 100)}% Completado
                    </span>
                  </div>

                  <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                    <div 
                      className="bg-emerald-500 h-full transition-all duration-300" 
                      style={{ width: `${(pasosCompletados.length / (modeloActualGuia.pasosASeguir.length || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Steps Checklist */}
              {modeloActualGuia && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">
                    Secuencia de Pasos para este Expediente:
                  </h4>

                  <div className="space-y-2">
                    {modeloActualGuia.pasosASeguir.map((paso) => {
                      const isCompletado = pasosCompletados.includes(paso.id);
                      return (
                        <div 
                          key={paso.id}
                          className={`p-4 rounded-xl border transition-all flex items-start space-x-3.5 ${
                            isCompletado 
                              ? 'bg-slate-950/60 border-emerald-900/60 opacity-80' 
                              : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isCompletado}
                            onChange={() => {
                              if (onTogglePasoCompletado && modeloActualGuia) {
                                onTogglePasoCompletado(expediente.id, modeloActualGuia.id, paso.id);
                              }
                            }}
                            className="mt-1 w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />

                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className={`text-xs font-bold ${isCompletado ? 'line-through text-slate-400' : 'text-slate-100'}`}>
                                Paso {paso.orden}: {paso.titulo}
                              </span>
                              {paso.diasEstimados && (
                                <span className="text-[10px] font-mono text-amber-400 bg-amber-950/60 border border-amber-800 px-2 py-0.5 rounded">
                                  ~ {paso.diasEstimados} días
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed">{paso.descripcion}</p>

                            <div className="pt-2 flex items-center justify-between">
                              <span className="text-[10px] font-mono text-slate-500">
                                {paso.obligatorio ? '• Requisito Procesal' : '• Opcional'}
                              </span>

                              <button
                                onClick={() => handleInterpolarEscrito(modeloActualGuia)}
                                className="px-2.5 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/40 rounded text-[11px] font-mono font-bold transition-colors flex items-center space-x-1"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                <span>Generar Escrito del Repositorio</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Interpolar Escrito para este Expediente */}
        {modeloParaGenerar && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden p-6 space-y-4 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-mono text-blue-400 uppercase block font-bold">
                    Escrito Interpolado con Datos del Expte N° {expediente.numero}
                  </span>
                  <h3 className="text-sm font-bold text-slate-100">{modeloParaGenerar.titulo}</h3>
                </div>
                <button onClick={() => setModeloParaGenerar(null)} className="text-slate-400 hover:text-white">
                  ✕
                </button>
              </div>

              <textarea
                value={textoGeneradoModal}
                onChange={(e) => setTextoGeneradoModal(e.target.value)}
                rows={10}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500 leading-relaxed"
              />

              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs font-mono">
                <button
                  onClick={() => handleCopiarTexto(textoGeneradoModal)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-bold transition-colors flex items-center space-x-1"
                >
                  <Copy className="w-3.5 h-3.5 text-blue-400" />
                  <span>{copiadoExito ? '¡Copiado!' : 'Copiar Texto'}</span>
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleConfirmarGuardarDoc}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold transition-colors flex items-center space-x-1"
                  >
                    <Folder className="w-3.5 h-3.5" />
                    <span>Guardar en Documentos del Expte</span>
                  </button>

                  {onAbrirEditorConTexto && (
                    <button
                      onClick={() => {
                        const txt = textoGeneradoModal;
                        const tit = modeloParaGenerar.titulo;
                        setModeloParaGenerar(null);
                        onClose();
                        onAbrirEditorConTexto(txt, tit, expediente);
                      }}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold transition-colors flex items-center space-x-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Abrir en Gestor .docx</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono shrink-0">
          <span className="text-slate-400">Poder Judicial de Misiones • Sistema SIGED</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-bold transition-colors"
          >
            Cerrar Ficha
          </button>
        </div>
      </div>
    </div>
  );
};
