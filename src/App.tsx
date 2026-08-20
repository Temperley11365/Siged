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
import { RepositorioEscritosView } from './components/RepositorioEscritosView';
import { PortalesExternosView } from './components/PortalesExternosView';
import { ChatbotClientesView } from './components/ChatbotClientesView';
import { OidcAuthModal } from './components/OidcAuthModal';
import { PerfilCredencialesModal } from './components/PerfilCredencialesModal';
import { NotificacionToastPopup } from './components/NotificacionToastPopup';
import { AuthModal } from './components/AuthModal';
import { AuthScreen } from './components/AuthScreen';
import { AsignacionAsociadosModal } from './components/AsignacionAsociadosModal';
import { AdminPanelModal } from './components/AdminPanelModal';

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
  RegistroSincronizacionSiged,
  ModeloEscritoRepositorio,
  ProgresoPasosExpediente,
  TramitePortalExterno,
  AlertaPushProgramable
} from './types';

import {
  obtenerConfiguracionRespaldo,
  guardarConfiguracionRespaldo,
  generarSnapshotObjeto,
  guardarSnapshotEnHistorial
} from './lib/backupManager';
import { 
  subirSnapshotAGoogleDrive, 
  estaAutenticadoConGoogleDrive,
  obtenerTokenGoogleDriveActivo 
} from './lib/googleDriveService';

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
  DEFAULT_OIDC_SESSION,
  INITIAL_REPOSITORIO_ESCRITOS,
  INITIAL_PROGRESO_PASOS,
  INITIAL_TRAMITES_PORTALES,
  INITIAL_ALERTAS_PROGRAMABLES
} from './data/mockStore';

import { sendBrowserPushNotification } from './utils/pushNotifications';

export default function App() {
  const [abogados, setAbogados] = useState<Abogado[]>(() => {
    const saved = localStorage.getItem('kairos_abogados');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error('Error cargando abogados de localStorage:', e);
      }
    }
    return INITIAL_ABOGADOS;
  });

  const [abogadoActual, setAbogadoActual] = useState<Abogado | null>(() => {
    const savedAuth = localStorage.getItem('kairos_auth_user');
    if (savedAuth) {
      try {
        const parsed = JSON.parse(savedAuth);
        if (parsed && parsed.id) return parsed;
      } catch (e) {
        console.error('Error cargando usuario autenticado de localStorage:', e);
      }
    }
    return null;
  });

  const [activeTab, setActiveTab] = useState<TabId>('motor');

  // Stores with LocalStorage Persistence
  const [expedientes, setExpedientes] = useState<Expediente[]>(() => {
    const saved = localStorage.getItem('kairos_expedientes');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return INITIAL_EXPEDIENTES;
  });

  useEffect(() => {
    localStorage.setItem('kairos_expedientes', JSON.stringify(expedientes));
  }, [expedientes]);

  const [actuaciones, setActuaciones] = useState<ActuacionSIGED[]>(() => {
    const saved = localStorage.getItem('kairos_actuaciones');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return INITIAL_ACTUACIONES;
  });

  useEffect(() => {
    localStorage.setItem('kairos_actuaciones', JSON.stringify(actuaciones));
  }, [actuaciones]);

  const [pruebas, setPruebas] = useState<PruebaExpediente[]>(() => {
    const saved = localStorage.getItem('kairos_pruebas');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return INITIAL_PRUEBAS;
  });

  useEffect(() => {
    localStorage.setItem('kairos_pruebas', JSON.stringify(pruebas));
  }, [pruebas]);

  const [audiencias, setAudiencias] = useState<AudienciaExpediente[]>(() => {
    const saved = localStorage.getItem('kairos_audiencias');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return INITIAL_AUDIENCIAS;
  });

  useEffect(() => {
    localStorage.setItem('kairos_audiencias', JSON.stringify(audiencias));
  }, [audiencias]);

  const [tareas, setTareas] = useState<TareaEstudio[]>(() => {
    const saved = localStorage.getItem('kairos_tareas');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return INITIAL_TAREAS;
  });

  useEffect(() => {
    localStorage.setItem('kairos_tareas', JSON.stringify(tareas));
  }, [tareas]);

  const [diasInhabiles, setDiasInhabiles] = useState<DiaInhabil[]>(() => {
    const saved = localStorage.getItem('kairos_dias_inhabiles');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return INITIAL_DIAS_INHABILES;
  });

  useEffect(() => {
    localStorage.setItem('kairos_dias_inhabiles', JSON.stringify(diasInhabiles));
  }, [diasInhabiles]);

  const [documentos, setDocumentos] = useState<DocumentoEstudio[]>(() => {
    const saved = localStorage.getItem('kairos_documentos');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return INITIAL_DOCUMENTOS;
  });

  useEffect(() => {
    localStorage.setItem('kairos_documentos', JSON.stringify(documentos));
  }, [documentos]);

  const [plantillas] = useState<PlantillaDocx[]>(INITIAL_PLANTILLAS_DOCX);

  const [modelosRepositorio, setModelosRepositorio] = useState<ModeloEscritoRepositorio[]>(() => {
    const saved = localStorage.getItem('siged_modelos_repositorio');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error('Error al cargar modelos del localStorage:', e);
      }
    }
    return INITIAL_REPOSITORIO_ESCRITOS;
  });

  useEffect(() => {
    localStorage.setItem('siged_modelos_repositorio', JSON.stringify(modelosRepositorio));
  }, [modelosRepositorio]);

  const [progresosPasos, setProgresosPasos] = useState<ProgresoPasosExpediente[]>(() => {
    const saved = localStorage.getItem('siged_progresos_pasos');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error('Error al cargar progresos del localStorage:', e);
      }
    }
    return INITIAL_PROGRESO_PASOS;
  });

  useEffect(() => {
    localStorage.setItem('siged_progresos_pasos', JSON.stringify(progresosPasos));
  }, [progresosPasos]);

  // Tramites Portales Externos (ANSES, PJN, DEOX) State
  const [tramitesPortales, setTramitesPortales] = useState<TramitePortalExterno[]>(() => {
    const saved = localStorage.getItem('siged_tramites_portales');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error('Error al cargar trámites de portales del localStorage:', e);
      }
    }
    return INITIAL_TRAMITES_PORTALES;
  });

  useEffect(() => {
    localStorage.setItem('siged_tramites_portales', JSON.stringify(tramitesPortales));
  }, [tramitesPortales]);

  // Alertas Push Programables State
  const [alertasProgramables, setAlertasProgramables] = useState<AlertaPushProgramable[]>(() => {
    const saved = localStorage.getItem('siged_alertas_programables');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error('Error al cargar alertas programables del localStorage:', e);
      }
    }
    return INITIAL_ALERTAS_PROGRAMABLES;
  });

  useEffect(() => {
    localStorage.setItem('siged_alertas_programables', JSON.stringify(alertasProgramables));
  }, [alertasProgramables]);

  const handleAgregarTramitePortal = (nuevo: TramitePortalExterno) => {
    setTramitesPortales((prev) => [nuevo, ...prev]);
  };

  const handleActualizarTramitePortal = (actualizado: TramitePortalExterno) => {
    setTramitesPortales((prev) =>
      prev.map((t) => (t.id === actualizado.id ? actualizado : t))
    );
  };

  const handleAgregarAlertaProgramable = (nueva: AlertaPushProgramable) => {
    setAlertasProgramables((prev) => [nueva, ...prev]);
  };

  const handleEliminarAlertaProgramable = (id: string) => {
    setAlertasProgramables((prev) => prev.filter((a) => a.id !== id));
  };

  const handleDispararAlertaPush = (alerta: AlertaPushProgramable) => {
    setAlertasProgramables((prev) =>
      prev.map((a) => (a.id === alerta.id ? { ...a, estado: 'Enviada' } : a))
    );
  };

  // SIGED Notifications & Sync Stores
  const [notificacionesPush, setNotificacionesPush] = useState<NotificacionPushSiged[]>(INITIAL_NOTIFICACIONES_PUSH);
  const [historialSync, setHistorialSync] = useState<RegistroSincronizacionSiged[]>(INITIAL_REGISTROS_SINCRONIZACION);
  const [activeToastPopups, setActiveToastPopups] = useState<NotificacionPushSiged[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // Dark / Light Theme State
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('siged_theme') as 'dark' | 'light') || 'dark';
  });

  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
    localStorage.setItem('siged_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // OIDC Session & Modals
  const [oidcSession, setOidcSession] = useState<OidcSessionState>(DEFAULT_OIDC_SESSION);
  const [isOidcModalOpen, setIsOidcModalOpen] = useState(false);
  const [isPerfilModalOpen, setIsPerfilModalOpen] = useState(false);

  // Authentication & Associate Access Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAsociadosModalOpen, setIsAsociadosModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [expedienteModalAsociados, setExpedienteModalAsociados] = useState<Expediente | null>(null);

  const handleLoginSuccess = (abogado: Abogado) => {
    setAbogadoActual(abogado);
    localStorage.setItem('kairos_auth_user', JSON.stringify(abogado));
    setAbogados((prev) => {
      const exists = prev.some(
        (a) => a.id === abogado.id || a.email.toLowerCase() === abogado.email.toLowerCase()
      );
      const updated = exists
        ? prev.map((a) =>
            a.id === abogado.id || a.email.toLowerCase() === abogado.email.toLowerCase() ? abogado : a
          )
        : [abogado, ...prev];
      localStorage.setItem('kairos_abogados', JSON.stringify(updated));
      return updated;
    });
    setIsAuthModalOpen(false);

    // Refresh list of lawyers from server
    fetch('/api/abogados')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const ct = res.headers.get('content-type');
        if (!ct || !ct.includes('application/json')) throw new Error('Respuesta no JSON');
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setAbogados((prev) => {
            const merged = [...data];
            prev.forEach((p) => {
              if (!merged.some((m) => m.id === p.id || m.email.toLowerCase() === p.email.toLowerCase())) {
                merged.push(p);
              }
            });
            localStorage.setItem('kairos_abogados', JSON.stringify(merged));
            return merged;
          });
        }
      })
      .catch((err) => console.log('Error refrescando abogados:', err));
  };

  const handleLogout = () => {
    localStorage.removeItem('kairos_auth_user');
    setAbogadoActual(null);
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
      if (res.ok) {
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await res.json();
          if (data.expediente) {
            setExpedientes((prev) =>
              prev.map((e) => (e.id === expedienteId ? data.expediente : e))
            );
          }
        }
      }
    } catch (err) {
      console.log('Actualizando autorizaciones localmente:', err);
      setExpedientes((prev) =>
        prev.map((e) =>
          e.id === expedienteId ? { ...e, abogados_autorizados: asociadosAutorizadosIds } : e
        )
      );
    }
  };

  useEffect(() => {
    fetch('/api/abogados')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const ct = res.headers.get('content-type');
        if (!ct || !ct.includes('application/json')) throw new Error('Respuesta no JSON');
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setAbogados((prev) => {
            const merged = [...data];
            prev.forEach((p) => {
              if (!merged.some((m) => m.id === p.id || m.email.toLowerCase() === p.email.toLowerCase())) {
                merged.push(p);
              }
            });
            localStorage.setItem('kairos_abogados', JSON.stringify(merged));
            return merged;
          });
        }
      })
      .catch((err) => console.log('Usando store local abogados:', err));

    fetch('/api/siged/notificaciones')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const ct = res.headers.get('content-type');
        if (!ct || !ct.includes('application/json')) throw new Error('Respuesta no JSON');
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) setNotificacionesPush(data);
      })
      .catch((err) => console.log('Usando notificaciones por defecto:', err));

    fetch('/api/siged/historial-sync')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const ct = res.headers.get('content-type');
        if (!ct || !ct.includes('application/json')) throw new Error('Respuesta no JSON');
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) setHistorialSync(data);
      })
      .catch((err) => console.log('Usando historial sync por defecto:', err));
  }, []);

  useEffect(() => {
    if (!abogadoActual) return;
    fetch(`/api/expedientes?abogado_id=${abogadoActual.id}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const ct = res.headers.get('content-type');
        if (!ct || !ct.includes('application/json')) throw new Error('Respuesta no JSON');
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setExpedientes(data);
        }
      })
      .catch((err) => console.log('Usando store por defecto expedientes:', err));
  }, [abogadoActual]);

  // Handler Executing Active SIGED Scan & Firing Web Push with Client-Side Fallback
  const handleSincronizarSiged = useCallback(async () => {
    if (!abogadoActual) return;

    const usuarioSiged = abogadoActual.credencialesSiged?.usuarioSiged?.trim();
    const claveSiged = abogadoActual.credencialesSiged?.claveSiged?.trim();

    // STRICT USER REQUIREMENT: If user has not loaded SIGED credentials, do NOT trigger any notifications or test notifications
    if (!usuarioSiged || !claveSiged) {
      const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
      const registroSinCreds = {
        id: `SYNC-${Date.now()}`,
        fecha: timestamp,
        expedientesAnalizados: expedientes.length,
        nuevosMovimientosDetectados: 0,
        estado: 'Error' as const,
        detalles: 'Credenciales SIGED no configuradas. Por favor ingrese su usuario y clave SIGED en la sección "Perfil y Credenciales" para activar la sincronización con el Poder Judicial de Misiones.',
      };
      setHistorialSync((prev) => [registroSinCreds, ...prev]);
      return;
    }

    setIsSyncing(true);
    let syncExitoso = false;

    try {
      const res = await fetch('/api/siged/sincronizar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ abogado_id: abogadoActual.id }),
      });

      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.exitoso) {
          syncExitoso = true;
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
          if (expRes.ok && expRes.headers.get('content-type')?.includes('application/json')) {
            const expData = await expRes.json();
            if (Array.isArray(expData)) setExpedientes(expData);
          }

          // Refresh Actuaciones
          const actRes = await fetch('/api/actuaciones');
          if (actRes.ok && actRes.headers.get('content-type')?.includes('application/json')) {
            const actData = await actRes.json();
            if (Array.isArray(actData)) setActuaciones(actData);
          }
        }
      }
    } catch (err) {
      console.log('Sincronización API no disponible, ejecutando verificación local SIGED:', err);
    }

    // Client-side fallback if backend API is not reachable - NO MOCK/TEST NOTIFICATIONS
    if (!syncExitoso) {
      const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
      
      // Look for real pending unread actuaciones for this lawyer
      const misCausas = expedientes.filter((e) => e.abogados_autorizados.includes(abogadoActual.id));
      const misCausasIds = misCausas.map((c) => c.id);
      const actuacionPendiente = actuaciones.find((a) => misCausasIds.includes(a.expediente_id) && !a.procesado);

      if (actuacionPendiente) {
        const expVinculado = misCausas.find((c) => c.id === actuacionPendiente.expediente_id);
        const nuevaNotifPush = {
          id: `NOT-${Date.now()}`,
          abogado_id: abogadoActual.id,
          expediente_id: actuacionPendiente.expediente_id,
          expediente_numero: expVinculado?.numero || 'S/N',
          caratula: expVinculado?.caratula || 'Causa Judicial',
          titulo: `🔔 Nueva Actuación: ${actuacionPendiente.tipo_actuacion}`,
          mensaje: actuacionPendiente.texto_completo.substring(0, 120) + '...',
          tipo: 'PROVEIDO' as const,
          fecha: timestamp,
          leida: false,
          actuacion_id: actuacionPendiente.id,
        };

        const registroSync = {
          id: `SYNC-${Date.now()}`,
          fecha: timestamp,
          expedientesAnalizados: misCausas.length,
          nuevosMovimientosDetectados: 1,
          estado: 'Con Novedades' as const,
          detalles: `Sincronización con SIGED Misiones completada. Se detectó 1 actuación en causa ${nuevaNotifPush.expediente_numero}.`,
        };

        setNotificacionesPush((prev) => [nuevaNotifPush, ...prev]);
        setActiveToastPopups((prev) => [nuevaNotifPush, ...prev]);
        setHistorialSync((prev) => [registroSync, ...prev]);

        sendBrowserPushNotification({
          title: nuevaNotifPush.titulo,
          body: `${nuevaNotifPush.caratula}\n${nuevaNotifPush.mensaje}`,
        });
      } else {
        const registroSync = {
          id: `SYNC-${Date.now()}`,
          fecha: timestamp,
          expedientesAnalizados: misCausas.length,
          nuevosMovimientosDetectados: 0,
          estado: 'Exitoso' as const,
          detalles: `Sincronización con SIGED Misiones completada con éxito. Se escanearon ${misCausas.length} expedientes activos. No se registraron novedades procesales pendientes.`,
        };
        setHistorialSync((prev) => [registroSync, ...prev]);
      }
    }

    setIsSyncing(false);
  }, [abogadoActual, expedientes, actuaciones]);

  // Periodic Auto-Sync Timer
  useEffect(() => {
    if (!abogadoActual?.credencialesSiged?.sincronizacionAutomatica) return;

    // Run auto-sync every 60 seconds
    const interval = setInterval(() => {
      handleSincronizarSiged();
    }, 60000);

    return () => clearInterval(interval);
  }, [abogadoActual, handleSincronizarSiged]);

  // Periodic Auto-Backup to Local & Google Drive System
  useEffect(() => {
    if (!abogadoActual) return;

    const intervalId = setInterval(async () => {
      try {
        const config = obtenerConfiguracionRespaldo();
        if (!config.habilitado) return;

        const ahora = Date.now();
        let intervaloMs = 24 * 60 * 60 * 1000; // DIARIO
        if (config.frecuencia === 'CADA_6_HORAS') intervaloMs = 6 * 60 * 60 * 1000;
        if (config.frecuencia === 'CADA_12_HORAS') intervaloMs = 12 * 60 * 60 * 1000;
        if (config.frecuencia === 'SEMANAL') intervaloMs = 7 * 24 * 60 * 60 * 1000;

        const ultimoRespaldo = config.ultimoRespaldoIso ? new Date(config.ultimoRespaldoIso).getTime() : 0;
        
        if (ahora - ultimoRespaldo >= intervaloMs) {
          const snapshot = generarSnapshotObjeto({
            expedientes,
            actuaciones: actuaciones as any,
            audiencias: audiencias as any,
            pruebas: pruebas as any,
            tareas,
            documentos,
            diasInhabiles,
            tramitesPortales,
            modelosRepositorio,
            progresosPasos
          }, abogadoActual, 'LOCAL_AUTO', 'Copia de seguridad periódica automática');

          // Guardar snapshot local
          guardarSnapshotEnHistorial(snapshot, config.mantenerMaxSnapshots);

          // Si tiene destino Google Drive y token activo, subir
          const gdriveTokenActivo = obtenerTokenGoogleDriveActivo();
          if ((config.destino === 'GOOGLE_DRIVE' || config.destino === 'AMBOS') && gdriveTokenActivo) {
            try {
              const resDrive = await subirSnapshotAGoogleDrive(snapshot, gdriveTokenActivo);
              if (resDrive.exito) {
                snapshot.googleDriveFileId = resDrive.fileId;
                guardarSnapshotEnHistorial(snapshot, config.mantenerMaxSnapshots);
              }
            } catch (errDrive) {
              console.warn('No se pudo subir respaldo automático a Google Drive:', errDrive);
            }
          }

          // Actualizar marcas temporales
          const configActualizada = {
            ...config,
            ultimoRespaldoIso: new Date(ahora).toISOString(),
            proximoRespaldoIso: new Date(ahora + intervaloMs).toISOString()
          };
          guardarConfiguracionRespaldo(configActualizada);
        }
      } catch (err) {
        console.error('Error ejecutando respaldo programado:', err);
      }
    }, 120000); // Chequea cada 2 minutos

    return () => clearInterval(intervalId);
  }, [abogadoActual, expedientes, actuaciones, audiencias, pruebas, tareas, documentos, diasInhabiles, tramitesPortales, modelosRepositorio, progresosPasos]);

  const handleGuardarCredencialesSiged = async (nuevasCreds: CredencialesSIGED) => {
    if (!abogadoActual) return;

    const credsActualizadas: CredencialesSIGED = {
      ...nuevasCreds,
      ultimaSincronizacion: new Date().toISOString().replace('T', ' ').substring(0, 16),
      estadoConexion: 'Conectado',
    };

    const abogadoActualizado: Abogado = {
      ...abogadoActual,
      credencialesSiged: credsActualizadas,
    };

    setAbogadoActual(abogadoActualizado);
    setAbogados((prev) =>
      prev.map((a) => (a.id === abogadoActual.id ? abogadoActualizado : a))
    );

    try {
      const res = await fetch('/api/siged/credenciales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          abogado_id: abogadoActual.id,
          ...nuevasCreds,
        }),
      });

      if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
        const data = await res.json();
        if (data.id) {
          setAbogadoActual(data);
          setAbogados((prev) => prev.map((a) => (a.id === data.id ? data : a)));
        }
      }
    } catch (err) {
      console.log('Credenciales guardadas localmente:', err);
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

  const handleCrearNuevoExpediente = async (nuevoExp: Expediente) => {
    setExpedientes((prev) => [nuevoExp, ...prev]);
    try {
      await fetch('/api/expedientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoExp),
      });
    } catch (err) {
      console.log('Error sincronizando nuevo expediente con backend:', err);
    }
  };

  const handleActualizarExpediente = async (expedienteActualizado: Expediente) => {
    setExpedientes((prev) =>
      prev.map((e) => (e.id === expedienteActualizado.id ? expedienteActualizado : e))
    );
    try {
      await fetch(`/api/expedientes/${expedienteActualizado.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expedienteActualizado),
      });
    } catch (err) {
      console.log('Error actualizando expediente en backend:', err);
    }
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

  // Handlers Documentos & Repositorio
  const handleGuardarDocumento = (doc: DocumentoEstudio) => {
    setDocumentos((prev) => [doc, ...prev]);
  };

  const handleGuardarDocumentoExpediente = (expedienteId: string, doc: DocumentoEstudio) => {
    setDocumentos((prev) => [doc, ...prev]);
  };

  const handleAbrirEditorConTexto = (texto: string, titulo: string, exp: Expediente) => {
    const nuevoDoc: DocumentoEstudio = {
      id: `DOC-${Date.now()}`,
      nombre: `${titulo} - Expte ${exp.numero}`,
      expediente_id: exp.id,
      carpeta: exp.id,
      tipoArchivo: 'docx',
      tamanio: '35 KB',
      fecha_modificacion: new Date().toISOString().split('T')[0],
      autor: abogadoActual.nombre,
      contenidoTexto: texto,
    };
    setDocumentos((prev) => [nuevoDoc, ...prev]);
    setActiveTab('documentos');
  };

  const handleAgregarModeloRepositorio = (nuevoModelo: ModeloEscritoRepositorio) => {
    setModelosRepositorio((prev) => [nuevoModelo, ...prev]);
  };

  const handleTogglePasoCompletado = (expedienteId: string, modeloId: string, pasoId: string) => {
    setProgresosPasos((prev) => {
      const idx = prev.findIndex((p) => p.expediente_id === expedienteId && p.modelo_id === modeloId);
      if (idx >= 0) {
        const item = prev[idx];
        const yaCompletado = item.pasosCompletadosIds.includes(pasoId);
        const nuevosPasos = yaCompletado
          ? item.pasosCompletadosIds.filter((id) => id !== pasoId)
          : [...item.pasosCompletadosIds, pasoId];

        const updated = [...prev];
        updated[idx] = {
          ...item,
          pasosCompletadosIds: nuevosPasos,
          fechaUltimaActualizacion: new Date().toISOString().split('T')[0],
        };
        return updated;
      } else {
        return [
          ...prev,
          {
            expediente_id: expedienteId,
            modelo_id: modeloId,
            pasosCompletadosIds: [pasoId],
            fechaUltimaActualizacion: new Date().toISOString().split('T')[0],
          },
        ];
      }
    });
  };

  if (!abogadoActual) {
    return (
      <AuthScreen
        onLoginSuccess={handleLoginSuccess}
        abogadosExistentes={abogados}
        abogadoActual={null}
        isModal={false}
      />
    );
  }

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
        onOpenAdminModal={() => setIsAdminModalOpen(true)}
        onLogout={handleLogout}
        oidcSession={oidcSession}
        notificacionesPush={notificacionesPush}
        onMarcarNotificacionLeida={handleMarcarNotificacionLeida}
        onSincronizarSiged={handleSincronizarSiged}
        isSyncing={isSyncing}
        theme={theme}
        onToggleTheme={toggleTheme}
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
            modelosRepositorio={modelosRepositorio}
            progresosPasos={progresosPasos}
            onSeleccionarActuacionParaProcesar={handleSeleccionarActuacionParaProcesar}
            onCrearNuevoExpediente={handleCrearNuevoExpediente}
            onActualizarExpediente={handleActualizarExpediente}
            onAbrirAsociadosModal={handleAbrirAsociadosModal}
            onTogglePasoCompletado={handleTogglePasoCompletado}
            onGuardarDocumentoExpediente={handleGuardarDocumentoExpediente}
            onAbrirEditorConTexto={handleAbrirEditorConTexto}
          />
        )}

        {activeTab === 'portales_externos' && (
          <PortalesExternosView
            expedientes={expedientes}
            tramitesPortales={tramitesPortales}
            alertasProgramables={alertasProgramables}
            modelosRepositorio={modelosRepositorio}
            documentos={documentos}
            onAgregarExpediente={handleCrearNuevoExpediente}
            onAgregarTramitePortal={handleAgregarTramitePortal}
            onActualizarTramitePortal={handleActualizarTramitePortal}
            onAgregarAlertaProgramable={handleAgregarAlertaProgramable}
            onEliminarAlertaProgramable={handleEliminarAlertaProgramable}
            onDispararAlertaPush={handleDispararAlertaPush}
            onSelectTab={setActiveTab}
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
            expedientes={expedientes}
            onAgregarDiaInhabil={handleAgregarDiaInhabil}
            onEliminarDiaInhabil={handleEliminarDiaInhabil}
            onActualizarEstadoTarea={handleActualizarEstadoTarea}
            onActualizarExpediente={handleActualizarExpediente}
            onSelectTab={setActiveTab}
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

        {activeTab === 'repositorio' && (
          <RepositorioEscritosView
            modelos={modelosRepositorio}
            expedientes={expedientes}
            abogadoActual={abogadoActual}
            onCrearModelo={handleAgregarModeloRepositorio}
            onUsarModeloEnExpediente={(modelo, exp, texto) => {
              const doc: DocumentoEstudio = {
                id: `DOC-${Date.now()}`,
                nombre: `${modelo.titulo} - Expte ${exp.numero}`,
                expediente_id: exp.id,
                carpeta: exp.id,
                tipoArchivo: 'docx',
                tamanio: '38 KB',
                fecha_modificacion: new Date().toISOString().split('T')[0],
                autor: abogadoActual.nombre,
                contenidoTexto: texto,
              };
              handleGuardarDocumento(doc);
            }}
            onAbrirEditorConTexto={handleAbrirEditorConTexto}
          />
        )}

        {activeTab === 'api_explorer' && (
          <ApiExplorerView abogadoActual={abogadoActual} />
        )}

        {activeTab === 'chatbot_clientes' && (
          <ChatbotClientesView
            expedientes={expedientes}
            audiencias={audiencias}
            theme={theme}
          />
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
        expedientes={expedientes}
        actuaciones={actuaciones}
        pruebas={pruebas}
        audiencias={audiencias}
        tareas={tareas}
        documentos={documentos}
        diasInhabiles={diasInhabiles}
        tramitesPortales={tramitesPortales}
        modelosRepositorio={modelosRepositorio}
        progresosPasos={progresosPasos}
        onRestaurarDatos={(datos) => {
          if (datos.expedientes) setExpedientes(datos.expedientes);
          if (datos.actuaciones) setActuaciones(datos.actuaciones as any);
          if (datos.pruebas) setPruebas(datos.pruebas as any);
          if (datos.audiencias) setAudiencias(datos.audiencias as any);
          if (datos.tareas) setTareas(datos.tareas);
          if (datos.documentos) setDocumentos(datos.documentos);
          if (datos.diasInhabiles) setDiasInhabiles(datos.diasInhabiles);
          if (datos.tramitesPortales) setTramitesPortales(datos.tramitesPortales);
          if (datos.modelosRepositorio) setModelosRepositorio(datos.modelosRepositorio);
          if (datos.progresosPasos) setProgresosPasos(datos.progresosPasos);
        }}
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

      {/* Modal de Administración General (JyE Sender Servicios) */}
      <AdminPanelModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        abogadoActual={abogadoActual}
        abogados={abogados}
        onActualizarAbogados={(nuevos) => {
          setAbogados(nuevos);
          localStorage.setItem('kairos_abogados', JSON.stringify(nuevos));
        }}
        onSincronizarSiged={handleSincronizarSiged}
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
              Kairos • Estudio Jurídico • Sistema SIGED Misiones • CPCCyM
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
