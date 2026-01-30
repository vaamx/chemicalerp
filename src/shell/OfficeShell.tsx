import { useState, useEffect, useCallback, useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/store';
import type { Permission } from '../shared/types';
import styles from './OfficeShell.module.css';

/* ─── Types ─── */
interface SubModule { path: string; label: string; }
interface Module {
  id: string; label: string; icon: string; basePath: string;
  requiredPermission?: Permission; submodules: SubModule[];
}

interface Notification {
  id: string;
  type: 'alert' | 'info' | 'success' | 'warning';
  title: string;
  detail: string;
  time: string;
  module: string;
  read: boolean;
}

interface WindowEntry {
  id: string;
  title: string;
  module: string;
  path: string;
  active: boolean;
  timestamp: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  time: string;
}

/* ─── Module definitions ─── */
const MODULES: Module[] = [
  /* ═══════════ PRODUCCIÓN Y COSTOS ═══════════ */
  { id: 'production', label: 'Producción y Costos', icon: '⚙', basePath: '/production', requiredPermission: 'production:request',
    submodules: [
      { path: '/production/orders', label: 'Órdenes de Producción' },
      { path: '/production/lots', label: 'Control de Lotes' },
      { path: '/production/formulas', label: 'Fórmulas Maestras' },
      { path: '/production/protocols', label: 'Protocolos de Fabricación' },
      { path: '/production/requisition', label: 'Requisición de Materiales' },
      { path: '/production/weighing', label: 'Pesaje y Dosificación' },
      { path: '/production/mixing', label: 'Mezcla y Tanques' },
      { path: '/production/filling', label: 'Llenado y Envasado' },
      { path: '/production/labeling', label: 'Etiquetado y Empaque' },
      { path: '/production/yield', label: 'Rendimiento y Varianzas' },
      { path: '/production/costs', label: 'Costeo por Lote' },
      { path: '/production/scheduling', label: 'Programación de Planta' },
      { path: '/production/equipment', label: 'Equipos y Tanques' },
      { path: '/production/deviations', label: 'Desviaciones y NCR' },
    ] },

  /* ═══════════ CALIDAD ═══════════ */
  { id: 'quality', label: 'Calidad', icon: '🔬', basePath: '/quality',
    submodules: [
      { path: '/quality/queue', label: 'Cola de Inspección' },
      { path: '/quality/incoming', label: 'QC Materia Prima' },
      { path: '/quality/inprocess', label: 'QC En Proceso' },
      { path: '/quality/final', label: 'QC Producto Final' },
      { path: '/quality/coa', label: 'Certificados de Análisis' },
      { path: '/quality/ncr', label: 'No Conformidades (NCR)' },
      { path: '/quality/capa', label: 'Acciones Correctivas (CAPA)' },
      { path: '/quality/disposition', label: 'Disposición de Lotes' },
      { path: '/quality/specs', label: 'Especificaciones de Pruebas' },
      { path: '/quality/instruments', label: 'Instrumentos y Calibración' },
      { path: '/quality/stability', label: 'Estudios de Estabilidad' },
      { path: '/quality/retention', label: 'Muestras de Retención' },
    ] },

  /* ═══════════ INVENTARIOS ═══════════ */
  { id: 'inventory', label: 'Inventarios', icon: '📦', basePath: '/inventory', requiredPermission: 'inventory:receive',
    submodules: [
      { path: '/inventory/materials', label: 'Materias Primas (MP)' },
      { path: '/inventory/packaging', label: 'Material de Empaque (ME)' },
      { path: '/inventory/finished', label: 'Producto Terminado (PT)' },
      { path: '/inventory/locations', label: 'Ubicaciones y Bodegas' },
      { path: '/inventory/movements', label: 'Movimientos de Inventario' },
      { path: '/inventory/transfers', label: 'Traslados entre Bodegas' },
      { path: '/inventory/quarantine', label: 'Cuarentena y Liberación' },
      { path: '/inventory/fifo', label: 'FIFO / FEFO Control' },
      { path: '/inventory/counts', label: 'Conteos Físicos' },
      { path: '/inventory/adjustments', label: 'Ajustes de Inventario' },
      { path: '/inventory/minimums', label: 'Niveles Mínimos y Alertas' },
      { path: '/inventory/conversions', label: 'Conversiones de Unidad' },
      { path: '/inventory/traceability', label: 'Trazabilidad de Lotes' },
      { path: '/inventory/expiration', label: 'Control de Vencimientos' },
    ] },

  /* ═══════════ COMPRAS Y PLANIFICACIÓN ═══════════ */
  { id: 'planning', label: 'Compras y Planificación', icon: '📋', basePath: '/planning', requiredPermission: 'purchasing:create_po',
    submodules: [
      { path: '/planning/requisitions', label: 'Requisiciones de Compra' },
      { path: '/planning/orders', label: 'Órdenes de Compra' },
      { path: '/planning/approvals', label: 'Aprobación de Compras' },
      { path: '/planning/suppliers', label: 'Directorio de Proveedores' },
      { path: '/planning/evaluation', label: 'Evaluación de Proveedores' },
      { path: '/planning/prices', label: 'Comparativo de Precios' },
      { path: '/planning/receiving', label: 'Recepción de Mercadería' },
      { path: '/planning/matching', label: 'Conciliación 3 Vías' },
      { path: '/planning/mrp', label: 'MRP — Planificación Material' },
      { path: '/planning/forecast', label: 'Pronóstico de Demanda' },
      { path: '/planning/lead-times', label: 'Tiempos de Entrega' },
      { path: '/planning/contracts', label: 'Contratos y Acuerdos' },
    ] },

  /* ═══════════ PAGOS A PROVEEDORES ═══════════ */
  { id: 'purchasing', label: 'Pagos a Proveedores', icon: '🏭', basePath: '/purchasing', requiredPermission: 'purchasing:create_po',
    submodules: [
      { path: '/purchasing/pending', label: 'Cuentas por Pagar' },
      { path: '/purchasing/schedule', label: 'Programación de Pagos' },
      { path: '/purchasing/payments', label: 'Emisión de Pagos' },
      { path: '/purchasing/checks', label: 'Cheques y Transferencias' },
      { path: '/purchasing/advances', label: 'Anticipos a Proveedores' },
      { path: '/purchasing/withholdings', label: 'Retenciones (IVA / Renta)' },
      { path: '/purchasing/reconciliation', label: 'Conciliación de Cuentas' },
      { path: '/purchasing/aging', label: 'Antigüedad de Saldos AP' },
      { path: '/purchasing/returns', label: 'Devoluciones a Proveedores' },
    ] },

  /* ═══════════ MERCADO Y VENTAS ═══════════ */
  { id: 'sales', label: 'Mercado y Ventas', icon: '🛒', basePath: '/sales', requiredPermission: 'sales:create_order',
    submodules: [
      { path: '/sales/quotes', label: 'Cotizaciones' },
      { path: '/sales/orders', label: 'Órdenes de Venta' },
      { path: '/sales/customers', label: 'Directorio de Clientes' },
      { path: '/sales/pricing', label: 'Listas de Precios' },
      { path: '/sales/atp', label: 'Disponibilidad (ATP)' },
      { path: '/sales/picking', label: 'Picking y Despacho' },
      { path: '/sales/shipping', label: 'Guías y Transporte' },
      { path: '/sales/routes', label: 'Rutas de Entrega' },
      { path: '/sales/returns', label: 'Devoluciones y NC' },
      { path: '/sales/commissions', label: 'Comisiones de Venta' },
      { path: '/sales/dte', label: 'Facturación Electrónica (DTE)' },
      { path: '/sales/catalog', label: 'Catálogo de Productos' },
    ] },

  /* ═══════════ CRÉDITOS Y COBROS ═══════════ */
  { id: 'credits', label: 'Créditos y Cobros', icon: '💳', basePath: '/credits', requiredPermission: 'sales:create_order',
    submodules: [
      { path: '/credits/limits', label: 'Límites de Crédito' },
      { path: '/credits/evaluation', label: 'Evaluación Crediticia' },
      { path: '/credits/receivables', label: 'Cuentas por Cobrar' },
      { path: '/credits/aging', label: 'Antigüedad de Saldos AR' },
      { path: '/credits/collection', label: 'Gestión de Cobro' },
      { path: '/credits/reminders', label: 'Recordatorios Automáticos' },
      { path: '/credits/escalation', label: 'Escalamiento y Bloqueo' },
      { path: '/credits/receipts', label: 'Recibos de Cobro' },
      { path: '/credits/write-offs', label: 'Castigos de Cartera' },
      { path: '/credits/credit-notes', label: 'Notas de Crédito' },
    ] },

  /* ═══════════ CONTABILIDAD Y BANCOS ═══════════ */
  { id: 'accounting', label: 'Contabilidad y Bancos', icon: '📊', basePath: '/accounting', requiredPermission: 'accounting:journal_entry',
    submodules: [
      { path: '/accounting/chart', label: 'Plan de Cuentas' },
      { path: '/accounting/journal', label: 'Partidas de Diario' },
      { path: '/accounting/ledger', label: 'Libro Mayor' },
      { path: '/accounting/trial-balance', label: 'Balanza de Comprobación' },
      { path: '/accounting/income', label: 'Estado de Resultados' },
      { path: '/accounting/balance', label: 'Balance General' },
      { path: '/accounting/banks', label: 'Bancos y Cuentas' },
      { path: '/accounting/reconciliation', label: 'Conciliación Bancaria' },
      { path: '/accounting/taxes', label: 'IVA y Retenciones' },
      { path: '/accounting/iva-book', label: 'Libro IVA Compras / Ventas' },
      { path: '/accounting/fixed-assets', label: 'Activos Fijos' },
      { path: '/accounting/depreciation', label: 'Depreciación' },
      { path: '/accounting/closing', label: 'Cierre Contable' },
      { path: '/accounting/multicurrency', label: 'Multimoneda (USD/CRC)' },
    ] },

  /* ═══════════ REPORTERÍA ═══════════ */
  { id: 'reports', label: 'Reportería', icon: '📈', basePath: '/reports',
    submodules: [
      { path: '/reports/production', label: 'Reportes de Producción' },
      { path: '/reports/quality', label: 'Reportes de Calidad' },
      { path: '/reports/inventory', label: 'Reportes de Inventario' },
      { path: '/reports/sales', label: 'Reportes de Ventas' },
      { path: '/reports/purchasing', label: 'Reportes de Compras' },
      { path: '/reports/financial', label: 'Reportes Financieros' },
      { path: '/reports/traceability', label: 'Trazabilidad de Lotes' },
      { path: '/reports/oee', label: 'OEE — Eficiencia Planta' },
      { path: '/reports/kpi', label: 'KPIs Operacionales' },
      { path: '/reports/regulatory', label: 'Reportes Regulatorios' },
      { path: '/reports/custom', label: 'Constructor de Reportes' },
      { path: '/reports/scheduled', label: 'Reportes Programados' },
    ] },

  /* ═══════════ SEGURIDAD Y ADMINISTRACIÓN ═══════════ */
  { id: 'admin', label: 'Seguridad y Administración', icon: '🔒', basePath: '/admin', requiredPermission: 'admin:manage_users',
    submodules: [
      { path: '/admin/users', label: 'Gestión de Usuarios' },
      { path: '/admin/roles', label: 'Roles y Permisos' },
      { path: '/admin/approval-flows', label: 'Flujos de Aprobación' },
      { path: '/admin/audit', label: 'Bitácora de Auditoría' },
      { path: '/admin/sessions', label: 'Sesiones Activas' },
      { path: '/admin/ip-policy', label: 'Políticas de Acceso IP' },
      { path: '/admin/password-policy', label: 'Políticas de Contraseña' },
      { path: '/admin/notifications', label: 'Config. Notificaciones' },
      { path: '/admin/backup', label: 'Respaldos y Recuperación' },
      { path: '/admin/system-log', label: 'Log del Sistema' },
      { path: '/admin/company', label: 'Datos de Empresa' },
      { path: '/admin/plants', label: 'Plantas y Ubicaciones' },
    ] },

  /* ═══════════ INTEGRACIONES ═══════════ */
  { id: 'integrations', label: 'Integraciones', icon: '🔗', basePath: '/integrations',
    submodules: [
      { path: '/integrations/dte', label: 'DTE — Hacienda (DGII)' },
      { path: '/integrations/banking', label: 'Banca Electrónica' },
      { path: '/integrations/scales', label: 'Básculas Industriales' },
      { path: '/integrations/barcode', label: 'Lectores de Código' },
      { path: '/integrations/email', label: 'Correo y SMTP' },
      { path: '/integrations/whatsapp', label: 'WhatsApp Business' },
      { path: '/integrations/make', label: 'Make (Integromat)' },
      { path: '/integrations/hubspot', label: 'HubSpot CRM' },
      { path: '/integrations/zapier', label: 'Zapier' },
      { path: '/integrations/api-keys', label: 'API Keys y Webhooks' },
      { path: '/integrations/export', label: 'Exportación de Datos' },
      { path: '/integrations/import', label: 'Importación Masiva' },
      { path: '/integrations/status', label: 'Monitor de Conexiones' },
    ] },
];

/* ─── Mock notifications (seed) ─── */
const SEED_NOTIFICATIONS: Notification[] = [
  { id: 'n1', type: 'alert', title: 'Stock bajo mínimo', detail: 'Envases 5 Gal — 450 u disponibles (mín: 1,000)', time: '10:52', module: 'Inventario', read: false },
  { id: 'n2', type: 'warning', title: 'QC Hold — pH fuera de rango', detail: 'Lote LC-2026-1031 — pH 8.7 (rango 9.0-10.5)', time: '10:15', module: 'Calidad', read: false },
  { id: 'n3', type: 'info', title: 'Orden autorizada', detail: 'OP-2026-0249 — Jabón Líquido 1gal — 4,000 gal', time: '09:30', module: 'Producción', read: false },
  { id: 'n4', type: 'success', title: 'Lote liberado', detail: 'LC-2026-1024 — Jabón Antibacterial — QC aprobado', time: '09:40', module: 'Calidad', read: true },
  { id: 'n5', type: 'info', title: 'OC recibida parcial', detail: 'OC-2026-0089 — 3 de 5 líneas recibidas', time: '08:45', module: 'Compras', read: true },
  { id: 'n6', type: 'alert', title: 'Tapón Azul 5 Gal bajo mínimo', detail: '380 u disponibles (mín: 1,000)', time: '08:30', module: 'Inventario', read: true },
  { id: 'n7', type: 'success', title: 'Pesaje registrado', detail: 'Ácido Sulfónico — 1,003.5 kg — Tanque 3', time: '10:42', module: 'Producción', read: true },
];

/* ─── Live notification feed (mock) ─── */
const LIVE_EVENTS: Omit<Notification, 'id' | 'time' | 'read'>[] = [
  { type: 'success', title: 'Pesaje completado', detail: 'Soda Cáustica — 502.3 kg — Tanque 3', module: 'Producción' },
  { type: 'info', title: 'Muestra QC tomada', detail: 'LC-2026-1032 — Gravedad Específica', module: 'Calidad' },
  { type: 'warning', title: 'Temperatura alta', detail: 'Tanque 5 — 42°C (máx recomendado: 40°C)', module: 'Producción' },
  { type: 'success', title: 'Llenado completo', detail: 'LC-2026-1030 — 2,000 gal — Línea 2', module: 'Producción' },
  { type: 'alert', title: 'Etiqueta Desengrasante bajo mín.', detail: '200 u disponibles (mín: 500)', module: 'Inventario' },
  { type: 'info', title: 'DTE emitido', detail: 'Factura F-2026-1845 — Dist. Central — $4,250', module: 'Ventas' },
  { type: 'success', title: 'QC aprobado', detail: 'LC-2026-1025 — Cloro Concentrado — Todas las pruebas OK', module: 'Calidad' },
];

/* ─── Mock AI responses ─── */
const AI_RESPONSES: Record<string, string> = {
  'lotes activos': 'Actualmente hay 8 lotes en producción activa:\n\n• LC-2026-1024 — Jabón Antibacterial (QC Aprobado)\n• LC-2026-1025 — Cloro Concentrado (Llenado)\n• LC-2026-1026 — Desengrasante Industrial (Mezcla)\n• LC-2026-1027 — Limpiador Multiusos (Pesaje)\n• LC-2026-1028 — Suavizante Textil (Mezcla)\n• LC-2026-1029 — Jabón Líquido Lavaplatos (Envasado)\n• LC-2026-1030 — Limpiador de Pisos (Llenado)\n• LC-2026-1031 — Detergente Líquido (QC Hold — pH fuera de rango)',
  'stock bajo': 'Hay 5 materiales bajo nivel mínimo:\n\n1. Envases 5 Gal — 450 u (mín: 1,000) ⚠️\n2. Tapón Azul 5 Gal — 380 u (mín: 1,000) ⚠️\n3. Etiqueta Desengrasante — 200 u (mín: 500) ⚠️\n4. Fragancia Lavanda — 45 kg (mín: 100 kg)\n5. Colorante Azul — 12 kg (mín: 25 kg)\n\nRecomendación: Generar requisiciones de compra para estos 5 ítems.',
  'produccion hoy': 'Resumen de producción del día:\n\n• Producción total: 12,847 kg\n• Lotes completados: 3\n• Lotes en proceso: 5\n• Rendimiento promedio: 97.2%\n• Personal en turno: 14 operadores\n• Tanques activos: 6 de 8\n• QC pendientes: 2 lotes en cola',
  'ventas semana': 'Ventas de la semana actual:\n\n• Total facturado: $28,450.00\n• Órdenes procesadas: 12\n• Órdenes pendientes: 4\n• Cliente principal: Distribuidora Central ($8,200)\n• Producto más vendido: Jabón Líquido 1 Gal (2,400 u)\n• DTE emitidos: 12 facturas, 0 errores',
};

function getAIResponse(input: string): string {
  const lower = input.toLowerCase();
  for (const [key, val] of Object.entries(AI_RESPONSES)) {
    if (lower.includes(key)) return val;
  }
  if (lower.includes('lote') || lower.includes('lot')) return AI_RESPONSES['lotes activos'];
  if (lower.includes('stock') || lower.includes('inventario') || lower.includes('material')) return AI_RESPONSES['stock bajo'];
  if (lower.includes('produccion') || lower.includes('producción') || lower.includes('planta')) return AI_RESPONSES['produccion hoy'];
  if (lower.includes('venta') || lower.includes('factur')) return AI_RESPONSES['ventas semana'];
  return `Entendido. Estoy analizando tu consulta sobre "${input}".\n\nPuedo ayudarte con:\n• Estado de lotes activos\n• Inventario y stock bajo mínimo\n• Resumen de producción\n• Reportes de ventas\n• Trazabilidad de materiales\n• Costos por lote\n\nIntenta preguntar algo como "¿Cuáles son los lotes activos?" o "¿Qué materiales están bajo stock?"`;
}

/* ─── Initial chat messages ─── */
const INITIAL_CHAT: ChatMessage[] = [
  { id: 'c0', role: 'assistant', text: 'Hola, soy el asistente de Plus Makers. Puedo ayudarte a consultar datos de producción, inventario, ventas, calidad y más. ¿En qué puedo ayudarte?', time: '10:00' },
];

export function OfficeShell() {
  const { session, logout, hasPermission } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [showWindows, setShowWindows] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(SEED_NOTIFICATIONS);
  const [toast, setToast] = useState<Notification | null>(null);
  const [windowHistory, setWindowHistory] = useState<WindowEntry[]>([]);
  const [clock, setClock] = useState(new Date());
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_CHAT);
  const [chatInput, setChatInput] = useState('');
  const [chatTyping, setChatTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  // Live clock
  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  // Track window history
  useEffect(() => {
    const mod = MODULES.find(m => location.pathname.startsWith(m.basePath));
    const sub = mod?.submodules.find(s => location.pathname === s.path);
    const title = sub ? `${mod!.label} > ${sub.label}` : location.pathname === '/dashboard' ? 'Dashboard Operacional' : location.pathname;
    const modLabel = mod?.label || 'Sistema';

    setWindowHistory(prev => {
      const updated = prev.map(w => ({ ...w, active: false }));
      const exists = updated.findIndex(w => w.path === location.pathname);
      if (exists >= 0) {
        updated[exists].active = true;
        updated[exists].timestamp = clock.toLocaleTimeString('es-SV', { hour: '2-digit', minute: '2-digit' });
      } else {
        updated.push({
          id: `w-${Date.now()}`, title, module: modLabel,
          path: location.pathname, active: true,
          timestamp: clock.toLocaleTimeString('es-SV', { hour: '2-digit', minute: '2-digit' }),
        });
      }
      return updated.slice(-10);
    });
  }, [location.pathname]);

  // Live notifications every 12s
  useEffect(() => {
    let idx = 0;
    const t = setInterval(() => {
      const evt = LIVE_EVENTS[idx % LIVE_EVENTS.length];
      const newNotif: Notification = {
        ...evt,
        id: `live-${Date.now()}`,
        time: new Date().toLocaleTimeString('es-SV', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        read: false,
      };
      setNotifications(prev => [newNotif, ...prev].slice(0, 30));
      setToast(newNotif);
      setTimeout(() => setToast(null), 4000);
      idx++;
    }, 12000);
    return () => clearInterval(t);
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, chatTyping]);

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const removeWindow = useCallback((id: string) => {
    setWindowHistory(prev => prev.filter(w => w.id !== id));
  }, []);

  const sendChat = useCallback(() => {
    const text = chatInput.trim();
    if (!text) return;
    const now = new Date().toLocaleTimeString('es-SV', { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: 'user', text, time: now };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setChatTyping(true);

    // Simulate AI typing delay
    setTimeout(() => {
      const response = getAIResponse(text);
      const aiMsg: ChatMessage = {
        id: `a-${Date.now()}`, role: 'assistant', text: response,
        time: new Date().toLocaleTimeString('es-SV', { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages(prev => [...prev, aiMsg]);
      setChatTyping(false);
    }, 800 + Math.random() * 1200);
  }, [chatInput]);

  if (!session) return null;

  const visibleModules = MODULES.filter(m => !m.requiredPermission || hasPermission(m.requiredPermission));
  const activeModuleId = MODULES.find(m => location.pathname.startsWith(m.basePath))?.id || null;
  const unreadCount = notifications.filter(n => !n.read).length;

  const toggleModule = (id: string) => {
    setExpandedModules(prev => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  };

  const closeAllPanels = () => { setShowNotif(false); setShowWindows(false); };

  const TYPE_ICONS: Record<string, string> = { alert: '🔴', warning: '🟡', info: '🔵', success: '🟢' };

  return (
    <div className={styles.shell} onClick={() => { if (showNotif || showWindows) closeAllPanels(); }}>
      {/* ═══ TOP BAR ═══ */}
      <header className={styles.topbar}>
        <div className={styles.topLeft}>
          <button className={styles.hamburger} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              {mobileMenuOpen
                ? <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                : <><path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></>
              }
            </svg>
          </button>
          <img src="/logo-total-cleaner.jpeg" alt="" className={styles.topLogo} />
          <div className={styles.topBrand}>
            <span className={styles.topTitle}>PLUS MAKERS</span>
            <span className={styles.topSub}>CHEMICAL MANUFACTURING SYSTEM</span>
          </div>
        </div>
        <div className={styles.topCenter} />
        <div className={styles.topRight}>
          <div className={styles.topActions}>
            <button className={styles.topAction} onClick={() => navigate('/dashboard')}>
              <span className={styles.actionIcon}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M2 2h5v5H2V2zm7 0h5v5H9V2zm-7 7h5v5H2V9zm7 0h5v5H9V9z" stroke="currentColor" strokeWidth="1.4"/></svg>
              </span>
              <span>Dashboard</span>
            </button>
            <div className={styles.topSep} />
            <button className={styles.topAction} onClick={() => { navigate('/admin/audit'); }}>
              <span className={styles.actionIcon}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.4"/><path d="M12.5 12.5L15 15" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
              </span>
              <span>Búsqueda</span>
            </button>
            <div className={styles.topSep} />
            {/* Ventanas */}
            <div className={styles.dropdownAnchor} onClick={e => e.stopPropagation()}>
              <button className={`${styles.topAction} ${showWindows ? styles.topActionActive : ''}`}
                onClick={() => { setShowWindows(!showWindows); setShowNotif(false); }}>
                <span className={styles.actionIcon}>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="1" y="2" width="14" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.4"/><path d="M1 5.5h14" stroke="currentColor" strokeWidth="1.2"/><circle cx="3" cy="3.8" r="0.6" fill="currentColor"/><circle cx="5" cy="3.8" r="0.6" fill="currentColor"/></svg>
                </span>
                <span>Ventanas</span>
                {windowHistory.length > 0 && <span className={styles.windowCount}>{windowHistory.length}</span>}
              </button>
              {showWindows && (
                <div className={styles.dropdown + ' ' + styles.dropdownWide}>
                  <div className={styles.ddHeader}>
                    <span className={styles.ddTitle}>Ventanas Abiertas</span>
                    <span className={styles.ddCount}>{windowHistory.length}</span>
                  </div>
                  <div className={styles.ddBody}>
                    {windowHistory.length === 0 ? (
                      <div className={styles.ddEmpty}>No hay ventanas abiertas</div>
                    ) : (
                      windowHistory.map(w => (
                        <div key={w.id} className={`${styles.windowItem} ${w.active ? styles.windowItemActive : ''}`}
                          onClick={() => { navigate(w.path); setShowWindows(false); }}>
                          <div className={styles.windowInfo}>
                            <div className={styles.windowDot} data-active={w.active ? 'true' : 'false'} />
                            <div className={styles.windowText}>
                              <span className={styles.windowTitle}>{w.title}</span>
                              <span className={styles.windowMod}>{w.module}</span>
                            </div>
                          </div>
                          <div className={styles.windowRight}>
                            <span className={styles.windowTime}>{w.timestamp}</span>
                            <button className={styles.windowClose} onClick={e => { e.stopPropagation(); removeWindow(w.id); }} title="Cerrar">×</button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className={styles.topSep} />
            {/* Notificaciones */}
            <div className={styles.dropdownAnchor} onClick={e => e.stopPropagation()}>
              <button className={`${styles.topAction} ${showNotif ? styles.topActionActive : ''}`}
                onClick={() => { setShowNotif(!showNotif); setShowWindows(false); }}>
                <span className={styles.actionIcon}>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 1.5a4.5 4.5 0 0 0-4.5 4.5v3L2 11h12l-1.5-2V6A4.5 4.5 0 0 0 8 1.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/><path d="M6 11v.5a2 2 0 0 0 4 0V11" stroke="currentColor" strokeWidth="1.4"/></svg>
                </span>
                <span>Notificaciones</span>
                {unreadCount > 0 && <span className={styles.notifBadge}>{unreadCount}</span>}
              </button>
              {showNotif && (
                <div className={styles.dropdown + ' ' + styles.dropdownWide}>
                  <div className={styles.ddHeader}>
                    <span className={styles.ddTitle}>Notificaciones</span>
                    {unreadCount > 0 && (
                      <button className={styles.ddAction} onClick={markAllRead}>Marcar todo leído</button>
                    )}
                  </div>
                  <div className={styles.ddTabs}>
                    <button className={styles.ddTab + ' ' + styles.ddTabActive}>Todas ({notifications.length})</button>
                    <button className={styles.ddTab}>No leídas ({unreadCount})</button>
                  </div>
                  <div className={styles.ddBody}>
                    {notifications.map(n => (
                      <div key={n.id} className={`${styles.notifItem} ${!n.read ? styles.notifUnread : ''}`}
                        onClick={() => setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))}>
                        <span className={styles.notifIcon}>{TYPE_ICONS[n.type]}</span>
                        <div className={styles.notifContent}>
                          <div className={styles.notifTop}>
                            <span className={styles.notifTitle}>{n.title}</span>
                            <span className={styles.notifTime}>{n.time}</span>
                          </div>
                          <span className={styles.notifDetail}>{n.detail}</span>
                          <span className={styles.notifModule}>{n.module}</span>
                        </div>
                        {!n.read && <div className={styles.notifDot} />}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <button className={styles.topGear} title="Configuración" onClick={() => navigate('/admin/company')}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.4"/><path d="M8 1v2m0 10v2M1 8h2m10 0h2M2.9 2.9l1.4 1.4m7.4 7.4l1.4 1.4M13.1 2.9l-1.4 1.4M4.3 11.7l-1.4 1.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
          </button>
        </div>
      </header>

      {/* ═══ USER BAR ═══ */}
      <div className={styles.userBar}>
        <div className={styles.userBarLeft}>
          <div className={styles.userAvatar}>{session.user.fullName.split(' ').map(n => n[0]).join('')}</div>
          <span className={styles.userBarName}>{session.user.fullName}</span>
          <span className={styles.userBarDivider}>|</span>
          <span className={styles.userBarRole}>{session.user.role.replace(/_/g, ' ')}</span>
        </div>
        <button className={styles.userBarLogout} onClick={logout}>Cerrar sesión</button>
      </div>

      <div className={styles.body}>
        {/* ═══ SIDEBAR ═══ */}
        {mobileMenuOpen && <div className={styles.mobileOverlay} onClick={() => setMobileMenuOpen(false)} />}
        <aside className={`${styles.sidebar} ${sidebarCollapsed ? styles.sidebarCollapsed : ''} ${mobileMenuOpen ? styles.sidebarMobileOpen : ''}`}>
          {/* Collapse toggle */}
          <button className={styles.collapseBtn} onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            title={sidebarCollapsed ? 'Expandir menú' : 'Colapsar menú'}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              {sidebarCollapsed
                ? <path d="M5 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                : <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              }
            </svg>
          </button>

          <nav className={styles.sidebarNav}>
            {visibleModules.map(mod => {
              const isExpanded = expandedModules.has(mod.id);
              const isActive = activeModuleId === mod.id;
              return (
                <div key={mod.id} className={styles.moduleGroup}>
                  <button className={`${styles.moduleBtn} ${isActive ? styles.moduleBtnActive : ''}`}
                    onClick={() => {
                      if (sidebarCollapsed) { setSidebarCollapsed(false); }
                      toggleModule(mod.id);
                      navigate(mod.submodules[0]?.path || mod.basePath);
                    }}
                    title={sidebarCollapsed ? mod.label : undefined}>
                    <span className={styles.moduleIcon}>{mod.icon}</span>
                    {!sidebarCollapsed && <span className={styles.moduleLabel}>{mod.label}</span>}
                    {!sidebarCollapsed && (
                      <span className={`${styles.moduleChevron} ${isExpanded ? styles.chevronOpen : ''}`}>
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M3 1.5L7 5L3 8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                    )}
                  </button>
                  {isExpanded && !sidebarCollapsed && (
                    <div className={styles.subList}>
                      {mod.submodules.map((sub, i) => {
                        const subActive = location.pathname === sub.path;
                        return (
                          <button key={sub.path} className={`${styles.subItem} ${subActive ? styles.subItemActive : ''}`}
                            onClick={() => { navigate(sub.path); setMobileMenuOpen(false); }}>
                            <span className={styles.subNumber}>{i + 1}</span>
                            <span className={styles.subLabel}>{sub.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* AI Assistant button at bottom of sidebar */}
          {!sidebarCollapsed ? (
            <button className={styles.assistantBtn} onClick={() => setShowChat(!showChat)}>
              <span className={styles.assistantPulse} />
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="1" y="2" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M5 14l3-2 3 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="5" cy="7" r="1" fill="currentColor"/>
                <circle cx="8" cy="7" r="1" fill="currentColor"/>
                <circle cx="11" cy="7" r="1" fill="currentColor"/>
              </svg>
              <span>Asistente IA</span>
              <span className={styles.assistantOnline}>EN LÍNEA</span>
            </button>
          ) : (
            <button className={styles.assistantBtnMini} onClick={() => { setSidebarCollapsed(false); setShowChat(!showChat); }}
              title="Asistente IA">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="1" y="2" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M5 14l3-2 3 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="5" cy="7" r="1" fill="currentColor"/>
                <circle cx="8" cy="7" r="1" fill="currentColor"/>
                <circle cx="11" cy="7" r="1" fill="currentColor"/>
              </svg>
            </button>
          )}
        </aside>

        {/* ═══ MAIN AREA ═══ */}
        <div className={styles.mainArea}>
          <div className={styles.alertBar}>
            <span className={styles.alertTriangle}>▲</span>
            <span className={styles.alertLabel}>ALERTA:</span>
            <span className={styles.alertText}>5 Productos de Empaque están abajo de su existencia mínima.</span>
          </div>
          <main className={styles.main}><Outlet /></main>
        </div>
      </div>

      {/* ═══ BOTTOM BAR ═══ */}
      <footer className={styles.bottomBar}>
        <div className={styles.bottomLeft}>
          <button className={styles.bottomBtn} onClick={() => navigate('/dashboard')}>
            <svg width="10" height="10" viewBox="0 0 16 16" fill="none"><path d="M2 2h5v5H2V2zm7 0h5v5H9V2zm-7 7h5v5H2V9zm7 0h5v5H9V9z" stroke="currentColor" strokeWidth="1.4"/></svg>
            Dashboard
          </button>
          <span className={styles.bottomSep}>|</span>
          <span className={styles.bottomLabel}>Módulo: {MODULES.find(m => location.pathname.startsWith(m.basePath))?.label || 'Dashboard'}</span>
        </div>
        <div className={styles.bottomRight}>
          <span className={styles.systemStatus}><span className={styles.statusDot} />Sistema Operativo</span>
          <span className={styles.systemTime}>{clock.toLocaleTimeString('es-SV', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </footer>

      {/* ═══ AI CHAT PANEL ═══ */}
      {showChat && (
        <div className={styles.chatPanel} onClick={e => e.stopPropagation()}>
          {/* Header */}
          <div className={styles.chatHeader}>
            <div className={styles.chatHeaderLeft}>
              <div className={styles.chatHeaderAvatar}>
                <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                  <rect x="1" y="2" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.2"/>
                  <path d="M5 14l3-2 3 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="5" cy="7" r="1" fill="currentColor"/>
                  <circle cx="8" cy="7" r="1" fill="currentColor"/>
                  <circle cx="11" cy="7" r="1" fill="currentColor"/>
                </svg>
                <span className={styles.chatHeaderPulse} />
              </div>
              <div>
                <span className={styles.chatHeaderTitle}>Asistente Plus Makers</span>
                <span className={styles.chatHeaderStatus}>
                  <span className={styles.chatStatusDot} />
                  Conectado a datos en tiempo real
                </span>
              </div>
            </div>
            <div className={styles.chatHeaderActions}>
              <button className={styles.chatHeaderBtn} onClick={() => setChatMessages(INITIAL_CHAT)} title="Nueva conversación">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
              <button className={styles.chatHeaderBtn} onClick={() => setShowChat(false)} title="Cerrar">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className={styles.chatBody}>
            {chatMessages.length <= 1 && (
              <div className={styles.chatWelcome}>
                <div className={styles.chatWelcomeIcon}>
                  <svg width="32" height="32" viewBox="0 0 16 16" fill="none">
                    <rect x="1" y="2" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1"/>
                    <path d="M5 14l3-2 3 2" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="5" cy="7" r="1" fill="currentColor"/>
                    <circle cx="8" cy="7" r="1" fill="currentColor"/>
                    <circle cx="11" cy="7" r="1" fill="currentColor"/>
                  </svg>
                </div>
                <span className={styles.chatWelcomeTitle}>¿En qué puedo ayudarte?</span>
                <span className={styles.chatWelcomeSub}>Consulta datos de producción, inventario, calidad, ventas y más en tiempo real.</span>
                <div className={styles.chatQuickGrid}>
                  {[
                    { icon: '⚙', label: 'Lotes activos', q: '¿Cuáles son los lotes activos?' },
                    { icon: '📦', label: 'Stock bajo mínimo', q: '¿Qué materiales están bajo stock?' },
                    { icon: '📊', label: 'Producción del día', q: 'Producción hoy' },
                    { icon: '🛒', label: 'Ventas de la semana', q: 'Ventas semana' },
                    { icon: '🔬', label: 'QC pendientes', q: '¿Cuántos lotes están en QC?' },
                    { icon: '💰', label: 'Resumen financiero', q: '¿Cómo van las ventas?' },
                  ].map(item => (
                    <button key={item.label} className={styles.chatQuickCard} onClick={() => {
                      const now = new Date().toLocaleTimeString('es-SV', { hour: '2-digit', minute: '2-digit' });
                      setChatMessages(prev => [...prev, { id: `u-${Date.now()}`, role: 'user', text: item.q, time: now }]);
                      setChatTyping(true);
                      setTimeout(() => {
                        setChatMessages(prev => [...prev, {
                          id: `a-${Date.now()}`, role: 'assistant', text: getAIResponse(item.q),
                          time: new Date().toLocaleTimeString('es-SV', { hour: '2-digit', minute: '2-digit' }),
                        }]);
                        setChatTyping(false);
                      }, 800 + Math.random() * 1200);
                    }}>
                      <span className={styles.chatQuickIcon}>{item.icon}</span>
                      <span className={styles.chatQuickLabel}>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {chatMessages.slice(1).map(m => (
              <div key={m.id} className={`${styles.chatMsg} ${styles['chatMsg_' + m.role]}`}>
                {m.role === 'assistant' && (
                  <div className={styles.chatAvatar}>
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <rect x="1" y="2" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.2"/>
                      <circle cx="5" cy="7" r="1" fill="currentColor"/>
                      <circle cx="8" cy="7" r="1" fill="currentColor"/>
                      <circle cx="11" cy="7" r="1" fill="currentColor"/>
                    </svg>
                  </div>
                )}
                <div className={styles.chatBubble + ' ' + styles['chatBubble_' + m.role]}>
                  <span className={styles.chatText}>{m.text}</span>
                  <span className={styles.chatMsgTime}>{m.time}</span>
                </div>
              </div>
            ))}
            {chatTyping && (
              <div className={`${styles.chatMsg} ${styles.chatMsg_assistant}`}>
                <div className={styles.chatAvatar}>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <rect x="1" y="2" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.2"/>
                    <circle cx="5" cy="7" r="1" fill="currentColor"/>
                    <circle cx="8" cy="7" r="1" fill="currentColor"/>
                    <circle cx="11" cy="7" r="1" fill="currentColor"/>
                  </svg>
                </div>
                <div className={styles.chatBubble + ' ' + styles.chatBubble_assistant}>
                  <span className={styles.chatTypingDots}>
                    <span /><span /><span />
                  </span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Inline suggestions when conversation is active */}
          {chatMessages.length > 1 && (
            <div className={styles.chatSuggestions}>
              {['¿Lotes activos?', '¿Stock bajo?', 'Producción hoy', 'Ventas semana'].map(s => (
                <button key={s} className={styles.chatSuggest} onClick={() => {
                  const now = new Date().toLocaleTimeString('es-SV', { hour: '2-digit', minute: '2-digit' });
                  setChatMessages(prev => [...prev, { id: `u-${Date.now()}`, role: 'user', text: s, time: now }]);
                  setChatTyping(true);
                  setTimeout(() => {
                    setChatMessages(prev => [...prev, {
                      id: `a-${Date.now()}`, role: 'assistant', text: getAIResponse(s),
                      time: new Date().toLocaleTimeString('es-SV', { hour: '2-digit', minute: '2-digit' }),
                    }]);
                    setChatTyping(false);
                  }, 800 + Math.random() * 1200);
                }}>
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Footer input */}
          <div className={styles.chatFooter}>
            <div className={styles.chatInputWrap}>
              <input ref={chatInputRef} className={styles.chatInput} type="text"
                placeholder="Escribe tu consulta..."
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') sendChat(); }}
              />
              <button className={styles.chatSend} onClick={sendChat} disabled={!chatInput.trim()}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2 14l2-6h7L4 2l-2 6" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
                  <path d="M4 8h10l-6-6M4 8l6 6 4-12" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" fill="currentColor" fillOpacity="0.15"/>
                </svg>
              </button>
            </div>
            <div className={styles.chatFooterMeta}>
              <span>Asistente IA</span>
              <span>·</span>
              <span>Datos en tiempo real</span>
              <span>·</span>
              <span>{chatMessages.length - 1} mensajes</span>
            </div>
          </div>
        </div>
      )}

      {/* ═══ TOAST NOTIFICATION ═══ */}
      {toast && (
        <div className={`${styles.toast} ${styles['toast_' + toast.type]}`} onClick={() => setToast(null)}>
          <span className={styles.toastIcon}>{TYPE_ICONS[toast.type]}</span>
          <div className={styles.toastContent}>
            <span className={styles.toastTitle}>{toast.title}</span>
            <span className={styles.toastDetail}>{toast.detail}</span>
          </div>
          <span className={styles.toastTime}>{toast.time}</span>
        </div>
      )}
    </div>
  );
}
