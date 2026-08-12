import React, { useState, useMemo } from 'react';
import { 
  Globe, Building2, Search, Plus, FileText, CheckCircle2, Clock, AlertTriangle, 
  Bell, Send, RefreshCw, ExternalLink, ShieldCheck, Trash2, User, FolderPlus, 
  BookOpen, Layers, Calendar, Zap, ChevronRight, Filter, Copy, Download, 
  Sparkles, Check, ChevronDown, Landmark, Scale, Cpu, Play
} from 'lucide-react';

import { 
  Expediente, 
  TramitePortalExterno, 
  AlertaPushProgramable, 
  ModeloEscritoRepositorio, 
  DocumentoEstudio, 
  FueroJudicial, 
  CircunscripcionJudicial, 
  EtapaProcesal,
  PortalTipo,
  PasoHistorialPortal
} from '../types';

import { sendBrowserPushNotification } from '../utils/pushNotifications';

interface PortalesExternosViewProps {
  expedientes: Expediente[];
  tramitesPortales: TramitePortalExterno[];
  alertasProgramables: AlertaPushProgramable[];
  modelosRepositorio: ModeloEscritoRepositorio[];
  documentos: DocumentoEstudio[];
  onAgregarExpediente: (nuevo: Expediente) => void;
  onAgregarTramitePortal: (nuevo: TramitePortalExterno) => void;
  onActualizarTramitePortal: (actualizado: TramitePortalExterno) => void;
  onAgregarAlertaProgramable: (nueva: AlertaPushProgramable) => void;
  onEliminarAlertaProgramable: (id: string) => void;
  onDispararAlertaPush: (alerta: AlertaPushProgramable) => void;
  onSelectTab?: (tab: string) => void;
}

export const PortalesExternosView: React.FC<PortalesExternosViewProps> = ({
  expedientes,
  tramitesPortales,
  alertasProgramables,
  modelosRepositorio,
  documentos,
  onAgregarExpediente,
  onAgregarTramitePortal,
  onActualizarTramitePortal,
  onAgregarAlertaProgramable,
  onEliminarAlertaProgramable,
  onDispararAlertaPush,
  onSelectTab,
}) => {
  const [subTab, setSubTab] = useState<'tramites' | 'buscador' | 'crear' | 'alertas'>('tramites');
  const [filtroPortal, setFiltroPortal] = useState<string>('todos');
  const [busquedaPortal, setBusquedaPortal] = useState<string>('');

  // Global search state
  const [queryCliente, setQueryCliente] = useState<string>('');
  const [clienteSeleccionadoDni, setClienteSeleccionadoDni] = useState<string | null>(null);

  // Modal / Form state for new presentation
  const [isModalTramiteOpen, setIsModalTramiteOpen] = useState(false);
  const [portalNuevo, setPortalNuevo] = useState<PortalTipo>('ANSES e-TRAMITE');
  const [numTramiteNuevo, setNumTramiteNuevo] = useState('');
  const [cuilNuevo, setCuilNuevo] = useState('');
  const [nombreTitularNuevo, setNombreTitularNuevo] = useState('');
  const [tipoTramiteNuevo, setTipoTramiteNuevo] = useState('Jubilación Ordinaria Ley 24.241');
  const [camaraFederalNueva, setCamaraFederalNueva] = useState('Cámara Federal de Apelaciones de Resistencia');
  const [observacionesNuevas, setObservacionesNuevas] = useState('');

  // Modal / Form state for new step update in portal
  const [tramiteParaPaso, setTramiteParaPaso] = useState<TramitePortalExterno | null>(null);
  const [nuevoEstadoTexto, setNuevoEstadoTexto] = useState('');
  const [nuevaObsTexto, setNuevaObsTexto] = useState('');

  // Form state for creating new Expediente
  const [expDniCliente, setExpDniCliente] = useState('');
  const [expNombreCliente, setExpNombreCliente] = useState('');
  const [expFuero, setExpFuero] = useState<FueroJudicial>('ANSES / Previsional');
  const [expCircunscripcion, setExpCircunscripcion] = useState<CircunscripcionJudicial>('Primera (Posadas)');
  const [expJuzgado, setExpJuzgado] = useState('Unidad de Atención Virtual ANSES - UDAI Posadas');
  const [expNumero, setExpNumero] = useState('');
  const [expCaratula, setExpCaratula] = useState('');
  const [expSistemaOrigen, setExpSistemaOrigen] = useState<'SIGED Misiones' | 'ANSES e-TRAMITE' | 'PJN - Justicia Federal'>('ANSES e-TRAMITE');
  const [expNumAnses, setExpNumAnses] = useState('');
  const [expCuilAnses, setExpCuilAnses] = useState('');
  const [expNumPJN, setExpNumPJN] = useState('');
  const [expCamaraPJN, setExpCamaraPJN] = useState('Cámara Federal de Apelaciones de Resistencia');
  const [expEtapa, setExpEtapa] = useState<EtapaProcesal>('Iniciación / Demanda');

  // Form state for new Push Alert
  const [alertaTitulo, setAlertaTitulo] = useState('');
  const [alertaMensaje, setAlertaMensaje] = useState('');
  const [alertaFechaHora, setAlertaFechaHora] = useState('');
  const [alertaExpteId, setAlertaExpteId] = useState('');
  const [alertaClienteDniNombre, setAlertaClienteDniNombre] = useState('');
  const [alertaTipo, setAlertaTipo] = useState<'ANSES_TURNO' | 'PJN_VENCIMIENTO' | 'CEDULA' | 'INTIMACION' | 'RESOLUCION' | 'GENERAL'>('ANSES_TURNO');
  const [alertaPrioridad, setAlertaPrioridad] = useState<'Baja' | 'Media' | 'Alta' | 'Urgente'>('Alta');

  // Simulated Sync indicator
  const [isSyncingPortales, setIsSyncingPortales] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // Filtered trámites
  const tramitesFiltrados = useMemo(() => {
    return tramitesPortales.filter((t) => {
      const coincidePortal = filtroPortal === 'todos' || t.portal === filtroPortal;
      const q = busquedaPortal.toLowerCase().trim();
      const coincideBusqueda = 
        !q ||
        t.nombreTitular.toLowerCase().includes(q) ||
        t.cuilDniTitular.toLowerCase().includes(q) ||
        t.numeroTramite.toLowerCase().includes(q) ||
        t.tipoTramite.toLowerCase().includes(q) ||
        t.estadoActual.toLowerCase().includes(q);
      return coincidePortal && coincideBusqueda;
    });
  }, [tramitesPortales, filtroPortal, busquedaPortal]);

  // Global search results for Client DNI / Name
  const clientesBusquedaResultados = useMemo(() => {
    const q = queryCliente.trim().toLowerCase();
    if (!q) return [];

    // Unique clients map by DNI/CUIL or name
    const mapaClientes = new Map<string, { dni: string; nombre: string }>();

    // Scan expedientes
    expedientes.forEach((e) => {
      const parteActora = e.partes.find((p) => p.rol === 'Actor/a');
      const dni = parteActora?.dni_cuit || e.cuilTitularAnses || 'S/DNI';
      const nombre = e.cliente || parteActora?.nombre || 'Cliente Sin Nombre';
      
      if (dni.toLowerCase().includes(q) || nombre.toLowerCase().includes(q)) {
        mapaClientes.set(dni + '-' + nombre, { dni, nombre });
      }
    });

    // Scan trámites portales
    tramitesPortales.forEach((t) => {
      if (t.cuilDniTitular.toLowerCase().includes(q) || t.nombreTitular.toLowerCase().includes(q)) {
        mapaClientes.set(t.cuilDniTitular + '-' + t.nombreTitular, { dni: t.cuilDniTitular, nombre: t.nombreTitular });
      }
    });

    return Array.from(mapaClientes.values());
  }, [queryCliente, expedientes, tramitesPortales]);

  // Details for selected client in global search
  const detallesCliente = useMemo(() => {
    if (!clienteSeleccionadoDni) return null;

    const queryDni = clienteSeleccionadoDni.toLowerCase();

    // Expedientes for this client
    const clientExpedientes = expedientes.filter((e) => {
      const parteActora = e.partes.find((p) => p.rol === 'Actor/a');
      return (
        (e.cuilTitularAnses && e.cuilTitularAnses.toLowerCase().includes(queryDni)) ||
        (parteActora?.dni_cuit && parteActora.dni_cuit.toLowerCase().includes(queryDni)) ||
        e.cliente.toLowerCase().includes(queryDni)
      );
    });

    // Trámites in portales
    const clientTramites = tramitesPortales.filter((t) => 
      t.cuilDniTitular.toLowerCase().includes(queryDni) ||
      t.nombreTitular.toLowerCase().includes(queryDni)
    );

    // Escritos & documentos worked
    const clientDocs = documentos.filter((d) => {
      const text = (d.nombre + ' ' + (d.contenidoTexto || '')).toLowerCase();
      return text.includes(queryDni) || clientExpedientes.some((e) => e.id === d.expediente_id);
    });

    // Alerts
    const clientAlerts = alertasProgramables.filter((a) => 
      (a.clienteDniNombre && a.clienteDniNombre.toLowerCase().includes(queryDni)) ||
      clientExpedientes.some((e) => e.id === a.expediente_id)
    );

    return {
      dni: clienteSeleccionadoDni,
      expedientes: clientExpedientes,
      tramites: clientTramites,
      documentos: clientDocs,
      alertas: clientAlerts,
    };
  }, [clienteSeleccionadoDni, expedientes, tramitesPortales, documentos, alertasProgramables]);

  // Handlers
  const handleCrearTramite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!numTramiteNuevo || !cuilNuevo || !nombreTitularNuevo) return;

    const nuevo: TramitePortalExterno = {
      id: `TRM-${Date.now()}`,
      portal: portalNuevo,
      numeroTramite: numTramiteNuevo,
      cuilDniTitular: cuilNuevo,
      nombreTitular: nombreTitularNuevo,
      tipoTramite: tipoTramiteNuevo,
      estadoActual: portalNuevo === 'ANSES e-TRAMITE' ? 'Ingresado en Atención Virtual' : 'Iniciado con Firma Digital en Portal PJN',
      fechaUltimoEstado: new Date().toISOString().substring(0, 10),
      camaraFederal: portalNuevo === 'PJN - Justicia Federal' ? camaraFederalNueva : undefined,
      observaciones: observacionesNuevas || undefined,
      archivosAdjuntosCount: 1,
      pasosHistorial: [
        {
          id: `PH-${Date.now()}`,
          fecha: new Date().toISOString().substring(0, 10),
          estado: 'Presentación Electrónica Ingresada',
          observacion: `Presentación enviada a ${portalNuevo} (${tipoTramiteNuevo})`,
          usuarioPortal: 'Estudio Jurídico',
        },
      ],
    };

    onAgregarTramitePortal(nuevo);
    setIsModalTramiteOpen(false);
    // Reset fields
    setNumTramiteNuevo('');
    setCuilNuevo('');
    setNombreTitularNuevo('');
    setObservacionesNuevas('');
  };

  const handleAgregarHitoPaso = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tramiteParaPaso || !nuevoEstadoTexto) return;

    const nuevoPaso: PasoHistorialPortal = {
      id: `PH-${Date.now()}`,
      fecha: new Date().toISOString().substring(0, 10),
      estado: nuevoEstadoTexto,
      observacion: nuevaObsTexto || 'Actualización registrada en seguimiento de portal.',
      usuarioPortal: 'Sistema / Estudio',
    };

    const tramiteActualizado: TramitePortalExterno = {
      ...tramiteParaPaso,
      estadoActual: nuevoEstadoTexto,
      fechaUltimoEstado: new Date().toISOString().substring(0, 10),
      pasosHistorial: [nuevoPaso, ...tramiteParaPaso.pasosHistorial],
    };

    onActualizarTramitePortal(tramiteActualizado);
    setTramiteParaPaso(null);
    setNuevoEstadoTexto('');
    setNuevaObsTexto('');
  };

  const handleSimularSincronizacion = () => {
    setIsSyncingPortales(true);
    setSyncFeedback(null);

    setTimeout(() => {
      setIsSyncingPortales(false);
      setSyncFeedback('¡Conexión exitosa con e-Trámites ANSES y Servicios Web PJN Federal! No se detectaron demoras de plazo.');
      
      // Auto dismiss message
      setTimeout(() => setSyncFeedback(null), 5000);
    }, 1200);
  };

  const handleCrearExpedienteCompleto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expNumero || !expCaratula || !expNombreCliente) return;

    const nuevoExp: Expediente = {
      id: `EXP-${Date.now()}`,
      numero: expNumero,
      caratula: expCaratula,
      juzgado: expJuzgado,
      fuero: expFuero,
      circunscripcion: expCircunscripcion,
      etapa_procesal: expEtapa,
      abogados_autorizados: ['ABG-001'],
      letrado_patrocinante: 'Dra. María Elena Gómez',
      fecha_inicio: new Date().toISOString().substring(0, 10),
      estado: 'En trámite',
      cliente: expNombreCliente,
      sistemaOrigen: expSistemaOrigen,
      numeroExpedienteAnses: expSistemaOrigen === 'ANSES e-TRAMITE' ? expNumAnses || expNumero : undefined,
      cuilTitularAnses: expSistemaOrigen === 'ANSES e-TRAMITE' ? expCuilAnses || expDniCliente : undefined,
      numeroExpedientePJN: expSistemaOrigen === 'PJN - Justicia Federal' ? expNumPJN || expNumero : undefined,
      camaraFederalPJN: expSistemaOrigen === 'PJN - Justicia Federal' ? expCamaraPJN : undefined,
      sistemaDeoxActivo: expSistemaOrigen === 'PJN - Justicia Federal',
      partes: [
        {
          id: `P-${Date.now()}`,
          nombre: expNombreCliente,
          rol: 'Actor/a',
          dni_cuit: expDniCliente,
        },
      ],
      movimientos: [
        {
          id: `M-${Date.now()}`,
          fecha: new Date().toISOString().substring(0, 10),
          tipo: 'Alta Expediente',
          descripcion: `Registro inicial de causa en ${expSistemaOrigen}. Fuero: ${expFuero}`,
          firmante: 'Estudio Jurídico',
        },
      ],
      financiero: {
        honorariosPactados: 1500000,
        honorariosRegulados: 0,
        honorariosCobrados: 0,
        tasaDeJusticiaMisiones: 0,
        tasaJusticiaPagada: true,
        aportesCajaForense: 0,
        aportesCajaAbogados: 0,
        gastosDiligenciamiento: 10000,
        saldoPendiente: 1500000,
      },
    };

    onAgregarExpediente(nuevoExp);

    // If it's an ANSES or PJN expediente, also create a portal trámite entry automatically
    if (expSistemaOrigen !== 'SIGED Misiones') {
      const nuevoTramite: TramitePortalExterno = {
        id: `TRM-${Date.now()}`,
        expediente_id: nuevoExp.id,
        portal: expSistemaOrigen === 'ANSES e-TRAMITE' ? 'ANSES e-TRAMITE' : 'PJN - Justicia Federal',
        numeroTramite: expNumero,
        cuilDniTitular: expDniCliente || expCuilAnses || '20-00000000-0',
        nombreTitular: expNombreCliente,
        tipoTramite: expFuero,
        estadoActual: 'Iniciado y Registrado en Expedientes del Estudio',
        fechaUltimoEstado: new Date().toISOString().substring(0, 10),
        camaraFederal: expCamaraPJN,
        pasosHistorial: [
          {
            id: `PH-${Date.now()}`,
            fecha: new Date().toISOString().substring(0, 10),
            estado: 'Expediente Dado de Alta',
            observacion: `Registrado para seguimiento de cliente ${expNombreCliente}`,
            usuarioPortal: 'Estudio Jurídico',
          },
        ],
      };
      onAgregarTramitePortal(nuevoTramite);
    }

    // Reset form
    setExpNumero('');
    setExpCaratula('');
    setExpNombreCliente('');
    setExpDniCliente('');
    setSubTab('tramites');
  };

  const handleCrearAlertaProgramable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertaTitulo || !alertaMensaje || !alertaFechaHora) return;

    const nuevaAlerta: AlertaPushProgramable = {
      id: `ALT-${Date.now()}`,
      titulo: alertaTitulo,
      mensaje: alertaMensaje,
      fechaHoraProgramada: alertaFechaHora.replace('T', ' '),
      expediente_id: alertaExpteId || undefined,
      clienteDniNombre: alertaClienteDniNombre || undefined,
      tipo: alertaTipo,
      prioridad: alertaPrioridad,
      estado: 'Programada',
      fechaCreacion: new Date().toISOString().substring(0, 16).replace('T', ' '),
    };

    onAgregarAlertaProgramable(nuevaAlerta);

    // Reset form
    setAlertaTitulo('');
    setAlertaMensaje('');
    setAlertaFechaHora('');
    setAlertaClienteDniNombre('');
  };

  const handleDispararPruebaAlerta = (alerta: AlertaPushProgramable) => {
    sendBrowserPushNotification({
      title: `🔔 [PUSH ALERTA]: ${alerta.titulo}`,
      body: `${alerta.mensaje}\nCliente: ${alerta.clienteDniNombre || 'Estudio'}\nFecha: ${alerta.fechaHoraProgramada}`,
    });
    onDispararAlertaPush(alerta);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Globe className="w-64 h-64 text-indigo-400" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="p-2 bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 rounded-xl">
                <Globe className="w-6 h-6" />
              </span>
              <div>
                <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center space-x-2">
                  <span>Portales Externos & Cliente Unificado</span>
                  <span className="text-[10px] bg-indigo-500 text-white font-mono px-2 py-0.5 rounded-full font-bold">
                    ANSES & PJN Federal
                  </span>
                </h2>
                <p className="text-xs text-slate-300 font-mono">
                  Presentaciones en e-Trámites ANSES, Justicia Federal (PJN), DEOX, Buscador Global por DNI y Alertas Push
                </p>
              </div>
            </div>
          </div>

          {/* Top Control Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleSimularSincronizacion}
              disabled={isSyncingPortales}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-mono font-bold flex items-center space-x-2 transition-all shadow-lg shadow-indigo-900/30"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncingPortales ? 'animate-spin' : ''}`} />
              <span>{isSyncingPortales ? 'Sincronizando...' : 'Consultar Estados e-Trámites'}</span>
            </button>

            <button
              onClick={() => setIsModalTramiteOpen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-mono font-bold flex items-center space-x-2 transition-all shadow-lg shadow-emerald-900/30"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Presentación Portal</span>
            </button>
          </div>
        </div>

        {syncFeedback && (
          <div className="mt-4 p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-2xl text-emerald-300 text-xs font-mono flex items-center space-x-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{syncFeedback}</span>
          </div>
        )}
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex space-x-2 bg-slate-900/80 p-1 rounded-2xl border border-slate-800 font-mono text-xs">
          <button
            onClick={() => setSubTab('tramites')}
            className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center space-x-2 ${
              subTab === 'tramites'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Seguimiento Portales ({tramitesPortales.length})</span>
          </button>

          <button
            onClick={() => setSubTab('buscador')}
            className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center space-x-2 ${
              subTab === 'buscador'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Buscador de Cliente (DNI/Nombre)</span>
          </button>

          <button
            onClick={() => setSubTab('crear')}
            className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center space-x-2 ${
              subTab === 'crear'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FolderPlus className="w-4 h-4" />
            <span>Registrar Expediente de Cliente</span>
          </button>

          <button
            onClick={() => setSubTab('alertas')}
            className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center space-x-2 ${
              subTab === 'alertas'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bell className="w-4 h-4 text-amber-400" />
            <span>Alertas Push Programables ({alertasProgramables.length})</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SUB-TAB 1: TRÁMITES Y SEGUIMIENTO EN PORTALES EXTERNOS */}
      {/* ------------------------------------------------------------- */}
      {subTab === 'tramites' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 font-mono text-xs">
            <div className="flex items-center space-x-2 w-full md:w-auto">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="text-slate-400">Organismo:</span>
              <select
                value={filtroPortal}
                onChange={(e) => setFiltroPortal(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="todos">Todos los Portales (ANSES, PJN, DEOX)</option>
                <option value="ANSES e-TRAMITE">ANSES e-TRAMITE</option>
                <option value="PJN - Justicia Federal">PJN - Justicia Federal</option>
                <option value="DEOX (Oficios Digitales)">DEOX (Oficios Digitales)</option>
              </select>
            </div>

            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={busquedaPortal}
                onChange={(e) => setBusquedaPortal(e.target.value)}
                placeholder="Buscar por DNI, CUIL, Nombre o N° Trámite..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {tramitesFiltrados.length === 0 ? (
              <div className="col-span-full p-12 bg-slate-900 border border-slate-800 rounded-3xl text-center space-y-3">
                <Building2 className="w-12 h-12 text-slate-600 mx-auto" />
                <p className="text-sm font-mono text-slate-400">
                  No se encontraron trámites ni presentaciones registradas en el portal seleccionado.
                </p>
                <button
                  onClick={() => setIsModalTramiteOpen(true)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-mono font-bold inline-flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Crear Primera Presentación</span>
                </button>
              </div>
            ) : (
              tramitesFiltrados.map((t) => (
                <div
                  key={t.id}
                  className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 hover:border-slate-700 transition-all shadow-xl relative"
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                          t.portal === 'ANSES e-TRAMITE'
                            ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                            : t.portal === 'PJN - Justicia Federal'
                            ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        }`}>
                          {t.portal}
                        </span>
                        {t.camaraFederal && (
                          <span className="text-[10px] font-mono text-slate-400">
                            • {t.camaraFederal}
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                        <span>{t.nombreTitular}</span>
                        <span className="text-xs font-mono text-indigo-400 font-normal">
                          (CUIL: {t.cuilDniTitular})
                        </span>
                      </h3>
                      <p className="text-xs text-slate-300 font-mono font-semibold">
                        {t.tipoTramite}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-[10px] font-mono text-slate-400">N° Trámite / Expte</div>
                      <div className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/30 inline-block">
                        {t.numeroTramite}
                      </div>
                    </div>
                  </div>

                  {/* Estado Actual Highlight */}
                  <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-slate-400 uppercase text-[10px] tracking-wider">Estado Actual en Portal:</span>
                      <span className="text-slate-500 text-[10px]">Actualizado: {t.fechaUltimoEstado}</span>
                    </div>
                    <div className="text-xs font-mono font-bold text-emerald-400 flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{t.estadoActual}</span>
                    </div>
                    {t.observaciones && (
                      <p className="text-[11px] text-slate-400 italic pt-1 border-t border-slate-900">
                        "{t.observaciones}"
                      </p>
                    )}
                  </div>

                  {/* Step Timeline */}
                  <div className="space-y-2 font-mono text-xs">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                      Línea de Tiempo & Pasos Registrados ({t.pasosHistorial.length}):
                    </span>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                      {t.pasosHistorial.map((paso) => (
                        <div
                          key={paso.id}
                          className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 space-y-1"
                        >
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="font-bold text-indigo-300">{paso.estado}</span>
                            <span className="text-slate-500">{paso.fecha}</span>
                          </div>
                          <p className="text-[11px] text-slate-300">{paso.observacion}</p>
                          {paso.usuarioPortal && (
                            <span className="text-[9px] text-slate-500 block">
                              Por: {paso.usuarioPortal}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Action Bar */}
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between font-mono text-xs">
                    <button
                      onClick={() => setTramiteParaPaso(t)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center space-x-1.5"
                    >
                      <Plus className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Agregar Hito / Paso</span>
                    </button>

                    {onSelectTab && (
                      <button
                        onClick={() => onSelectTab('expedientes')}
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center space-x-1"
                      >
                        <span>Ver en Expedientes</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUB-TAB 2: BUSCADOR INTEGRADO DE CLIENTE POR DNI Y NOMBRE */}
      {/* ------------------------------------------------------------- */}
      {subTab === 'buscador' && (
        <div className="space-y-6">
          {/* Search Header Input */}
          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-4">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Search className="w-5 h-5 text-indigo-400" />
                <span>Buscador Unificado por DNI, CUIL o Nombre Completo del Cliente</span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Consulte en tiempo real todos los expedientes, escritos redactados, trámites en ANSES/PJN y notificaciones de un cliente.
              </p>
            </div>

            <div className="relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="text"
                value={queryCliente}
                onChange={(e) => {
                  setQueryCliente(e.target.value);
                  setClienteSeleccionadoDni(null);
                }}
                placeholder="Ingrese DNI (ej: 20384192), CUIL (ej: 27-05839201-4) o Nombre (ej: Rosa Martínez)..."
                className="w-full bg-slate-950 border border-slate-700 rounded-2xl pl-12 pr-4 py-3 text-slate-100 font-mono text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 shadow-inner"
              />
            </div>

            {/* Quick Suggestions / Results Pills */}
            {queryCliente.trim().length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="text-[11px] font-mono text-slate-400 block">
                  Resultados encontrados ({clientesBusquedaResultados.length}):
                </span>
                <div className="flex flex-wrap gap-2">
                  {clientesBusquedaResultados.length === 0 ? (
                    <span className="text-xs font-mono text-slate-500">
                      No hay registros coincidentes. Pruebe buscar "Rosa Martínez" o "27-05839201-4"
                    </span>
                  ) : (
                    clientesBusquedaResultados.map((c) => (
                      <button
                        key={c.dni + c.nombre}
                        onClick={() => setClienteSeleccionadoDni(c.dni)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center space-x-2 border transition-all ${
                          clienteSeleccionadoDni === c.dni
                            ? 'bg-indigo-600 text-white border-indigo-500'
                            : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-indigo-500/50'
                        }`}
                      >
                        <User className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{c.nombre} ({c.dni})</span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Client Dossier View */}
          {detallesCliente && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 animate-in fade-in">
              {/* Dossier Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-2xl">
                    <User className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      Legajo Unificado del Cliente: {detallesCliente.expedientes[0]?.cliente || detallesCliente.tramites[0]?.nombreTitular || 'Cliente'}
                    </h3>
                    <p className="text-xs font-mono text-indigo-400">
                      DNI / CUIL Identificador: {detallesCliente.dni}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setExpDniCliente(detallesCliente.dni);
                      setExpNombreCliente(detallesCliente.expedientes[0]?.cliente || detallesCliente.tramites[0]?.nombreTitular || '');
                      setSubTab('crear');
                    }}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-mono font-bold flex items-center space-x-1.5 shadow-md"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Nuevo Expediente para este Cliente</span>
                  </button>
                </div>
              </div>

              {/* Grid 3 Columns Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono text-xs">
                {/* Col 1: Expedientes */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                  <h4 className="font-bold text-slate-200 uppercase text-[11px] flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-blue-400" />
                    <span>Expedientes del Cliente ({detallesCliente.expedientes.length})</span>
                  </h4>

                  {detallesCliente.expedientes.length === 0 ? (
                    <p className="text-slate-500 text-[11px]">No posee expedientes locales registrados.</p>
                  ) : (
                    detallesCliente.expedientes.map((e) => (
                      <div key={e.id} className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-amber-400">{e.numero}</span>
                          <span className="text-[10px] text-slate-400">{e.fuero}</span>
                        </div>
                        <p className="text-[11px] text-slate-200 line-clamp-2">{e.caratula}</p>
                        <div className="text-[10px] text-slate-400 pt-1 flex justify-between">
                          <span>{e.juzgado}</span>
                          <span className="text-emerald-400 font-bold">{e.estado}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Col 2: Trámites Portales ANSES/PJN */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                  <h4 className="font-bold text-slate-200 uppercase text-[11px] flex items-center space-x-2">
                    <Building2 className="w-4 h-4 text-purple-400" />
                    <span>Portales ANSES / PJN ({detallesCliente.tramites.length})</span>
                  </h4>

                  {detallesCliente.tramites.length === 0 ? (
                    <p className="text-slate-500 text-[11px]">No registra e-Trámites en portales externos.</p>
                  ) : (
                    detallesCliente.tramites.map((t) => (
                      <div key={t.id} className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded">
                            {t.portal}
                          </span>
                          <span className="font-bold text-slate-200">{t.numeroTramite}</span>
                        </div>
                        <p className="text-[11px] text-slate-300 font-bold">{t.tipoTramite}</p>
                        <p className="text-[10px] text-emerald-400">{t.estadoActual}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Col 3: Escritos trabajados & Documentos */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                  <h4 className="font-bold text-slate-200 uppercase text-[11px] flex items-center space-x-2">
                    <BookOpen className="w-4 h-4 text-emerald-400" />
                    <span>Escritos & Documentos ({detallesCliente.documentos.length})</span>
                  </h4>

                  {detallesCliente.documentos.length === 0 ? (
                    <p className="text-slate-500 text-[11px]">No hay escritos guardados para este cliente.</p>
                  ) : (
                    detallesCliente.documentos.map((d) => (
                      <div key={d.id} className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-cyan-300 truncate">{d.nombre}</span>
                          <span className="text-[9px] bg-slate-800 text-slate-300 px-1 py-0.5 rounded">
                            {d.tipoArchivo.toUpperCase()}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 block">
                          Modificado: {d.fecha_modificacion} • {d.autor}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUB-TAB 3: REGISTRO COMPLETO DE EXPEDIENTE PARA CLIENTE */}
      {/* ------------------------------------------------------------- */}
      {subTab === 'crear' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 max-w-4xl mx-auto">
          <div className="border-b border-slate-800 pb-4 space-y-1">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <FolderPlus className="w-5 h-5 text-indigo-400" />
              <span>Alta e Inserción de Expediente para Cliente</span>
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Registre un nuevo expediente judicial o administrativo vinculando datos del cliente, fuero, estado y sistema de origen.
            </p>
          </div>

          <form onSubmit={handleCrearExpedienteCompleto} className="space-y-4 font-mono text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* DNI / CUIL */}
              <div className="space-y-1">
                <label className="text-slate-300 font-bold">DNI / CUIL del Cliente *</label>
                <input
                  type="text"
                  required
                  value={expDniCliente}
                  onChange={(e) => setExpDniCliente(e.target.value)}
                  placeholder="Ej: 27-05839201-4"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Nombre Completo */}
              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Nombre Completo del Cliente *</label>
                <input
                  type="text"
                  required
                  value={expNombreCliente}
                  onChange={(e) => setExpNombreCliente(e.target.value)}
                  placeholder="Ej: Rosa Martínez"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Sistema Origen */}
              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Sistema u Organismo de Origen *</label>
                <select
                  value={expSistemaOrigen}
                  onChange={(e) => setExpSistemaOrigen(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="ANSES e-TRAMITE">ANSES e-TRAMITE (Previsional)</option>
                  <option value="PJN - Justicia Federal">PJN - Justicia Federal (Cámaras Federales)</option>
                  <option value="SIGED Misiones">SIGED Misiones (Poder Judicial Provincial)</option>
                </select>
              </div>

              {/* Fuero */}
              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Fuero Judicial / Administrativo *</label>
                <select
                  value={expFuero}
                  onChange={(e) => setExpFuero(e.target.value as FueroJudicial)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="ANSES / Previsional">ANSES / Previsional</option>
                  <option value="Justicia Federal">Justicia Federal</option>
                  <option value="Civil y Comercial">Civil y Comercial</option>
                  <option value="Laboral">Laboral</option>
                  <option value="Familia">Familia</option>
                  <option value="Caducidades y Concursos">Caducidades y Concursos</option>
                </select>
              </div>

              {/* Número Expte */}
              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Número de Expediente / e-Trámite *</label>
                <input
                  type="text"
                  required
                  value={expNumero}
                  onChange={(e) => setExpNumero(e.target.value)}
                  placeholder="Ej: 024-20384192-3/1 o FPO 48291/2026"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Juzgado / Unidad */}
              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Juzgado u Oficina *</label>
                <input
                  type="text"
                  required
                  value={expJuzgado}
                  onChange={(e) => setExpJuzgado(e.target.value)}
                  placeholder="Ej: UDAI Posadas ANSES / Juzgado Federal N° 1"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Carátula */}
            <div className="space-y-1">
              <label className="text-slate-300 font-bold">Carátula de la Causa *</label>
              <input
                type="text"
                required
                value={expCaratula}
                onChange={(e) => setExpCaratula(e.target.value)}
                placeholder="Ej: MARTINEZ ROSA C/ ANSES S/ REAJUSTE DE HABERES"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="pt-4 flex justify-end space-x-3">
              <button
                type="submit"
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-mono font-bold flex items-center space-x-2 shadow-lg shadow-indigo-900/40"
              >
                <Check className="w-4 h-4" />
                <span>Guardar Expediente & Vincular Cliente</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUB-TAB 4: ALERTAS PUSH PROGRAMABLES */}
      {/* ------------------------------------------------------------- */}
      {subTab === 'alertas' && (
        <div className="space-y-6">
          {/* Top Form to Schedule Alert */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="border-b border-slate-800 pb-3 space-y-1">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Bell className="w-5 h-5 text-amber-400" />
                <span>Programar Nueva Alerta Web Push</span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Programe notificaciones emergentes para vencimientos en Justicia Federal, turnos ANSES o audiencias.
              </p>
            </div>

            <form onSubmit={handleCrearAlertaProgramable} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-mono text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Título de la Alerta *</label>
                <input
                  type="text"
                  required
                  value={alertaTitulo}
                  onChange={(e) => setAlertaTitulo(e.target.value)}
                  placeholder="Ej: Turno UDAI ANSES Posadas"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Fecha y Hora Programada *</label>
                <input
                  type="datetime-local"
                  required
                  value={alertaFechaHora}
                  onChange={(e) => setAlertaFechaHora(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Tipo de Notificación *</label>
                <select
                  value={alertaTipo}
                  onChange={(e) => setAlertaTipo(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="ANSES_TURNO">Turno ANSES e-Trámite</option>
                  <option value="PJN_VENCIMIENTO">Vencimiento Justicia Federal PJN</option>
                  <option value="CEDULA">Cédula Digital</option>
                  <option value="INTIMACION">Intimación Procesal</option>
                  <option value="RESOLUCION">Resolución / Dictamen</option>
                  <option value="GENERAL">General</option>
                </select>
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-slate-300 font-bold">Mensaje de la Alerta Push *</label>
                <input
                  type="text"
                  required
                  value={alertaMensaje}
                  onChange={(e) => setAlertaMensaje(e.target.value)}
                  placeholder="Ej: Presentar borrador de SICAM y carta poder presencial en Posadas."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Prioridad *</label>
                <select
                  value={alertaPrioridad}
                  onChange={(e) => setAlertaPrioridad(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="Baja">Baja</option>
                  <option value="Media">Media</option>
                  <option value="Alta">Alta</option>
                  <option value="Urgente">Urgente</option>
                </select>
              </div>

              <div className="col-span-full pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-mono font-bold flex items-center space-x-2 shadow-lg shadow-amber-900/30"
                >
                  <Bell className="w-4 h-4" />
                  <span>Programar Alerta Push</span>
                </button>
              </div>
            </form>
          </div>

          {/* List of Scheduled Alerts */}
          <div className="space-y-3 font-mono text-xs">
            <h4 className="font-bold text-slate-200 uppercase text-xs">
              Alertas Programadas en Agenda ({alertasProgramables.length}):
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {alertasProgramables.map((a) => (
                <div
                  key={a.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 hover:border-slate-700 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          a.prioridad === 'Urgente'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        }`}>
                          {a.prioridad}
                        </span>
                        <span className="text-[10px] text-slate-400">{a.tipo}</span>
                      </div>
                      <h5 className="font-bold text-slate-100 text-sm">{a.titulo}</h5>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-slate-500 block">Fecha y Hora:</span>
                      <span className="text-xs font-bold text-indigo-400">{a.fechaHoraProgramada}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                    {a.mensaje}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                    <button
                      onClick={() => handleDispararPruebaAlerta(a)}
                      className="px-3 py-1 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 rounded-lg text-[11px] font-bold flex items-center space-x-1"
                      title="Genera una notificación push nativa en la pantalla de inmediato"
                    >
                      <Play className="w-3 h-3 text-indigo-400" />
                      <span>Probar Disparo Ahora</span>
                    </button>

                    <button
                      onClick={() => onEliminarAlertaProgramable(a.id)}
                      className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                      title="Eliminar Alerta"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Nueva Presentación en Portal Externo */}
      {isModalTramiteOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-xl w-full space-y-4 font-mono text-xs shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Globe className="w-5 h-5 text-indigo-400" />
                <span>Simular / Registrar Presentación en Portal</span>
              </h3>
              <button
                onClick={() => setIsModalTramiteOpen(false)}
                className="text-slate-400 hover:text-white text-base"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCrearTramite} className="space-y-4">
              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Portal Destino *</label>
                <select
                  value={portalNuevo}
                  onChange={(e) => setPortalNuevo(e.target.value as PortalTipo)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="ANSES e-TRAMITE">ANSES e-TRAMITE (Atención Virtual)</option>
                  <option value="PJN - Justicia Federal">PJN - Justicia Federal (Portal Gestión Judicial)</option>
                  <option value="DEOX (Oficios Digitales)">DEOX (Oficios Digitales PJN)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">CUIL / DNI Titular *</label>
                  <input
                    type="text"
                    required
                    value={cuilNuevo}
                    onChange={(e) => setCuilNuevo(e.target.value)}
                    placeholder="Ej: 27-05839201-4"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Nombre Titular *</label>
                  <input
                    type="text"
                    required
                    value={nombreTitularNuevo}
                    onChange={(e) => setNombreTitularNuevo(e.target.value)}
                    placeholder="Ej: Rosa Martínez"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Número de Trámite / Expte *</label>
                <input
                  type="text"
                  required
                  value={numTramiteNuevo}
                  onChange={(e) => setNumTramiteNuevo(e.target.value)}
                  placeholder="Ej: 024-20384192-3/1 o FPO 12345/2026"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Tipo de Trámite *</label>
                <input
                  type="text"
                  required
                  value={tipoTramiteNuevo}
                  onChange={(e) => setTipoTramiteNuevo(e.target.value)}
                  placeholder="Ej: Reajuste de Haberes / Amparo por Mora"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalTramiteOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Registrar Presentación</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Agregar Hito a Trámite */}
      {tramiteParaPaso && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-4 font-mono text-xs shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Plus className="w-5 h-5 text-indigo-400" />
                <span>Agregar Hito al Trámite N° {tramiteParaPaso.numeroTramite}</span>
              </h3>
              <button
                onClick={() => setTramiteParaPaso(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAgregarHitoPaso} className="space-y-4">
              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Nuevo Estado *</label>
                <input
                  type="text"
                  required
                  value={nuevoEstadoTexto}
                  onChange={(e) => setNuevoEstadoTexto(e.target.value)}
                  placeholder="Ej: Dictamen Legal Emitido / Cédula DEOX Contestada"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Observación / Detalle</label>
                <textarea
                  rows={3}
                  value={nuevaObsTexto}
                  onChange={(e) => setNuevaObsTexto(e.target.value)}
                  placeholder="Añada detalles o aclaraciones sobre el nuevo estado..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setTramiteParaPaso(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold"
                >
                  Guardar Hito
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
