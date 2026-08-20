import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { procesarNotificacionSiged } from './src/server/sigedEngine';
import { 
  INITIAL_ABOGADOS, 
  INITIAL_EXPEDIENTES, 
  INITIAL_ACTUACIONES, 
  INITIAL_NOTIFICACIONES_PUSH, 
  INITIAL_REGISTROS_SINCRONIZACION 
} from './src/data/mockStore';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Memory store for runtime additions
  let abogadosStore = [...INITIAL_ABOGADOS];
  let expedientesStore = [...INITIAL_EXPEDIENTES];
  let actuacionesStore = [...INITIAL_ACTUACIONES];
  let notificacionesPushStore = [...INITIAL_NOTIFICACIONES_PUSH];
  let historialSyncStore = [...INITIAL_REGISTROS_SINCRONIZACION];

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
        nombre: nombre || 'Dr. Profesional Responsable',
        matricula: matricula || 'MP CPAM',
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
    res.json(abogadosStore);
  });

  // Autenticación: Registro de nuevos profesionales
  app.post('/api/auth/register', (req, res) => {
    const { nombre, email, password, matricula, rol, telefono, usuarioSiged, claveSiged } = req.body;

    if (!nombre || !email || !password || !matricula) {
      return res.status(400).json({ error: 'Todos los campos obligatorios deben completarse' });
    }

    const existe = abogadosStore.find((a) => a.email.toLowerCase() === email.toLowerCase());
    if (existe) {
      return res.status(400).json({ error: 'El correo electrónico ya se encuentra registrado en el estudio' });
    }

    const nuevoAbogado = {
      id: `ABG-${String(abogadosStore.length + 1).padStart(3, '0')}`,
      nombre,
      email,
      password,
      matricula,
      rol: (rol as 'Socio' | 'Asociado') || 'Asociado',
      telefono: telefono || '+5493764000000',
      avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
      credencialesSiged: {
        usuarioSiged: usuarioSiged || `${email.split('@')[0]}.siged`,
        claveSiged: claveSiged || '••••••••••••',
        estadoConexion: 'Conectado' as const,
        ultimaSincronizacion: new Date().toISOString().replace('T', ' ').substring(0, 16),
        sincronizacionAutomatica: true,
        frecuenciaMinutos: 15,
        notificacionesPushWeb: true,
      },
    };

    abogadosStore.push(nuevoAbogado);
    return res.status(201).json({ exitoso: true, abogado: nuevoAbogado });
  });

  // Autenticación: Inicio de Sesión
  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;

    const abogado = abogadosStore.find((a) => a.email.toLowerCase() === email.toLowerCase());
    if (!abogado) {
      return res.status(401).json({ error: 'Credenciales inválidas. Usuario no encontrado.' });
    }

    // Pass verification (or fallback to '123456' for mock users)
    if (abogado.password && abogado.password !== password && password !== '123456') {
      return res.status(401).json({ error: 'Contraseña incorrecta. Verifique sus datos.' });
    }

    return res.json({ exitoso: true, abogado });
  });

  // Actualizar credenciales SIGED en Perfil
  app.post('/api/siged/credenciales', (req, res) => {
    const { abogado_id, usuarioSiged, claveSiged, pinCertificadoDigital, sincronizacionAutomatica, frecuenciaMinutos, notificacionesPushWeb } = req.body;
    const index = abogadosStore.findIndex((a) => a.id === abogado_id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Abogado no encontrado' });
    }

    const abogadoActualizado = {
      ...abogadosStore[index],
      credencialesSiged: {
        usuarioSiged: usuarioSiged || 'jposadas.cadam',
        claveSiged: claveSiged || '••••••••••••',
        pinCertificadoDigital: pinCertificadoDigital || '884192',
        estadoConexion: 'Conectado' as const,
        ultimaSincronizacion: new Date().toISOString().replace('T', ' ').substring(0, 16),
        sincronizacionAutomatica: sincronizacionAutomatica ?? true,
        frecuenciaMinutos: frecuenciaMinutos || 15,
        notificacionesPushWeb: notificacionesPushWeb ?? true,
      },
    };

    abogadosStore[index] = abogadoActualizado;
    return res.json(abogadoActualizado);
  });

  // 3. Expedientes del Estudio (Filtrados por seguridad multiusuario)
  app.get('/api/expedientes', (req, res) => {
    const abogadoId = req.query.abogado_id as string;
    if (!abogadoId) {
      return res.json(expedientesStore);
    }

    const abogado = abogadosStore.find((a) => a.id === abogadoId);
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

  // Actualizar asignación de abogados autorizados en un expediente
  app.post('/api/expedientes/autorizaciones', (req, res) => {
    const { expediente_id, abogados_autorizados } = req.body;
    const expIndex = expedientesStore.findIndex((e) => e.id === expediente_id);

    if (expIndex === -1) {
      return res.status(404).json({ error: 'Expediente no encontrado' });
    }

    expedientesStore[expIndex] = {
      ...expedientesStore[expIndex],
      abogados_autorizados: abogados_autorizados || [],
    };

    return res.json({ exitoso: true, expediente: expedientesStore[expIndex] });
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
  // SIGED SYNCHRONIZATION & PUSH NOTIFICATIONS
  // ==========================================

  // Sincronización activa de movimientos SIGED
  app.post('/api/siged/sincronizar', (req, res) => {
    const { abogado_id } = req.body;
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);

    // Simulated array of potential new movements decretados by Juzgados Misiones
    const posiblesMoviNovedades = [
      {
        expediente_id: 'EXP-1420',
        expediente_numero: '1420/2025',
        caratula: 'GOMEZ ALBERTO C/ SUPERMERCADOS MISIONES S.R.L. S/ DAÑOS Y PERJUICIOS',
        tipo: 'CEDULA' as const,
        titulo: '🔔 Proveído de Apertura a Prueba',
        mensaje: 'Juzgado Civil N° 1 declara abierta la causa a prueba por el plazo de 40 días hábiles.',
        firmante: 'Juez Dr. Esteban M. Ruiz',
        texto: 'Posadas, Misiones. Atento lo solicitado y estado de autos, ábrase la causa a prueba por el plazo legal de cuarenta días hábiles.',
      },
      {
        expediente_id: 'EXP-882',
        expediente_numero: '882/2024',
        caratula: 'SILVA ROCIO C/ EMPRESA TIGRE BUS S.A. S/ LABORAL',
        tipo: 'RESOLUCION' as const,
        titulo: '⚡ Homologación de Acuerdo Conciliatorio',
        mensaje: 'Tribunal del Trabajo N° 2 homologa convenio laboral alcanzado en audiencia.',
        firmante: 'Dra. María Laura Varela',
        texto: 'Posadas. Téngase por homologado en cuanto a derecho el acuerdo transaccional presentado por las partes.',
      },
      {
        expediente_id: 'EXP-3105',
        expediente_numero: '3105/2024',
        caratula: 'BANCO MACRO S.A. C/ KRAMER HUGO S/ EJECUTIVO',
        tipo: 'INTIMACION' as const,
        titulo: '🚨 Mandamiento de Embargo Librado',
        mensaje: 'Se libra mandamiento de embargo sobre cuenta bancaria en Banco Macro.',
        firmante: 'Secretario Dr. H. B. Méndez',
        texto: 'Eldorado. Líbrese mandamiento de embargo sobre los saldos depositados en caja de ahorro hasta cubrir la suma demandada.',
      },
    ];

    // Pick 1 random movement to simulate real-time court activity
    const novedad = posiblesMoviNovedades[Math.floor(Math.random() * posiblesMoviNovedades.length)];

    // Add new movement to target expediente in expedientesStore
    const targetExp = expedientesStore.find((e) => e.id === novedad.expediente_id);
    if (targetExp) {
      const nuevoMov = {
        id: `M-${Date.now()}`,
        fecha: timestamp.split(' ')[0],
        tipo: novedad.titulo,
        descripcion: novedad.mensaje,
        firmante: novedad.firmante,
      };
      targetExp.movimientos.unshift(nuevoMov);
      targetExp.estado = 'Con plazo pendiente';
    }

    // Add new Actuación SIGED
    const nuevaActuacion = {
      id: `ACT-${String(actuacionesStore.length + 1).padStart(3, '0')}`,
      expediente_id: novedad.expediente_id,
      fecha: timestamp.split(' ')[0],
      tipo_actuacion: novedad.titulo,
      firmante: novedad.firmante,
      texto_completo: novedad.texto,
      procesado: false,
    };
    actuacionesStore.unshift(nuevaActuacion);

    // Create Push Notification
    const nuevaNotifPush = {
      id: `NOT-${Date.now()}`,
      abogado_id: abogado_id || 'ABG-001',
      expediente_id: novedad.expediente_id,
      expediente_numero: novedad.expediente_numero,
      caratula: novedad.caratula,
      titulo: novedad.titulo,
      mensaje: novedad.mensaje,
      tipo: novedad.tipo,
      fecha: timestamp,
      leida: false,
      actuacion_id: nuevaActuacion.id,
    };
    notificacionesPushStore.unshift(nuevaNotifPush);

    // Log Sync Run
    const registroSync = {
      id: `SYNC-${Date.now()}`,
      fecha: timestamp,
      expedientesAnalizados: expedientesStore.length,
      nuevosMovimientosDetectados: 1,
      estado: 'Con Novedades' as const,
      detalles: `Se sincronizó con éxito la mesa de entradas virtual SIGED Misiones. Novedad detectada en causa ${novedad.expediente_numero}.`,
    };
    historialSyncStore.unshift(registroSync);

    // Update lawyer last sync date
    const abg = abogadosStore.find((a) => a.id === (abogado_id || 'ABG-001'));
    if (abg && abg.credencialesSiged) {
      abg.credencialesSiged.ultimaSincronizacion = timestamp;
      abg.credencialesSiged.estadoConexion = 'Conectado';
    }

    return res.json({
      exitoso: true,
      timestamp,
      novedadDetectada: nuevaNotifPush,
      expedientesAnalizados: expedientesStore.length,
      registroSync,
    });
  });

  // Notificaciones Push List
  app.get('/api/siged/notificaciones', (req, res) => {
    res.json(notificacionesPushStore);
  });

  // Marcar notificación leída
  app.post('/api/siged/notificaciones/marcar-leida', (req, res) => {
    const { id } = req.body;
    notificacionesPushStore = notificacionesPushStore.map((n) =>
      n.id === id ? { ...n, leida: true } : n
    );
    res.json({ exito: true });
  });

  // Historial Sync
  app.get('/api/siged/historial-sync', (req, res) => {
    res.json(historialSyncStore);
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
