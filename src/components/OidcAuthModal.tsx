import React, { useState } from 'react';
import { Key, ShieldCheck, UserCheck, RefreshCw, FileText, CheckCircle2, Lock, ExternalLink, Globe } from 'lucide-react';
import { OidcSessionState, Abogado } from '../types';

interface OidcAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: OidcSessionState;
  onUpdateSession: (newSession: OidcSessionState) => void;
  abogados: Abogado[];
  abogadoActual: Abogado;
  onSelectAbogado: (abogado: Abogado) => void;
}

export const OidcAuthModal: React.FC<OidcAuthModalProps> = ({
  isOpen,
  onClose,
  session,
  onUpdateSession,
  abogados,
  abogadoActual,
  onSelectAbogado,
}) => {
  const [isSimulatingSso, setIsSimulatingSso] = useState(false);
  const [activeTab, setActiveTab] = useState<'claims' | 'config' | 'cambiar_abogado'>('claims');

  if (!isOpen) return null;

  const handleSimulateKeycloakLogin = (abg: Abogado) => {
    setIsSimulatingSso(true);
    setTimeout(() => {
      onSelectAbogado(abg);
      const newSession: OidcSessionState = {
        autenticado: true,
        metodoAutenticacion: 'OIDC_SSO',
        fechaAutenticacion: new Date().toISOString().replace('T', ' ').substring(0, 19),
        tokenJwt: `eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(
          JSON.stringify({
            sub: `usr_${abg.id.toLowerCase()}`,
            preferred_username: abg.email.split('@')[0],
            email: abg.email,
            name: abg.nombre,
            matricula_cpam: abg.matricula,
            roles: [abg.rol, 'Abogado_Acreditado_SIGED'],
            circunscripcion: 'Primera (Posadas)',
            expedientes_acreditados: abg.rol === 'Socio' ? ['EXP-1420', 'EXP-882', 'EXP-3105', 'EXP-9941', 'EXP-504'] : ['EXP-1420', 'EXP-882'],
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 3600,
          })
        )}.siged_signature_hash`,
        claims: {
          sub: `usr_${abg.id.toLowerCase()}`,
          preferred_username: abg.email.split('@')[0],
          email: abg.email,
          name: abg.nombre,
          matricula_cpam: abg.matricula,
          roles: [abg.rol, 'Abogado_Acreditado_SIGED'],
          circunscripcion: 'Primera (Posadas)',
          expedientes_acreditados: abg.rol === 'Socio' ? ['EXP-1420', 'EXP-882', 'EXP-3105', 'EXP-9941', 'EXP-504'] : ['EXP-1420', 'EXP-882'],
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 3600,
        },
      };
      onUpdateSession(newSession);
      setIsSimulatingSso(false);
    }, 800);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-lg">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold uppercase tracking-tight text-slate-100 flex items-center space-x-2">
                <span>Autenticación OIDC / Keycloak SIGED</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-mono">
                  IDP Jusmisiones
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Single Sign-On (SSO) en <code className="text-blue-400 font-mono">idm.jusmisiones.gov.ar</code>
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

        {/* Navigation Tabs */}
        <div className="bg-slate-950/60 px-6 pt-2 border-b border-slate-800 flex space-x-4 text-xs font-mono">
          <button
            onClick={() => setActiveTab('claims')}
            className={`pb-2.5 font-semibold transition-colors border-b-2 ${
              activeTab === 'claims'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Session Claims (JWT)
          </button>
          <button
            onClick={() => setActiveTab('cambiar_abogado')}
            className={`pb-2.5 font-semibold transition-colors border-b-2 ${
              activeTab === 'cambiar_abogado'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Simular Login SSO / Abogado
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`pb-2.5 font-semibold transition-colors border-b-2 ${
              activeTab === 'config'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Configuración OIDC Spec
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {activeTab === 'claims' && (
            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400 uppercase">Estado Autenticación:</span>
                  <span className="inline-flex items-center space-x-1 text-xs font-bold text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded border border-emerald-800/60 font-mono">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>OIDC VALIDO & SESION ACTIVA</span>
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-800 font-mono">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">Abogado Autenticado:</span>
                    <strong className="text-slate-100">{session.claims?.name || abogadoActual.nombre}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">Matrícula CPAM:</span>
                    <strong className="text-blue-400">{session.claims?.matricula_cpam || abogadoActual.matricula}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">Rol en Estudio:</span>
                    <span className="text-slate-200">{session.claims?.roles.join(', ')}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">Circunscripción:</span>
                    <span className="text-slate-200">{session.claims?.circunscripcion || 'Primera (Posadas)'}</span>
                  </div>
                </div>
              </div>

              {/* JWT Claims JSON viewer */}
              <div>
                <span className="text-xs font-mono text-slate-400 uppercase block mb-1">
                  Decodificación OpenID Connect Token (ID Token & Access Token):
                </span>
                <pre className="bg-slate-950 p-4 border border-slate-800 rounded-lg text-xs text-blue-300 font-mono overflow-x-auto max-h-48 leading-relaxed">
                  {JSON.stringify(session.claims || {}, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'cambiar_abogado' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400 leading-relaxed">
                Seleccione un abogado para simular el flujo OAuth 2.0 / OIDC Authorization Code Flow con PKCE en el proveedor de identidad del Poder Judicial de Misiones.
              </p>

              <div className="space-y-2">
                {abogados.map((abg) => {
                  const isSelected = abogadoActual.id === abg.id;
                  return (
                    <div
                      key={abg.id}
                      className={`p-3.5 rounded-lg border transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-blue-600/10 border-blue-500/50 text-white'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        {abg.avatarUrl && (
                          <img
                            src={abg.avatarUrl}
                            alt={abg.nombre}
                            className="w-9 h-9 rounded-full object-cover border border-slate-700"
                          />
                        )}
                        <div>
                          <div className="flex items-center space-x-2">
                            <strong className="text-xs font-bold">{abg.nombre}</strong>
                            <span
                              className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                                abg.rol === 'Socio'
                                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {abg.rol}
                            </span>
                          </div>
                          <span className="text-[11px] font-mono text-slate-400 block">{abg.matricula} • {abg.email}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleSimulateKeycloakLogin(abg)}
                        disabled={isSimulatingSso}
                        className={`px-3 py-1.5 text-xs font-bold rounded transition-colors flex items-center space-x-1 ${
                          isSelected
                            ? 'bg-blue-600 text-white cursor-default'
                            : 'bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-200 border border-slate-700'
                        }`}
                      >
                        {isSimulatingSso && isSelected ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <UserCheck className="w-3.5 h-3.5" />
                        )}
                        <span>{isSelected ? 'Autenticado' : 'Iniciar SSO'}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'config' && (
            <div className="space-y-4 font-mono text-xs">
              <div className="bg-slate-950 p-4 border border-slate-800 rounded-lg space-y-2">
                <div className="flex items-center justify-between text-blue-400 font-bold">
                  <span>IDENTITY PROVIDER PARAMETERS (OIDC Spec)</span>
                  <Globe className="w-4 h-4" />
                </div>
                <div className="space-y-1 text-slate-300 pt-1">
                  <div><span className="text-slate-500">Issuer / IDP:</span> https://idm.jusmisiones.gov.ar/auth/realms/poder-judicial-misiones</div>
                  <div><span className="text-slate-500">client_id:</span> <span className="text-amber-400 font-bold">siged-oidc</span></div>
                  <div><span className="text-slate-500">scope:</span> <span className="text-emerald-400">openid email profile</span></div>
                  <div><span className="text-slate-500">grant_type:</span> authorization_code + PKCE (S256)</div>
                  <div><span className="text-slate-500">token_endpoint:</span> /protocol/openid-connect/token</div>
                </div>
              </div>

              <div className="p-3 bg-blue-950/20 border border-blue-500/30 rounded text-slate-300 text-[11px] leading-relaxed">
                <strong className="text-blue-400 block mb-1">Mapeo Automático de Seguridad:</strong>
                Una vez completado el apretón de manos (handshake) OIDC, el token JWT valida que la matrícula profesional esté habilitada ante el Colegio de Abogados de Misiones (CADAM) y asigna la visibilidad de causas según el rol (Socio ve toda la cartera, Asociado ve causas autorizadas).
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">SIGED Misiones • Keycloak OIDC Standard</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-bold transition-colors"
          >
            Cerrar Detalle
          </button>
        </div>
      </div>
    </div>
  );
};
