import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, Cloud, HardDrive, RefreshCw, Clock, CheckCircle2, 
  AlertTriangle, Upload, Download, Trash2, Calendar, FileJson, 
  Settings2, Eye, Database, Info, ExternalLink, Sparkles, Folder
} from 'lucide-react';
import { 
  BackupSnapshot, ConfiguracionRespaldoAutomatico, FrecuenciaRespaldo, 
  DestinoRespaldo, Abogado, Expediente, ActuacionProcesal, Audiencia, 
  MedioPrueba, TareaEstudio, DocumentoEstudio, DiaInhabil, TramitePortalExterno,
  ModeloEscritoRepositorio, ProgresoPasosExpediente
} from '../types';
import { 
  obtenerConfiguracionRespaldo, guardarConfiguracionRespaldo, 
  obtenerSnapshotsAlmacenados, guardarSnapshotEnHistorial, 
  eliminarSnapshotDeHistorial, generarSnapshotObjeto, 
  descargarSnapshotEnComputadora, DatosCompletosEstudio
} from '../lib/backupManager';
import { 
  conectarGoogleDriveOAuth, subirSnapshotAGoogleDrive, 
  listarRespaldosGoogleDrive, descargarSnapshotDeDrive, GoogleDriveFileMeta 
} from '../lib/googleDriveService';

interface BackupRestoreManagerProps {
  abogadoActual: Abogado;
  expedientes: Expediente[];
  actuaciones: ActuacionProcesal[];
  audiencias: Audiencia[];
  pruebas: MedioPrueba[];
  tareas: TareaEstudio[];
  documentos: DocumentoEstudio[];
  diasInhabiles: DiaInhabil[];
  tramitesPortales?: TramitePortalExterno[];
  modelosRepositorio?: ModeloEscritoRepositorio[];
  progresosPasos?: ProgresoPasosExpediente[];
  onRestaurarDatos: (datos: {
    expedientes: Expediente[];
    actuaciones: ActuacionProcesal[];
    audiencias: Audiencia[];
    pruebas: MedioPrueba[];
    tareas: TareaEstudio[];
    documentos: DocumentoEstudio[];
    diasInhabiles: DiaInhabil[];
    tramitesPortales?: TramitePortalExterno[];
    modelosRepositorio?: ModeloEscritoRepositorio[];
    progresosPasos?: ProgresoPasosExpediente[];
  }) => void;
}

export const BackupRestoreManager: React.FC<BackupRestoreManagerProps> = ({
  abogadoActual,
  expedientes,
  actuaciones,
  audiencias,
  pruebas,
  tareas,
  documentos,
  diasInhabiles,
  tramitesPortales = [],
  modelosRepositorio = [],
  progresosPasos = [],
  onRestaurarDatos,
}) => {
  const [config, setConfig] = useState<ConfiguracionRespaldoAutomatico>(obtenerConfiguracionRespaldo());
  const [snapshotsLocales, setSnapshotsLocales] = useState<BackupSnapshot[]>(obtenerSnapshotsAlmacenados());
  const [snapshotsDrive, setSnapshotsDrive] = useState<GoogleDriveFileMeta[]>([]);
  
  const [activeSubTab, setActiveSubTab] = useState<'historial' | 'configuracion' | 'google_drive' | 'restaurar_archivo'>('historial');
  const [isProcessing, setIsProcessing] = useState(false);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  // Modal para confirmar restauración
  const [snapshotParaRestaurar, setSnapshotParaRestaurar] = useState<BackupSnapshot | null>(null);
  const [detalleSnapshotVer, setDetalleSnapshotVer] = useState<BackupSnapshot | null>(null);

  // Google Drive state
  const [gdriveToken, setGdriveToken] = useState<string | null>(sessionStorage.getItem('gdrive_access_token'));
  const [isConnectingDrive, setIsConnectingDrive] = useState(false);

  // Input file ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Al montar, si hay token de Google Drive, listar archivos
    if (gdriveToken) {
      cargarRespaldosDeDrive(gdriveToken);
    }
  }, [gdriveToken]);

  const recopilarDatosActuales = (): DatosCompletosEstudio => ({
    expedientes,
    actuaciones,
    audiencias,
    pruebas,
    tareas,
    documentos,
    diasInhabiles,
    tramitesPortales,
    modelosRepositorio,
    progresosPasos,
  });

  const handleCrearRespaldoAhora = async (destino: DestinoRespaldo = config.destino) => {
    setIsProcessing(true);
    setMensajeError(null);
    setMensajeExito(null);

    try {
      const datos = recopilarDatosActuales();
      const snapshot = generarSnapshotObjeto(
        datos, 
        abogadoActual, 
        destino === 'GOOGLE_DRIVE' ? 'GOOGLE_DRIVE' : 'LOCAL_MANUAL',
        `Respaldo manual solicitado por ${abogadoActual.nombre} (${datos.expedientes.length} expedientes)`
      );

      // 1. Guardar en historial local / localStorage
      const actualizados = guardarSnapshotEnHistorial(snapshot, config.mantenerMaxSnapshots);
      setSnapshotsLocales(actualizados);

      // 2. Si el destino incluye LOCAL_PC, descargar archivo JSON
      if (destino === 'LOCAL_PC' || destino === 'AMBOS') {
        descargarSnapshotEnComputadora(snapshot);
      }

      // 3. Si el destino incluye GOOGLE_DRIVE
      let driveMsg = '';
      if (destino === 'GOOGLE_DRIVE' || destino === 'AMBOS') {
        if (!gdriveToken) {
          driveMsg = ' (Pendiente Google Drive: Conecte su cuenta para sincronización en la nube)';
        } else {
          const driveRes = await subirSnapshotAGoogleDrive(snapshot, gdriveToken);
          if (driveRes.exito) {
            driveMsg = ' y subido exitosamente a Google Drive';
            cargarRespaldosDeDrive(gdriveToken);
          } else {
            driveMsg = ` (Aviso Drive: ${driveRes.error})`;
          }
        }
      }

      // Actualizar fecha de último respaldo
      const nuevaConfig = {
        ...config,
        ultimoRespaldoIso: snapshot.fechaIso,
      };
      setConfig(nuevaConfig);
      guardarConfiguracionRespaldo(nuevaConfig);

      setMensajeExito(`¡Copia de seguridad generada con éxito! [${snapshot.fechaHoraLegible}]${driveMsg}`);
      setTimeout(() => setMensajeExito(null), 5000);
    } catch (e: any) {
      setMensajeError(`Error al generar respaldo: ${e.message || e}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConectarGoogleDrive = async () => {
    setIsConnectingDrive(true);
    setMensajeError(null);
    try {
      const auth = await conectarGoogleDriveOAuth();
      setGdriveToken(auth.accessToken);
      const nuevaConfig = {
        ...config,
        googleDriveToken: auth.accessToken,
      };
      setConfig(nuevaConfig);
      guardarConfiguracionRespaldo(nuevaConfig);
      await cargarRespaldosDeDrive(auth.accessToken);
      setMensajeExito('¡Cuenta de Google Drive autorizada correctamente para respaldos!');
      setTimeout(() => setMensajeExito(null), 4000);
    } catch (err: any) {
      setMensajeError(err?.message || 'No se pudo autorizar Google Drive. Verifique los permisos en el navegador.');
    } finally {
      setIsConnectingDrive(false);
    }
  };

  const cargarRespaldosDeDrive = async (token: string) => {
    try {
      const files = await listarRespaldosGoogleDrive(token);
      setSnapshotsDrive(files);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDescargarDeDriveYRestaurar = async (fileId: string) => {
    if (!gdriveToken) return;
    setIsProcessing(true);
    try {
      const snapshot = await descargarSnapshotDeDrive(fileId, gdriveToken);
      setSnapshotParaRestaurar(snapshot);
    } catch (e: any) {
      setMensajeError(`Error al descargar archivo de Google Drive: ${e?.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubirArchivoJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const contenido = event.target?.result as string;
        const parsed = JSON.parse(contenido);

        // Detectar si es un formato BackupSnapshot estructurado o un dump JSON previo
        let snapshotValido: BackupSnapshot;

        if (parsed.datos && parsed.fechaIso && parsed.estadisticas) {
          snapshotValido = parsed as BackupSnapshot;
        } else if (parsed.expedientes && Array.isArray(parsed.expedientes)) {
          // Adaptar formato antiguo
          const timestamp = new Date().toISOString();
          snapshotValido = {
            id: `BKP-IMPORT-${Date.now()}`,
            fechaIso: timestamp,
            fechaHoraLegible: new Date().toLocaleString('es-AR'),
            origen: 'LOCAL_MANUAL',
            versionSistema: 'Kairós Legal (Importado)',
            tamanoBytes: file.size,
            tamanoLegible: `${(file.size / 1024).toFixed(1)} KB`,
            autorNombre: parsed._metadatos_seguridad?.exportado_por?.nombre || 'Archivo Externo',
            autorMatricula: parsed._metadatos_seguridad?.exportado_por?.matricula || '-',
            descripcion: `Archivo importado desde ${file.name}`,
            estadisticas: {
              totalExpedientes: parsed.expedientes?.length || 0,
              totalActuaciones: parsed.actuaciones?.length || 0,
              totalAudiencias: parsed.audiencias?.length || 0,
              totalPruebas: parsed.pruebas?.length || 0,
              totalTareas: parsed.tareas?.length || 0,
              totalDocumentos: parsed.documentos?.length || 0,
            },
            datos: {
              expedientes: parsed.expedientes || [],
              actuaciones: parsed.actuaciones || [],
              audiencias: parsed.audiencias || [],
              pruebas: parsed.pruebas || [],
              tareas: parsed.tareas || [],
              documentos: parsed.documentos || [],
              diasInhabiles: parsed.dias_inhabiles_personalizados || parsed.diasInhabiles || [],
              tramitesPortales: parsed.tramitesPortales || [],
              modelosRepositorio: parsed.modelosRepositorio || [],
              progresosPasos: parsed.progresosPasos || [],
            }
          };
        } else {
          throw new Error('El archivo seleccionado no posee una estructura válida de base de datos Kairós.');
        }

        // Abrir diálogo de confirmación de restauración
        setSnapshotParaRestaurar(snapshotValido);
      } catch (err: any) {
        setMensajeError(`Error al leer el archivo de respaldo: ${err.message}`);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleEjecutarRestauracionConfirmada = () => {
    if (!snapshotParaRestaurar) return;

    try {
      const d = snapshotParaRestaurar.datos;
      onRestaurarDatos({
        expedientes: d.expedientes || [],
        actuaciones: d.actuaciones || [],
        audiencias: d.audiencias || [],
        pruebas: d.pruebas || [],
        tareas: d.tareas || [],
        documentos: d.documentos || [],
        diasInhabiles: d.diasInhabiles || [],
        tramitesPortales: d.tramitesPortales || [],
        modelosRepositorio: d.modelosRepositorio || [],
        progresosPasos: d.progresosPasos || [],
      });

      // Agregar a historial como snapshot restaurado
      const snapActualizado: BackupSnapshot = {
        ...snapshotParaRestaurar,
        id: `RESTORE-${Date.now()}`,
        origen: 'CLOUD_RESTORE',
        descripcion: `Restaurado el ${new Date().toLocaleString('es-AR')} desde respaldo del ${snapshotParaRestaurar.fechaHoraLegible}`,
      };
      const nuevos = guardarSnapshotEnHistorial(snapActualizado, config.mantenerMaxSnapshots);
      setSnapshotsLocales(nuevos);

      setMensajeExito(`¡Base de datos restaurada con éxito al estado del ${snapshotParaRestaurar.fechaHoraLegible}! (${snapshotParaRestaurar.estadisticas.totalExpedientes} causas restauradas)`);
      setSnapshotParaRestaurar(null);
      setTimeout(() => setMensajeExito(null), 6000);
    } catch (e: any) {
      setMensajeError(`Fallo al aplicar la restauración: ${e.message}`);
    }
  };

  const handleEliminarSnapshot = (id: string) => {
    if (confirm('¿Está seguro de eliminar este punto de respaldo del historial local?')) {
      const actualizados = eliminarSnapshotDeHistorial(id);
      setSnapshotsLocales(actualizados);
    }
  };

  const handleGuardarConfiguracion = (nuevaConfig: ConfiguracionRespaldoAutomatico) => {
    setConfig(nuevaConfig);
    guardarConfiguracionRespaldo(nuevaConfig);
    setMensajeExito('¡Configuración de frecuencia y destino de respaldo actualizada!');
    setTimeout(() => setMensajeExito(null), 3500);
  };

  return (
    <div className="space-y-4 font-mono">
      {/* Header Banner */}
      <div className="bg-slate-950/90 p-4 rounded-xl border border-slate-800 space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-emerald-600/20 text-emerald-400 border border-emerald-500/40 rounded-xl">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center space-x-2">
                <span>Centro de Respaldos & Restauración de Memoria</span>
                <span className="text-[9px] bg-blue-900/60 text-blue-300 border border-blue-700/50 px-2 py-0.5 rounded font-bold">
                  Google Cloud • Firebase • Google Drive • Local PC
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 font-sans">
                Protección integral contra pérdidas, fallas de hardware y auditoría de causas judiciales.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => handleCrearRespaldoAhora('AMBOS')}
              disabled={isProcessing}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center space-x-2 shadow-lg shadow-emerald-950/60 transition-all cursor-pointer disabled:opacity-50"
              title="Generar Respaldo Inmediato en PC y Nube"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
              <span>Crear Respaldo Ahora</span>
            </button>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-[11px]">
          <div className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">Frecuencia Automática:</span>
            <span className="text-blue-400 font-bold">
              {config.frecuencia === 'DIARIO' && 'Diaria (24 hs)'}
              {config.frecuencia === 'EN_CADA_CAMBIO' && 'En Cada Modificación'}
              {config.frecuencia === 'CADA_6_HORAS' && 'Cada 6 Horas'}
              {config.frecuencia === 'CADA_12_HORAS' && 'Cada 12 Horas'}
              {config.frecuencia === 'SEMANAL' && 'Semanal'}
              {config.frecuencia === 'MANUAL' && 'Solo Manual'}
            </span>
          </div>

          <div className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">Destino Configurado:</span>
            <span className="text-emerald-400 font-bold">
              {config.destino === 'AMBOS' && 'Google Drive + PC'}
              {config.destino === 'GOOGLE_DRIVE' && 'Google Drive (Nube)'}
              {config.destino === 'LOCAL_PC' && 'Computadora Local (JSON)'}
            </span>
          </div>

          <div className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">Último Respaldo:</span>
            <span className="text-amber-300 font-bold">
              {config.ultimoRespaldoIso ? new Date(config.ultimoRespaldoIso).toLocaleString('es-AR') : 'Nunca'}
            </span>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {mensajeExito && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-500/60 rounded-xl text-emerald-300 text-xs flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{mensajeExito}</span>
        </div>
      )}

      {mensajeError && (
        <div className="p-3 bg-red-950/80 border border-red-500/60 rounded-xl text-red-300 text-xs flex items-center space-x-2 animate-in fade-in">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{mensajeError}</span>
        </div>
      )}

      {/* Sub Tabs Navigation */}
      <div className="flex border-b border-slate-800 text-xs space-x-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setActiveSubTab('historial')}
          className={`px-3 py-2 rounded-t-lg font-bold transition-colors flex items-center space-x-2 ${
            activeSubTab === 'historial'
              ? 'bg-slate-900 text-blue-400 border-t-2 border-blue-500'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Historial de Respaldos ({snapshotsLocales.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('google_drive')}
          className={`px-3 py-2 rounded-t-lg font-bold transition-colors flex items-center space-x-2 ${
            activeSubTab === 'google_drive'
              ? 'bg-slate-900 text-emerald-400 border-t-2 border-emerald-500'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Cloud className="w-3.5 h-3.5" />
          <span>Google Drive Cloud</span>
          {gdriveToken && <span className="w-2 h-2 rounded-full bg-emerald-400"></span>}
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('configuracion')}
          className={`px-3 py-2 rounded-t-lg font-bold transition-colors flex items-center space-x-2 ${
            activeSubTab === 'configuracion'
              ? 'bg-slate-900 text-purple-400 border-t-2 border-purple-500'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Settings2 className="w-3.5 h-3.5" />
          <span>Frecuencia & Destinos</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('restaurar_archivo')}
          className={`px-3 py-2 rounded-t-lg font-bold transition-colors flex items-center space-x-2 ${
            activeSubTab === 'restaurar_archivo'
              ? 'bg-slate-900 text-amber-400 border-t-2 border-amber-500'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Restaurar Archivo .JSON</span>
        </button>
      </div>

      {/* TAB 1: HISTORIAL DE PUNTOS DE RESTAURACIÓN */}
      {activeSubTab === 'historial' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 pb-1">
            <span>Puntos de restauración registrados en este dispositivo:</span>
            <span>Total actual: {expedientes.length} causas activas</span>
          </div>

          {snapshotsLocales.length === 0 ? (
            <div className="p-8 text-center bg-slate-950/60 rounded-xl border border-dashed border-slate-800 space-y-3">
              <Database className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">Aún no hay puntos de respaldo registrados.</p>
              <button
                type="button"
                onClick={() => handleCrearRespaldoAhora()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold"
              >
                Crear Primer Punto de Respaldo
              </button>
            </div>
          ) : (
            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {snapshotsLocales.map((snap) => (
                <div
                  key={snap.id}
                  className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-slate-100">{snap.fechaHoraLegible}</span>
                      <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                        snap.origen === 'GOOGLE_DRIVE' 
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : snap.origen === 'CLOUD_RESTORE'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-blue-950 text-blue-300 border border-blue-800'
                      }`}>
                        {snap.origen}
                      </span>
                      <span className="text-[10px] text-slate-500 font-normal">({snap.tamanoLegible})</span>
                    </div>

                    <div className="text-[11px] text-slate-400 font-sans">{snap.descripcion}</div>

                    <div className="flex flex-wrap items-center gap-2 pt-1 text-[10px] text-slate-400">
                      <span className="text-slate-300 font-bold">{snap.estadisticas.totalExpedientes} Expedientes</span>
                      <span>•</span>
                      <span>{snap.estadisticas.totalActuaciones} Actuaciones</span>
                      <span>•</span>
                      <span>{snap.estadisticas.totalAudiencias} Audiencias</span>
                      <span>•</span>
                      <span>{snap.estadisticas.totalDocumentos} Docs</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => setDetalleSnapshotVer(snap)}
                      className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg text-xs"
                      title="Ver detalle del snapshot"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => descargarSnapshotEnComputadora(snap)}
                      className="p-1.5 bg-slate-900 hover:bg-slate-800 text-blue-400 rounded-lg text-xs"
                      title="Descargar copia JSON a la computadora"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setSnapshotParaRestaurar(snap)}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow"
                      title="Restaurar base de datos a este punto exacto en el tiempo"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Restaurar</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleEliminarSnapshot(snap.id)}
                      className="p-1.5 bg-slate-900 hover:bg-red-950/80 text-red-400 rounded-lg text-xs"
                      title="Eliminar de historial"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: GOOGLE DRIVE CLOUD */}
      {activeSubTab === 'google_drive' && (
        <div className="space-y-4">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-emerald-950/70 text-emerald-400 border border-emerald-600/40 rounded-xl">
                  <Cloud className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-100 uppercase">
                    Integración con Google Drive de su Cuenta
                  </h4>
                  <p className="text-[11px] text-slate-400 font-sans">
                    Guarda automáticamente copias cifradas en su carpeta privada de Google Drive: <strong>{config.googleDriveFolder}</strong>.
                  </p>
                </div>
              </div>

              {gdriveToken ? (
                <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-600/50 px-2.5 py-1 rounded-full font-bold flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>Conectado</span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleConectarGoogleDrive}
                  disabled={isConnectingDrive}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center space-x-2 shadow-lg cursor-pointer"
                >
                  <Cloud className="w-3.5 h-3.5" />
                  <span>{isConnectingDrive ? 'Conectando...' : 'Conectar Google Drive'}</span>
                </button>
              )}
            </div>

            {gdriveToken && (
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400">Acceso OAuth2 autorizado para archivos creados por Kairós.</span>
                <button
                  type="button"
                  onClick={() => handleConectarGoogleDrive()}
                  className="text-blue-400 hover:underline text-[11px]"
                >
                  Renovar autorización / Cambiar cuenta
                </button>
              </div>
            )}
          </div>

          {/* Archivos en Google Drive */}
          {gdriveToken && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span className="font-bold flex items-center space-x-1.5">
                  <Folder className="w-4 h-4 text-amber-400" />
                  <span>Respaldos en la Nube (Google Drive)</span>
                </span>
                <button
                  type="button"
                  onClick={() => cargarRespaldosDeDrive(gdriveToken)}
                  className="text-blue-400 text-[11px] hover:underline flex items-center space-x-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Actualizar lista</span>
                </button>
              </div>

              {snapshotsDrive.length === 0 ? (
                <div className="p-6 text-center bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-2">
                  <p>No se encontraron respaldos previos en su Google Drive.</p>
                  <button
                    type="button"
                    onClick={() => handleCrearRespaldoAhora('GOOGLE_DRIVE')}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold"
                  >
                    Subir Primer Respaldo a Drive
                  </button>
                </div>
              ) : (
                <div className="space-y-2 max-h-[280px] overflow-y-auto">
                  {snapshotsDrive.map((file) => (
                    <div
                      key={file.id}
                      className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <strong className="block text-slate-200">{file.name}</strong>
                        <span className="text-[10px] text-slate-500">
                          Fecha Drive: {new Date(file.createdTime).toLocaleString('es-AR')} • {file.description || 'Respaldo Kairós'}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => handleDescargarDeDriveYRestaurar(file.id)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center space-x-1"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Descargar & Restaurar</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CONFIGURACIÓN DE FRECUENCIA Y DESTINOS */}
      {activeSubTab === 'configuracion' && (
        <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
          <h4 className="text-xs font-bold uppercase text-slate-200 border-b border-slate-800 pb-2 flex items-center space-x-2">
            <Settings2 className="w-4 h-4 text-purple-400" />
            <span>Configuración de Automatización de Respaldos</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Frecuencia Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300">
                Frecuencia Automática de Guardado:
              </label>
              <select
                value={config.frecuencia}
                onChange={(e) => handleGuardarConfiguracion({ ...config, frecuencia: e.target.value as FrecuenciaRespaldo })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
              >
                <option value="EN_CADA_CAMBIO">En cada modificación (Tiempo Real)</option>
                <option value="CADA_6_HORAS">Cada 6 horas</option>
                <option value="CADA_12_HORAS">Cada 12 horas</option>
                <option value="DIARIO">Diario (Cada 24 horas - Recomendado)</option>
                <option value="SEMANAL">Semanal</option>
                <option value="MANUAL">Solo cuando lo solicite manualmente</option>
              </select>
              <span className="text-[10px] text-slate-500 block">
                Determina cada cuánto el sistema emite una instantánea de resguardo.
              </span>
            </div>

            {/* Destino Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300">
                Destino Principal del Respaldo:
              </label>
              <select
                value={config.destino}
                onChange={(e) => handleGuardarConfiguracion({ ...config, destino: e.target.value as DestinoRespaldo })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
              >
                <option value="AMBOS">Google Drive + Computadora Local (Máxima Seguridad)</option>
                <option value="GOOGLE_DRIVE">Solo Google Drive (Nube Privada)</option>
                <option value="LOCAL_PC">Solo Computadora del Usuario (Descarga JSON)</option>
              </select>
              <span className="text-[10px] text-slate-500 block">
                Ubicación donde se preservarán los archivos descargados y sincronizados.
              </span>
            </div>

            {/* Mantener Max Snapshots */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300">
                Máximo de Puntos de Restauración en Memoria:
              </label>
              <select
                value={config.mantenerMaxSnapshots}
                onChange={(e) => handleGuardarConfiguracion({ ...config, mantenerMaxSnapshots: parseInt(e.target.value, 10) })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
              >
                <option value="5">Últimos 5 respaldos</option>
                <option value="10">Últimos 10 respaldos (Estándar)</option>
                <option value="20">Últimos 20 respaldos (Extendido)</option>
                <option value="50">Últimos 50 respaldos (Estudio Grande)</option>
              </select>
            </div>

            {/* Notificaciones Toggle */}
            <div className="space-y-1.5 flex flex-col justify-end">
              <label className="flex items-center space-x-2.5 p-2.5 bg-slate-900/80 rounded-xl border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.notificarAlGuardar}
                  onChange={(e) => handleGuardarConfiguracion({ ...config, notificarAlGuardar: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs text-slate-300 font-bold">
                  Mostrar aviso en pantalla al completar respaldos automáticos
                </span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: RESTAURAR DESDE ARCHIVO JSON LOCAL */}
      {activeSubTab === 'restaurar_archivo' && (
        <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
          <div className="text-center p-6 border-2 border-dashed border-slate-700 rounded-xl bg-slate-900/50 space-y-3">
            <Upload className="w-10 h-10 text-amber-400 mx-auto animate-bounce" />
            <div>
              <h4 className="text-xs font-bold uppercase text-slate-100">
                Cargar Archivo de Respaldo (.JSON) desde su Disco Local
              </h4>
              <p className="text-[11px] text-slate-400 max-w-md mx-auto font-sans mt-1">
                Seleccione un archivo previamente descargado (o copia de seguridad en pendrive) para restaurar la totalidad de causas, decretos y tareas.
              </p>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleSubirArchivoJSON}
              className="hidden"
              id="upload-backup-json"
            />

            <label
              htmlFor="upload-backup-json"
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold shadow-lg cursor-pointer transition-all"
            >
              <Upload className="w-4 h-4" />
              <span>Examinar y Cargar Archivo .JSON</span>
            </label>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMACIÓN DE RESTAURACIÓN CON FECHA Y HORA */}
      {snapshotParaRestaurar && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/60 rounded-2xl max-w-lg w-full shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 font-mono">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
              <div className="p-2.5 bg-amber-950 text-amber-400 border border-amber-600/50 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-amber-300 uppercase">
                  Confirmar Restauración de Base de Datos
                </h3>
                <p className="text-xs text-slate-400">
                  Volver al estado exacto guardado en el punto de respaldo
                </p>
              </div>
            </div>

            {/* Info Respaldo a Restaurar */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2.5 text-xs">
              <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                <span className="text-slate-400">Fecha y Hora del Respaldo:</span>
                <strong className="text-amber-300 font-bold text-sm">
                  {snapshotParaRestaurar.fechaHoraLegible}
                </strong>
              </div>

              <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                <span className="text-slate-400">Autor del Respaldo:</span>
                <span className="text-slate-200">
                  {snapshotParaRestaurar.autorNombre} ({snapshotParaRestaurar.autorMatricula})
                </span>
              </div>

              <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                <span className="text-slate-400">Origen:</span>
                <span className="text-blue-400 font-bold">{snapshotParaRestaurar.origen}</span>
              </div>

              {/* Estadísticas */}
              <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Expedientes</span>
                  <strong className="text-slate-100 text-sm">{snapshotParaRestaurar.estadisticas.totalExpedientes}</strong>
                </div>
                <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Actuaciones</span>
                  <strong className="text-blue-400 text-sm">{snapshotParaRestaurar.estadisticas.totalActuaciones}</strong>
                </div>
                <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Audiencias</span>
                  <strong className="text-emerald-400 text-sm">{snapshotParaRestaurar.estadisticas.totalAudiencias}</strong>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-amber-200/80 font-sans leading-relaxed">
              ⚠️ <strong>Advertencia:</strong> Esta acción reemplazará la memoria activa por los datos de este respaldo. Se recomienda generar una copia de seguridad del estado actual antes de proceder si posee cambios sin guardar.
            </p>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setSnapshotParaRestaurar(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleEjecutarRestauracionConfirmada}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-amber-950/80 flex items-center space-x-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Restaurar a esta Fecha y Hora</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PARA VER DETALLE COMPLETO DEL SNAPSHOT */}
      {detalleSnapshotVer && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full shadow-2xl p-5 space-y-4 font-mono">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-xs font-bold text-slate-100 uppercase">
                Metadatos del Punto de Respaldo: {detalleSnapshotVer.id}
              </h3>
              <button
                type="button"
                onClick={() => setDetalleSnapshotVer(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div><span className="text-slate-500">Fecha y Hora:</span> <strong className="text-slate-200">{detalleSnapshotVer.fechaHoraLegible}</strong></div>
              <div><span className="text-slate-500">ISO Timestamp:</span> <span className="text-slate-400 text-[10px]">{detalleSnapshotVer.fechaIso}</span></div>
              <div><span className="text-slate-500">Tamaño del archivo:</span> <span className="text-slate-300">{detalleSnapshotVer.tamanoLegible}</span></div>
              <div><span className="text-slate-500">Versión:</span> <span className="text-slate-300">{detalleSnapshotVer.versionSistema}</span></div>
              <div><span className="text-slate-500">Autor:</span> <span className="text-slate-300">{detalleSnapshotVer.autorNombre} ({detalleSnapshotVer.autorMatricula})</span></div>
              <div><span className="text-slate-500">Descripción:</span> <span className="text-slate-300">{detalleSnapshotVer.descripcion}</span></div>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => descargarSnapshotEnComputadora(detalleSnapshotVer)}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar JSON</span>
              </button>
              <button
                type="button"
                onClick={() => setDetalleSnapshotVer(null)}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
