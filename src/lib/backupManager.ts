import { 
  Expediente, ActuacionProcesal, Audiencia, 
  MedioPrueba, TareaEstudio, DocumentoEstudio, 
  DiaInhabil, Abogado, TramitePortalExterno, 
  ModeloEscritoRepositorio, ProgresoPasosExpediente,
  BackupSnapshot, ConfiguracionRespaldoAutomatico
} from '../types';

export const BACKUP_STORAGE_KEY = 'kairos_backups_snapshots';
export const BACKUP_CONFIG_KEY = 'kairos_backup_config';

export const DEFAULT_BACKUP_CONFIG: ConfiguracionRespaldoAutomatico = {
  habilitado: true,
  destino: 'AMBOS',
  frecuencia: 'DIARIO',
  mantenerMaxSnapshots: 10,
  ultimoRespaldoIso: undefined,
  proximoRespaldoIso: undefined,
  googleDriveFolder: 'Kairós Legal - Respaldos Automáticos',
  notificarAlGuardar: true,
};

export function obtenerConfiguracionRespaldo(): ConfiguracionRespaldoAutomatico {
  try {
    const saved = localStorage.getItem(BACKUP_CONFIG_KEY);
    if (saved) {
      return { ...DEFAULT_BACKUP_CONFIG, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error('Error al leer configuración de respaldo:', e);
  }
  return DEFAULT_BACKUP_CONFIG;
}

export function guardarConfiguracionRespaldo(config: ConfiguracionRespaldoAutomatico): void {
  try {
    localStorage.setItem(BACKUP_CONFIG_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Error al guardar configuración de respaldo:', e);
  }
}

export function obtenerSnapshotsAlmacenados(): BackupSnapshot[] {
  try {
    const saved = localStorage.getItem(BACKUP_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Error al leer snapshots almacenados:', e);
  }
  return [];
}

export function guardarSnapshotEnHistorial(snapshot: BackupSnapshot, maxSnapshots: number = 15): BackupSnapshot[] {
  const existentes = obtenerSnapshotsAlmacenados();
  // Evitar duplicados exactos y mantener orden cronológico descendente
  const filtrados = existentes.filter(s => s.id !== snapshot.id);
  const actualizados = [snapshot, ...filtrados].slice(0, maxSnapshots);
  try {
    localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(actualizados));
  } catch (e) {
    console.error('Error al persistir snapshots en localStorage:', e);
  }
  return actualizados;
}

export function eliminarSnapshotDeHistorial(snapshotId: string): BackupSnapshot[] {
  const existentes = obtenerSnapshotsAlmacenados();
  const actualizados = existentes.filter(s => s.id !== snapshotId);
  try {
    localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(actualizados));
  } catch (e) {
    console.error('Error al eliminar snapshot:', e);
  }
  return actualizados;
}

export interface DatosCompletosEstudio {
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
}

export function generarSnapshotObjeto(
  datos: DatosCompletosEstudio,
  abogadoActual: Abogado,
  origen: 'LOCAL_AUTO' | 'LOCAL_MANUAL' | 'GOOGLE_DRIVE' | 'CLOUD_RESTORE' = 'LOCAL_AUTO',
  descripcion?: string
): BackupSnapshot {
  const timestamp = new Date().toISOString();
  const fechaLegible = new Date().toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const id = `BKP-${Date.now()}`;
  const payloadSnapshot = {
    expedientes: datos.expedientes,
    actuaciones: datos.actuaciones,
    audiencias: datos.audiencias,
    pruebas: datos.pruebas,
    tareas: datos.tareas,
    documentos: datos.documentos,
    diasInhabiles: datos.diasInhabiles,
    tramitesPortales: datos.tramitesPortales || [],
    modelosRepositorio: datos.modelosRepositorio || [],
    progresosPasos: datos.progresosPasos || [],
  };

  const jsonStr = JSON.stringify(payloadSnapshot);
  const bytes = new Blob([jsonStr]).size;
  let tamanoFormateado = `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes > 1024 * 1024) {
    tamanoFormateado = `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  const snapshot: BackupSnapshot = {
    id,
    fechaIso: timestamp,
    fechaHoraLegible: fechaLegible,
    origen,
    versionSistema: 'Kairós Legal v2.5 - SIGED Misiones & Cloud Backup',
    tamanoBytes: bytes,
    tamanoLegible: tamanoFormateado,
    autorNombre: abogadoActual.nombre,
    autorMatricula: abogadoActual.matricula,
    descripcion: descripcion || `Respaldo integral ${fechaLegible} (${datos.expedientes.length} causas, ${datos.actuaciones.length} actuaciones)`,
    estadisticas: {
      totalExpedientes: datos.expedientes.length,
      totalActuaciones: datos.actuaciones.length,
      totalAudiencias: datos.audiencias.length,
      totalPruebas: datos.pruebas.length,
      totalTareas: datos.tareas.length,
      totalDocumentos: datos.documentos.length,
    },
    datos: payloadSnapshot,
  };

  return snapshot;
}

export function descargarSnapshotEnComputadora(snapshot: BackupSnapshot): void {
  const jsonString = JSON.stringify(snapshot, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const sanitizedName = snapshot.autorNombre.replace(/\s+/g, '_').toLowerCase();
  const dateStr = snapshot.fechaIso.split('T')[0];
  const timeStr = snapshot.fechaIso.split('T')[1].replace(/:/g, '-').slice(0, 5);
  link.href = url;
  link.download = `respaldo_kairos_${sanitizedName}_${dateStr}_${timeStr}.json`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
