import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { procesarNotificacionSiged } from './src/server/sigedEngine';
import { INITIAL_ABOGADOS, INITIAL_EXPEDIENTES, INITIAL_ACTUACIONES } from './src/data/mockStore';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Memory store for runtime additions
  let expedientesStore = [...INITIAL_EXPEDIENTES];
  let actuacionesStore = [...INITIAL_ACTUACIONES];

  // ==========================================
  // API ROUTES
  // ==========================================

  // 1. Core Endpoint for SIGED Intelligence Processing (Main Prompt Requirement)
  app.post('/api/procesar-siged', async (req, res) => {
    try {
      const { abogado_autenticado, abogado_id, nombre, matricula, rol, expediente, texto_actuacion, fecha_notificacion } = req.body;

      // Normalize abogado input in case user sends flattened or nested properties
      const authUser = abogado_autenticado || {
        abogado_id: abogado_id || 'ABG-001',
        nombre: nombre || 'Dr. Juan Manuel Posadas',
        matricula: matricula || 'MP 4102 - CADAM',
        rol: rol || 'Socio',
      };

      if (!texto_actuacion) {
        return res.status(400).json({
          error: 'Debe incluir el campo "texto_actuacion" proveniente del portal SIGED.',
        });
      }

      const resultado = await procesarNotificacionSiged({
        abogado_autenticado: authUser,
        expediente,
        texto_actuacion,
        fecha_notificacion,
      });

      // Returns the exact strict JSON format requested by user
      return res.json(resultado);
    } catch (err: any) {
      console.error('Error procesando SIGED:', err);
      return res.status(500).json({
        error: 'Error interno en el motor de inteligencia procesal',
        detalles: err?.message || String(err),
      });
    }
  });

  // 2. Abogados del Estudio
  app.get('/api/abogados', (req, res) => {
    res.json(INITIAL_ABOGADOS);
  });

  // 3. Expedientes del Estudio (Filtrados por seguridad multiusuario)
  app.get('/api/expedientes', (req, res) => {
    const abogadoId = req.query.abogado_id as string;
    if (!abogadoId) {
      return res.json(expedientesStore);
    }

    const abogado = INITIAL_ABOGADOS.find((a) => a.id === abogadoId);
    if (!abogado) {
      return res.status(404).json({ error: 'Abogado no encontrado' });
    }

    if (abogado.rol === 'Socio') {
      return res.json(expedientesStore);
    }

    // Si es Asociado, filtrar causas autorizadas
    const permitidos = expedientesStore.filter((exp) =>
      exp.abogados_autorizados.includes(abogadoId)
    );
    return res.json(permitidos);
  });

  // 4. Actuaciones SIGED
  app.get('/api/actuaciones', (req, res) => {
    res.json(actuacionesStore);
  });

  app.post('/api/actuaciones', (req, res) => {
    const nueva = {
      id: `ACT-${String(actuacionesStore.length + 1).padStart(3, '0')}`,
      expediente_id: req.body.expediente_id,
      fecha: req.body.fecha || new Date().toISOString().split('T')[0],
      tipo_actuacion: req.body.tipo_actuacion || 'Actuación SIGED',
      firmante: req.body.firmante || 'Juzgado Misiones',
      texto_completo: req.body.texto_completo,
      procesado: false,
    };
    actuacionesStore.unshift(nueva);
    res.status(201).json(nueva);
  });

  // ==========================================
  // VITE MIDDLEWARE / STATIC SERVING
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Motor Procesal SIGED ejecutándose en http://localhost:${PORT}`);
  });
}

startServer();
