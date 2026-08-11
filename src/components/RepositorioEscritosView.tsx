import React, { useState } from 'react';
import { 
  BookOpen, Plus, Search, Filter, FileText, CheckCircle2, Clock, ChevronRight, 
  Copy, Download, Edit3, Sparkles, Folder, ArrowRight, Tag, ShieldCheck, CheckSquare, Eye, X, Send, Award
} from 'lucide-react';
import { ModeloEscritoRepositorio, PasoProcesalGuia, Expediente, Abogado, DocumentoEstudio } from '../types';

interface RepositorioEscritosViewProps {
  modelos: ModeloEscritoRepositorio[];
  expedientes: Expediente[];
  abogadoActual: Abogado;
  onCrearModelo: (nuevo: ModeloEscritoRepositorio) => void;
  onUsarModeloEnExpediente: (modelo: ModeloEscritoRepositorio, exp: Expediente, textoInterpolado: string) => void;
  onAbrirEditorConTexto?: (texto: string, titulo: string, exp: Expediente) => void;
}

export const RepositorioEscritosView: React.FC<RepositorioEscritosViewProps> = ({
  modelos,
  expedientes,
  abogadoActual,
  onCrearModelo,
  onUsarModeloEnExpediente,
  onAbrirEditorConTexto,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [fueroFiltro, setFueroFiltro] = useState<string>('todos');
  const [tematicaFiltro, setTematicaFiltro] = useState<string>('todas');
  
  // Selected Model for Detail Modal
  const [modeloDetalle, setModeloDetalle] = useState<ModeloEscritoRepositorio | null>(null);
  const [activeTabDetalle, setActiveTabDetalle] = useState<'pasos' | 'plantilla'>('pasos');

  // "Usar en Expediente" Modal
  const [modeloParaExpediente, setModeloParaExpediente] = useState<ModeloEscritoRepositorio | null>(null);
  const [expedienteSeleccionadoId, setExpedienteSeleccionadoId] = useState<string>(expedientes[0]?.id || '');
  const [textoInterpoladoPreview, setTextoInterpoladoPreview] = useState<string>('');
  const [copiadoExito, setCopiadoExito] = useState(false);

  // Modal para Cargar Nuevo Modelo
  const [isCreandoModelo, setIsCreandoModelo] = useState(false);
  const [nuevoTitulo, setNuevoTitulo] = useState('');
  const [nuevoFuero, setNuevoFuero] = useState('Civil y Comercial');
  const [nuevaTematica, setNuevaTematica] = useState('Daños y Perjuicios');
  const [nuevoTipoExpte, setNuevoTipoExpte] = useState('Juicio Ordinario');
  const [nuevaEtapa, setNuevaEtapa] = useState('Iniciación / Demanda');
  const [nuevaDescripcion, setNuevaDescripcion] = useState('');
  const [nuevoContenidoPlantilla, setNuevoContenidoPlantilla] = useState('');
  const [pasosDraft, setPasosDraft] = useState<{ titulo: string; descripcion: string; diasEstimados: number }[]>([
    { titulo: 'Interposición de Escrito Inicial y Pago de Tasas', descripcion: 'Presentación en portal SIGED con adjuntos de ley.', diasEstimados: 3 },
    { titulo: 'Notificación Digital por Cédula SIGED', descripcion: 'Traslado a la contraparte por el término de ley.', diasEstimados: 15 }
  ]);

  // Extract unique temática options
  const tematicasDisponibles = Array.from(new Set(modelos.map(m => m.tematica)));

  // Filtering models
  const modelosFiltrados = modelos.filter((m) => {
    const matchesSearch = 
      m.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.tematica.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.etiquetas && m.etiquetas.some(t => t.toLowerCase().includes(searchTerm.toLowerCase())));
    
    const matchesFuero = fueroFiltro === 'todos' || m.fuero === fueroFiltro;
    const matchesTematica = tematicaFiltro === 'todas' || m.tematica === tematicaFiltro;

    return matchesSearch && matchesFuero && matchesTematica;
  });

  // Helper to interpolate placeholders for selected expediente
  const interpolarTexto = (modelo: ModeloEscritoRepositorio, exp: Expediente): string => {
    let txt = modelo.contenidoPlantilla;
    const actorParte = exp.partes.find(p => p.rol === 'Actor/a');
    const cuilTitular = exp.cuilTitularAnses || actorParte?.dni_cuit || '20-12345678-9';
    const numAnses = exp.numeroExpedienteAnses || exp.numero;

    txt = txt
      .replace(/{NUMERO_EXPTE}/g, exp.numero)
      .replace(/{NUMERO_EXPTE_ANSES}/g, numAnses)
      .replace(/{CUIL_TITULAR}/g, cuilTitular)
      .replace(/{MATRICULA}/g, abogadoActual.matricula || 'F° 102 C.P.A.M.')
      .replace(/{CARATULA}/g, exp.caratula)
      .replace(/{JUZGADO}/g, exp.juzgado)
      .replace(/{CLIENTE}/g, exp.cliente)
      .replace(/{LETRADO_PATROCINANTE}/g, exp.letrado_patrocinante || abogadoActual.nombre)
      .replace(/{CIRCUNSCRIPCION}/g, exp.circunscripcion)
      .replace(/{DEMANDADO}/g, exp.partes.find(p => p.rol === 'Demandado/a')?.nombre || 'LA DEMANDADA')
      .replace(/{ACTOR}/g, actorParte?.nombre || exp.cliente);
    return txt;
  };

  const handlePrepararUsarEnExpediente = (modelo: ModeloEscritoRepositorio) => {
    setModeloParaExpediente(modelo);
    const expBase = expedientes.find(e => e.id === expedienteSeleccionadoId) || expedientes[0];
    if (expBase) {
      setExpedienteSeleccionadoId(expBase.id);
      setTextoInterpoladoPreview(interpolarTexto(modelo, expBase));
    }
  };

  const handleCambiarExpedienteSeleccionado = (expId: string) => {
    setExpedienteSeleccionadoId(expId);
    const exp = expedientes.find(e => e.id === expId);
    if (exp && modeloParaExpediente) {
      setTextoInterpoladoPreview(interpolarTexto(modeloParaExpediente, exp));
    }
  };

  const handleCopiarTexto = (texto: string) => {
    navigator.clipboard.writeText(texto);
    setCopiadoExito(true);
    setTimeout(() => setCopiadoExito(false), 2000);
  };

  const handleConfirmarGuardarEnExpediente = () => {
    if (!modeloParaExpediente) return;
    const exp = expedientes.find(e => e.id === expedienteSeleccionadoId);
    if (!exp) return;

    onUsarModeloEnExpediente(modeloParaExpediente, exp, textoInterpoladoPreview);
    setModeloParaExpediente(null);
  };

  const handleConfirmarAbrirEditor = () => {
    if (!modeloParaExpediente) return;
    const exp = expedientes.find(e => e.id === expedienteSeleccionadoId);
    if (!exp) return;

    if (onAbrirEditorConTexto) {
      onAbrirEditorConTexto(textoInterpoladoPreview, modeloParaExpediente.titulo, exp);
    }
    setModeloParaExpediente(null);
  };

  // Add new step in form
  const handleAgregarPasoDraft = () => {
    setPasosDraft([
      ...pasosDraft,
      { titulo: `Paso ${pasosDraft.length + 1}`, descripcion: 'Descripción del paso procesal', diasEstimados: 5 }
    ]);
  };

  const handleGuardarNuevoModelo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoTitulo || !nuevoContenidoPlantilla) return;

    const pasosConstruidos: PasoProcesalGuia[] = pasosDraft.map((p, idx) => ({
      id: `PASO-${Date.now()}-${idx + 1}`,
      orden: idx + 1,
      titulo: p.titulo,
      descripcion: p.descripcion,
      diasEstimados: p.diasEstimados,
      obligatorio: true,
    }));

    const nuevoModelo: ModeloEscritoRepositorio = {
      id: `REP-${Date.now().toString().slice(-4)}`,
      titulo: nuevoTitulo,
      fuero: nuevoFuero,
      tematica: nuevaTematica,
      tipoExpediente: nuevoTipoExpte,
      etapaProcesal: nuevaEtapa as any,
      descripcion: nuevaDescripcion || 'Modelo institucional de escrito judicial cargado por el estudio.',
      contenidoPlantilla: nuevoContenidoPlantilla,
      pasosASeguir: pasosConstruidos,
      autor: abogadoActual.nombre,
      fechaCreacion: new Date().toISOString().split('T')[0],
      etiquetas: [nuevoFuero.split(' ')[0], nuevaTematica.split(' ')[0]],
    };

    onCrearModelo(nuevoModelo);
    setIsCreandoModelo(false);
    
    // Reset form
    setNuevoTitulo('');
    setNuevaDescripcion('');
    setNuevoContenidoPlantilla('');
  };

  return (
    <div className="space-y-6">
      {/* View Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-blue-600/10 to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="p-2 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-xl">
                <BookOpen className="w-5 h-5" />
              </span>
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-blue-400">
                Librería & Hoja de Ruta Procesal
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-100 tracking-tight">
              Repositorio de Escritos y Pasos por Fuero
            </h1>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              Cargue y consulte modelos oficiales de escritos, plantillas con variables automatizadas y la secuencia normalizada de pasos a seguir para expedientes del fuero Misionero.
            </p>
          </div>

          <button
            onClick={() => setIsCreandoModelo(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center space-x-2 shadow-lg shadow-blue-900/30 shrink-0 self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Cargar Nuevo Modelo y Pasos</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar por título, temática, etiqueta o palabra clave..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center space-x-2 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg text-xs">
            <Filter className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-slate-400 text-[11px] uppercase">Fuero:</span>
            <select
              value={fueroFiltro}
              onChange={(e) => setFueroFiltro(e.target.value)}
              className="bg-transparent text-slate-200 font-bold focus:outline-none text-xs cursor-pointer"
            >
              <option value="todos" className="bg-slate-900">Todos los Fueros</option>
              <option value="Civil y Comercial" className="bg-slate-900">Civil y Comercial</option>
              <option value="Laboral" className="bg-slate-900">Laboral</option>
              <option value="Familia" className="bg-slate-900">Familia</option>
              <option value="Caducidades y Concursos" className="bg-slate-900">Caducidades y Concursos</option>
              <option value="ANSES / Previsional" className="bg-slate-900">ANSES / Previsional</option>
              <option value="Justicia Federal" className="bg-slate-900">Justicia Federal</option>
            </select>
          </div>

          <div className="flex items-center space-x-2 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg text-xs">
            <Tag className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400 text-[11px] uppercase">Temática:</span>
            <select
              value={tematicaFiltro}
              onChange={(e) => setTematicaFiltro(e.target.value)}
              className="bg-transparent text-slate-200 font-bold focus:outline-none text-xs cursor-pointer"
            >
              <option value="todas" className="bg-slate-900">Todas las Temáticas</option>
              {tematicasDisponibles.map((tem) => (
                <option key={tem} value={tem} className="bg-slate-900">{tem}</option>
              ))}
            </select>
          </div>

          <div className="text-xs font-mono text-slate-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            Modelos: <strong className="text-blue-400">{modelosFiltrados.length}</strong>
          </div>
        </div>
      </div>

      {/* Models Grid */}
      {modelosFiltrados.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
          <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-300">No se encontraron modelos de escritos</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Intente ajustar los filtros de Fuero/Temática o busque con otra palabra clave. También puede cargar un nuevo modelo institucional.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {modelosFiltrados.map((modelo) => (
            <div 
              key={modelo.id}
              className="bg-slate-900 border border-slate-800 hover:border-blue-500/50 rounded-2xl p-5 shadow-lg flex flex-col justify-between space-y-4 transition-all hover:shadow-blue-950/20 group"
            >
              <div className="space-y-3">
                {/* Header tags */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-md bg-blue-950 text-blue-300 border border-blue-800 uppercase">
                    {modelo.fuero}
                  </span>
                  <span className="text-[10px] font-mono font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
                    {modelo.tematica}
                  </span>
                </div>

                {/* Title and Description */}
                <div>
                  <h3 className="text-sm font-bold text-slate-100 group-hover:text-blue-400 transition-colors line-clamp-2">
                    {modelo.titulo}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {modelo.descripcion}
                  </p>
                </div>

                {/* Steps count & stage badge */}
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400 flex items-center space-x-1.5">
                      <CheckSquare className="w-3.5 h-3.5 text-amber-400" />
                      <span>Pasos Procesales Guía:</span>
                    </span>
                    <strong className="text-slate-200 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                      {modelo.pasosASeguir.length} pasos
                    </strong>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span>Etapa:</span>
                    <span className="text-slate-300 font-semibold">{modelo.etapaProcesal}</span>
                  </div>
                </div>

                {/* Tags */}
                {modelo.etiquetas && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {modelo.etiquetas.map((t) => (
                      <span key={t} className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Footer */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center gap-2">
                <button
                  onClick={() => {
                    setModeloDetalle(modelo);
                    setActiveTabDetalle('pasos');
                  }}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center justify-center space-x-1.5"
                >
                  <Eye className="w-3.5 h-3.5 text-blue-400" />
                  <span>Ver Guía y Escrito</span>
                </button>

                <button
                  onClick={() => handlePrepararUsarEnExpediente(modelo)}
                  className="py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center space-x-1 shadow-md shrink-0"
                  title="Seleccionar para usar en un Expediente del Estudio"
                >
                  <span>Usar</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal: Ver Modelo y Pasos */}
      {modeloDetalle && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-900 text-blue-300 border border-blue-700 uppercase">
                    {modeloDetalle.fuero}
                  </span>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                    {modeloDetalle.tematica}
                  </span>
                </div>
                <h2 className="text-base font-bold text-slate-100">{modeloDetalle.titulo}</h2>
              </div>

              <button
                onClick={() => setModeloDetalle(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs Header */}
            <div className="bg-slate-950/80 px-6 border-b border-slate-800 flex space-x-6 text-xs font-mono shrink-0">
              <button
                onClick={() => setActiveTabDetalle('pasos')}
                className={`py-3 font-semibold transition-colors border-b-2 flex items-center space-x-2 ${
                  activeTabDetalle === 'pasos'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <CheckSquare className="w-4 h-4 text-amber-400" />
                <span>Pasos Procesales a Seguir ({modeloDetalle.pasosASeguir.length})</span>
              </button>

              <button
                onClick={() => setActiveTabDetalle('plantilla')}
                className={`py-3 font-semibold transition-colors border-b-2 flex items-center space-x-2 ${
                  activeTabDetalle === 'plantilla'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText className="w-4 h-4 text-blue-400" />
                <span>Texto del Escrito / Plantilla</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {activeTabDetalle === 'pasos' ? (
                <div className="space-y-4">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1">
                    <strong className="text-blue-400 block font-mono">Guía de Secuencia Procesal:</strong>
                    <p className="leading-relaxed text-slate-400">
                      Siga los pasos parametrizados para la tramitación de causas de {modeloDetalle.tematica} en {modeloDetalle.fuero}.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {modeloDetalle.pasosASeguir.map((paso, idx) => (
                      <div 
                        key={paso.id}
                        className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-start space-x-4"
                      >
                        <div className="w-8 h-8 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/40 flex items-center justify-center font-bold text-xs font-mono shrink-0">
                          {paso.orden || idx + 1}
                        </div>

                        <div className="space-y-1 flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-slate-100">{paso.titulo}</h4>
                            {paso.diasEstimados && (
                              <span className="text-[10px] font-mono text-amber-400 bg-amber-950/60 border border-amber-800 px-2 py-0.5 rounded">
                                ~ {paso.diasEstimados} días hábiles
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed">{paso.descripcion}</p>

                          {paso.escritoRecomendadoNombre && (
                            <div className="pt-2 text-[11px] font-mono text-blue-400 flex items-center space-x-1">
                              <FileText className="w-3.5 h-3.5" />
                              <span>Escrito vinculado: {paso.escritoRecomendadoNombre}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-400">
                      Plantilla con variables automáticas: <code className="text-amber-400 font-bold">{'{NUMERO_EXPTE}'}</code>, <code className="text-amber-400 font-bold">{'{CARATULA}'}</code>, <code className="text-amber-400 font-bold">{'{JUZGADO}'}</code>
                    </span>

                    <button
                      onClick={() => handleCopiarTexto(modeloDetalle.contenidoPlantilla)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-mono transition-colors flex items-center space-x-1.5"
                    >
                      <Copy className="w-3.5 h-3.5 text-blue-400" />
                      <span>{copiadoExito ? '¡Copiado!' : 'Copiar Plantilla'}</span>
                    </button>
                  </div>

                  <pre className="bg-slate-950 p-5 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap max-h-[450px] overflow-y-auto">
                    {modeloDetalle.contenidoPlantilla}
                  </pre>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono shrink-0">
              <span className="text-slate-500">Autor: {modeloDetalle.autor}</span>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setModeloDetalle(null)}
                  className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-bold transition-colors"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => {
                    const m = modeloDetalle;
                    setModeloDetalle(null);
                    handlePrepararUsarEnExpediente(m);
                  }}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold transition-colors flex items-center space-x-1.5"
                >
                  <span>Usar en Expediente</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Usar Modelo en Expediente */}
      {modeloParaExpediente && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 space-y-6 p-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono text-blue-400 uppercase tracking-widest block font-bold">
                  Generación de Escrito para Causa
                </span>
                <h3 className="text-base font-bold text-slate-100">{modeloParaExpediente.titulo}</h3>
              </div>
              <button
                onClick={() => setModeloParaExpediente(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Selector de Expediente */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block font-mono">
                Seleccione el Expediente del Estudio:
              </label>
              <select
                value={expedienteSeleccionadoId}
                onChange={(e) => handleCambiarExpedienteSeleccionado(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 font-mono font-bold focus:outline-none focus:border-blue-500"
              >
                {expedientes.map((exp) => (
                  <option key={exp.id} value={exp.id}>
                    Expte N° {exp.numero} - {exp.caratula} ({exp.fuero})
                  </option>
                ))}
              </select>
            </div>

            {/* Interpolated Preview */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 font-mono">
                  Vista Previa del Escrito Interpolado:
                </span>
                <button
                  onClick={() => handleCopiarTexto(textoInterpoladoPreview)}
                  className="text-xs text-blue-400 hover:underline font-mono flex items-center space-x-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiadoExito ? '¡Copiado!' : 'Copiar Texto'}</span>
                </button>
              </div>

              <textarea
                value={textoInterpoladoPreview}
                onChange={(e) => setTextoInterpoladoPreview(e.target.value)}
                rows={12}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500 leading-relaxed"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2 border-t border-slate-800 font-mono text-xs">
              <button
                onClick={() => setModeloParaExpediente(null)}
                className="w-full sm:w-auto px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition-colors"
              >
                Cancelar
              </button>

              <button
                onClick={handleConfirmarGuardarEnExpediente}
                className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-colors flex items-center justify-center space-x-2"
              >
                <Folder className="w-4 h-4" />
                <span>Guardar en Documentos del Expediente</span>
              </button>

              {onAbrirEditorConTexto && (
                <button
                  onClick={handleConfirmarAbrirEditor}
                  className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-colors flex items-center justify-center space-x-2 shadow-lg shadow-blue-900/30"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Abrir y Editar en Gestor .docx</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Cargar Nuevo Modelo / Guía Procesal */}
      {isCreandoModelo && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <form 
            onSubmit={handleGuardarNuevoModelo}
            className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-6 space-y-5"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <span className="p-2 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-lg">
                  <BookOpen className="w-4 h-4" />
                </span>
                <h3 className="text-base font-bold text-slate-100">Cargar Nuevo Modelo e Instructivo Procesal</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreandoModelo(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="space-y-1 md:col-span-2">
                <label className="text-slate-300 font-bold">Título del Modelo / Escrito *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Demanda por Incumplimiento Contractual Misiones"
                  value={nuevoTitulo}
                  onChange={(e) => setNuevoTitulo(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Fuero Judicial *</label>
                <select
                  value={nuevoFuero}
                  onChange={(e) => setNuevoFuero(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="Civil y Comercial">Civil y Comercial</option>
                  <option value="Laboral">Laboral</option>
                  <option value="Familia">Familia</option>
                  <option value="Caducidades y Concursos">Caducidades y Concursos</option>
                  <option value="ANSES / Previsional">ANSES / Previsional</option>
                  <option value="Justicia Federal">Justicia Federal</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Temática / Materia *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Daños y Perjuicios, Despido, Alimentos..."
                  value={nuevaTematica}
                  onChange={(e) => setNuevaTematica(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-slate-300 font-bold">Descripción del Caso / Indicaciones</label>
                <input
                  type="text"
                  placeholder="Breve reseña sobre cuándo aplica este escrito..."
                  value={nuevaDescripcion}
                  onChange={(e) => setNuevaDescripcion(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-slate-300 font-bold">Contenido de la Plantilla (con Variables) *</label>
                <textarea
                  required
                  rows={8}
                  placeholder={`SEÑOR JUEZ:\n\n{LETRADO_PATROCINANTE}, en representación de {CLIENTE}, en autos "{CARATULA}", Expte. N° {NUMERO_EXPTE}, ante el {JUZGADO}, digo:...`}
                  value={nuevoContenidoPlantilla}
                  onChange={(e) => setNuevoContenidoPlantilla(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-100 focus:outline-none focus:border-blue-500 leading-relaxed"
                />
              </div>
            </div>

            {/* Pasos a seguir draft builder */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-200 font-mono uppercase">
                  Hoja de Ruta: Pasos Procesales a Seguir ({pasosDraft.length})
                </h4>
                <button
                  type="button"
                  onClick={handleAgregarPasoDraft}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded text-xs font-mono font-bold flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Agregar Paso</span>
                </button>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {pasosDraft.map((paso, idx) => (
                  <div key={idx} className="bg-slate-950 p-3 rounded-lg border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono">
                    <input
                      type="text"
                      value={paso.titulo}
                      onChange={(e) => {
                        const next = [...pasosDraft];
                        next[idx].titulo = e.target.value;
                        setPasosDraft(next);
                      }}
                      placeholder="Título del Paso"
                      className="bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-200"
                    />
                    <input
                      type="text"
                      value={paso.descripcion}
                      onChange={(e) => {
                        const next = [...pasosDraft];
                        next[idx].descripcion = e.target.value;
                        setPasosDraft(next);
                      }}
                      placeholder="Descripción"
                      className="bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-200"
                    />
                    <div className="flex items-center space-x-1">
                      <input
                        type="number"
                        value={paso.diasEstimados}
                        onChange={(e) => {
                          const next = [...pasosDraft];
                          next[idx].diasEstimados = parseInt(e.target.value) || 0;
                          setPasosDraft(next);
                        }}
                        className="bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-200 w-16 text-center"
                      />
                      <span className="text-[10px] text-slate-500">días hábiles</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800 text-xs font-mono">
              <button
                type="button"
                onClick={() => setIsCreandoModelo(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-bold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold shadow-lg shadow-blue-900/30"
              >
                Guardar Modelo en Repositorio
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
