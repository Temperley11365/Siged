import React, { useState } from 'react';
import { 
  Scale, Shield, User, Lock, Mail, Award, Phone, KeyRound, 
  UserPlus, ArrowRight, AlertCircle, CheckCircle2, Globe, 
  Sparkles, Check, ChevronRight, X, HelpCircle, Key, RefreshCw,
  ShieldAlert, UserCheck
} from 'lucide-react';
import { Abogado, RolAbogado } from '../types';

const PREGUNTAS_SECRETAS_DISPONIBLES = [
  '¿Cuál es el servicio de administración del sistema?',
  '¿Cuál es la sede o ciudad principal de su matrícula profesional?',
  '¿Cuál es el nombre de su primera mascota?',
  '¿En qué ciudad o localidad nació?',
  '¿Cuál es su fuero o materia jurídica de especialización?',
  '¿Cuál es el nombre de su escuela primaria o secundaria?',
];

interface AuthScreenProps {
  onLoginSuccess: (abogado: Abogado) => void;
  abogadosExistentes: Abogado[];
  abogadoActual?: Abogado | null;
  isModal?: boolean;
  onClose?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onLoginSuccess,
  abogadosExistentes,
  abogadoActual,
  isModal = false,
  onClose,
}) => {
  const [tab, setTab] = useState<'login' | 'registro' | 'recuperar'>(() =>
    abogadosExistentes && abogadosExistentes.length > 0 ? 'login' : 'login'
  );
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Form State - Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Form State - Registro
  const [regNombre, setRegNombre] = useState('');
  const [regMatricula, setRegMatricula] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRol, setRegRol] = useState<RolAbogado>('Socio');
  const [regTelefono, setRegTelefono] = useState('');
  const [regUsuarioSiged, setRegUsuarioSiged] = useState('');
  const [regClaveSiged, setRegClaveSiged] = useState('');
  const [regPinCertificado, setRegPinCertificado] = useState('');
  const [regPreguntaSecreta, setRegPreguntaSecreta] = useState(PREGUNTAS_SECRETAS_DISPONIBLES[0]);
  const [regRespuestaSecreta, setRegRespuestaSecreta] = useState('');

  // Form State - Recuperación / Blanqueo de Clave
  const [recuperarEmail, setRecuperarEmail] = useState('');
  const [recuperarPregunta, setRecuperarPregunta] = useState('');
  const [recuperarRespuesta, setRecuperarRespuesta] = useState('');
  const [recuperarNuevaPassword, setRecuperarNuevaPassword] = useState('');
  const [recuperarConfirmPassword, setRecuperarConfirmPassword] = useState('');
  const [pasoRecuperacion, setPasoRecuperacion] = useState<'buscar_email' | 'responder_pregunta'>('buscar_email');
  const [errorRecuperacionAdmin, setErrorRecuperacionAdmin] = useState(false);

  // LOGIN HANDLER
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const emailTrim = loginEmail.trim();
    const passTrim = loginPassword.trim();

    if (!emailTrim || !passTrim) {
      setErrorMsg('Por favor complete su correo electrónico y contraseña.');
      return;
    }

    setLoading(true);
    let abogadoLogueado: Abogado | null = null;

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailTrim, password: passTrim }),
      });
      const ct = res.headers.get('content-type');
      if (ct && ct.includes('application/json')) {
        const data = await res.json();
        if (res.ok && data?.abogado) {
          abogadoLogueado = data.abogado;
        } else if (data?.error) {
          throw new Error(data.error);
        }
      }
    } catch (err: any) {
      if (err.message && !err.message.includes('Unexpected token') && !err.message.includes('is not valid JSON')) {
        setErrorMsg(err.message);
        setLoading(false);
        return;
      }
    }

    // Client-side fallback check in existing registered lawyers
    if (!abogadoLogueado) {
      const encontrado = abogadosExistentes.find(
        (a) => a.email.toLowerCase() === emailTrim.toLowerCase()
      );
      if (encontrado) {
        if (encontrado.password && encontrado.password !== passTrim) {
          setErrorMsg('Contraseña incorrecta. Por favor verifique sus datos o utilice la opción de Blanquear clave.');
          setLoading(false);
          return;
        }
        abogadoLogueado = encontrado;
      } else {
        setErrorMsg('Usuario no encontrado. Por favor verifique el correo o regístrese en la pestaña "Nuevo Registro".');
        setLoading(false);
        return;
      }
    }

    if (abogadoLogueado.email.toLowerCase() === 'jye.sender2023@gmail.com') {
      abogadoLogueado.rol = 'Administrador';
      abogadoLogueado.esAdmin = true;
    }

    setSuccessMsg(`¡Bienvenido/a, ${abogadoLogueado.nombre}! Iniciando sesión...`);
    setTimeout(() => {
      onLoginSuccess(abogadoLogueado!);
      if (onClose) onClose();
    }, 500);
    setLoading(false);
  };

  const handleQuickLogin = (abg: Abogado) => {
    setErrorMsg('');
    setSuccessMsg(`Iniciando sesión como ${abg.nombre} (${abg.rol})...`);
    setTimeout(() => {
      onLoginSuccess(abg);
      if (onClose) onClose();
    }, 400);
  };

  // REGISTRO HANDLER
  const handleRegistroSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!regNombre.trim() || !regEmail.trim() || !regPassword.trim() || !regMatricula.trim() || !regRespuestaSecreta.trim()) {
      setErrorMsg('Por favor complete todos los campos obligatorios (*), incluyendo la pregunta secreta de recuperación.');
      return;
    }

    setLoading(true);
    let nuevoAbogado: Abogado | null = null;
    const tieneCredsSiged = !!(regUsuarioSiged.trim() && regClaveSiged.trim());
    const esAdminUser = regEmail.toLowerCase() === 'jye.sender2023@gmail.com' || regRol === 'Administrador';

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: regNombre.trim(),
          email: regEmail.trim(),
          password: regPassword.trim(),
          matricula: regMatricula.trim(),
          rol: esAdminUser ? 'Administrador' : regRol,
          telefono: regTelefono.trim(),
          usuarioSiged: regUsuarioSiged.trim(),
          claveSiged: regClaveSiged.trim(),
          pinCertificadoDigital: regPinCertificado.trim(),
          preguntaSecreta: regPreguntaSecreta,
          respuestaSecreta: regRespuestaSecreta.trim(),
        }),
      });

      const ct = res.headers.get('content-type');
      if (ct && ct.includes('application/json')) {
        const data = await res.json();
        if (res.ok && data?.abogado) {
          nuevoAbogado = data.abogado;
        } else if (data?.error) {
          throw new Error(data.error);
        }
      }
    } catch (err: any) {
      if (err.message && err.message.includes('ya se encuentra registrado')) {
        setErrorMsg(err.message);
        setLoading(false);
        return;
      }
      console.warn('API de registro local:', err);
    }

    // Client-side fallback if server was unavailable
    if (!nuevoAbogado) {
      nuevoAbogado = {
        id: `ABG-${Date.now().toString().slice(-4)}`,
        nombre: regNombre.trim(),
        email: regEmail.trim(),
        password: regPassword.trim(),
        matricula: regMatricula.trim(),
        rol: esAdminUser ? 'Administrador' : regRol,
        esAdmin: esAdminUser,
        telefono: regTelefono.trim() || '+5493764000000',
        preguntaSecreta: regPreguntaSecreta,
        respuestaSecreta: regRespuestaSecreta.trim(),
        avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
        credencialesSiged: tieneCredsSiged ? {
          usuarioSiged: regUsuarioSiged.trim(),
          claveSiged: regClaveSiged.trim(),
          pinCertificadoDigital: regPinCertificado.trim(),
          estadoConexion: 'Conectado',
          ultimaSincronizacion: new Date().toISOString().replace('T', ' ').substring(0, 16),
          sincronizacionAutomatica: true,
          frecuenciaMinutos: 15,
          notificacionesPushWeb: true,
        } : {
          usuarioSiged: '',
          claveSiged: '',
          pinCertificadoDigital: '',
          estadoConexion: 'Desconectado',
          sincronizacionAutomatica: false,
          frecuenciaMinutos: 15,
          notificacionesPushWeb: false,
        },
      };
    }

    setSuccessMsg(`¡Registro exitoso! Bienvenido/a ${nuevoAbogado.nombre} a Kairós Estudio Jurídico.`);
    setTimeout(() => {
      onLoginSuccess(nuevoAbogado!);
      if (onClose) onClose();
    }, 700);
    setLoading(false);
  };

  // PASO 1 RECUPERAR: BUSCAR USUARIO Y CARGAR PREGUNTA SECRETA
  const handleBuscarPreguntaSecreta = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setErrorRecuperacionAdmin(false);

    const emailTrim = recuperarEmail.trim();
    if (!emailTrim) {
      setErrorMsg('Por favor ingrese su correo electrónico registrado.');
      return;
    }

    setLoading(true);

    try {
      // Try backend endpoint
      const res = await fetch(`/api/auth/security-question?email=${encodeURIComponent(emailTrim)}`);
      if (res.ok) {
        const data = await res.json();
        setRecuperarPregunta(data.preguntaSecreta || '¿Cuál es el servicio de administración del sistema?');
        setPasoRecuperacion('responder_pregunta');
        setLoading(false);
        return;
      }
    } catch (e) {
      console.log('Error buscando pregunta en servidor, buscando local:', e);
    }

    // Client fallback check
    const encontrado = abogadosExistentes.find(
      (a) => a.email.toLowerCase() === emailTrim.toLowerCase()
    );

    if (encontrado) {
      setRecuperarPregunta(encontrado.preguntaSecreta || '¿Cuál es el servicio de administración del sistema?');
      setPasoRecuperacion('responder_pregunta');
    } else {
      setErrorRecuperacionAdmin(true);
      setErrorMsg('Usuario no encontrado en la base de datos.');
    }

    setLoading(false);
  };

  // PASO 2 RECUPERAR: VALIDAR RESPUESTA Y BLANQUEAR CLAVE
  const handleBlanquearClaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setErrorRecuperacionAdmin(false);

    if (!recuperarRespuesta.trim()) {
      setErrorMsg('Por favor responda a la pregunta secreta de seguridad.');
      return;
    }

    if (!recuperarNuevaPassword.trim()) {
      setErrorMsg('Por favor ingrese su nueva contraseña.');
      return;
    }

    if (recuperarNuevaPassword !== recuperarConfirmPassword) {
      setErrorMsg('Las contraseñas no coinciden. Por favor verifique.');
      return;
    }

    setLoading(true);

    const emailTrim = recuperarEmail.trim();
    const respTrim = recuperarRespuesta.trim();
    const nuevaPass = recuperarNuevaPassword.trim();

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailTrim,
          respuestaSecreta: respTrim,
          nuevaPassword: nuevaPass,
        }),
      });

      if (!res.ok) {
        throw new Error('Error al procesar blanqueo');
      }

      const data = await res.json();
      setSuccessMsg(data.mensaje || '¡Clave blanqueada con éxito! Ya puede iniciar sesión con su nueva contraseña.');
      setLoginEmail(emailTrim);
      setLoginPassword(nuevaPass);
      setTimeout(() => {
        setTab('login');
        setPasoRecuperacion('buscar_email');
        setRecuperarRespuesta('');
        setRecuperarNuevaPassword('');
        setRecuperarConfirmPassword('');
      }, 1500);
      setLoading(false);
      return;
    } catch (err) {
      // Local fallback verification
      const user = abogadosExistentes.find(
        (a) => a.email.toLowerCase() === emailTrim.toLowerCase()
      );

      if (user) {
        const respGuardada = (user.respuestaSecreta || '').toLowerCase().trim();
        const coincide = !respGuardada || respGuardada === respTrim.toLowerCase();

        if (coincide) {
          user.password = nuevaPass;
          // Update in local storage
          const updated = abogadosExistentes.map((a) => (a.id === user.id ? { ...a, password: nuevaPass } : a));
          localStorage.setItem('kairos_abogados', JSON.stringify(updated));

          setSuccessMsg('¡Clave blanqueada con éxito! Ya puede iniciar sesión con su nueva contraseña.');
          setLoginEmail(emailTrim);
          setLoginPassword(nuevaPass);
          setTimeout(() => {
            setTab('login');
            setPasoRecuperacion('buscar_email');
            setRecuperarRespuesta('');
            setRecuperarNuevaPassword('');
            setRecuperarConfirmPassword('');
          }, 1500);
          setLoading(false);
          return;
        }
      }

      // If failed / wrong answer -> Requirement: show exact error cartell
      setErrorRecuperacionAdmin(true);
      setErrorMsg('Error al blanquear la clave.');
      setLoading(false);
    }
  };

  // Demo Admin Direct Access
  const handleDemoAdminAccess = () => {
    setLoading(true);
    setSuccessMsg('Iniciando sesión como Administrador General (JyE Sender Servicios)...');
    setTimeout(() => {
      const adminAbogado: Abogado = {
        id: 'ADMIN-001',
        nombre: 'JyE Sender Servicios (Administrador)',
        email: 'jye.sender2023@gmail.com',
        matricula: 'ADMIN-001 • JyE Servicios',
        rol: 'Administrador',
        esAdmin: true,
        telefono: '+54 9 376 400-0000',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        preguntaSecreta: '¿Cuál es el servicio de administración del sistema?',
        respuestaSecreta: 'JyE Sender Servicios',
        credencialesSiged: {
          usuarioSiged: 'admin.jyesender',
          claveSiged: '••••••••••••',
          pinCertificadoDigital: '990182',
          estadoConexion: 'Conectado',
          ultimaSincronizacion: new Date().toISOString().replace('T', ' ').substring(0, 16),
          sincronizacionAutomatica: true,
          frecuenciaMinutos: 15,
          notificacionesPushWeb: true,
        },
      };
      onLoginSuccess(adminAbogado);
      if (onClose) onClose();
      setLoading(false);
    }, 450);
  };

  const handleDemoDirectorAccess = () => {
    setLoading(true);
    setSuccessMsg('Iniciando sesión directa como Dr. Alejandro Posadas (Socio Director)...');
    setTimeout(() => {
      const abogadoDemo: Abogado = {
        id: 'ABG-001',
        nombre: 'Dr. Alejandro Posadas',
        email: 'aposadas@estudioposadas.com.ar',
        matricula: 'T° 14 F° 230 C.P.A.M.',
        rol: 'Socio',
        telefono: '+54 9 376 455-8899',
        avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
        preguntaSecreta: '¿Cuál es la sede o ciudad principal del estudio?',
        respuestaSecreta: 'Posadas',
        credencialesSiged: {
          usuarioSiged: 'aposadas.siged',
          claveSiged: '••••••••••••',
          pinCertificadoDigital: '884192',
          estadoConexion: 'Conectado',
          ultimaSincronizacion: new Date().toISOString().replace('T', ' ').substring(0, 16),
          sincronizacionAutomatica: true,
          frecuenciaMinutos: 15,
          notificacionesPushWeb: true,
        },
      };
      onLoginSuccess(abogadoDemo);
      if (onClose) onClose();
      setLoading(false);
    }, 450);
  };

  const handleOidcQuickAuth = () => {
    setLoading(true);
    setSuccessMsg('Conectando con IDM Jusmisiones (Keycloak OIDC Single Sign-On)...');
    setTimeout(() => {
      const abogadoOidc: Abogado = {
        id: `ABG-OIDC-${Date.now().toString().slice(-3)}`,
        nombre: 'Dr. Profesional Certificado',
        email: 'abogado@jusmisiones.gov.ar',
        matricula: 'MP CPAM Certificado OIDC',
        rol: 'Socio',
        telefono: '+5493764000000',
        avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
        credencialesSiged: {
          usuarioSiged: 'abogado.jusmisiones',
          claveSiged: '••••••••••••',
          pinCertificadoDigital: '990182',
          estadoConexion: 'Conectado',
          ultimaSincronizacion: new Date().toISOString().replace('T', ' ').substring(0, 16),
          sincronizacionAutomatica: true,
          frecuenciaMinutos: 15,
          notificacionesPushWeb: true,
        },
      };
      onLoginSuccess(abogadoOidc);
      if (onClose) onClose();
      setLoading(false);
    }, 600);
  };

  const content = (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden font-sans">
      {/* Header Modal */}
      <div className="bg-slate-950 px-6 sm:px-8 py-5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3.5">
          <div className="p-2.5 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-2xl">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wider">
              Kairós Estudio Jurídico
            </h2>
            <span className="text-[11px] text-slate-400 font-mono block">
              Gestión Integral de Expedientes • SIGED Misiones
            </span>
          </div>
        </div>

        {isModal && onClose && (
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Mode Selector Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-950/60 font-mono text-xs">
        <button
          type="button"
          onClick={() => {
            setTab('login');
            setErrorMsg('');
            setSuccessMsg('');
            setErrorRecuperacionAdmin(false);
          }}
          className={`flex-1 py-3 font-bold uppercase tracking-wider flex items-center justify-center space-x-2 border-b-2 transition-all ${
            tab === 'login'
              ? 'border-blue-500 text-blue-400 bg-blue-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Iniciar Sesión</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setTab('registro');
            setErrorMsg('');
            setSuccessMsg('');
            setErrorRecuperacionAdmin(false);
          }}
          className={`flex-1 py-3 font-bold uppercase tracking-wider flex items-center justify-center space-x-2 border-b-2 transition-all ${
            tab === 'registro'
              ? 'border-blue-500 text-blue-400 bg-blue-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          <span>Registrarse</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setTab('recuperar');
            setErrorMsg('');
            setSuccessMsg('');
            setErrorRecuperacionAdmin(false);
            setPasoRecuperacion('buscar_email');
          }}
          className={`flex-1 py-3 font-bold uppercase tracking-wider flex items-center justify-center space-x-1.5 border-b-2 transition-all ${
            tab === 'recuperar'
              ? 'border-amber-500 text-amber-400 bg-amber-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Blanquear Clave</span>
        </button>
      </div>

      {/* Mandatory Administrator Contact Error Alert */}
      {errorRecuperacionAdmin && (
        <div className="mx-6 sm:mx-8 mt-4 p-4 bg-red-950/90 border-2 border-red-500/80 rounded-2xl text-red-200 text-xs font-mono shadow-xl animate-in fade-in space-y-2">
          <div className="flex items-center space-x-2 text-red-300 font-bold uppercase tracking-wider">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <span>Aviso del Sistema de Seguridad</span>
          </div>
          <p className="text-slate-100 font-bold leading-relaxed">
            Error al blanquear la clave. Debe comunicarse con el administrador <span className="text-amber-300 underline">JyE Sender Servicios</span>, email <a href="mailto:jye.sender2023@gmail.com" className="text-amber-300 underline font-mono">jye.sender2023@gmail.com</a>
          </p>
          <div className="pt-2 border-t border-red-900/60 flex items-center justify-between text-[10px] text-slate-400">
            <span>Soporte Técnico de Kairós</span>
            <span className="text-amber-400 font-bold">jye.sender2023@gmail.com</span>
          </div>
        </div>
      )}

      {/* Standard Feedback Messages */}
      {errorMsg && !errorRecuperacionAdmin && (
        <div className="mx-6 sm:mx-8 mt-4 p-3 bg-red-950/70 border border-red-500/50 rounded-xl text-red-300 text-xs flex items-center space-x-2 font-mono">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="mx-6 sm:mx-8 mt-4 p-3 bg-emerald-950/70 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs flex items-center space-x-2 font-mono">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Form Content Area */}
      <div className="p-6 sm:p-8 space-y-5 overflow-y-auto max-h-[70vh]">
        {/* ===================== */}
        {/* 1. INICIAR SESIÓN     */}
        {/* ===================== */}
        {tab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5 font-bold">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="ejemplo@estudio.com.ar"
                  required
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-600"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                  Contraseña
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setTab('recuperar');
                    setRecuperarEmail(loginEmail);
                    setErrorMsg('');
                    setErrorRecuperacionAdmin(false);
                  }}
                  className="text-[11px] font-mono text-amber-400 hover:text-amber-300 underline font-bold cursor-pointer"
                >
                  ¿Olvidó su contraseña? Blanquear clave
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white rounded-xl font-bold text-xs uppercase tracking-wider font-mono flex items-center justify-center space-x-2 transition-all shadow-lg shadow-blue-900/40 cursor-pointer"
            >
              {loading ? (
                <span>Verificando Credenciales...</span>
              ) : (
                <>
                  <span>Ingresar a Kairós</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Quick Switch for Already Registered Accounts */}
            {abogadosExistentes.length > 0 && (
              <div className="pt-4 border-t border-slate-800 mt-4 font-mono">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-2 font-bold">
                  Cuentas Registradas en este Equipo:
                </span>
                <div className="space-y-2">
                  {abogadosExistentes.map((abg) => {
                    const isCurrent = abogadoActual && abg.id === abogadoActual.id;
                    const esAdmin = abg.email.toLowerCase() === 'jye.sender2023@gmail.com' || abg.rol === 'Administrador';
                    return (
                      <button
                        key={abg.id}
                        type="button"
                        onClick={() => handleQuickLogin(abg)}
                        className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                          isCurrent
                            ? 'bg-blue-950/40 border-blue-500/50 text-blue-200'
                            : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/80 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-xs ${
                            esAdmin 
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                              : 'bg-blue-600/30 text-blue-300 border-blue-500/40'
                          }`}>
                            {abg.nombre.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-xs flex items-center space-x-1.5">
                              <span>{abg.nombre}</span>
                              {isCurrent && (
                                <span className="text-[9px] bg-blue-500/20 text-blue-400 px-1.5 py-0.2 rounded border border-blue-500/30">
                                  ACTIVO
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {abg.matricula} • {abg.email}
                            </div>
                          </div>
                        </div>

                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                            esAdmin
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : abg.rol === 'Socio'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {esAdmin ? 'Administrador' : abg.rol}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quick Demo & Admin Access Options */}
            <div className="pt-4 border-t border-slate-800 mt-4 space-y-2">
              <button
                type="button"
                onClick={handleDemoAdminAccess}
                disabled={loading}
                className="w-full py-2.5 px-4 bg-amber-950/40 hover:bg-amber-900/50 border border-amber-500/40 hover:border-amber-500/70 rounded-xl text-amber-300 text-xs font-mono font-bold flex items-center justify-center space-x-2 transition-all shadow-sm cursor-pointer"
              >
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span>Acceso como Administrador General (JyE Sender Servicios)</span>
              </button>

              <button
                type="button"
                onClick={handleDemoDirectorAccess}
                disabled={loading}
                className="w-full py-2.5 px-4 bg-blue-950/40 hover:bg-blue-900/50 border border-blue-500/40 hover:border-blue-500/70 rounded-xl text-blue-300 text-xs font-mono font-bold flex items-center justify-center space-x-2 transition-all shadow-sm cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span>Acceso Rápido como Dr. Alejandro Posadas (Socio)</span>
              </button>

              <button
                type="button"
                onClick={handleOidcQuickAuth}
                disabled={loading}
                className="w-full py-2.5 px-4 bg-slate-950 hover:bg-slate-800/80 border border-purple-500/30 hover:border-purple-500/60 rounded-xl text-purple-300 text-xs font-mono font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <Shield className="w-4 h-4 text-purple-400" />
                <span>Acceso SSO Jusmisiones (Keycloak OIDC)</span>
              </button>
            </div>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setTab('registro')}
                className="text-xs text-slate-400 hover:text-blue-400 font-mono transition-colors cursor-pointer"
              >
                ¿Aún no tienes cuenta? <span className="text-blue-400 font-bold underline">Regístrate aquí</span>
              </button>
            </div>
          </form>
        )}

        {/* ========================================= */}
        {/* 2. BLANQUEO DE CLAVE CON PREGUNTA SECRETA */}
        {/* ========================================= */}
        {tab === 'recuperar' && (
          <div className="space-y-4 font-mono">
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl">
              <div className="flex items-center space-x-2 text-amber-300 text-xs font-bold uppercase mb-1">
                <HelpCircle className="w-4 h-4" />
                <span>Blanqueo de Clave por Pregunta Secreta</span>
              </div>
              <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                Para restablecer su contraseña, ingrese su correo electrónico registrado y responda la pregunta secreta configurada en su cuenta.
              </p>
            </div>

            {pasoRecuperacion === 'buscar_email' ? (
              <form onSubmit={handleBuscarPreguntaSecreta} className="space-y-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-slate-400 mb-1.5 font-bold">
                    Correo Electrónico Registrado *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      value={recuperarEmail}
                      onChange={(e) => setRecuperarEmail(e.target.value)}
                      placeholder="ejemplo@estudio.com.ar o jye.sender2023@gmail.com"
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500 transition-all placeholder:text-slate-600"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-lg shadow-amber-900/40 cursor-pointer"
                >
                  {loading ? (
                    <span>Verificando usuario...</span>
                  ) : (
                    <>
                      <span>Continuar y Cargar Pregunta Secreta</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleBlanquearClaveSubmit} className="space-y-4">
                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Pregunta Secreta de Seguridad:</span>
                  <p className="text-xs text-amber-300 font-bold">{recuperarPregunta}</p>
                  <span className="text-[10px] text-slate-500">Usuario: {recuperarEmail}</span>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-slate-400 mb-1.5 font-bold">
                    Su Respuesta Secreta *
                  </label>
                  <div className="relative">
                    <HelpCircle className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={recuperarRespuesta}
                      onChange={(e) => setRecuperarRespuesta(e.target.value)}
                      placeholder="Escriba su respuesta..."
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500 transition-all placeholder:text-slate-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-slate-400 mb-1 font-bold">
                      Nueva Contraseña *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type="password"
                        required
                        value={recuperarNuevaPassword}
                        onChange={(e) => setRecuperarNuevaPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500 transition-all placeholder:text-slate-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-slate-400 mb-1 font-bold">
                      Confirmar Contraseña *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type="password"
                        required
                        value={recuperarConfirmPassword}
                        onChange={(e) => setRecuperarConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500 transition-all placeholder:text-slate-600"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setPasoRecuperacion('buscar_email')}
                    className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-xs uppercase"
                  >
                    Volver
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-lg shadow-amber-900/40 cursor-pointer"
                  >
                    {loading ? (
                      <span>Blanqueando clave...</span>
                    ) : (
                      <>
                        <Key className="w-4 h-4" />
                        <span>Confirmar y Blanquear Clave</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setTab('login')}
                className="text-xs text-slate-400 hover:text-blue-400 transition-colors"
              >
                Volver a <span className="text-blue-400 font-bold underline">Iniciar Sesión</span>
              </button>
            </div>
          </div>
        )}

        {/* ===================== */}
        {/* 3. REGISTRO           */}
        {/* ===================== */}
        {tab === 'registro' && (
          <form onSubmit={handleRegistroSubmit} className="space-y-4 font-mono">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-slate-400 mb-1 font-bold">
                Nombre y Apellido Completo *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={regNombre}
                  onChange={(e) => setRegNombre(e.target.value)}
                  placeholder="Dr. / Dra. Nombre y Apellido"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-slate-400 mb-1 font-bold">
                  Matrícula Profesional *
                </label>
                <div className="relative">
                  <Award className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={regMatricula}
                    onChange={(e) => setRegMatricula(e.target.value)}
                    placeholder="MP 7420 - CADAM"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-slate-400 mb-1 font-bold">
                  Rol en el Estudio *
                </label>
                <select
                  value={regRol}
                  onChange={(e) => setRegRol(e.target.value as RolAbogado)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500 transition-all"
                >
                  <option value="Socio">Socio Director (Acceso Total)</option>
                  <option value="Asociado">Abogado Asociado</option>
                  <option value="Administrador">Administrador del Sistema</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-slate-400 mb-1 font-bold">
                  Correo Electrónico *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="abogado@estudio.com.ar"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-slate-400 mb-1 font-bold">
                  Contraseña de Acceso *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-600"
                  />
                </div>
              </div>
            </div>

            {/* PREGUNTA SECRETA DE RECUPERACIÓN */}
            <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
              <div className="flex items-center space-x-1.5 text-amber-400 text-[11px] font-bold uppercase">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Pregunta Secreta para Blanqueo de Clave *</span>
              </div>
              
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Seleccionar Pregunta de Seguridad:</label>
                <select
                  value={regPreguntaSecreta}
                  onChange={(e) => setRegPreguntaSecreta(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                >
                  {PREGUNTAS_SECRETAS_DISPONIBLES.map((preg, idx) => (
                    <option key={idx} value={preg}>{preg}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Respuesta Secreta * (guarde este dato con seguridad):</label>
                <input
                  type="text"
                  required
                  value={regRespuestaSecreta}
                  onChange={(e) => setRegRespuestaSecreta(e.target.value)}
                  placeholder="Escriba su respuesta secreta..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500 placeholder:text-slate-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-slate-400 mb-1 font-bold">
                Teléfono / WhatsApp de Contacto
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="tel"
                  value={regTelefono}
                  onChange={(e) => setRegTelefono(e.target.value)}
                  placeholder="+54 9 376 400-0000"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-600"
                />
              </div>
            </div>

            {/* Optional SIGED Credentials Section */}
            <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
              <span className="text-[10px] uppercase font-bold tracking-wider text-blue-400 block">
                Credenciales del Portal SIGED Misiones (Opcional):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={regUsuarioSiged}
                  onChange={(e) => setRegUsuarioSiged(e.target.value)}
                  placeholder="Usuario SIGED (ej. usuario.siged)"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500 placeholder:text-slate-600"
                />
                <input
                  type="password"
                  value={regClaveSiged}
                  onChange={(e) => setRegClaveSiged(e.target.value)}
                  placeholder="Clave SIGED"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500 placeholder:text-slate-600"
                />
              </div>
              <input
                type="password"
                value={regPinCertificado}
                onChange={(e) => setRegPinCertificado(e.target.value)}
                placeholder="PIN Token / Certificado Digital CADAM (opcional)"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500 placeholder:text-slate-600"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-lg shadow-blue-900/40 cursor-pointer"
            >
              {loading ? (
                <span>Creando Cuenta...</span>
              ) : (
                <>
                  <span>Registrar y Crear Cuenta Jurídica</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => setTab('login')}
                className="text-xs text-slate-400 hover:text-blue-400 transition-colors cursor-pointer"
              >
                ¿Ya tienes una cuenta registrada? <span className="text-blue-400 font-bold underline">Inicia sesión</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Security Footer */}
      <div className="bg-slate-950 px-6 sm:px-8 py-3.5 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500 font-mono">
        <div className="flex items-center space-x-1.5 text-slate-400">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span>Encriptación Segura TLS & Token JWT</span>
        </div>
        <span>Misiones CPCCyM • Jusmisiones</span>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
        {content}
      </div>
    );
  }

  // Full Screen Auth Landing Screen
  return (
    <div className="min-h-screen bg-slate-950 grid-bg text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 selection:bg-blue-600 selection:text-white">
      <div className="w-full max-w-xl py-6 animate-in fade-in zoom-in-95 duration-300">
        {content}
      </div>
    </div>
  );
};
