import React, { useState } from 'react';
import { 
  Zap, FileText, Scale, Calendar, CheckSquare, Folder, Code, Key, UserCheck, 
  ShieldCheck, ChevronDown, Bell, RefreshCw, Settings, Check, ExternalLink, Cpu, ShieldAlert,
  Users, UserPlus, LogIn, LogOut, Shield, Sun, Moon, BookOpen, Globe
} from 'lucide-react';
import { Abogado, OidcSessionState, NotificacionPushSiged } from '../types';

export type TabId = 
  | 'motor' 
  | 'expedientes' 
  | 'portales_externos'
  | 'pruebas' 
  | 'audiencias' 
  | 'tareas' 
  | 'agenda' 
  | 'documentos' 
  | 'repositorio'
  | 'api_explorer';

interface NavbarProps {
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
  abogadoActual: Abogado;
  onOpenOidcModal: () => void;
  onOpenPerfilModal: () => void;
  onOpenAuthModal: () => void;
  onOpenAsociadosModal: () => void;
  oidcSession: OidcSessionState;
  notificacionesPush: NotificacionPushSiged[];
  onMarcarNotificacionLeida: (id: string) => void;
  onSincronizarSiged: () => void;
  isSyncing: boolean;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  abogadoActual,
  onOpenOidcModal,
  onOpenPerfilModal,
  onOpenAuthModal,
  onOpenAsociadosModal,
  oidcSession,
  notificacionesPush,
  onMarcarNotificacionLeida,
  onSincronizarSiged,
  isSyncing,
  theme = 'dark',
  onToggleTheme,
}) => {
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const sinLeerCount = notificacionesPush.filter((n) => !n.leida).length;

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'motor', label: 'Motor SIGED', icon: <Zap className="w-4 h-4 text-amber-400" /> },
    { id: 'expedientes', label: 'Expedientes', icon: <FileText className="w-4 h-4 text-blue-400" /> },
    { id: 'portales_externos', label: 'Portales ANSES & PJN', icon: <Globe className="w-4 h-4 text-teal-400" /> },
    { id: 'pruebas', label: 'Pruebas', icon: <Scale className="w-4 h-4 text-emerald-400" /> },
    { id: 'audiencias', label: 'Audiencias', icon: <Calendar className="w-4 h-4 text-purple-400" /> },
    { id: 'tareas', label: 'Tareas', icon: <CheckSquare className="w-4 h-4 text-indigo-400" /> },
    { id: 'agenda', label: 'Agenda & Plazos', icon: <Calendar className="w-4 h-4 text-amber-400" /> },
    { id: 'documentos', label: 'Gestor & .docx', icon: <Folder className="w-4 h-4 text-cyan-400" /> },
    { id: 'repositorio', label: 'Repositorio & Guías', icon: <BookOpen className="w-4 h-4 text-amber-400" /> },
    { id: 'api_explorer', label: 'API Explorer', icon: <Code className="w-4 h-4 text-rose-400" /> },
  ];

  const handleNotificationClick = (notif: NotificacionPushSiged) => {
    onMarcarNotificacionLeida(notif.id);
    setIsNotifDropdownOpen(false);
    onSelectTab('expedientes');
  };

  return (
    <header className="bg-slate-950 border-b border-slate-800 sticky top-0 z-40 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onSelectTab('motor')}>
            <div className="p-2 bg-blue-600/20 text-blue-400 border border-blue-500/40 rounded-xl shadow-inner">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-white uppercase flex items-center space-x-1.5 font-sans">
                <span>SIGED</span>
                <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.2 rounded font-mono font-normal">Misiones</span>
              </h1>
              <span className="text-[10px] text-slate-400 font-mono block">Sistema Jurídico Unificado</span>
            </div>
          </div>

          {/* Top Actions: Sync Button, Push Bell & Lawyer Profile */}
          <div className="flex items-center space-x-3">
            {/* Quick Sync SIGED Button */}
            <button
              onClick={onSincronizarSiged}
              disabled={isSyncing}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-xs font-mono font-bold text-slate-200 flex items-center space-x-2 transition-all shadow-sm"
              title="Sincronizar expedientes y nuevos decretos con SIGED"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${isSyncing ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline">
                {isSyncing ? 'Sincronizando...' : 'Sincronizar SIGED'}
              </span>
            </button>

            {/* Theme Toggle Button (Dark / Light) */}
            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-slate-300 transition-colors"
                title={theme === 'dark' ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-indigo-400" />
                )}
              </button>
            )}

            {/* Push Notifications Bell Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsNotifDropdownOpen(!isNotifDropdownOpen);
                  setIsUserDropdownOpen(false);
                }}
                className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-slate-300 transition-colors relative"
                title="Notificaciones Push en tiempo real"
              >
                <Bell className="w-4 h-4" />
                {sinLeerCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-mono text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                    {sinLeerCount}
                  </span>
                )}
              </button>

              {/* Notification Drawer */}
              {isNotifDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 max-w-[calc(100vw-1.5rem)] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden font-mono text-xs animate-in fade-in zoom-in-95 duration-150">
                  <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Bell className="w-4 h-4 text-amber-400" />
                      <strong className="text-slate-100 uppercase text-[11px]">Notificaciones Push SIGED</strong>
                    </div>
                    <span className="text-[10px] bg-blue-600/20 text-blue-300 px-2 py-0.5 rounded border border-blue-500/30">
                      {sinLeerCount} sin leer
                    </span>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/80">
                    {notificacionesPush.length === 0 ? (
                      <div className="p-6 text-center text-slate-500 text-xs">
                        No hay notificaciones push registradas.
                      </div>
                    ) : (
                      notificacionesPush.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => handleNotificationClick(notif)}
                          className={`p-3 cursor-pointer transition-colors hover:bg-slate-800/60 flex items-start space-x-3 ${
                            !notif.leida ? 'bg-blue-950/20' : 'opacity-80'
                          }`}
                        >
                          <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                            notif.tipo === 'CEDULA'
                              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                              : notif.tipo === 'INTIMACION'
                              ? 'bg-amber-600/20 text-amber-400 border border-amber-500/30'
                              : 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                          }`}>
                            <Zap className="w-3.5 h-3.5" />
                          </div>

                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-200 text-[11px] truncate">{notif.titulo}</span>
                              <span className="text-[9px] text-slate-500">{notif.fecha.substring(11, 16)}</span>
                            </div>
                            <p className="text-[11px] text-slate-300 leading-snug">{notif.mensaje}</p>
                            <div className="text-[10px] text-blue-400 font-bold flex items-center space-x-1 pt-0.5">
                              <span>Expte. {notif.expediente_numero}</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="bg-slate-950 px-4 py-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                    <button
                      onClick={onSincronizarSiged}
                      className="text-blue-400 hover:underline font-bold flex items-center space-x-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Buscar Novedades</span>
                    </button>
                    <button
                      onClick={onOpenPerfilModal}
                      className="text-slate-400 hover:text-white"
                    >
                      Configurar Push
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown Toggle */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsUserDropdownOpen(!isUserDropdownOpen);
                  setIsNotifDropdownOpen(false);
                }}
                className="bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-xl px-3 py-1.5 flex items-center space-x-3 transition-colors text-left"
              >
                {abogadoActual.avatarUrl && (
                  <img
                    src={abogadoActual.avatarUrl}
                    alt={abogadoActual.nombre}
                    className="w-8 h-8 rounded-full border border-blue-500/40 object-cover"
                  />
                )}
                <div className="hidden sm:block">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-bold text-slate-100">{abogadoActual.nombre}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      {abogadoActual.rol}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 text-[10px] font-mono text-emerald-400">
                    <ShieldCheck className="w-3 h-3" />
                    <span>SIGED {abogadoActual.credencialesSiged?.estadoConexion === 'Conectado' ? 'OK' : 'Sync'} • {abogadoActual.matricula}</span>
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* User Profile Menu Dropdown */}
              {isUserDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 max-w-[calc(100vw-1.5rem)] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden font-mono text-xs animate-in fade-in zoom-in-95 duration-150">
                  <div className="p-4 bg-slate-950 border-b border-slate-800 space-y-1">
                    <strong className="text-slate-100 block text-xs">{abogadoActual.nombre}</strong>
                    <span className="text-[10px] text-slate-400 block">{abogadoActual.email}</span>
                    <span className="text-[10px] text-blue-400 font-bold block">{abogadoActual.matricula}</span>
                  </div>

                  <div className="p-[6px] space-y-1">
                    <button
                      onClick={() => {
                        setIsUserDropdownOpen(false);
                        onOpenAuthModal();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-slate-100 bg-blue-950/40 hover:bg-blue-900/40 border border-blue-500/30 flex items-center space-x-2.5 transition-colors"
                    >
                      <LogIn className="w-4 h-4 text-blue-400" />
                      <div>
                        <strong className="block text-xs">Iniciar Sesión / Registrarse</strong>
                        <span className="text-[10px] text-blue-300">Acceder con usuario y clave</span>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setIsUserDropdownOpen(false);
                        onOpenAsociadosModal();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-slate-200 hover:bg-slate-800 flex items-center space-x-2.5 transition-colors"
                    >
                      <Users className="w-4 h-4 text-emerald-400" />
                      <div>
                        <strong className="block text-xs">Asignar Accesos a Asociados</strong>
                        <span className="text-[10px] text-slate-400">Autorizar expedientes por abogado</span>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setIsUserDropdownOpen(false);
                        onOpenPerfilModal();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-slate-200 hover:bg-slate-800 flex items-center space-x-2.5 transition-colors"
                    >
                      <Key className="w-4 h-4 text-amber-400" />
                      <div>
                        <strong className="block text-xs">Credenciales & Sync SIGED</strong>
                        <span className="text-[10px] text-slate-400">Usuario, clave y token digital</span>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setIsUserDropdownOpen(false);
                        onOpenOidcModal();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-slate-200 hover:bg-slate-800 flex items-center space-x-2.5 transition-colors"
                    >
                      <ShieldCheck className="w-4 h-4 text-purple-400" />
                      <div>
                        <strong className="block text-xs">Autenticación Keycloak OIDC</strong>
                        <span className="text-[10px] text-slate-400">IDP idm.jusmisiones.gov.ar</span>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Horizontal Navigation Tabs */}
        <nav className="flex space-x-1 overflow-x-auto pb-2 pt-1 border-t border-slate-900 text-xs font-mono scrollbar-none">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`px-3.5 py-2 rounded-lg font-bold transition-all flex items-center space-x-2 shrink-0 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
