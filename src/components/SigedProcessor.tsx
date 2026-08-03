import React, { useState } from 'react';
import { Abogado, RespuestaProcesalSiged, Expediente } from '../types';
import {
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Calendar,
  MessageSquare,
  Mail,
  Bell,
  Copy,
  Check,
  FileText,
  AlertTriangle,
  Code2,
  RefreshCw,
  Send,
  Lock,
  ExternalLink,
} from 'lucide-react';

interface SigedProcessorProps {
  abogadoActual: Abogado;
  expedientes: Expediente[];
}

// Preset test actuations from SIGED Misiones
const PRESET_ACTUACIONES = [
  {
    titulo: '1. Cédula de Traslado de Demanda (5 Días Hábiles)',
    numeroExpte: '1420/2025',
    caratula: 'GOMEZ ALBERTO C/ SUPERMERCADOS MISIONES S.R.L. S/ DAÑOS Y PERJUICIOS',
    juzgado: 'Juzgado Civil y Comercial N° 1 - Posadas',
    texto: `CEDULA DE NOTIFICACIÓN DIGITAL - PODER JUDICIAL DE MISIONES (SIGED)
Juzgado de Primera Instancia Civil y Comercial N° 1 - Secretaría N° 2
Expediente N° 1420/2025 - Carátula: GOMEZ ALBERTO C/ SUPERMERCADOS MISIONES S.R.L. S/ DAÑOS Y PERJUICIOS.

Se notifica al letrado apoderado Dr. Juan Manuel Posadas (M.P. 4102) y letrada patrocinante Dra. María Elena Gómez (M.P. 5890) del traslado de la contestación de demanda presentada por la demandada con fecha 28/07/2026.
Se otorga un plazo de CINCO (5) DÍAS HÁBILES judicial a las partes para manifestarse sobre la documental acompañada y solicitar las medidas probatorias suplementarias conforme el Art. 358 del CPCCyM de la Provincia de Misiones, bajo apercibimiento de ley. Quedan Uds. debidamente notificados.`,
  },
  {
    titulo: '2. Resolución Interlocutoria - Intimación de Pago (3 Días Hábiles)',
    numeroExpte: '3105/2025',
    caratula: 'BANCO MACRO S.A. C/ KOWALSKI MARTIN S/ EJECUCION PRENDARIA',
    juzgado: 'Juzgado Civil, Comercial y de Familia N° 1 - Oberá',
    texto: `PODER JUDICIAL DE MISIONES - SIGED NOTIFICACIONES
Juzgado Civil, Comercial y de Familia N° 1 - Oberá
Expediente N° 3105/2025 - BANCO MACRO S.A. C/ KOWALSKI MARTIN S/ EJECUCION PRENDARIA.

Oberá, Misiones, 02 de Agosto de 2026.
AUTOS Y VISTOS: Por presentados, por parte y por constituido el domicilio legal y electrónico.
RESUELVO: 1) Intimar al ejecutado Martin Kowalski para que en el plazo de TRES (3) DÍAS HÁBILES judiciales proceda a dar cumplimiento a la traba del embargo y depositar la suma reclamada de $4.500.000 con más la suma de $1.350.000 presupuestada provisoriamente para acrecidas. 2) Traslado por el término de TRES (3) DÍAS a la parte actora para que opte por el martillero de la lista. Notifíquese por Cédula Digital SIGED.`,
  },
  {
    titulo: '3. Vista al Ministerio Público Fiscal (10 Días Hábiles)',
    numeroExpte: '9941/2025',
    caratula: 'FERREYRA PATRICIA C/ RUIZ MARCELO S/ DIVORCIO VINCULAR Y ALIMENTOS',
    juzgado: 'Juzgado de Familia N° 2 - Eldorado',
    texto: `PODER JUDICIAL DE MISIONES - VISTA FISCAL DIGITAL SIGED
Juzgado de Familia N° 2 - Eldorado
Expediente N° 9941/2025 - FERREYRA PATRICIA C/ RUIZ MARCELO S/ DIVORCIO VINCULAR Y ALIMENTOS.

Eldorado, 29 de Julio de 2026.
Cúmpleme correr VISTA a la letrada patrocinante de la parte actora Dra. María Elena Gómez de la propuesta regulatoria de cuota alimentaria formulada por la Asesoría de Menores. Confiérase traslado por el término de DIEZ (10) DÍAS HÁBILES procesales para formular alegaciones o conformidad. Notifíquese por cédula electrónica.`,
  },
  {
    titulo: '4. Prueba de Seguridad: Causa no Autorizada (Para Asociado Ruiz)',
    numeroExpte: '1420/2025', // Ruiz no está autorizado en 1420/2025
    caratula: 'GOMEZ ALBERTO C/ SUPERMERCADOS MISIONES S.R.L. S/ DAÑOS Y PERJUICIOS',
    juzgado: 'Juzgado Civil y Comercial N° 1 - Posadas',
    texto: `CÉDULA DE NOTIFICACIÓN DIGITAL
Expediente N° 1420/2025 - GOMEZ ALBERTO C/ SUPERMERCADOS MISIONES S.R.L.
Notificación confidencial de sentencia de primera instancia dictada en los autos de referencia.`,
  },
];

export const SigedProcessor: React.FC<SigedProcessorProps> = ({ abogadoActual, expedientes }) => {
  const [textoActuacion, setTextoActuacion] = useState(PRESET_ACTUACIONES[0].texto);
  const [expteNumero, setExpteNumero] = useState(PRESET_ACTUACIONES[0].numeroExpte);
  const [caratula, setCaratula] = useState(PRESET_ACTUACIONES[0].caratula);
  const [juzgado, setJuzgado] = useState(PRESET_ACTUACIONES[0].juzgado);
  const [fechaNotificacion, setFechaNotificacion] = useState(new Date().toISOString().split('T')[0]);

  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<RespuestaProcesalSiged | null>(null);
  const [copiadoJson, setCopiadoJson] = useState(false);
  const [copiadoWsp, setCopiadoWsp] = useState(false);
  const [pestanaVista, setPestanaVista] = useState<'visual' | 'json'>('visual');

  const handleCargarPreset = (preset: typeof PRESET_ACTUACIONES[0]) => {
    setTextoActuacion(preset.texto);
    setExpteNumero(preset.numeroExpte);
    setCaratula(preset.caratula);
    setJuzgado(preset.juzgado);
  };

  const handleProcesar = async () => {
    setLoading(true);
    setResultado(null);
    try {
      const resp = await fetch('/api/procesar-siged', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          abogado_autenticado: {
            abogado_id: abogadoActual.id,
            nombre: abogadoActual.nombre,
            matricula: abogadoActual.matricula,
            rol: abogadoActual.rol,
          },
          expediente: {
            numero: expteNumero,
            caratula: caratula,
            juzgado: juzgado,
          },
          texto_actuacion: textoActuacion,
          fecha_notificacion: fechaNotificacion,
        }),
      });

      const data: RespuestaProcesalSiged = await resp.json();
      setResultado(data);
    } catch (err) {
      console.error('Error al procesar actuación:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopiarJson = () => {
    if (resultado) {
      navigator.clipboard.writeText(JSON.stringify(resultado, null, 2));
      setCopiadoJson(true);
      setTimeout(() => setCopiadoJson(false), 2000);
    }
  };

  const handleCopiarWsp = () => {
    if (resultado?.notificaciones?.whatsapp_text) {
      navigator.clipboard.writeText(resultado.notificaciones.whatsapp_text);
      setCopiadoWsp(true);
      setTimeout(() => setCopiadoWsp(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Context Info */}
      <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-blue-500" />
              <h2 className="text-lg font-bold tracking-tight uppercase text-slate-100">
                Motor de Inteligencia Procesal SIGED <span className="text-blue-500 italic">Misiones</span>
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Procesamiento contextualizado de actuaciones judiciales, determinación de plazos en días hábiles (CPCCyM), y generación de notificaciones multi-canal con control de acceso multiusuario.
            </p>
          </div>

          {/* User Auth Context badge */}
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 flex items-center space-x-3 self-start md:self-auto shrink-0">
            <div className="w-9 h-9 rounded-full bg-slate-800 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold text-xs font-mono">
              {abogadoActual.nombre.substring(4, 6)}
            </div>
            <div>
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">AUTENTICACION_VALIDA</div>
              <div className="text-xs font-bold text-slate-200">{abogadoActual.nombre}</div>
              <div className="flex items-center space-x-2 text-[10px] font-mono text-slate-400">
                <span>ID: {abogadoActual.id}</span>
                <span>•</span>
                <span className={abogadoActual.rol === 'Socio' ? 'text-emerald-400 font-bold' : 'text-blue-400 font-bold'}>
                  Rol: {abogadoActual.rol}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Input Form vs Preset Selectors */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Input Form (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-widest text-blue-400 flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>Ingreso de Actuación SIGED</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">CPCCyM Misiones</span>
            </div>

            {/* Presets quick load */}
            <div>
              <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1.5 tracking-wider">
                Cargar Actuación Tipo de Misiones:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PRESET_ACTUACIONES.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleCargarPreset(preset)}
                    className="text-left px-3 py-2 text-xs bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded text-slate-300 transition-colors flex items-center justify-between group"
                  >
                    <span className="truncate pr-2 font-medium">{preset.titulo}</span>
                    <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider opacity-60 group-hover:opacity-100 shrink-0">
                      Cargar
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Form Metadata Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">N° Expediente SIGED</label>
                <input
                  type="text"
                  value={expteNumero}
                  onChange={(e) => setExpteNumero(e.target.value)}
                  placeholder="ej. 1420/2025"
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-100 focus:ring-1 focus:ring-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Fecha Notificación Cédula</label>
                <input
                  type="date"
                  value={fechaNotificacion}
                  onChange={(e) => setFechaNotificacion(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-100 focus:ring-1 focus:ring-blue-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Carátula de la Causa</label>
              <input
                type="text"
                value={caratula}
                onChange={(e) => setCaratula(e.target.value)}
                placeholder="ej. GOMEZ ALBERTO C/ SUPERMERCADOS MISIONES S.R.L. S/ DAÑOS"
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-100 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Juzgado / Radicación</label>
              <input
                type="text"
                value={juzgado}
                onChange={(e) => setJuzgado(e.target.value)}
                placeholder="ej. Juzgado Civil y Comercial N° 1 - Posadas"
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-100 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Main Textarea */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Texto de la Actuación / Cédula / Resolución (SIGED)
              </label>
              <textarea
                rows={7}
                value={textoActuacion}
                onChange={(e) => setTextoActuacion(e.target.value)}
                placeholder="Pegue aquí el texto completo copiado del portal SIGED..."
                className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-xs text-slate-200 font-mono focus:ring-1 focus:ring-blue-500 leading-relaxed"
              ></textarea>
            </div>

            {/* Action Submit Button */}
            <div className="pt-2">
              <button
                id="btn-procesar-siged"
                type="button"
                onClick={handleProcesar}
                disabled={loading || !textoActuacion.trim()}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase tracking-widest text-xs rounded transition-all shadow-lg shadow-blue-950/50 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Procesando con Motor SIGED AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-white" />
                    <span>PROCESAR Y GENERAR RESPUESTA ESTRICTA JSON</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Output Section (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-6 shadow-sm min-h-[500px] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300">
                    Resultado del Procesamiento
                  </h3>
                  {resultado && (
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        resultado.autenticacion_valida
                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-700'
                          : 'bg-red-950/80 text-red-400 border border-red-700'
                      }`}
                    >
                      {resultado.autenticacion_valida ? 'AUTH OK' : 'RESTRINGIDO'}
                    </span>
                  )}
                </div>

                {/* View switcher visual vs json */}
                {resultado && (
                  <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded border border-slate-800">
                    <button
                      onClick={() => setPestanaVista('visual')}
                      className={`px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider rounded transition-colors ${
                        pestanaVista === 'visual' ? 'bg-blue-600 text-white' : 'text-slate-400'
                      }`}
                    >
                      Vista Ficha
                    </button>
                    <button
                      onClick={() => setPestanaVista('json')}
                      className={`px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider font-mono rounded transition-colors ${
                        pestanaVista === 'json' ? 'bg-blue-600 text-white' : 'text-slate-400'
                      }`}
                    >
                      JSON Estricto
                    </button>
                  </div>
                )}
              </div>

              {/* Empty state */}
              {!resultado && !loading && (
                <div className="py-20 text-center space-y-3">
                  <div className="w-12 h-12 rounded bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto text-slate-400">
                    <Code2 className="w-6 h-6 text-blue-400" />
                  </div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Aún no se procesó ninguna actuación</h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Complete los campos o seleccione un preset de prueba de Misiones y presione "Procesar".
                  </p>
                </div>
              )}

              {/* Loading state */}
              {loading && (
                <div className="py-24 text-center space-y-4">
                  <RefreshCw className="w-10 h-10 text-blue-500 animate-spin mx-auto" />
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Analizando Actuación Procesal</h4>
                    <p className="text-xs text-slate-400 mt-1">Verificando matriz de seguridad y días hábiles Misiones...</p>
                  </div>
                </div>
              )}

              {/* Output Content */}
              {resultado && !loading && (
                <div className="mt-4 space-y-4">
                  {/* Security Restriction Alert if invalid */}
                  {!resultado.autenticacion_valida && (
                    <div className="p-4 bg-red-950/40 border-l-4 border-red-500 rounded space-y-2">
                      <div className="flex items-center space-x-2 text-red-400 font-bold text-xs uppercase tracking-wider">
                        <Lock className="w-4 h-4" />
                        <span>ACCESO DENEGADO POR SEGURIDAD MULTIUSUARIO</span>
                      </div>
                      <p className="text-xs text-red-200 leading-relaxed">
                        {resultado.analisis_procesal.resumen_ejecutivo}
                      </p>
                    </div>
                  )}

                  {pestanaVista === 'visual' ? (
                    <div className="space-y-4">
                      {/* Expediente Info Card */}
                      <div className="bg-slate-950 p-4 border border-slate-800 rounded-lg space-y-2">
                        <div className="flex items-center justify-between text-xs font-mono text-blue-400">
                          <span>EXPTE N°: {resultado.expediente.numero}</span>
                          <span className="text-[10px] text-slate-400">DESTINO: {resultado.abogado_destino_id}</span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-100 uppercase leading-snug">
                          {resultado.expediente.caratula}
                        </h4>
                        <p className="text-xs text-slate-400 italic flex items-center space-x-1">
                          <span>🏛️ {resultado.expediente.juzgado}</span>
                        </p>
                      </div>

                      {/* Procedural Analysis */}
                      <div className="bg-slate-950 p-4 border border-slate-800 rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Análisis Procesal</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                              resultado.analisis_procesal.requiere_accion
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {resultado.analisis_procesal.tipo_actuacion}
                          </span>
                        </div>

                        <div className="p-4 bg-slate-800 rounded-lg border-l-4 border-amber-500">
                          <p className="text-xs text-slate-200 leading-relaxed">
                            {resultado.analisis_procesal.resumen_ejecutivo}
                          </p>
                        </div>

                        {/* Deadline Calculation Box */}
                        {resultado.analisis_procesal.requiere_accion && (
                          <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg space-y-3">
                            <div className="flex items-center justify-between text-amber-400 text-xs font-bold uppercase tracking-wider">
                              <span className="flex items-center space-x-1.5">
                                <Clock className="w-4 h-4 text-amber-400" />
                                <span>Plazo: {resultado.analisis_procesal.plazo_dias} Días {resultado.analisis_procesal.tipo_plazo}</span>
                              </span>
                              <span className="text-[10px] bg-blue-600/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded font-mono">
                                CPCCyM
                              </span>
                            </div>

                            {resultado.meta_calculo && (
                              <div className="text-xs space-y-1.5 pt-2 border-t border-slate-800 font-mono">
                                <div className="text-slate-300 flex justify-between">
                                  <span className="text-slate-400">Vencimiento Término:</span>
                                  <strong className="text-amber-400">{resultado.meta_calculo.vencimiento_fecha}</strong>
                                </div>
                                <div className="text-emerald-300 text-[11px] flex justify-between">
                                  <span className="text-slate-400">Gracia (Art. 124):</span>
                                  <strong>{resultado.meta_calculo.vencimiento_con_gracia}</strong>
                                </div>
                              </div>
                            )}

                            {resultado.analisis_procesal.sugerencia_agenda && (
                              <div className="text-xs text-slate-400 pt-2 border-t border-slate-800">
                                <strong className="text-slate-300 font-bold uppercase tracking-wider text-[10px] block mb-0.5">Sugerencia Agenda:</strong>
                                <span>{resultado.analisis_procesal.sugerencia_agenda}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Notifier Previews */}
                      <div className="space-y-3">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Canales de Notificación</h4>

                        {/* Push Short */}
                        <div className="bg-slate-950 p-3 border border-slate-800 rounded-lg space-y-1">
                          <div className="flex items-center justify-between text-[11px] text-slate-400">
                            <span className="flex items-center space-x-1 text-blue-400 font-bold text-[10px] uppercase tracking-wider">
                              <Bell className="w-3.5 h-3.5" />
                              <span>Push Notification</span>
                            </span>
                          </div>
                          <p className="text-xs text-slate-200 font-mono bg-slate-900 p-2 rounded border border-slate-800">
                            {resultado.notificaciones.push_short}
                          </p>
                        </div>

                        {/* WhatsApp text */}
                        <div className="bg-slate-950 p-3 border border-slate-800 rounded-lg space-y-1">
                          <div className="flex items-center justify-between text-[11px] text-slate-400">
                            <span className="flex items-center space-x-1 text-emerald-400 font-bold text-[10px] uppercase tracking-wider">
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>WhatsApp Alert</span>
                            </span>
                            <button
                              onClick={handleCopiarWsp}
                              className="text-[10px] text-emerald-400 hover:text-emerald-300 flex items-center space-x-1 font-mono uppercase font-bold"
                            >
                              {copiadoWsp ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                              <span>{copiadoWsp ? 'Copiado' : 'Copiar'}</span>
                            </button>
                          </div>
                          <pre className="text-xs text-emerald-100 font-mono bg-slate-900 p-2.5 rounded border border-slate-800 whitespace-pre-wrap overflow-x-auto max-h-40 leading-relaxed">
                            {resultado.notificaciones.whatsapp_text}
                          </pre>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Strict JSON Output View */
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">JSON de Salida Estricto</span>
                        <button
                          id="btn-copiar-json-estricto"
                          onClick={handleCopiarJson}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider rounded flex items-center space-x-1 transition-colors"
                        >
                          {copiadoJson ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiadoJson ? '¡Copiado!' : 'Copiar JSON'}</span>
                        </button>
                      </div>

                      <pre className="bg-slate-950 p-4 border border-slate-800 rounded-lg text-xs text-emerald-400 font-mono overflow-x-auto max-h-[500px] leading-relaxed">
                        {JSON.stringify(resultado, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer Copy JSON Action */}
            {resultado && pestanaVista === 'visual' && (
              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <button
                  onClick={handleCopiarJson}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700 text-xs font-bold uppercase tracking-wider rounded flex items-center space-x-2 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copiar JSON de Salida Requerido</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
