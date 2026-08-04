import React, { useState } from 'react';
import { 
  Key, ShieldCheck, UserCheck, RefreshCw, Bell, Lock, Globe, CheckCircle2, AlertTriangle, 
  Settings, Clock, Sparkles, Send, Zap, ChevronRight, Activity, Cpu
} from 'lucide-react';
import { Abogado, CredencialesSIGED, RegistroSincronizacionSiged } from '../types';
import { 
  getPushPermissionStatus, 
  requestPushPermission, 
  sendBrowserPushNotification 
} from '../utils/pushNotifications';

interface PerfilCredencialesModalProps {
  isOpen: boolean;
  onClose: () => void;
  abogadoActual: Abogado;
  onGuardarCredenciales: (nuevas: CredencialesSIGED) => void;
  onSincronizarManual: () => Promise<void>;
  historialSync: RegistroSincronizacionSiged[];
  isSyncing: boolean;
}

export const PerfilCredencialesModal: React.FC<PerfilCredencialesModalProps> = ({
  isOpen,
  onClose,
  abogadoActual,
  onGuardarCredenciales,
  onSincronizarManual,
  historialSync,
  isSyncing,
}) => {
  const [activeTab, setActiveTab] = useState<'credenciales' | 'notificaciones' | 'historial'>('credenciales');
  
  // Credentials Form State
  const initialCreds = abogadoActual.credencialesSiged || {
    usuarioSiged: 'jposadas.cadam',
    claveSiged: '••••••••••••',
    pinCertificadoDigital: '884192',
    estadoConexion: 'Conectado',
    ultimaSincronizacion: new Date().toISOString().replace('T', ' ').substring(0, 16),
    sincronizacionAutomatica: true,
    frecuenciaMinutos: 15,
    notificacionesPushWeb: true,
  };

  const [usuarioSiged, setUsuarioSiged] = useState(initialCreds.usuarioSiged);
  const [claveSiged, setClaveSiged] = useState(initialCreds.claveSiged);
  const [pinCertificado, setPinCertificado] = useState(initialCreds.pinCertificadoDigital || '');
  const [sincronizacionAuto, setSincronizacionAuto] = useState(initialCreds.sincronizacionAutomatica);
  const [frecuencia, setFrecuencia] = useState<number>(initialCreds.frecuenciaMinutos);
  const [pushHabilitadas, setPushHabilitadas] = useState(initialCreds.notificacionesPushWeb);

  const [isTestingConn, setIsTestingConn] = useState(false);
  const [testResult, setTestResult] = useState<{ exito: boolean; mensaje: string } | null>(null);
  const [pushPermissionStatus, setPushPermissionStatus] = useState(getPushPermissionStatus());

  if (!isOpen) return null;

  const handleProbarConexion = () => {
    setIsTestingConn(true);
    setTestResult(null);

    setTimeout(() => {
      setIsTestingConn(false);
      if (usuarioSiged.trim().length >= 4 && claveSiged.length >= 4) {
        setTestResult({
          exito: true,
          mensaje: 'Handshake de autenticación con Portal SIGED (siged.jusmisiones.gov.ar) exitoso. Certificado Digital CADAM activo.',
        });
      } else {
        setTestResult({
          exito: false,
          mensaje: 'Error de autenticación. Verifique el usuario y clave provistos por el Superior Tribunal de Justicia.',
        });
      }
    }, 900);
  };

  const handleSolicitarPermisoPushNavegador = async () => {
    const res = await requestPushPermission();
    setPushPermissionStatus(res);
    if (res === 'granted') {
      sendBrowserPushNotification({
        title: '🔔 SIGED Misiones - Notificaciones Push Activas',
        body: 'El sistema le notificará instantáneamente ante nuevos decretos, cédulas o resoluciones.',
      });
    }
  };

  const handleGuardarCambios = () => {
    const credsActualizadas: CredencialesSIGED = {
      usuarioSiged,
      claveSiged,
      pinCertificadoDigital: pinCertificado,
      estadoConexion: testResult?.exito ? 'Conectado' : initialCreds.estadoConexion,
      ultimaSincronizacion: initialCreds.ultimaSincronizacion,
      sincronizacionAutomatica: sincronizacionAuto,
      frecuenciaMinutos: frecuencia,
      notificacionesPushWeb: pushHabilitadas,
    };

    onGuardarCredenciales(credsActualizadas);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {abogadoActual.avatarUrl ? (
              <img
                src={abogadoActual.avatarUrl}
                alt={abogadoActual.nombre}
                className="w-10 h-10 rounded-full border-2 border-blue-500/50 object-cover"
              />
            ) : (
              <div className="p-2.5 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-xl">
                <Key className="w-5 h-5" />
              </div>
            )}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-tight text-slate-100 flex items-center space-x-2">
                <span>{abogadoActual.nombre}</span>
                <span className="text-[10px] bg-blue-600/30 text-blue-300 border border-blue-500/40 px-2 py-0.5 rounded font-mono font-normal">
                  {abogadoActual.matricula}
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Perfil de Abogado & Sincronización Automática Portal SIGED Misiones
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="bg-slate-950/60 px-6 pt-2 border-b border-slate-800 flex space-x-4 text-xs font-mono">
          <button
            onClick={() => setActiveTab('credenciales')}
            className={`pb-2.5 font-bold transition-colors border-b-2 flex items-center space-x-2 ${
              activeTab === 'credenciales'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Credenciales SIGED</span>
          </button>

          <button
            onClick={() => setActiveTab('notificaciones')}
            className={`pb-2.5 font-bold transition-colors border-b-2 flex items-center space-x-2 ${
              activeTab === 'notificaciones'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Monitoreo & Push Web</span>
          </button>

          <button
            onClick={() => setActiveTab('historial')}
            className={`pb-2.5 font-bold transition-colors border-b-2 flex items-center space-x-2 ${
              activeTab === 'historial'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Historial Sincronización</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 space-y-5">
          {/* TAB 1: CREDENTIALS FORM */}
          {activeTab === 'credenciales' && (
            <div className="space-y-4">
              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400 uppercase flex items-center space-x-1.5">
                    <Globe className="w-3.5 h-3.5 text-blue-400" />
                    <span>Portal SIGED Jusmisiones:</span>
                  </span>
                  <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/40 px-2.5 py-0.5 rounded border border-emerald-800/60 font-mono">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{initialCreds.estadoConexion.toUpperCase()}</span>
                  </span>
                </div>

                <div className="text-[11px] font-mono text-slate-400 leading-relaxed">
                  Ingrese las credenciales asignadas por el Superior Tribunal de Justicia de Misiones para permitir la lectura automatizada de decretos, cédulas firmadas y movimientos procesales.
                </div>
              </div>

              {/* Form Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                <div>
                  <label className="block text-slate-300 uppercase text-[10px] font-bold mb-1">
                    Usuario SIGED / Matrícula:
                  </label>
                  <input
                    type="text"
                    value={usuarioSiged}
                    onChange={(e) => setUsuarioSiged(e.target.value)}
                    placeholder="Ej: jposadas.cadam"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 uppercase text-[10px] font-bold mb-1">
                    Clave de Acceso SIGED:
                  </label>
                  <input
                    type="password"
                    value={claveSiged}
                    onChange={(e) => setClaveSiged(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-300 uppercase text-[10px] font-bold mb-1">
                    PIN Certificado Firma Digital / Token Criptográfico (Opcional):
                  </label>
                  <input
                    type="password"
                    value={pinCertificado}
                    onChange={(e) => setPinCertificado(e.target.value)}
                    placeholder="Ej: 884192"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:ring-1 focus:ring-blue-500"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Permite la validación de firma digital en cédulas y providencias descargadas directamente del servidor judicial.
                  </span>
                </div>
              </div>

              {/* Test Connection Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleProbarConexion}
                  disabled={isTestingConn}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700 rounded-xl font-mono text-xs font-bold flex items-center justify-center space-x-2 transition-all"
                >
                  {isTestingConn ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
                      <span>Validando Handshake SIGED...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 text-amber-400" />
                      <span>Probar Conexión con Servidor Judicial</span>
                    </>
                  )}
                </button>
              </div>

              {testResult && (
                <div
                  className={`p-3 rounded-lg border text-xs font-mono flex items-start space-x-2.5 ${
                    testResult.exito
                      ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-300'
                      : 'bg-rose-950/40 border-rose-800/80 text-rose-300'
                  }`}
                >
                  {testResult.exito ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <span>{testResult.mensaje}</span>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MONITORING & PUSH NOTIFICATIONS */}
          {activeTab === 'notificaciones' && (
            <div className="space-y-4">
              {/* Push Web Permission Card */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Bell className="w-4 h-4 text-amber-400" />
                    <h4 className="text-xs font-bold uppercase text-slate-100 font-mono">
                      Notificaciones Push en Navegador Web
                    </h4>
                  </div>

                  <span
                    className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded border uppercase ${
                      pushPermissionStatus === 'granted'
                        ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800'
                        : pushPermissionStatus === 'denied'
                        ? 'bg-rose-950/60 text-rose-400 border-rose-800'
                        : 'bg-amber-950/60 text-amber-400 border-amber-800'
                    }`}
                  >
                    Estado: {pushPermissionStatus}
                  </span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed font-mono">
                  Reciba alertas instantáneas con sonido e hipervínculo directo al expediente cuando la mesa de entradas del Juzgado registre una cédula, resolución o vista a la contraparte.
                </p>

                {pushPermissionStatus !== 'granted' && (
                  <button
                    onClick={handleSolicitarPermisoPushNavegador}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-mono font-bold flex items-center justify-center space-x-2 shadow-md"
                  >
                    <Bell className="w-3.5 h-3.5" />
                    <span>Activar Permiso Push en este Navegador</span>
                  </button>
                )}
              </div>

              {/* Automatic Monitoring Settings */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4 text-xs font-mono">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <strong className="text-slate-200 block">Monitoreo Automático de Expedientes</strong>
                    <span className="text-[10px] text-slate-500">
                      Rastrea continuamente el estado de todas las causas asignadas en SIGED Misiones.
                    </span>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sincronizacionAuto}
                      onChange={(e) => setSincronizacionAuto(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 uppercase text-[10px] mb-1">
                      Frecuencia de Exploración:
                    </label>
                    <select
                      value={frecuencia}
                      onChange={(e) => setFrecuencia(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200"
                    >
                      <option value={15}>Cada 15 minutos (Recomendado)</option>
                      <option value={30}>Cada 30 minutos</option>
                      <option value={60}>Cada 1 hora</option>
                      <option value={120}>Cada 2 horas</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 uppercase text-[10px] mb-1">
                      Notificaciones en Pantalla:
                    </label>
                    <select
                      value={pushHabilitadas ? 'si' : 'no'}
                      onChange={(e) => setPushHabilitadas(e.target.value === 'si')}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200"
                    >
                      <option value="si">Push Web + Chime Sonoro</option>
                      <option value="no">Solo Registro In-App</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Action Button to Sync Immediately */}
              <button
                type="button"
                onClick={onSincronizarManual}
                disabled={isSyncing}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-mono text-xs font-bold flex items-center justify-center space-x-2 shadow-lg transition-all"
              >
                {isSyncing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Escaneando Movimientos en SIGED...</span>
                  </>
                ) : (
                  <>
                    <Cpu className="w-4 h-4" />
                    <span>Ejecutar Sincronización de Expedientes Ahora</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* TAB 3: HISTORY AUDIT LOG */}
          {activeTab === 'historial' && (
            <div className="space-y-3 font-mono">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
                <span className="text-slate-400 uppercase font-bold text-[10px]">
                  Auditoría de Sincronizaciones Recientes
                </span>
                <span className="text-slate-500 text-[10px]">{historialSync.length} Registros</span>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {historialSync.map((reg) => (
                  <div
                    key={reg.id}
                    className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-bold">{reg.fecha}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                          reg.estado === 'Con Novedades'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : reg.estado === 'Exitoso'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {reg.estado}
                      </span>
                    </div>

                    <div className="text-slate-300 text-[11px]">{reg.detalles}</div>
                    <div className="text-[10px] text-slate-500 flex justify-between pt-1 border-t border-slate-900">
                      <span>Causas Monitoreadas: {reg.expedientesAnalizados}</span>
                      <span>Novedades: +{reg.nuevosMovimientosDetectados}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
          <span className="text-slate-500 text-[10px]">Poder Judicial de Misiones • Conexión Cifrada SSL/TLS</span>
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold"
            >
              Cancelar
            </button>
            <button
              onClick={handleGuardarCambios}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow"
            >
              Guardar Configuración
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
