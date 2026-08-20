import React, { useState } from 'react';
import { Abogado, Expediente, ActuacionSIGED, DocumentoEstudio, PruebaExpediente, AudienciaExpediente, ModeloEscritoRepositorio, ProgresoPasosExpediente } from '../types';
import { FileText, Search, UserCheck, Scale, ExternalLink, Eye, Filter, PlusCircle, Users, CheckCircle2 } from 'lucide-react';
import { FichaExpedienteModal } from './FichaExpedienteModal';

interface ExpedientesViewProps {
  abogadoActual: Abogado;
  expedientes: Expediente[];
  abogados: Abogado[];
  actuaciones: ActuacionSIGED[];
  documentos: DocumentoEstudio[];
  pruebas: PruebaExpediente[];
  audiencias: AudienciaExpediente[];
  modelosRepositorio?: ModeloEscritoRepositorio[];
  progresosPasos?: ProgresoPasosExpediente[];
  onSeleccionarActuacionParaProcesar: (actuacion: ActuacionSIGED, expte: Expediente) => void;
  onCrearNuevoExpediente?: (exp: Expediente) => void;
  onAbrirAsociadosModal?: (expte?: Expediente) => void;
  onTogglePasoCompletado?: (expedienteId: string, modeloId: string, pasoId: string) => void;
  onGuardarDocumentoExpediente?: (expedienteId: string, doc: DocumentoEstudio) => void;
  onAbrirEditorConTexto?: (texto: string, titulo: string, exp: Expediente) => void;
  onActualizarExpediente?: (expedienteActualizado: Expediente) => void;
}

export const ExpedientesView: React.FC<ExpedientesViewProps> = ({
  abogadoActual,
  expedientes,
  abogados,
  actuaciones,
  documentos,
  pruebas,
  audiencias,
  modelosRepositorio = [],
  progresosPasos = [],
  onSeleccionarActuacionParaProcesar,
  onCrearNuevoExpediente,
  onAbrirAsociadosModal,
  onTogglePasoCompletado,
  onGuardarDocumentoExpediente,
  onAbrirEditorConTexto,
  onActualizarExpediente,
}) => {
  const [busqueda, setBusqueda] = useState('');
  const [filtroFuero, setFiltroFuero] = useState('todos');
  const [filtroCircunscripcion, setFiltroCircunscripcion] = useState('todos');
  const [filtroEtapa, setFiltroEtapa] = useState('todos');
  const [filtroResponsable, setFiltroResponsable] = useState('todos');

  // Modal drawer state for Ficha Completa
  const [expedienteSeleccionado, setExpedienteSeleccionado] = useState<Expediente | null>(null);

  // New Expediente Form Modal State
  const [isCreandoExpte, setIsCreandoExpte] = useState(false);
  const [nuevoNumero, setNuevoNumero] = useState('');
  const [nuevaCaratula, setNuevaCaratula] = useState('');
  const [nuevoJuzgado, setNuevoJuzgado] = useState('Juzgado Civil y Comercial N° 1 - Posadas');
  const [nuevoFuero, setNuevoFuero] = useState<any>('Civil y Comercial');
  const [nuevaCircunscripcion, setNuevaCircunscripcion] = useState<any>('Primera (Posadas)');
  const [nuevoCliente, setNuevoCliente] = useState('');

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

    if (filtroCircunscripcion !== 'todos' && exp.circunscripcion !== filtroCircunscripcion) {
      return false;
    }

    if (filtroEtapa !== 'todos' && exp.etapa_procesal !== filtroEtapa) {
      return false;
    }

    if (filtroResponsable !== 'todos' && !exp.abogados_autorizados.includes(filtroResponsable)) {
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

  const handleCrearSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoNumero || !nuevaCaratula || !nuevoCliente) return;

    let origenSistema: 'SIGED Misiones' | 'ANSES e-TRAMITE' | 'PJN - Justicia Federal' = 'SIGED Misiones';
    if (nuevoFuero === 'ANSES / Previsional') origenSistema = 'ANSES e-TRAMITE';
    if (nuevoFuero === 'Justicia Federal') origenSistema = 'PJN - Justicia Federal';

    const nuevoExp: Expediente = {
      id: `EXP-${Math.floor(Math.random() * 9000 + 1000)}`,
      numero: nuevoNumero,
      caratula: nuevaCaratula.toUpperCase(),
      juzgado: nuevoJuzgado,
      fuero: nuevoFuero,
      circunscripcion: nuevaCircunscripcion,
      etapa_procesal: 'Iniciación / Demanda',
      abogados_autorizados: [abogadoActual.id, 'ABG-001'],
      letrado_patrocinante: abogadoActual.id,
      fecha_inicio: new Date().toISOString().split('T')[0],
      estado: 'En trámite',
      cliente: nuevoCliente,
      sistemaOrigen: origenSistema,
      numeroExpedienteAnses: nuevoFuero === 'ANSES / Previsional' ? nuevoNumero : undefined,
      numeroExpedientePJN: nuevoFuero === 'Justicia Federal' ? nuevoNumero : undefined,
      partes: [
        { id: `P-${Date.now()}`, nombre: nuevoCliente, rol: 'Actor/a', letrado_patrocinante: abogadoActual.nombre },
      ],
      movimientos: [
        { id: `M-${Date.now()}`, fecha: new Date().toISOString().split('T')[0], tipo: 'Inicio de Actuaciones', descripcion: `Sorteo e ingreso de carátula en ${origenSistema}.`, firmante: abogadoActual.nombre },
      ],
      financiero: {
        honorariosPactados: 3000000,
        honorariosRegulados: 0,
        honorariosCobrados: 1000000,
        tasaDeJusticiaMisiones: 45000,
        tasaJusticiaPagada: false,
        aportesCajaForense: 10000,
        aportesCajaAbogados: 8000,
        gastosDiligenciamiento: 15000,
        saldoPendiente: 2000000,
      },
    };

    if (onCrearNuevoExpediente) {
      onCrearNuevoExpediente(nuevoExp);
    }
    setIsCreandoExpte(false);
    setNuevoNumero('');
    setNuevaCaratula('');
    setNuevoCliente('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-6 shadow-xl space-y-4">
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

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center space-x-2 bg-slate-950 px-3 py-2 rounded border border-slate-800 text-xs shrink-0">
              <span className="text-slate-400 font-mono text-[10px] uppercase tracking-wider">Causas Accesibles:</span>
              <span className="font-bold text-blue-400 font-mono text-sm">{expedientesFiltrados.length}</span>
            </div>

            {onAbrirAsociadosModal && (
              <button
                onClick={() => onAbrirAsociadosModal()}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/40 rounded text-xs font-bold uppercase tracking-wider transition-colors flex items-center space-x-1.5 shadow-md shrink-0"
              >
                <Users className="w-4 h-4 text-emerald-400" />
                <span>Asignar Asociados</span>
              </button>
            )}

            <button
              onClick={() => setIsCreandoExpte(true)}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold uppercase tracking-wider transition-colors flex items-center space-x-1.5 shadow-md shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Alta de Causa</span>
            </button>
          </div>
        </div>

        {/* Multi-criteria Advanced Filters */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-4 border-t border-slate-800">
          <div className="md:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por N° expte, carátula, cliente o juzgado..."
              className="w-full bg-slate-950 border border-slate-800 rounded pl-9 pr-3 py-2 text-xs text-slate-100 focus:ring-1 focus:ring-blue-500 font-mono"
            />
          </div>

          <div className="md:col-span-2">
            <select
              value={filtroFuero}
              onChange={(e) => setFiltroFuero(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-2 text-xs text-slate-200 focus:ring-1 focus:ring-blue-500 font-mono"
            >
              <option value="todos">Todos los Fueros / Sistemas</option>
              <option value="Civil y Comercial">Civil y Comercial</option>
              <option value="Laboral">Laboral</option>
              <option value="Familia">Familia</option>
              <option value="Caducidades y Concursos">Caducidades y Concursos</option>
              <option value="ANSES / Previsional">ANSES / Previsional</option>
              <option value="Justicia Federal">Justicia Federal (PJN)</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              value={filtroCircunscripcion}
              onChange={(e) => setFiltroCircunscripcion(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-2 text-xs text-slate-200 focus:ring-1 focus:ring-blue-500 font-mono"
            >
              <option value="todos">Todas las Jurisdicciones</option>
              <option value="Primera (Posadas)">1ra (Posadas)</option>
              <option value="Segunda (Oberá)">2da (Oberá)</option>
              <option value="Tercera (Eldorado)">3ra (Eldorado)</option>
              <option value="Cuarta (Puerto Rico)">4ta (Puerto Rico)</option>
              <option value="Quinta (San Vicente)">5ta (San Vicente)</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              value={filtroEtapa}
              onChange={(e) => setFiltroEtapa(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-2 text-xs text-slate-200 focus:ring-1 focus:ring-blue-500 font-mono"
            >
              <option value="todos">Todas las Etapas</option>
              <option value="Iniciación / Demanda">Iniciación</option>
              <option value="Traba de la Litis / Contestación">Contestación</option>
              <option value="Apertura a Prueba">Prueba</option>
              <option value="Alegatos">Alegatos</option>
              <option value="Autos para Sentencia">Sentencia</option>
              <option value="Ejecución de Sentencia">Ejecución</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              value={filtroResponsable}
              onChange={(e) => setFiltroResponsable(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-2 text-xs text-slate-200 focus:ring-1 focus:ring-blue-500 font-mono"
            >
              <option value="todos">Cualquier Letrado</option>
              {abogados.map((a) => (
                <option key={a.id} value={a.id}>{a.nombre.split(' ')[1]}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Expedientes Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {expedientesFiltrados.map((exp) => {
          const abgsAutorizados = abogados.filter((a) => exp.abogados_autorizados.includes(a.id));
          const actuacionExpte = actuaciones.find((act) => act.expediente_id === exp.id);

          return (
            <div
              key={exp.id}
              className="bg-slate-900 border border-slate-700/80 rounded-xl p-5 shadow-sm space-y-4 hover:border-slate-600 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header Badge & Number */}
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <span className="text-xs font-mono font-bold text-blue-400 bg-blue-600/20 border border-blue-500/30 px-2.5 py-0.5 rounded">
                        EXPTE N° {exp.numero}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-blue-900/40 text-blue-300 border border-blue-700/50">
                        {exp.fuero}
                      </span>
                      {exp.sistemaOrigen === 'ANSES e-TRAMITE' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-purple-950 text-purple-300 border border-purple-800">
                          ANSES e-TRAMITE
                        </span>
                      )}
                      {exp.sistemaOrigen === 'PJN - Justicia Federal' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-amber-950 text-amber-300 border border-amber-800">
                          PJN Federal
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">
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

                {/* Etapa Procesal Badge */}
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Etapa:</span>
                  <span className="text-[10px] font-mono font-bold text-slate-200 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    {exp.etapa_procesal}
                  </span>
                </div>

                {/* Juzgado */}
                <p className="text-xs text-slate-300 italic flex items-center space-x-1">
                  <span>🏛️ {exp.juzgado}</span>
                </p>

                {/* Cliente */}
                <div className="text-xs text-slate-400 pt-1 border-t border-slate-800/80 flex items-center justify-between">
                  <div>
                    <span className="font-mono text-[10px] uppercase text-slate-500">Cliente: </span>
                    <strong className="text-slate-200 font-semibold">{exp.cliente}</strong>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">
                    Inicio: {exp.fecha_inicio}
                  </span>
                </div>

                {/* Authorized Lawyers list */}
                <div className="bg-slate-950 p-2.5 rounded border border-slate-800 text-xs space-y-1">
                  <div className="text-[10px] uppercase font-mono text-slate-500 flex items-center justify-between">
                    <span>Abogados Autorizados:</span>
                    {onAbrirAsociadosModal && (
                      <button
                        onClick={() => onAbrirAsociadosModal(exp)}
                        className="text-[9px] text-emerald-400 hover:underline font-bold flex items-center space-x-1"
                      >
                        <Users className="w-3 h-3" />
                        <span>Editar Accesos</span>
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {abgsAutorizados.map((a) => (
                      <span
                        key={a.id}
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                          a.id === abogadoActual.id
                            ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40 font-bold'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {a.nombre.split(' ')[1] || a.nombre} ({a.rol})
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons: Ficha Completa + Finalizar Trámite + Procesar SIGED */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setExpedienteSeleccionado(exp)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold uppercase tracking-wider rounded transition-colors flex items-center space-x-1 border border-slate-700"
                  >
                    <Eye className="w-3.5 h-3.5 text-blue-400" />
                    <span>Ficha Completa</span>
                  </button>

                  {onActualizarExpediente && (
                    <button
                      onClick={() => {
                        const nuevoEstado = exp.estado === 'Finalizado' ? 'En trámite' : 'Finalizado';
                        onActualizarExpediente({
                          ...exp,
                          estado: nuevoEstado,
                        });
                      }}
                      className={`px-2.5 py-1.5 rounded text-[10px] font-mono font-bold flex items-center space-x-1 transition-all border ${
                        exp.estado === 'Finalizado'
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600/60 hover:bg-emerald-900'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-emerald-400 hover:border-emerald-700'
                      }`}
                      title={exp.estado === 'Finalizado' ? 'Reabrir trámite' : 'Marcar trámite como finalizado'}
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>{exp.estado === 'Finalizado' ? 'Finalizado' : 'Finalizar'}</span>
                    </button>
                  )}
                </div>

                {actuacionExpte && (
                  <button
                    onClick={() => onSeleccionarActuacionParaProcesar(actuacionExpte, exp)}
                    className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/40 text-[10px] font-bold uppercase tracking-wider rounded transition-all flex items-center space-x-1"
                  >
                    <span>Motor SIGED</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Ficha Completa */}
      <FichaExpedienteModal
        isOpen={!!expedienteSeleccionado}
        onClose={() => setExpedienteSeleccionado(null)}
        expediente={expedientes.find(e => e.id === expedienteSeleccionado?.id) || expedienteSeleccionado}
        documentos={documentos}
        pruebas={pruebas}
        audiencias={audiencias}
        modelosRepositorio={modelosRepositorio}
        progresosPasos={progresosPasos}
        onTogglePasoCompletado={onTogglePasoCompletado}
        onGuardarDocumentoExpediente={onGuardarDocumentoExpediente}
        onAbrirEditorConTexto={onAbrirEditorConTexto}
        onActualizarExpediente={onActualizarExpediente}
      />

      {/* Modal Alta de Causa */}
      {isCreandoExpte && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-100 uppercase tracking-tight flex items-center space-x-2">
              <PlusCircle className="w-5 h-5 text-blue-500" />
              <span>Alta de Nuevo Expediente (SIGED)</span>
            </h3>

            <form onSubmit={handleCrearSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-mono text-slate-400 uppercase text-[10px] mb-1">N° Expediente y Año:</label>
                <input
                  type="text"
                  required
                  placeholder="ej: 1890/2026"
                  value={nuevoNumero}
                  onChange={(e) => setNuevoNumero(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100 font-mono focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-mono text-slate-400 uppercase text-[10px] mb-1">Carátula Judicial:</label>
                <input
                  type="text"
                  required
                  placeholder="ej: PEREZ JUAN C/ BENITEZ S/ DAÑOS Y PERJUICIOS"
                  value={nuevaCaratula}
                  onChange={(e) => setNuevaCaratula(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-slate-400 uppercase text-[10px] mb-1">Fuero:</label>
                  <select
                    value={nuevoFuero}
                    onChange={(e) => setNuevoFuero(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 font-mono"
                  >
                    <option value="Civil y Comercial">Civil y Comercial</option>
                    <option value="Laboral">Laboral</option>
                    <option value="Familia">Familia</option>
                    <option value="Caducidades y Concursos">Caducidades y Concursos</option>
                    <option value="ANSES / Previsional">ANSES / Previsional</option>
                    <option value="Justicia Federal">Justicia Federal</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-slate-400 uppercase text-[10px] mb-1">Circunscripción:</label>
                  <select
                    value={nuevaCircunscripcion}
                    onChange={(e) => setNuevaCircunscripcion(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 font-mono"
                  >
                    <option value="Primera (Posadas)">Primera (Posadas)</option>
                    <option value="Segunda (Oberá)">Segunda (Oberá)</option>
                    <option value="Tercera (Eldorado)">Tercera (Eldorado)</option>
                    <option value="Cuarta (Puerto Rico)">Cuarta (Puerto Rico)</option>
                    <option value="Quinta (San Vicente)">Quinta (San Vicente)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-mono text-slate-400 uppercase text-[10px] mb-1">Juzgado de Radicación:</label>
                <input
                  type="text"
                  value={nuevoJuzgado}
                  onChange={(e) => setNuevoJuzgado(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-mono text-slate-400 uppercase text-[10px] mb-1">Cliente Representado:</label>
                <input
                  type="text"
                  required
                  placeholder="ej: Juan Pérez"
                  value={nuevoCliente}
                  onChange={(e) => setNuevoCliente(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreandoExpte(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-bold uppercase text-[10px]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold uppercase text-[10px]"
                >
                  Guardar Causa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
