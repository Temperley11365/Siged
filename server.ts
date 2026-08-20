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
    const { nombre, email, password, matricula, rol, telefono, usuarioSiged, claveSiged, pinCertificadoDigital } = req.body;

    if (!nombre || !email || !password || !matricula) {
      return res.status(400).json({ error: 'Todos los campos obligatorios deben completarse' });
    }

    const existe = abogadosStore.find((a) => a.email.toLowerCase() === email.toLowerCase());
    if (existe) {
      return res.status(400).json({ error: 'El correo electrónico ya se encuentra registrado en el estudio' });
    }

    const tieneCredsSiged = !!(usuarioSiged && usuarioSiged.trim() && claveSiged && claveSiged.trim());

    const nuevoAbogado = {
      id: `ABG-${String(abogadosStore.length + 1).padStart(3, '0')}`,
      nombre,
      email,
      password,
      matricula,
      rol: (rol as 'Socio' | 'Asociado') || 'Asociado',
      telefono: telefono || '+5493764000000',
      avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
      credencialesSiged: tieneCredsSiged ? {
        usuarioSiged: usuarioSiged.trim(),
        claveSiged: claveSiged.trim(),
        pinCertificadoDigital: pinCertificadoDigital?.trim() || '',
        estadoConexion: 'Conectado' as const,
        ultimaSincronizacion: new Date().toISOString().replace('T', ' ').substring(0, 16),
        sincronizacionAutomatica: true,
        frecuenciaMinutos: 15,
        notificacionesPushWeb: true,
      } : {
        usuarioSiged: '',
        claveSiged: '',
        pinCertificadoDigital: '',
        estadoConexion: 'Desconectado' as const,
        sincronizacionAutomatica: false,
        frecuenciaMinutos: 15,
        notificacionesPushWeb: false,
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

    // Pass verification
    if (abogado.password && abogado.password !== password) {
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

    const tieneCreds = !!(usuarioSiged && usuarioSiged.trim() && claveSiged && claveSiged.trim());

    const abogadoActualizado = {
      ...abogadosStore[index],
      credencialesSiged: {
        usuarioSiged: usuarioSiged ? usuarioSiged.trim() : '',
        claveSiged: claveSiged ? claveSiged.trim() : '',
        pinCertificadoDigital: pinCertificadoDigital ? pinCertificadoDigital.trim() : '',
        estadoConexion: tieneCreds ? ('Conectado' as const) : ('Desconectado' as const),
        ultimaSincronizacion: tieneCreds ? new Date().toISOString().replace('T', ' ').substring(0, 16) : undefined,
        sincronizacionAutomatica: sincronizacionAutomatica ?? tieneCreds,
        frecuenciaMinutos: frecuenciaMinutos || 15,
        notificacionesPushWeb: notificacionesPushWeb ?? tieneCreds,
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

  // Crear nuevo expediente en el backend
  app.post('/api/expedientes', (req, res) => {
    const nuevo = req.body;
    if (!nuevo || !nuevo.id) {
      return res.status(400).json({ error: 'Datos de expediente inválidos' });
    }
    const idx = expedientesStore.findIndex(e => e.id === nuevo.id);
    if (idx >= 0) {
      expedientesStore[idx] = nuevo;
    } else {
      expedientesStore.unshift(nuevo);
    }
    return res.status(201).json(nuevo);
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

    const abg = abogadosStore.find((a) => a.id === abogado_id);
    const usuarioSiged = abg?.credencialesSiged?.usuarioSiged?.trim();
    const claveSiged = abg?.credencialesSiged?.claveSiged?.trim();

    // If user does not have SIGED credentials loaded, do not emit any notifications or test notifications
    if (!usuarioSiged || !claveSiged) {
      return res.status(400).json({
        exitoso: false,
        error: 'Credenciales SIGED no configuradas. Por favor cargue su usuario y clave SIGED en su Perfil para poder sincronizar las causas del Poder Judicial de Misiones.',
      });
    }

    // Lawyer is authenticated to SIGED
    abg.credencialesSiged!.ultimaSincronizacion = timestamp;
    abg.credencialesSiged!.estadoConexion = 'Conectado';

    // Check for any unprocessed real actuacion
    const causasAbogado = expedientesStore.filter(e => e.abogados_autorizados.includes(abogado_id));
    const causasIds = causasAbogado.map(c => c.id);
    const actuacionPendiente = actuacionesStore.find(a => causasIds.includes(a.expediente_id) && !a.procesado);

    let nuevaNotifPush: any = null;

    if (actuacionPendiente) {
      const expVinculado = causasAbogado.find(c => c.id === actuacionPendiente.expediente_id);
      nuevaNotifPush = {
        id: `NOT-${Date.now()}`,
        abogado_id: abogado_id,
        expediente_id: actuacionPendiente.expediente_id,
        expediente_numero: expVinculado?.numero || 'S/N',
        caratula: expVinculado?.caratula || 'Causa Judicial Misiones',
        titulo: `🔔 Nueva Actuación: ${actuacionPendiente.tipo_actuacion}`,
        mensaje: actuacionPendiente.texto_completo.substring(0, 120) + '...',
        tipo: 'PROVEIDO' as const,
        fecha: timestamp,
        leida: false,
        actuacion_id: actuacionPendiente.id,
      };
      notificacionesPushStore.unshift(nuevaNotifPush);
    }

    const nuevosMovimientos = nuevaNotifPush ? 1 : 0;

    const registroSync = {
      id: `SYNC-${Date.now()}`,
      fecha: timestamp,
      expedientesAnalizados: causasAbogado.length,
      nuevosMovimientosDetectados: nuevosMovimientos,
      estado: nuevosMovimientos > 0 ? ('Con Novedades' as const) : ('Exitoso' as const),
      detalles: nuevosMovimientos > 0
        ? `Sincronización con SIGED Misiones completada. Se detectó 1 nueva actuación en causa ${nuevaNotifPush.expediente_numero}.`
        : `Sincronización con SIGED Misiones completada con éxito. Se analizaron ${causasAbogado.length} expedientes activos sin novedades pendientes.`,
    };
    historialSyncStore.unshift(registroSync);

    return res.json({
      exitoso: true,
      timestamp,
      novedadDetectada: nuevaNotifPush,
      expedientesAnalizados: causasAbogado.length,
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
