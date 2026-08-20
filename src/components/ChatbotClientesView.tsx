import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Send, 
  User, 
  MessageSquare, 
  Settings, 
  Phone, 
  Calendar, 
  FileText, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  RefreshCw, 
  Search, 
  Share2, 
  ShieldCheck, 
  Smartphone, 
  Scale, 
  Info,
  Maximize2,
  ChevronRight,
  ArrowRight,
  Headphones,
  Check
} from 'lucide-react';
import { 
  Expediente, 
  AudienciaExpediente, 
  ConfiguracionChatbot, 
  RegistroConsultaChatbot, 
  MensajeChatCliente, 
  ResumenExpedienteChatbot 
} from '../types';
import { 
  DEFAULT_CONFIGURACION_CHATBOT, 
  INITIAL_REGISTROS_CHATBOT 
} from '../data/mockStore';
import { procesarConsultaChatbot } from '../server/chatbotEngine';

interface ChatbotClientesViewProps {
  expedientes: Expediente[];
  audiencias: AudienciaExpediente[];
  theme?: 'dark' | 'light';
}

export const ChatbotClientesView: React.FC<ChatbotClientesViewProps> = ({
  expedientes,
  audiencias,
  theme = 'dark',
}) => {
  const [subTab, setSubTab] = useState<'simulador' | 'portal_publico' | 'bandeja' | 'configuracion'>('simulador');

  // Estado de configuración
  const [config, setConfig] = useState<ConfiguracionChatbot>(() => {
    const saved = localStorage.getItem('kairos_chatbot_config');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return DEFAULT_CONFIGURACION_CHATBOT;
  });

  useEffect(() => {
    localStorage.setItem('kairos_chatbot_config', JSON.stringify(config));
  }, [config]);

  // Historial de consultas registradas
  const [historialRegistros, setHistorialRegistros] = useState<RegistroConsultaChatbot[]>(() => {
    const saved = localStorage.getItem('kairos_chatbot_historial');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_REGISTROS_CHATBOT;
  });

  useEffect(() => {
    localStorage.setItem('kairos_chatbot_historial', JSON.stringify(historialRegistros));
  }, [historialRegistros]);

  // Estado del Chat en vivo
  const [clienteDniInput, setClienteDniInput] = useState('30123456');
  const [dniActivo, setDniActivo] = useState('30123456');
  const [mensajes, setMensajes] = useState<MensajeChatCliente[]>([
    {
      id: 'msg-init-1',
      emisor: 'bot',
      texto: config.mensajeBienvenida,
      timestamp: 'Ahora',
      sugerencias: [
        '📌 ¿En qué etapa está mi juicio actualmente?',
        '📅 ¿Cuándo y dónde es mi próxima audiencia?',
        '📜 ¿Qué novedades hubo en el último despacho?',
        '🤝 ¿Puedo solicitar que mi abogado me llame?'
      ]
    }
  ]);
  const [inputTexto, setInputTexto] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expedienteActual, setExpedienteActual] = useState<ResumenExpedienteChatbot | null>(null);

  // Modal Solicitud de Llamada
  const [mostrarModalLlamada, setMostrarModalLlamada] = useState(false);
  const [telefonoContacto, setTelefonoContacto] = useState('');
  const [motivoLlamada, setMotivoLlamada] = useState('Consulta sobre estado y próximos pasos del expediente.');
  const [llamadaEnviada, setLlamadaEnviada] = useState(false);

  // Filtro de bandeja de consultas
  const [busquedaBandeja, setBusquedaBandeja] = useState('');
  const [filtroSoloLlamadas, setFiltroSoloLlamadas] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [mensajes, isLoading]);

  // Manejador para enviar consulta
  const handleEnviarMensaje = async (textoAEnviar?: string) => {
    const texto = (textoAEnviar || inputTexto).trim();
    if (!texto) return;

    const userMsg: MensajeChatCliente = {
      id: `msg-${Date.now()}-user`,
      emisor: 'cliente',
      texto: texto,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMensajes((prev) => [...prev, userMsg]);
    if (!textoAEnviar) setInputTexto('');
    setIsLoading(true);

    try {
      // 1. Intentar llamar endpoint backend si está disponible o motor local
      let respuestaData;
      try {
        const res = await fetch('/api/chatbot-cliente/consultar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dni_cuit: dniActivo,
            consulta: texto,
            expediente_id: expedienteActual?.numero,
            canal: 'web_widget',
          }),
        });
        if (res.ok) {
          respuestaData = await res.json();
        }
      } catch (e) {
        // Fallback a motor directo del cliente
      }

      if (!respuestaData) {
        respuestaData = await procesarConsultaChatbot(
          {
            dni_cuit: dniActivo,
            consulta: texto,
            expediente_id: expedienteActual?.numero,
            canal: 'web_widget',
          },
          expedientes,
          audiencias,
          config
        );
      }

      const botMsg: MensajeChatCliente = {
        id: `msg-${Date.now()}-bot`,
        emisor: 'bot',
        texto: respuestaData.mensaje,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        tipoRespuesta: respuestaData.tipo,
        expedienteReferencia: respuestaData.expediente,
        sugerencias: respuestaData.sugerencias,
      };

      setMensajes((prev) => [...prev, botMsg]);

      if (respuestaData.expediente) {
        setExpedienteActual(respuestaData.expediente);
      }

      // Guardar en historial
      const nuevoReg: RegistroConsultaChatbot = {
        id: `REG-BOT-${Date.now()}`,
        fecha: new Date().toISOString().replace('T', ' ').substring(0, 16),
        clienteDni: dniActivo,
        clienteNombre: respuestaData.expediente?.caratula?.split(' C/ ')[0] || respuestaData.expediente?.caratula || 'Cliente',
        expedienteNumero: respuestaData.expediente?.numero,
        pregunta: texto,
        respuesta: respuestaData.mensaje,
        canal: 'web_widget',
        solicitoHumano: !!respuestaData.requiereContactoHumano,
        atendidoPorAbogado: false,
      };
      setHistorialRegistros((prev) => [nuevoReg, ...prev]);

    } catch (err) {
      console.error('Error procesando respuesta del chatbot:', err);
      const errMsg: MensajeChatCliente = {
        id: `msg-${Date.now()}-err`,
        emisor: 'bot',
        texto: `Lo sentimos, ocurrió un inconveniente temporal al consultar tu causa. Por favor intenta nuevamente o comunícate con nuestro WhatsApp al ${config.telefonoWhatsAppEstudio}.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        tipoRespuesta: 'seguridad',
      };
      setMensajes((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Cambiar de cliente de prueba
  const handleCambiarClientePrueba = (nuevoDni: string) => {
    setClienteDniInput(nuevoDni);
    setDniActivo(nuevoDni);
    setExpedienteActual(null);
    setMensajes([
      {
        id: `msg-reset-${Date.now()}`,
        emisor: 'bot',
        texto: `👋 ¡Hola! Has iniciado consulta para el documento **${nuevoDni}**.\n\n¿En qué podemos orientarte hoy sobre tu expediente?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sugerencias: [
          '📌 ¿En qué etapa está mi juicio actualmente?',
          '📅 ¿Cuándo y dónde es mi próxima audiencia?',
          '📜 ¿Qué novedades hubo en el último despacho?',
          '💰 ¿Cuál es el estado de mis honorarios y pagos?'
        ]
      }
    ]);
  };

  // Enviar solicitud de llamada
  const handleSolicitarLlamada = async () => {
    if (!telefonoContacto.trim()) return;

    try {
      await fetch('/api/chatbot-cliente/solicitar-contacto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dni_cuit: dniActivo,
          nombre: expedienteActual?.caratula?.split(' C/ ')[0] || `Cliente DNI ${dniActivo}`,
          telefono: telefonoContacto,
          expediente_numero: expedienteActual?.numero || '',
          motivo: motivoLlamada,
        }),
      });
    } catch (e) {}

    const nuevoReg: RegistroConsultaChatbot = {
      id: `CALL-REQ-${Date.now()}`,
      fecha: new Date().toISOString().replace('T', ' ').substring(0, 16),
      clienteDni: dniActivo,
      clienteNombre: expedienteActual?.caratula?.split(' C/ ')[0] || `Cliente DNI ${dniActivo}`,
      expedienteNumero: expedienteActual?.numero || 'Sin asignar',
      pregunta: `[SOLICITUD DE LLAMADA] Tel: ${telefonoContacto} - ${motivoLlamada}`,
      respuesta: 'Solicitud enviada a la secretaría del estudio.',
      canal: 'web_widget',
      solicitoHumano: true,
      atendidoPorAbogado: false,
    };
    setHistorialRegistros((prev) => [nuevoReg, ...prev]);

    setLlamadaEnviada(true);
    setTimeout(() => {
      setMostrarModalLlamada(false);
      setLlamadaEnviada(false);
      setTelefonoContacto('');
      setMensajes((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}-confirm`,
          emisor: 'bot',
          texto: `✅ **Solicitud de contacto registrada con éxito.**\n\nTu abogado **${expedienteActual?.abogado_responsable || 'asignado'}** ha recibido la alerta y se comunicará al **${telefonoContacto}** a la brevedad.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    }, 1500);
  };

  // Filtrado de bandeja
  const registrosFiltrados = historialRegistros.filter((reg) => {
    const coincideTexto = 
      (reg.clienteDni || '').toLowerCase().includes(busquedaBandeja.toLowerCase()) ||
      (reg.clienteNombre || '').toLowerCase().includes(busquedaBandeja.toLowerCase()) ||
      (reg.pregunta || '').toLowerCase().includes(busquedaBandeja.toLowerCase()) ||
      (reg.expedienteNumero || '').toLowerCase().includes(busquedaBandeja.toLowerCase());
    
    if (filtroSoloLlamadas) {
      return coincideTexto && reg.solicitoHumano;
    }
    return coincideTexto;
  });

  const llamadasPendientesCount = historialRegistros.filter((r) => r.solicitoHumano && !r.atendidoPorAbogado).length;

  return (
    <div className="space-y-6">
      {/* Header Principal */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-gradient-to-bl from-indigo-600/10 via-amber-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-tr from-indigo-600 to-indigo-500 rounded-xl shadow-lg shadow-indigo-600/30 text-white">
              <Bot className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold text-white tracking-tight">{config.nombreBot}</h1>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
                  Activo 24/7
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-1">
                Atención automatizada en lenguaje claro para clientes: consulta de causas por DNI, estado procesal, audiencias y derivación a WhatsApp.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <a 
              href={`https://wa.me/${config.telefonoWhatsAppEstudio.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-md shadow-emerald-600/20 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 mr-1.5" />
              WhatsApp Oficial ({config.telefonoWhatsAppEstudio})
            </a>
          </div>
        </div>

        {/* Navegación de Sub-pestañas */}
        <div className="flex items-center space-x-2 mt-6 pt-4 border-t border-slate-800/80 overflow-x-auto">
          <button
            onClick={() => setSubTab('simulador')}
            className={`flex items-center px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              subTab === 'simulador'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Bot className="w-4 h-4 mr-2 text-indigo-300" />
            Simulador de Chat en Vivo
          </button>

          <button
            onClick={() => setSubTab('portal_publico')}
            className={`flex items-center px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              subTab === 'portal_publico'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Maximize2 className="w-4 h-4 mr-2 text-teal-300" />
            Portal Web de Clientes (Modo Público)
          </button>

          <button
            onClick={() => setSubTab('bandeja')}
            className={`flex items-center px-4 py-2 rounded-lg text-xs font-medium transition-all relative ${
              subTab === 'bandeja'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <MessageSquare className="w-4 h-4 mr-2 text-amber-300" />
            Bandeja de Consultas & Solicitudes
            {llamadasPendientesCount > 0 && (
              <span className="ml-2 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                {llamadasPendientesCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setSubTab('configuracion')}
            className={`flex items-center px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              subTab === 'configuracion'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Settings className="w-4 h-4 mr-2 text-cyan-300" />
            Configurador & WhatsApp API
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUB-PESTAÑA 1: SIMULADOR DE CHAT EN VIVO                                  */}
      {/* ========================================================================= */}
      {subTab === 'simulador' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Panel Izquierdo: Selector de Cliente y Datos de Causa */}
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center">
                <User className="w-4 h-4 mr-2 text-indigo-400" />
                Identificación de Cliente
              </h3>
              <p className="text-xs text-slate-400 mb-3">
                Selecciona un cliente de muestra o ingresa un DNI/CUIT para simular la experiencia:
              </p>

              <div className="space-y-2 mb-4">
                <button
                  type="button"
                  onClick={() => handleCambiarClientePrueba('30123456')}
                  className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all ${
                    dniActivo === '30123456'
                      ? 'bg-indigo-950/60 border-indigo-500/50 text-indigo-200'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="font-semibold text-white">Gómez, Mario Roberto</div>
                  <div className="text-[11px] text-slate-400">DNI: 30123456 • Daños y Perjuicios (Civil N° 2)</div>
                  <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">
                    Audiencia 15/09/2026
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCambiarClientePrueba('28456789')}
                  className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all ${
                    dniActivo === '28456789'
                      ? 'bg-indigo-950/60 border-indigo-500/50 text-indigo-200'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="font-semibold text-white">Ferreira, Silvana Andrea</div>
                  <div className="text-[11px] text-slate-400">DNI: 28456789 • Despido Laboral (Laboral N° 1)</div>
                  <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300">
                    Traslado Cédula 10 días
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCambiarClientePrueba('14223344')}
                  className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all ${
                    dniActivo === '14223344'
                      ? 'bg-indigo-950/60 border-indigo-500/50 text-indigo-200'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="font-semibold text-white">Martínez, Claudio Gabriel</div>
                  <div className="text-[11px] text-slate-400">DNI: 14223344 • Reajuste ANSES (Juzg. Federal)</div>
                  <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                    Autos para Sentencia
                  </span>
                </button>
              </div>

              <div className="pt-3 border-t border-slate-800">
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Ingreso manual de DNI / CUIT:
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={clienteDniInput}
                    onChange={(e) => setClienteDniInput(e.target.value)}
                    placeholder="Ej: 30123456"
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleCambiarClientePrueba(clienteDniInput)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold"
                  >
                    Cargar
                  </button>
                </div>
              </div>
            </div>

            {/* Ficha Resumen del Expediente Activo */}
            {expedienteActual && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold text-indigo-300 uppercase tracking-wider flex items-center">
                    <Scale className="w-3.5 h-3.5 mr-1.5" />
                    Causa en Consulta
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {expedienteActual.estado}
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div>
                    <span className="text-slate-400">Expediente:</span>
                    <p className="font-bold text-white">{expedienteActual.numero}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Carátula:</span>
                    <p className="text-slate-200 line-clamp-2">{expedienteActual.caratula}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Juzgado:</span>
                    <p className="text-slate-300">{expedienteActual.juzgado}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Etapa Procesal:</span>
                    <p className="text-amber-300 font-semibold">{expedienteActual.etapa_procesal}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Letrado a Cargo:</span>
                    <p className="text-slate-300">{expedienteActual.abogado_responsable}</p>
                  </div>

                  {expedienteActual.proxima_audiencia && (
                    <div className="p-2.5 bg-purple-950/40 border border-purple-800/50 rounded-lg">
                      <span className="text-[10px] font-bold text-purple-300 uppercase flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        Próxima Audiencia
                      </span>
                      <p className="font-bold text-white mt-0.5">{expedienteActual.proxima_audiencia.fecha} hs</p>
                      <p className="text-[11px] text-purple-200">{expedienteActual.proxima_audiencia.tipo}</p>
                    </div>
                  )}

                  {config.permitirSolicitarLlamada && (
                    <button
                      type="button"
                      onClick={() => setMostrarModalLlamada(true)}
                      className="w-full mt-3 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white rounded-lg text-xs font-semibold shadow flex items-center justify-center transition-all"
                    >
                      <Headphones className="w-3.5 h-3.5 mr-1.5" />
                      Solicitar Llamada de mi Abogado
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Panel Central/Derecho: Interfaz de Chat */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl shadow-xl flex flex-col h-[650px] overflow-hidden">
            {/* Encabezado del Chat */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white shadow-md">
                    <Bot className="w-5 h-5" />
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-950 rounded-full" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center">
                    {config.nombreBot}
                    <span className="ml-2 text-[10px] font-normal px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                      IA Gemini + SIGED
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Consultando como DNI: <span className="text-indigo-300 font-mono font-semibold">{dniActivo}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleCambiarClientePrueba(dniActivo)}
                  title="Reiniciar conversación"
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg text-xs transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Cuerpo del Chat (Mensajes) */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-900/60">
              {mensajes.map((msg) => {
                const esCliente = msg.emisor === 'cliente';
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start space-x-2.5 ${esCliente ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs shrink-0 ${
                        esCliente ? 'bg-amber-600' : 'bg-indigo-600'
                      }`}
                    >
                      {esCliente ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>

                    <div className={`max-w-[80%] space-y-2`}>
                      <div
                        className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                          esCliente
                            ? 'bg-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-600/20'
                            : 'bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700/60 shadow'
                        }`}
                      >
                        <div className="whitespace-pre-line">{msg.texto}</div>
                        <div
                          className={`text-[9px] mt-1.5 text-right ${
                            esCliente ? 'text-indigo-200' : 'text-slate-400'
                          }`}
                        >
                          {msg.timestamp}
                        </div>
                      </div>

                      {/* Chips de Preguntas Sugeridas */}
                      {msg.sugerencias && msg.sugerencias.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {msg.sugerencias.map((sug, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => handleEnviarMensaje(sug)}
                              disabled={isLoading}
                              className="px-2.5 py-1 bg-slate-800/90 hover:bg-indigo-600 hover:text-white border border-slate-700 text-indigo-300 rounded-full text-[11px] transition-all text-left shadow-sm disabled:opacity-50"
                            >
                              {sug}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex items-start space-x-2.5">
                  <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="p-3.5 bg-slate-800 text-slate-300 rounded-2xl rounded-tl-none border border-slate-700 text-xs flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
                    <span>Consultando expediente y redactando respuesta clara...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Barra de Entrada de Mensaje */}
            <div className="p-3 bg-slate-950 border-t border-slate-800">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleEnviarMensaje();
                }}
                className="flex items-center space-x-2"
              >
                <input
                  type="text"
                  value={inputTexto}
                  onChange={(e) => setInputTexto(e.target.value)}
                  placeholder="Escribe tu consulta aquí (ej: ¿Cuándo es mi próxima audiencia?)..."
                  disabled={isLoading}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  disabled={isLoading || !inputTexto.trim()}
                  className="p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl shadow-md shadow-indigo-600/30 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-PESTAÑA 2: PORTAL WEB DE CLIENTES (MODO PÚBLICO)                      */}
      {/* ========================================================================= */}
      {subTab === 'portal_publico' && (
        <div className="max-w-4xl mx-auto bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-6 md:p-10 relative overflow-hidden">
          <div className="text-center max-w-xl mx-auto mb-8">
            <div className="w-16 h-16 bg-gradient-to-tr from-indigo-600 to-amber-500 rounded-2xl flex items-center justify-center text-white mx-auto shadow-xl mb-4">
              <Scale className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">{config.nombreEstudio}</h2>
            <p className="text-xs text-indigo-400 font-semibold uppercase tracking-widest mt-1">
              Portal de Autogestión y Consulta de Expedientes
            </p>
            <p className="text-sm text-slate-400 mt-2">
              Ingresa tu número de DNI o CUIT para conocer el estado procesal actualizado de tus causas en el Poder Judicial de Misiones.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg max-w-lg mx-auto">
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Documento Nacional de Identidad (DNI) o CUIT:
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={clienteDniInput}
                onChange={(e) => setClienteDniInput(e.target.value)}
                placeholder="Ingresa tu DNI (ej: 30123456)"
                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={() => {
                  setDniActivo(clienteDniInput);
                  setSubTab('simulador');
                  handleCambiarClientePrueba(clienteDniInput);
                }}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center space-x-1.5 transition-all"
              >
                <span>Consultar</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center">
                <ShieldCheck className="w-4 h-4 mr-1 text-emerald-400" />
                Consulta Segura y Confidencial
              </span>
              <span>Horario: {config.horarioAtencion.split(' y ')[0]}</span>
            </div>
          </div>

          {/* Información del Estudio */}
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl">
              <Phone className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
              <div className="text-xs font-bold text-white">WhatsApp de Contacto</div>
              <div className="text-xs text-slate-400 mt-0.5">{config.telefonoWhatsAppEstudio}</div>
            </div>
            <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl">
              <Clock className="w-5 h-5 text-indigo-400 mx-auto mb-2" />
              <div className="text-xs font-bold text-white">Horarios de Atención</div>
              <div className="text-xs text-slate-400 mt-0.5">{config.horarioAtencion}</div>
            </div>
            <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl">
              <Bot className="w-5 h-5 text-amber-400 mx-auto mb-2" />
              <div className="text-xs font-bold text-white">Asistente Virtual 24/7</div>
              <div className="text-xs text-slate-400 mt-0.5">Respuestas inmediatas</div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-PESTAÑA 3: BANDEJA DE CONSULTAS & SOLICITUDES DE CONTACTO             */}
      {/* ========================================================================= */}
      {subTab === 'bandeja' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center space-x-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={busquedaBandeja}
                  onChange={(e) => setBusquedaBandeja(e.target.value)}
                  placeholder="Buscar por DNI, cliente, expediente o pregunta..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="button"
                onClick={() => setFiltroSoloLlamadas(!filtroSoloLlamadas)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  filtroSoloLlamadas
                    ? 'bg-rose-600 text-white border-rose-500'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                Solo pedidos de llamada ({llamadasPendientesCount})
              </button>
            </div>

            <div className="text-xs text-slate-400">
              Total consultas registradas: <span className="text-white font-bold">{historialRegistros.length}</span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Fecha / Hora</th>
                    <th className="py-3 px-4">Cliente / DNI</th>
                    <th className="py-3 px-4">Expediente</th>
                    <th className="py-3 px-4">Consulta del Cliente</th>
                    <th className="py-3 px-4">Canal</th>
                    <th className="py-3 px-4">Estado / Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {registrosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500 text-xs">
                        No se encontraron registros de consultas con los filtros actuales.
                      </td>
                    </tr>
                  ) : (
                    registrosFiltrados.map((reg) => (
                      <tr key={reg.id} className="hover:bg-slate-850/50 transition-colors">
                        <td className="py-3 px-4 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                          {reg.fecha}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-white">{reg.clienteNombre || 'S/D'}</div>
                          <div className="text-[10px] text-slate-400 font-mono">DNI: {reg.clienteDni}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-indigo-300">
                            {reg.expedienteNumero || 'General'}
                          </span>
                        </td>
                        <td className="py-3 px-4 max-w-xs">
                          <p className="text-slate-200 line-clamp-2">{reg.pregunta}</p>
                          <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5 italic">
                            Respuesta: {reg.respuesta}
                          </p>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                            {reg.canal === 'whatsapp' ? '📱 WhatsApp' : '🌐 Web Widget'}
                          </span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          {reg.solicitoHumano ? (
                            reg.atendidoPorAbogado ? (
                              <span className="inline-flex items-center text-emerald-400 font-medium text-[11px]">
                                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                                Contactado
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setHistorialRegistros((prev) =>
                                    prev.map((r) => r.id === reg.id ? { ...r, atendidoPorAbogado: true } : r)
                                  );
                                }}
                                className="px-2.5 py-1 bg-rose-600/20 text-rose-300 hover:bg-rose-600 hover:text-white border border-rose-500/40 rounded text-[10px] font-bold transition-all"
                              >
                                📞 Marcar Atendido
                              </button>
                            )
                          ) : (
                            <span className="text-slate-500 text-[11px]">Autorespondido</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-PESTAÑA 4: CONFIGURADOR DEL ASISTENTE & WHATSAPP API                  */}
      {/* ========================================================================= */}
      {subTab === 'configuracion' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Panel General */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center">
              <Settings className="w-4 h-4 mr-2 text-indigo-400" />
              Parámetros del Asistente Virtual
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre del Asistente:</label>
              <input
                type="text"
                value={config.nombreBot}
                onChange={(e) => setConfig({ ...config, nombreBot: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre del Estudio Jurídico:</label>
              <input
                type="text"
                value={config.nombreEstudio}
                onChange={(e) => setConfig({ ...config, nombreEstudio: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Mensaje de Bienvenida:</label>
              <textarea
                rows={3}
                value={config.mensajeBienvenida}
                onChange={(e) => setConfig({ ...config, mensajeBienvenida: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Tono de la Respuesta:</label>
              <select
                value={config.tonoRespuesta}
                onChange={(e: any) => setConfig({ ...config, tonoRespuesta: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="cordial">Cordial y Profesional (Recomendado)</option>
                <option value="formal">Formal y Jurídico Tradicional</option>
                <option value="simplificado">Simplificado y Didáctico (Lenguaje Llano)</option>
              </select>
            </div>

            <div className="pt-3 border-t border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-200">Permisos y Datos Visibles al Cliente:</h4>
              
              <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.permitirVerAudiencias}
                  onChange={(e) => setConfig({ ...config, permitirVerAudiencias: e.target.checked })}
                  className="rounded bg-slate-950 border-slate-700 text-indigo-600 focus:ring-0"
                />
                <span>Informar fechas y sedes de próximas audiencias judiciales</span>
              </label>

              <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.permitirVerFinanciero}
                  onChange={(e) => setConfig({ ...config, permitirVerFinanciero: e.target.checked })}
                  className="rounded bg-slate-950 border-slate-700 text-indigo-600 focus:ring-0"
                />
                <span>Informar estado de honorarios pactados y saldo pendiente</span>
              </label>

              <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.permitirSolicitarLlamada}
                  onChange={(e) => setConfig({ ...config, permitirSolicitarLlamada: e.target.checked })}
                  className="rounded bg-slate-950 border-slate-700 text-indigo-600 focus:ring-0"
                />
                <span>Habilitar botón "Solicitar llamada de mi abogado"</span>
              </label>
            </div>
          </div>

          {/* Panel WhatsApp Business API */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center">
                <Smartphone className="w-4 h-4 mr-2 text-emerald-400" />
                Integración WhatsApp Business API
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Meta Cloud API Ready
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Configura el número oficial de derivación y los parámetros para conectar con Meta WhatsApp Cloud API o Twilio:
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Teléfono de WhatsApp del Estudio (con código de país):
              </label>
              <input
                type="text"
                value={config.telefonoWhatsAppEstudio}
                onChange={(e) => setConfig({ ...config, telefonoWhatsAppEstudio: e.target.value })}
                placeholder="+54 9 376 455-8899"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Horario de Atención Telefónica:</label>
              <input
                type="text"
                value={config.horarioAtencion}
                onChange={(e) => setConfig({ ...config, horarioAtencion: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="pt-3 border-t border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-200 flex items-center">
                <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-teal-400" />
                Endpoints para Meta Developers / Webhook:
              </h4>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Callback URL (Webhook):</label>
                <div className="p-2 bg-slate-950 border border-slate-800 rounded font-mono text-[11px] text-teal-300 break-all select-all">
                  {config.whatsappWebhookUrl || 'https://tu-dominio.com/api/chatbot-cliente/whatsapp-webhook'}
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Verify Token:</label>
                <input
                  type="text"
                  value={config.whatsappVerifyToken || ''}
                  onChange={(e) => setConfig({ ...config, whatsappVerifyToken: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                />
              </div>
            </div>

            <div className="p-3 bg-indigo-950/40 border border-indigo-800/40 rounded-lg text-xs text-indigo-300 flex items-start space-x-2">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                Los cambios se guardan automáticamente y se aplican en tiempo real en el simulador y los endpoints del sistema.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Solicitar Llamada de mi Abogado */}
      {mostrarModalLlamada && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl">
                <Headphones className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Solicitar Llamada de mi Abogado</h3>
                <p className="text-xs text-slate-400">
                  Causa: <span className="text-white font-semibold">{expedienteActual?.numero || 'Consulta General'}</span>
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300">
              Déjanos tu número de teléfono y el profesional a cargo (<span className="text-amber-300 font-semibold">{expedienteActual?.abogado_responsable || 'Letrado Patrocinante'}</span>) se comunicará contigo.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Tu Teléfono de Contacto (con código de área):
              </label>
              <input
                type="tel"
                value={telefonoContacto}
                onChange={(e) => setTelefonoContacto(e.target.value)}
                placeholder="Ej: +54 9 376 411-2233"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Motivo o duda principal:</label>
              <textarea
                rows={2}
                value={motivoLlamada}
                onChange={(e) => setMotivoLlamada(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-500 resize-none"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setMostrarModalLlamada(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSolicitarLlamada}
                disabled={!telefonoContacto.trim() || llamadaEnviada}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow transition-colors flex items-center space-x-1.5"
              >
                {llamadaEnviada ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>¡Enviado!</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Confirmar Solicitud</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
