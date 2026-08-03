import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { SigedProcessor } from './components/SigedProcessor';
import { ExpedientesView } from './components/ExpedientesView';
import { CalendarView } from './components/CalendarView';
import { ApiExplorerView } from './components/ApiExplorerView';
import { Abogado, Expediente, ActuacionSIGED } from './types';
import { INITIAL_ABOGADOS, INITIAL_EXPEDIENTES, INITIAL_ACTUACIONES } from './data/mockStore';

export default function App() {
  const [abogados, setAbogados] = useState<Abogado[]>(INITIAL_ABOGADOS);
  const [abogadoActual, setAbogadoActual] = useState<Abogado>(INITIAL_ABOGADOS[0]);
  const [tabActiva, setTabActiva] = useState<string>('motor');

  const [expedientes, setExpedientes] = useState<Expediente[]>(INITIAL_EXPEDIENTES);
  const [actuaciones, setActuaciones] = useState<ActuacionSIGED[]>(INITIAL_ACTUACIONES);

  useEffect(() => {
    // Fetch lawyers from backend
    fetch('/api/abogados')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setAbogados(data);
        }
      })
      .catch((err) => console.log('Using default client abogados store:', err));
  }, []);

  useEffect(() => {
    // Fetch expedientes based on selected lawyer
    fetch(`/api/expedientes?abogado_id=${abogadoActual.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setExpedientes(data);
        }
      })
      .catch((err) => console.log('Using default expedientes store:', err));
  }, [abogadoActual]);

  const handleSeleccionarActuacionParaProcesar = (actuacion: ActuacionSIGED, expte: Expediente) => {
    setTabActiva('motor');
  };

  return (
    <div className="min-h-screen bg-slate-900 grid-bg text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        abogados={abogados}
        abogadoActual={abogadoActual}
        onSelectAbogado={setAbogadoActual}
        tabActiva={tabActiva}
        onSelectTab={setTabActiva}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {tabActiva === 'motor' && (
          <SigedProcessor abogadoActual={abogadoActual} expedientes={expedientes} />
        )}

        {tabActiva === 'expedientes' && (
          <ExpedientesView
            abogadoActual={abogadoActual}
            expedientes={expedientes}
            abogados={abogados}
            actuaciones={actuaciones}
            onSeleccionarActuacionParaProcesar={handleSeleccionarActuacionParaProcesar}
          />
        )}

        {tabActiva === 'calendario' && <CalendarView />}

        {tabActiva === 'api' && <ApiExplorerView abogadoActual={abogadoActual} />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900/90 backdrop-blur-md py-4 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 status-glow"></span>
            <span className="font-mono text-[11px] text-slate-400">Estudio Posadas & Asociados • SIGED Engine</span>
          </div>
          <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">
            PODER JUDICIAL DE MISIONES • CPCCYM
          </span>
        </div>
      </footer>
    </div>
  );
}
