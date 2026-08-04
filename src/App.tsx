import React, { useState, useEffect, useCallback } from 'react';
import { Navbar, TabId } from './components/Navbar';
import { SigedProcessor } from './components/SigedProcessor';
import { ExpedientesView } from './components/ExpedientesView';
import { PruebasView } from './components/PruebasView';
import { AudienciasView } from './components/AudienciasView';
import { TareasView } from './components/TareasView';
import { CalendarView } from './components/CalendarView';
import { DocumentosEditorView } from './components/DocumentosEditorView';
import { ApiExplorerView } from './components/ApiExplorerView';
import { OidcAuthModal } from './components/OidcAuthModal';
import { PerfilCredencialesModal } from './components/PerfilCredencialesModal';
import { NotificacionToastPopup } from './components/NotificacionToastPopup';
import { AuthModal } from './components/AuthModal';
import { AsignacionAsociadosModal } from './components/AsignacionAsociadosModal';

import { 
  Abogado, 
  Expediente, 
  ActuacionSIGED, 
  PruebaExpediente, 
  AudienciaExpediente, 
  TareaEstudio, 
  DiaInhabil, 
  DocumentoEstudio, 
  PlantillaDocx,
  OidcSessionState,
  EstadoTarea,
  EstadoNotificacionAudiencia,
  CredencialesSIGED,
  NotificacionPushSiged,
  RegistroSincronizacionSiged
} from './types';

import { 
  INITIAL_ABOGADOS, 
  INITIAL_EXPEDIENTES, 
  INITIAL_ACTUACIONES, 
  INITIAL_PRUEBAS, 
  INITIAL_AUDIENCIAS, 
  INITIAL_TAREAS, 
  INITIAL_DIAS_INHABILES, 
  INITIAL_DOCUMENTOS, 
  INITIAL_PLANTILLAS_DOCX,
  INITIAL_NOTIFICACIONES_PUSH,
  INITIAL_REGISTROS_SINCRONIZACION,
  DEFAULT_OIDC_SESSION 
} from './data/mockStore';

import { sendBrowserPushNotification } from './utils/pushNotifications';

export default function App() {
  const [abogados, setAbogados] = useState<Abogado[]>(INITIAL_ABOGADOS);
  const [abogadoActual, setAbogadoActual] = useState<Abogado>(INITIAL_ABOGADOS[0]);
  const [activeTab, setActiveTab] = useState<TabId>('motor');

  // Stores
  const [expedientes, setExpedientes] = useState<Expediente[]>(INITIAL_EXPEDIENTES);
  const [actuaciones, setActuaciones] = useState<ActuacionSIGED[]>(INITIAL_ACTUACIONES);
  const [pruebas, setPruebas] = useState<PruebaExpediente[]>(INITIAL_PRUEBAS);
  const [audiencias, setAudiencias] = useState<AudienciaExpediente[]>(INITIAL_AUDIENCIAS);
  const [tareas, setTareas] = useState<TareaEstudio[]>(INITIAL_TAREAS);
  const [diasInhabiles, setDiasInhabiles] = useState<DiaInhabil[]>(INITIAL_DIAS_INHABILES);
  const [documentos, setDocumentos] = useState<DocumentoEstudio[]>(INITIAL_DOCUMENTOS);
  const [plantillas] = useState<PlantillaDocx[]>(INITIAL_PLANTILLAS_DOCX);

  // SIGED Notifications & Sync Stores
  const [notificacionesPush, setNotificacionesPush] = useState<NotificacionPushSiged[]>(INITIAL_NOTIFICACIONES_PUSH);
  const [historialSync, setHistorialSync] = useState<RegistroSincronizacionSiged[]>(INITIAL_REGISTROS_SINCRONIZACION);
  const [activeToastPopups, setActiveToastPopups] = useState<NotificacionPushSiged[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // OIDC Session & Modals
  const [oidcSession, setOidcSession] = useState<OidcSessionState>(DEFAULT_OIDC_SESSION);
  const [isOidcModalOpen, setIsOidcModalOpen] = useState(false);
  const [isPerfilModalOpen, setIsPerfilModalOpen] = useState(false);

  // Authentication & Associate Access Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAsociadosModalOpen, setIsAsociadosModalOpen] = useState(false);
  const [expedienteModalAsociados, setExpedienteModalAsociados] = useState<Expediente | null>(null);

  const handleLoginSuccess = (abogado: Abogado) => {
    setAbogadoActual(abogado);
    // Refresh list of lawyers from server
    fetch('/api/abogados')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setAbogados(data);
      })
      .catch((err) => console.log('Error cargando lista actualizada de abogados:', err));
  };

  const handleAbrirAsociadosModal = (expte?: Expediente) => {
    setExpedienteModalAsociados(expte || null);
    setIsAsociadosModalOpen(true);
  };

  const handleGuardarAutorizacionesSiged = async (expedienteId: string, asociadosAutorizadosIds: string[]) => {
    try {
      const res = await fetch('/api/expedientes/autorizaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expediente_id: expedienteId,
          abogados_autorizados: asociadosAutorizadosIds,
        }),
      });
      const data = await res.json();
      if (res.ok && data.expediente) {
        setExpedientes((prev) =>
          prev.map((e) => (e.id === expedienteId ? data.expediente : e))
        );
      }
    } catch (err) {
      console.error('Error guardando autorizaciones de asociados:', err);
    }
  };

  useEffect(() => {
    fetch('/api/abogados')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setAbogados(data);
          setAbogadoActual(data[0]);
        }
      })
      .catch((err) => console.log('Usando store por defecto abogados:', err));

    fetch('/api/siged/notificaciones')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setNotificacionesPush(data);
      })
      .catch((err) => console.log('Usando notificaciones por defecto:', err));

    fetch('/api/siged/historial-sync')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setHistorialSync(data);
      })
      .catch((err) => console.log('Usando historial sync por defecto:', err));
  }, []);

  useEffect(() => {
    fetch(`/api/expedientes?abogado_id=${abogadoActual.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setExpedientes(data);
        }
      })
      .catch((err) => console.log('Usando store por defecto expedientes:', err));
  }, [abogadoActual]);

  // Handler Executing Active SIGED Scan & Firing Web Push
  const handleSincronizarSiged = useCallback(async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/siged/sincronizar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ abogado_id: abogadoActual.id }),
      });

      const data = await res.json();
      if (data.exitoso) {
        if (data.novedadDetectada) {
          setNotificacionesPush((prev) => [data.novedadDetectada, ...prev]);
          setActiveToastPopups((prev) => [data.novedadDetectada, ...prev]);

          // Fire Native Browser Push Notification
          sendBrowserPushNotification({
            title: data.novedadDetectada.titulo,
            body: `${data.novedadDetectada.caratula}\n${data.novedadDetectada.mensaje}`,
          });
        }

        if (data.registroSync) {
          setHistorialSync((prev) => [data.registroSync, ...prev]);
        }

        // Refresh Expedientes
        const expRes = await fetch(`/api/expedientes?abogado_id=${abogadoActual.id}`);
        const expData = await expRes.json();
        if (Array.isArray(expData)) setExpedientes(expData);

        // Refresh Actuaciones
        const actRes = await fetch('/api/actuaciones');
        const actData = await actRes.json();
        if (Array.isArray(actData)) setActuaciones(actData);
      }
    } catch (err) {
      console.error('Error durante la sincronización SIGED:', err);
    } finally {
      setIsSyncing(false);
    }
  }, [abogadoActual.id]);

  // Periodic Auto-Sync Timer
  useEffect(() => {
    if (!abogadoActual.credencialesSiged?.sincronizacionAutomatica) return;

    // Run auto-sync every 60 seconds
    const interval = setInterval(() => {
      handleSincronizarSiged();
    }, 60000);

    return () => clearInterval(interval);
  }, [abogadoActual, handleSincronizarSiged]);

  const handleGuardarCredencialesSiged = async (nuevasCreds: CredencialesSIGED) => {
    try {
      const res = await fetch('/api/siged/credenciales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          abogado_id: abogadoActual.id,
          ...nuevasCreds,
        }),
      });

      const abogadoActualizado = await res.json();
      if (abogadoActualizado.id) {
        setAbogadoActual(abogadoActualizado);
        setAbogados((prev) =>
          prev.map((a) => (a.id === abogadoActualizado.id ? abogadoActualizado : a))
        );
      }
    } catch (err) {
      console.error('Error guardando credenciales SIGED:', err);
    }
  };

  const handleMarcarNotificacionLeida = async (id: string) => {
    setNotificacionesPush((prev) =>
      prev.map((n) => (n.id === id ? { ...n, leida: true } : n))
    );
    setActiveToastPopups((prev) => prev.filter((p) => p.id !== id));
    try {
      await fetch('/api/siged/notificaciones/marcar-leida', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
    } catch (err) {
      console.error('Error marcando notificación:', err);
    }
  };

  const handleSeleccionarActuacionParaProcesar = (actuacion: ActuacionSIGED, expte: Expediente) => {
    setActiveTab('motor');
  };

  const handleCrearNuevoExpediente = (nuevoExp: Expediente) => {
    setExpedientes((prev) => [nuevoExp, ...prev]);
  };

  // Handlers Pruebas
  const handleAgregarPrueba = (nueva: PruebaExpediente) => {
    setPruebas((prev) => [nueva, ...prev]);
  };

  const handleActualizarPrueba = (actualizada: PruebaExpediente) => {
    setPruebas((prev) => prev.map((p) => (p.id === actualizada.id ? actualizada : p)));
  };

  // Handlers Audiencias
  const handleAgregarAudiencia = (nueva: AudienciaExpediente) => {
    setAudiencias((prev) => [nueva, ...prev]);
  };

  const handleActualizarNotificacionPersona = (
    audienciaId: string,
    personaId: string,
    nuevoEstado: EstadoNotificacionAudiencia,
    obs?: string
  ) => {
    setAudiencias((prev) =>
      prev.map((a) => {
        if (a.id !== audienciaId) return a;
        return {
          ...a,
          personas_citadas: a.personas_citadas.map((cit) => {
            if (cit.id !== personaId) return cit;
            return {
              ...cit,
              estadoNotificacion: nuevoEstado,
              observacionesNotificacion: obs || cit.observacionesNotificacion,
              fechaNotificacionManual: new Date().toISOString().split('T')[0],
            };
          }),
        };
      })
    );
  };

  // Handlers Tareas
  const handleAgregarTarea = (nueva: TareaEstudio) => {
    setTareas((prev) => [nueva, ...prev]);
  };

  const handleActualizarEstadoTarea = (tareaId: string, nuevoEstado: EstadoTarea) => {
    setTareas((prev) =>
      prev.map((t) => (t.id === tareaId ? { ...t, estado: nuevoEstado } : t))
    );
  };

  const handleAgregarComentarioTarea = (tareaId: string, autor: string, texto: string) => {
    setTareas((prev) =>
      prev.map((t) => {
        if (t.id !== tareaId) return t;
        const nuevoComentario = {
          id: `COM-${Date.now()}`,
          autor,
          fecha: new Date().toISOString().replace('T', ' ').substring(0, 16),
          texto,
        };
        return {
          ...t,
          comentarios: [...t.comentarios, nuevoComentario],
        };
      })
    );
  };

  // Handlers Dias Inhabiles
  const handleAgregarDiaInhabil = (dia: DiaInhabil) => {
    setDiasInhabiles((prev) => [dia, ...prev]);
  };

  const handleEliminarDiaInhabil = (id: string) => {
    setDiasInhabiles((prev) => prev.filter((d) => d.id !== id));
  };

  // Handlers Documentos
  const handleGuardarDocumento = (doc: DocumentoEstudio) => {
    setDocumentos((prev) => [doc, ...prev]);
  };

  return (
    <div className="min-h-screen bg-slate-900 grid-bg text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        abogadoActual={abogadoActual}
        onOpenOidcModal={() => setIsOidcModalOpen(true)}
        onOpenPerfilModal={() => setIsPerfilModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenAsociadosModal={() => handleAbrirAsociadosModal()}
        oidcSession={oidcSession}
        notificacionesPush={notificacionesPush}
        onMarcarNotificacionLeida={handleMarcarNotificacionLeida}
        onSincronizarSiged={handleSincronizarSiged}
        isSyncing={isSyncing}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'motor' && (
          <SigedProcessor abogadoActual={abogadoActual} expedientes={expedientes} />
        )}

        {activeTab === 'expedientes' && (
          <ExpedientesView
            abogadoActual={abogadoActual}
            expedientes={expedientes}
            abogados={abogados}
            actuaciones={actuaciones}
            documentos={documentos}
            pruebas={pruebas}
            audiencias={audiencias}
            onSeleccionarActuacionParaProcesar={handleSeleccionarActuacionParaProcesar}
            onCrearNuevoExpediente={handleCrearNuevoExpediente}
            onAbrirAsociadosModal={handleAbrirAsociadosModal}
          />
        )}

        {activeTab === 'pruebas' && (
          <PruebasView
            pruebas={pruebas}
            expedientes={expedientes}
            abogados={abogados}
            onAgregarPrueba={handleAgregarPrueba}
            onActualizarPrueba={handleActualizarPrueba}
          />
        )}

        {activeTab === 'audiencias' && (
          <AudienciasView
            audiencias={audiencias}
            expedientes={expedientes}
            onAgregarAudiencia={handleAgregarAudiencia}
            onActualizarNotificacionPersona={handleActualizarNotificacionPersona}
          />
        )}

        {activeTab === 'tareas' && (
          <TareasView
            tareas={tareas}
            expedientes={expedientes}
            abogados={abogados}
            onAgregarTarea={handleAgregarTarea}
            onActualizarEstadoTarea={handleActualizarEstadoTarea}
            onAgregarComentario={handleAgregarComentarioTarea}
          />
        )}

        {activeTab === 'agenda' && (
          <CalendarView
            diasInhabiles={diasInhabiles}
            audiencias={audiencias}
            tareas={tareas}
            onAgregarDiaInhabil={handleAgregarDiaInhabil}
            onEliminarDiaInhabil={handleEliminarDiaInhabil}
          />
        )}

        {activeTab === 'documentos' && (
          <DocumentosEditorView
            documentos={documentos}
            plantillas={plantillas}
            expedientes={expedientes}
            onGuardarDocumento={handleGuardarDocumento}
          />
        )}

        {activeTab === 'api_explorer' && (
          <ApiExplorerView abogadoActual={abogadoActual} />
        )}
      </main>

      {/* OIDC Modal */}
      <OidcAuthModal
        isOpen={isOidcModalOpen}
        onClose={() => setIsOidcModalOpen(false)}
        session={oidcSession}
        onUpdateSession={setOidcSession}
        abogados={abogados}
        abogadoActual={abogadoActual}
        onSelectAbogado={(abg) => setAbogadoActual(abg)}
      />

      {/* SIGED Profile & Push Credentials Modal */}
      <PerfilCredencialesModal
        isOpen={isPerfilModalOpen}
        onClose={() => setIsPerfilModalOpen(false)}
        abogadoActual={abogadoActual}
        onGuardarCredenciales={handleGuardarCredencialesSiged}
        onSincronizarManual={handleSincronizarSiged}
        historialSync={historialSync}
        isSyncing={isSyncing}
      />

      {/* Modal de Registro e Iniciar Sesión de Profesionales */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        abogadosExistentes={abogados}
        abogadoActual={abogadoActual}
      />

      {/* Modal de Asignación y Selección de Accesos a Asociados */}
      <AsignacionAsociadosModal
        isOpen={isAsociadosModalOpen}
        onClose={() => setIsAsociadosModalOpen(false)}
        expedientes={expedientes}
        abogados={abogados}
        abogadoActual={abogadoActual}
        onGuardarAutorizaciones={handleGuardarAutorizacionesSiged}
        expedienteInicial={expedienteModalAsociados}
      />

      {/* Ventanas Emergentes (Toast Popups) de Notificaciones & Movimientos SIGED */}
      <NotificacionToastPopup
        popups={activeToastPopups}
        onDismiss={(id) =>
          setActiveToastPopups((prev) => prev.filter((p) => p.id !== id))
        }
        onMarcarLeida={handleMarcarNotificacionLeida}
        onVerExpediente={(expedienteId) => {
          setActiveTab('expedientes');
        }}
        onProcesarEnMotor={(actuacionId) => {
          setActiveTab('motor');
        }}
      />

      {/* Bottom Legal Footer */}
      <footer className="border-t border-slate-800 bg-slate-950/90 backdrop-blur-md py-4 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 font-mono">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 status-glow"></span>
            <span className="text-[11px] text-slate-400">
              Estudio Posadas & Asociados • Sistema SIGED Misiones • CPCCyM
            </span>
          </div>
          <span className="text-[10px] text-slate-500 uppercase tracking-widest">
            Keycloak OIDC Single Sign-On • idm.jusmisiones.gov.ar
          </span>
        </div>
      </footer>
    </div>
  );
}
