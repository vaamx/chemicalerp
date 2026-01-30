import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, CartesianGrid,
} from 'recharts';
import styles from './DashboardPage.module.css';

/* ═══════════════════════════════════════════════════════════════
   PLANT-WIDE OPERATIONAL DASHBOARD

   This is the 6am view. Plant manager walks in, coffee in hand,
   and in 5 seconds understands:
     - How many lots are running and where
     - What's stuck in QC
     - What materials are short
     - Who's on the floor
     - Revenue vs cost performance
     - What needs attention RIGHT NOW
   ═══════════════════════════════════════════════════════════════ */

// ── Weekly production output ──
const WEEKLY_PRODUCTION = [
  { day: 'Lun', kg: 6800, lots: 5 },
  { day: 'Mar', kg: 7200, lots: 6 },
  { day: 'Mié', kg: 5400, lots: 4 },
  { day: 'Jue', kg: 8100, lots: 7 },
  { day: 'Vie', kg: 7850, lots: 6 },
  { day: 'Sáb', kg: 3200, lots: 2 },
  { day: 'Hoy', kg: 4100, lots: 3 },
];

// ── Lot status distribution ──
const LOT_STATUS_DATA = [
  { name: 'En Proceso', value: 8, color: '#d97706' },
  { name: 'QC Hold', value: 3, color: '#7c3aed' },
  { name: 'Llenado', value: 2, color: '#2563eb' },
  { name: 'Empaque', value: 1, color: '#0891b2' },
  { name: 'Completo Hoy', value: 4, color: '#16a34a' },
];

// ── Revenue trend (last 12 weeks) ──
const REVENUE_TREND = [
  { w: 'S1', revenue: 42000, cost: 28000 },
  { w: 'S2', revenue: 38000, cost: 26000 },
  { w: 'S3', revenue: 51000, cost: 32000 },
  { w: 'S4', revenue: 45000, cost: 30000 },
  { w: 'S5', revenue: 49000, cost: 29000 },
  { w: 'S6', revenue: 55000, cost: 33000 },
  { w: 'S7', revenue: 48000, cost: 31000 },
  { w: 'S8', revenue: 62000, cost: 35000 },
  { w: 'S9', revenue: 58000, cost: 34000 },
  { w: 'S10', revenue: 53000, cost: 32000 },
  { w: 'S11', revenue: 61000, cost: 36000 },
  { w: 'S12', revenue: 57000, cost: 33000 },
];

// ── All active lots in plant ──
const ACTIVE_LOTS = [
  { lot: 'LC-2026-1032', product: 'Desengrasante Industrial 5gal', formula: 'GC-01', qty: '5,000 gal', stage: 'Mezclado', pct: 45, status: 'process', operator: 'J. López', tank: 'Tanque 3', started: '06:15' },
  { lot: 'LC-2026-1031', product: 'Limpiador Multiusos 1gal', formula: 'MC-02', qty: '3,000 gal', stage: 'QC Hold', pct: 72, status: 'hold', operator: 'M. Reyes', tank: 'Tanque 1', started: '05:00' },
  { lot: 'LC-2026-1030', product: 'Jabón Líquido Industrial', formula: 'JL-04', qty: '2,000 gal', stage: 'Llenado', pct: 80, status: 'filling', operator: 'P. Ramos', tank: 'Línea 2', started: 'Ayer 14:00' },
  { lot: 'LC-2026-1029', product: 'Desinfectante Concentrado', formula: 'DC-01', qty: '1,500 gal', stage: 'Empaque', pct: 90, status: 'packing', operator: 'C. Flores', tank: 'Línea 1', started: 'Ayer 10:00' },
  { lot: 'LC-2026-1028', product: 'Desengrasante Industrial 1gal', formula: 'GC-01', qty: '4,000 gal', stage: 'En Proceso', pct: 35, status: 'process', operator: 'J. López', tank: 'Tanque 5', started: '07:30' },
  { lot: 'LC-2026-1027', product: 'Limpia Vidrios Premium', formula: 'LV-02', qty: '2,500 gal', stage: 'QC Hold', pct: 68, status: 'hold', operator: 'M. Reyes', tank: 'Tanque 2', started: 'Ayer 16:00' },
  { lot: 'LC-2026-1026', product: 'Suavizante Textil', formula: 'ST-03', qty: '3,500 gal', stage: 'En Proceso', pct: 55, status: 'process', operator: 'A. Mejía', tank: 'Tanque 4', started: '08:15' },
  { lot: 'LC-2026-1025', product: 'Cloro Concentrado', formula: 'CL-01', qty: '6,000 gal', stage: 'QC Hold', pct: 70, status: 'hold', operator: 'M. Reyes', tank: 'Tanque 6', started: 'Ayer 08:00' },
];

// ── Completed today ──
const COMPLETED_TODAY = [
  { lot: 'LC-2026-1024', product: 'Jabón Antibacterial', qty: '2,000 gal', yield: '96.2%', releasedAt: '09:40' },
  { lot: 'LC-2026-1023', product: 'Desengrasante Ind. 5gal', qty: '5,000 gal', yield: '94.8%', releasedAt: '08:15' },
  { lot: 'LC-2026-1022', product: 'Limpiador Cítrico', qty: '3,000 gal', yield: '97.1%', releasedAt: '07:00' },
  { lot: 'LC-2026-1021', product: 'Desinfectante Lavanda', qty: '1,500 gal', yield: '93.5%', releasedAt: '06:30' },
];

// ── Materials critical stock ──
const MATERIALS_STOCK = [
  { name: 'Envases 5 Gal', code: 'ME-012', current: 450, min: 1000, unit: 'u', pct: 45, critical: true },
  { name: 'Tapón Azul 5 Gal', code: 'ME-015', current: 380, min: 1000, unit: 'u', pct: 38, critical: true },
  { name: 'Etiqueta Desengr.', code: 'ME-030', current: 200, min: 500, unit: 'u', pct: 40, critical: true },
  { name: 'Caja Cartón 4u', code: 'ME-050', current: 85, min: 250, unit: 'u', pct: 34, critical: true },
  { name: 'Fragancia FS-901', code: 'MP-045', current: 185, min: 200, unit: 'kg', pct: 92, critical: true },
  { name: 'Ácido Sulfónico', code: 'MP-001', current: 4001, min: 3000, unit: 'kg', pct: 133, critical: false },
  { name: 'Soda Cáustica', code: 'MP-003', current: 6600, min: 2000, unit: 'kg', pct: 330, critical: false },
  { name: 'Surfactante NI', code: 'MP-008', current: 820, min: 500, unit: 'kg', pct: 164, critical: false },
];

// ── QC queue ──
const QC_QUEUE = [
  { lot: 'LC-2026-1031', product: 'Limpiador Multiusos', tests: 3, pending: 3, priority: 'high', age: '5h 15m' },
  { lot: 'LC-2026-1027', product: 'Limpia Vidrios Premium', tests: 2, pending: 2, priority: 'high', age: '18h' },
  { lot: 'LC-2026-1025', product: 'Cloro Concentrado', tests: 4, pending: 1, priority: 'medium', age: '26h' },
];

// ── Shift personnel ──
const PERSONNEL = [
  { name: 'José López', role: 'Operador', area: 'Mezclado', status: 'active', since: '06:00' },
  { name: 'Pablo Ramos', role: 'Operador', area: 'Llenado', status: 'active', since: '06:00' },
  { name: 'Andrés Mejía', role: 'Operador', area: 'Mezclado', status: 'active', since: '06:00' },
  { name: 'Carlos Flores', role: 'Bodega', area: 'Empaque', status: 'active', since: '06:00' },
  { name: 'María Reyes', role: 'QC Técnico', area: 'Laboratorio', status: 'active', since: '07:00' },
  { name: 'Ana Castro', role: 'Supervisora', area: 'Oficina', status: 'active', since: '07:00' },
];

// ── Upcoming orders ──
const PENDING_ORDERS = [
  { order: 'OP-2026-0249', product: 'Jabón Líquido 1gal', qty: '4,000 gal', priority: 'Urgente', customer: 'Dist. Central' },
  { order: 'OP-2026-0250', product: 'Desengrasante 5gal', qty: '3,000 gal', priority: 'Normal', customer: 'SuperMax' },
  { order: 'OP-2026-0251', product: 'Cloro 1gal', qty: '6,000 gal', priority: 'Normal', customer: 'CleanPro SV' },
];

const STATUS_COLORS: Record<string, string> = {
  process: styles.lsProcess,
  hold: styles.lsHold,
  filling: styles.lsFilling,
  packing: styles.lsPacking,
  complete: styles.lsComplete,
};

const STATUS_LABELS: Record<string, string> = {
  process: 'En Proceso',
  hold: 'QC Hold',
  filling: 'Llenado',
  packing: 'Empaque',
  complete: 'Completo',
};

export function DashboardPage() {
  const totalKgToday = WEEKLY_PRODUCTION[WEEKLY_PRODUCTION.length - 1].kg;
  const totalLotsActive = ACTIVE_LOTS.length;
  const avgYield = (COMPLETED_TODAY.reduce((s, c) => s + parseFloat(c.yield), 0) / COMPLETED_TODAY.length).toFixed(1);
  const criticalMaterials = MATERIALS_STOCK.filter(m => m.critical).length;

  return (
    <div className={styles.dashboard}>
      {/* ═══ KPI STRIP ═══ */}
      <div className={styles.kpiStrip}>
        <div className={styles.kpi}>
          <div className={styles.kpiTop}>
            <span className={styles.kpiVal}>{totalLotsActive}</span>
            <span className={styles.kpiTrend} data-dir="up">+2</span>
          </div>
          <span className={styles.kpiLabel}>Lotes Activos</span>
          <div className={styles.kpiBar}><div className={styles.kpiBarFill} style={{ width: '65%', background: '#d97706' }} /></div>
        </div>
        <div className={styles.kpi}>
          <div className={styles.kpiTop}>
            <span className={styles.kpiVal}>{COMPLETED_TODAY.length}</span>
          </div>
          <span className={styles.kpiLabel}>Completados Hoy</span>
          <div className={styles.kpiBar}><div className={styles.kpiBarFill} style={{ width: '80%', background: '#16a34a' }} /></div>
        </div>
        <div className={styles.kpi}>
          <div className={styles.kpiTop}>
            <span className={styles.kpiValLg}>{totalKgToday.toLocaleString()}</span>
            <span className={styles.kpiUnit}>KG</span>
          </div>
          <span className={styles.kpiLabel}>Producción del Día</span>
          <div className={styles.kpiBar}><div className={styles.kpiBarFill} style={{ width: '52%', background: '#2563eb' }} /></div>
        </div>
        <div className={styles.kpi}>
          <div className={styles.kpiTop}>
            <span className={styles.kpiValGreen}>{avgYield}%</span>
          </div>
          <span className={styles.kpiLabel}>Rendimiento Promedio</span>
          <div className={styles.kpiBar}><div className={styles.kpiBarFill} style={{ width: `${parseFloat(avgYield)}%`, background: '#16a34a' }} /></div>
        </div>
        <div className={styles.kpi}>
          <div className={styles.kpiTop}>
            <span className={styles.kpiValPurple}>{QC_QUEUE.length}</span>
          </div>
          <span className={styles.kpiLabel}>QC en Espera</span>
          <div className={styles.kpiBar}><div className={styles.kpiBarFill} style={{ width: '30%', background: '#7c3aed' }} /></div>
        </div>
        <div className={styles.kpi}>
          <div className={styles.kpiTop}>
            <span className={styles.kpiValRed}>{criticalMaterials}</span>
          </div>
          <span className={styles.kpiLabel}>Materiales Bajo Mín.</span>
          <div className={styles.kpiBar}><div className={styles.kpiBarFill} style={{ width: '100%', background: '#dc2626' }} /></div>
        </div>
        <div className={styles.kpi}>
          <div className={styles.kpiTop}>
            <span className={styles.kpiVal}>{PERSONNEL.length}</span>
          </div>
          <span className={styles.kpiLabel}>Personal en Turno</span>
          <div className={styles.kpiBar}><div className={styles.kpiBarFill} style={{ width: '75%', background: '#0891b2' }} /></div>
        </div>
      </div>

      {/* ═══ ROW 1: Charts ═══ */}
      <div className={styles.row3}>
        {/* Weekly production */}
        <section className={styles.panel}>
          <div className={styles.ph}><span className={styles.pt}>Producción Semanal</span><span className={styles.pSub}>kg producidos por día</span></div>
          <div className={styles.chartWrap}>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={WEEKLY_PRODUCTION} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e4ea" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#8494a7' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#8494a7' }} axisLine={false} tickLine={false} width={40} />
                <Tooltip
                  contentStyle={{ fontSize: 11, borderRadius: 4, border: '1px solid #ccd2da' }}
                  formatter={(v: number) => [`${v.toLocaleString()} kg`, 'Producción']}
                />
                <Bar dataKey="kg" fill="#2a5298" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Lot distribution */}
        <section className={styles.panel}>
          <div className={styles.ph}><span className={styles.pt}>Distribución de Lotes</span><span className={styles.pSub}>{totalLotsActive + COMPLETED_TODAY.length} lotes totales hoy</span></div>
          <div className={styles.pieWrap}>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={LOT_STATUS_DATA} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value" stroke="none">
                  {LOT_STATUS_DATA.map(entry => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 4, border: '1px solid #ccd2da' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className={styles.pieLegend}>
              {LOT_STATUS_DATA.map(d => (
                <div key={d.name} className={styles.legendItem}>
                  <span className={styles.legendDot} style={{ background: d.color }} />
                  <span className={styles.legendLabel}>{d.name}</span>
                  <span className={styles.legendVal}>{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Revenue trend */}
        <section className={styles.panel}>
          <div className={styles.ph}><span className={styles.pt}>Tendencia de Ingresos</span><span className={styles.pSub}>últimas 12 semanas</span></div>
          <div className={styles.chartWrap}>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={REVENUE_TREND}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e4ea" vertical={false} />
                <XAxis dataKey="w" tick={{ fontSize: 9, fill: '#8494a7' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: '#8494a7' }} axisLine={false} tickLine={false} width={35} tickFormatter={v => `${v / 1000}k`} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 4, border: '1px solid #ccd2da' }} formatter={(v: number) => [`$${v.toLocaleString()}`, '']} />
                <Area type="monotone" dataKey="revenue" stroke="#16a34a" fill="#e6f5ec" strokeWidth={2} name="Ingresos" />
                <Area type="monotone" dataKey="cost" stroke="#dc2626" fill="#fde8ea" strokeWidth={1.5} name="Costos" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      {/* ═══ ROW 2: Lots + QC + Materials ═══ */}
      <div className={styles.row2}>
        {/* Active lots */}
        <section className={styles.panel}>
          <div className={styles.ph}>
            <span className={styles.pt}>Lotes Activos en Planta</span>
            <span className={styles.badge}>{ACTIVE_LOTS.length} activos</span>
          </div>
          <div className={styles.tableScroll}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>Lote</th>
                  <th className={styles.th}>Producto</th>
                  <th className={styles.th}>Fórmula</th>
                  <th className={styles.th}>Cantidad</th>
                  <th className={styles.th}>Etapa</th>
                  <th className={styles.th}>Progreso</th>
                  <th className={styles.th}>Operador</th>
                  <th className={styles.th}>Ubicación</th>
                  <th className={styles.th}>Inicio</th>
                </tr>
              </thead>
              <tbody>
                {ACTIVE_LOTS.map(l => (
                  <tr key={l.lot} className={styles.tr}>
                    <td className={styles.tdLot}>{l.lot}</td>
                    <td className={styles.td}>{l.product}</td>
                    <td className={styles.tdMono}>{l.formula}</td>
                    <td className={styles.tdMono}>{l.qty}</td>
                    <td className={styles.td}><span className={`${styles.statusTag} ${STATUS_COLORS[l.status]}`}>{l.stage}</span></td>
                    <td className={styles.td}>
                      <div className={styles.progWrap}>
                        <div className={styles.progBar}><div className={styles.progFill} data-status={l.status} style={{ width: `${l.pct}%` }} /></div>
                        <span className={styles.progPct}>{l.pct}%</span>
                      </div>
                    </td>
                    <td className={styles.td}>{l.operator}</td>
                    <td className={styles.tdMuted}>{l.tank}</td>
                    <td className={styles.tdMuted}>{l.started}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* ═══ ROW 3: QC + Stock + Personnel + Orders ═══ */}
      <div className={styles.row4}>
        {/* QC Queue */}
        <section className={styles.panel}>
          <div className={styles.ph}>
            <span className={styles.pt}>Cola de Calidad</span>
            <span className={styles.badgeWarn}>{QC_QUEUE.length} pendientes</span>
          </div>
          <div className={styles.pb}>
            {QC_QUEUE.map(q => (
              <div key={q.lot} className={styles.qcCard}>
                <div className={styles.qcTop}>
                  <span className={styles.qcLot}>{q.lot}</span>
                  <span className={`${styles.priBadge} ${q.priority === 'high' ? styles.priHigh : styles.priMed}`}>
                    {q.priority === 'high' ? 'Urgente' : 'Normal'}
                  </span>
                </div>
                <span className={styles.qcProduct}>{q.product}</span>
                <div className={styles.qcMeta}>
                  <span>{q.pending}/{q.tests} pruebas pendientes</span>
                  <span className={styles.qcAge}>⏱ {q.age}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Materials stock */}
        <section className={styles.panel}>
          <div className={styles.ph}>
            <span className={styles.pt}>Inventario Crítico</span>
            <span className={styles.badgeDanger}>{criticalMaterials} bajo mín.</span>
          </div>
          <div className={styles.pb}>
            {MATERIALS_STOCK.filter(m => m.critical).map(m => (
              <div key={m.code} className={styles.stockRow}>
                <div className={styles.stockInfo}>
                  <span className={styles.stockName}>{m.name}</span>
                  <span className={styles.stockCode}>{m.code}</span>
                </div>
                <div className={styles.stockMeter}>
                  <div className={styles.meterBar}>
                    <div className={styles.meterFill} style={{ width: `${Math.min(m.pct, 100)}%` }} data-crit={m.critical ? 'true' : 'false'} />
                    <div className={styles.meterThreshold} />
                  </div>
                  <div className={styles.meterNums}>
                    <span className={styles.meterCurrent}>{m.current.toLocaleString()}</span>
                    <span className={styles.meterMin}>mín: {m.min.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Personnel */}
        <section className={styles.panel}>
          <div className={styles.ph}>
            <span className={styles.pt}>Personal en Turno</span>
            <span className={styles.badge}>{PERSONNEL.length} activos</span>
          </div>
          <div className={styles.pb}>
            {PERSONNEL.map(p => (
              <div key={p.name} className={styles.personRow}>
                <div className={styles.personAvatar}>{p.name.split(' ').map(n => n[0]).join('')}</div>
                <div className={styles.personInfo}>
                  <span className={styles.personName}>{p.name}</span>
                  <span className={styles.personMeta}>{p.role} — {p.area}</span>
                </div>
                <span className={styles.personSince}>{p.since}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Pending orders */}
        <section className={styles.panel}>
          <div className={styles.ph}>
            <span className={styles.pt}>Órdenes Pendientes</span>
            <span className={styles.badge}>{PENDING_ORDERS.length}</span>
          </div>
          <div className={styles.pb}>
            {PENDING_ORDERS.map(o => (
              <div key={o.order} className={styles.orderCard}>
                <div className={styles.orderTop}>
                  <span className={styles.orderNum}>{o.order}</span>
                  <span className={`${styles.priBadge} ${o.priority === 'Urgente' ? styles.priHigh : styles.priMed}`}>{o.priority}</span>
                </div>
                <span className={styles.orderProduct}>{o.product}</span>
                <div className={styles.orderMeta}>
                  <span>{o.qty}</span>
                  <span className={styles.orderCustomer}>{o.customer}</span>
                </div>
              </div>
            ))}
            {/* Completed today summary */}
            <div className={styles.completedSummary}>
              <span className={styles.completedIcon}>✓</span>
              <span className={styles.completedText}>{COMPLETED_TODAY.length} lotes liberados hoy — rendimiento promedio {avgYield}%</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
