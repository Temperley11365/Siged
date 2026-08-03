import React from 'react';
import { Abogado } from '../types';
import { Scale, ShieldCheck, User, Sparkles, Calendar, FileText, Code2, Lock } from 'lucide-react';

interface NavbarProps {
  abogados: Abogado[];
  abogadoActual: Abogado;
  onSelectAbogado: (abogado: Abogado) => void;
  tabActiva: string;
  onSelectTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  abogados,
  abogadoActual,
  onSelectAbogado,
  tabActiva,
  onSelectTab,
}) => {
  return (
    <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-700/80 text-slate-100 sticky top-0 z-40 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onSelectTab('motor')}>
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-white shadow-md shadow-blue-900/30">
              <Scale className="w-5 h-5 text-white" />
            </div>
            <div className="leading-tight">
              <div className="flex items-center space-x-2">
                <span className="font-bold tracking-tight uppercase text-base text-slate-100">
                  SIGED <span className="text-blue-500 italic">Engine</span>
                </span>
                <span className="text-[9px] uppercase font-mono tracking-[0.15em] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  v2.5
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium tracking-[0.2em] uppercase">
                Inteligencia Procesal Unificada
              </p>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              id="nav-tab-motor"
              onClick={() => onSelectTab('motor')}
              className={`flex items-center space-x-2 px-3 py-2 rounded text-xs font-bold uppercase tracking-wider transition-all ${
                tabActiva === 'motor'
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40 shadow-sm'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Motor Procesal SIGED</span>
            </button>

            <button
              id="nav-tab-expedientes"
              onClick={() => onSelectTab('expedientes')}
              className={`flex items-center space-x-2 px-3 py-2 rounded text-xs font-bold uppercase tracking-wider transition-all ${
                tabActiva === 'expedientes'
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40 shadow-sm'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              <span>Gestión de Expedientes</span>
            </button>

            <button
              id="nav-tab-calendario"
              onClick={() => onSelectTab('calendario')}
              className={`flex items-center space-x-2 px-3 py-2 rounded text-xs font-bold uppercase tracking-wider transition-all ${
                tabActiva === 'calendario'
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40 shadow-sm'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              <span>Plazos Hábiles</span>
            </button>

            <button
              id="nav-tab-api"
              onClick={() => onSelectTab('api')}
              className={`flex items-center space-x-2 px-3 py-2 rounded text-xs font-bold uppercase tracking-wider transition-all ${
                tabActiva === 'api'
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40 shadow-sm'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Code2 className="w-3.5 h-3.5 text-blue-400" />
              <span>API JSON</span>
            </button>
          </nav>

          {/* User Selector Dropdown & Security Context */}
          <div className="flex items-center space-x-3">
            <div className="text-right hidden sm:block">
              <div className="flex items-center space-x-1.5 justify-end">
                <span className="text-xs font-bold text-slate-200">{abogadoActual.nombre}</span>
              </div>
              <p className="text-[10px] text-blue-400 uppercase tracking-wider font-bold">
                Rol: {abogadoActual.rol} | Mat: {abogadoActual.matricula}
              </p>
            </div>

            <div className="relative flex items-center gap-2">
              <div className="w-9 h-9 rounded-full border-2 border-blue-500 p-0.5 bg-slate-800 shrink-0">
                <div className="w-full h-full rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-200">
                  {abogadoActual.nombre.split(' ').map((n) => n[0]).filter((_, i) => i < 2).join('')}
                </div>
              </div>

              <select
                id="select-abogado-autenticado"
                value={abogadoActual.id}
                onChange={(e) => {
                  const sel = abogados.find((a) => a.id === e.target.value);
                  if (sel) onSelectAbogado(sel);
                }}
                className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded p-1.5 focus:ring-1 focus:ring-blue-500 cursor-pointer font-mono"
              >
                {abogados.map((abg) => (
                  <option key={abg.id} value={abg.id}>
                    {abg.nombre} ({abg.rol})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Nav Tabs */}
      <div className="md:hidden border-t border-slate-800 bg-slate-900 px-4 py-2 flex overflow-x-auto space-x-2">
        <button
          onClick={() => onSelectTab('motor')}
          className={`px-3 py-1.5 text-xs rounded uppercase font-bold tracking-wider whitespace-nowrap ${
            tabActiva === 'motor' ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40' : 'text-slate-400'
          }`}
        >
          Motor SIGED
        </button>
        <button
          onClick={() => onSelectTab('expedientes')}
          className={`px-3 py-1.5 text-xs rounded uppercase font-bold tracking-wider whitespace-nowrap ${
            tabActiva === 'expedientes' ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40' : 'text-slate-400'
          }`}
        >
          Expedientes
        </button>
        <button
          onClick={() => onSelectTab('calendario')}
          className={`px-3 py-1.5 text-xs rounded uppercase font-bold tracking-wider whitespace-nowrap ${
            tabActiva === 'calendario' ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40' : 'text-slate-400'
          }`}
        >
          Calendario
        </button>
        <button
          onClick={() => onSelectTab('api')}
          className={`px-3 py-1.5 text-xs rounded uppercase font-bold tracking-wider whitespace-nowrap ${
            tabActiva === 'api' ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40' : 'text-slate-400'
          }`}
        >
          API JSON
        </button>
      </div>
    </header>
  );
};
