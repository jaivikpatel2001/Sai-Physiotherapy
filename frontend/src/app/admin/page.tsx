'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, PieChart, Pie, Cell, Legend, Area, AreaChart,
} from 'recharts';
import { analyticsApi } from '@/lib/api';
import { formatCurrency } from '@sai-physio/utils';
import styles from './admin.module.css';
import { StatusBadge, toneFor } from '@/components/admin';

// ─── Types ──────────────────────────────────────────────────────────────────
interface DashboardKPIs {
  totalPatients: number;
  newPatientsThisMonth: number;
  patientGrowth: number;
  todayAppointments: number;
  weeklyAppointments: number;
  upcomingAppointments: number;
  monthlyRevenue: number;
  revenueGrowth: number;
  pendingDues: number;
  activeDoctors: number;
  publishedBlogs: number;
  approvedTestimonials: number;
}

interface TrendPoint { date: string; count: number; completed: number; cancelled: number; scheduled: number }
interface RevenuePoint { period: string; billed: number; collected: number; outstanding: number; invoices: number }
interface ServiceSlice { name: string; value: number; category?: string }
interface TopDoctor { _id: string; name: string; avatar?: string; specialization?: string; appointments: number; completed: number; completionRate: number }
interface PatientGrowthPoint { period: string; newPatients: number; total: number }
interface UpcomingAppt {
  _id: string;
  appointmentId: string;
  scheduledAt: string;
  status: string;
  patient?: { personalInfo?: { name?: string }; patientId?: string };
  doctor?: { name?: string };
  service?: { name?: string };
}
interface PaymentRow {
  _id: string;
  invoiceNumber: string;
  amountPaid: number;
  paymentMethod: string;
  paymentStatus: string;
  paymentDate?: string;
  patient?: { personalInfo?: { name?: string } };
}
interface ActivityEvent { kind: string; at: string; title: string; subtitle?: string; icon: string }
interface ContentSummary {
  recentBlogs: Array<{ _id: string; title: string; slug: string; views: number; publishedAt?: string; featuredImage?: string; excerpt?: string }>;
  latestTestimonials: Array<{ _id: string; patientName: string; condition: string; rating: number; review: string; isFeatured: boolean }>;
  mostViewedBlogs: Array<{ _id: string; title: string; slug: string; views: number; category?: string }>;
  gallerySize: number;
  serviceCount: number;
}

const PIE_COLORS = ['#46a2b7', '#eb783d', '#0c2641', '#bfd6d9', '#1aae39', '#f5d75e', '#7b3ff2', '#0075de', '#ff64c8'];
const STATUS_COLORS: Record<string, string> = {
  scheduled: '#0075de',
  confirmed: '#46a2b7',
  in_progress: '#7b3ff2',
  completed: '#1aae39',
  cancelled: '#e03131',
  no_show: '#dd5b00',
};

const TREND_RANGES: { label: string; days: number }[] = [
  { label: '7d', days: 7 },
  { label: '30d', days: 30 },
  { label: '90d', days: 90 },
];

// ─── Helpers ────────────────────────────────────────────────────────────────
function fmtPeriod(period: string): string {
  // "2026-05" → "May 2026"
  const [y, m] = period.split('-');
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
}

function fmtDate(d: string | undefined, opts?: Intl.DateTimeFormatOptions): string {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', opts ?? { day: '2-digit', month: 'short' });
}

function fmtTime(d: string): string {
  return new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

function timeAgo(d: string): string {
  const diff = (Date.now() - new Date(d).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86_400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 7 * 86_400) return `${Math.floor(diff / 86_400)}d ago`;
  return fmtDate(d, { day: '2-digit', month: 'short' });
}

function initialsOf(name?: string): string {
  if (!name) return '?';
  return name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
}

// ─── Skeleton ───────────────────────────────────────────────────────────────
function SkeletonBar({ width = '60%', height = 14, mt = 0 }: { width?: string; height?: number; mt?: number }) {
  return (
    <div
      className={styles.skeleton}
      style={{ height, width, marginTop: mt, borderRadius: 4 }}
    />
  );
}

// ─── Component ──────────────────────────────────────────────────────────────
export default function AdminDashboardPage() {
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [revenue, setRevenue] = useState<RevenuePoint[]>([]);
  const [services, setServices] = useState<ServiceSlice[]>([]);
  const [topDoctors, setTopDoctors] = useState<TopDoctor[]>([]);
  const [upcoming, setUpcoming] = useState<UpcomingAppt[]>([]);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [activity, setActivity] = useState<ActivityEvent[]>([]);
  const [content, setContent] = useState<ContentSummary | null>(null);
  const [patientGrowth, setPatientGrowth] = useState<PatientGrowthPoint[]>([]);
  const [trendRange, setTrendRange] = useState(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Initial load
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const results = await Promise.allSettled([
          analyticsApi.getDashboard(),
          analyticsApi.getRevenue({ months: 12 }),
          analyticsApi.getServiceBreakdown(),
          analyticsApi.getTopDoctors({ days: 30 }),
          analyticsApi.getUpcomingAppointments({ limit: 8 }),
          analyticsApi.getRecentPayments({ limit: 8 }),
          analyticsApi.getRecentActivity({ limit: 10 }),
          analyticsApi.getContentSummary(),
          analyticsApi.getPatientGrowth({ months: 12 }),
        ]);
        if (cancelled) return;
        const pick = <T,>(r: PromiseSettledResult<{ data: { data?: T } }>, fallback: T): T => {
          if (r.status !== 'fulfilled') return fallback;
          const body = r.value.data;
          return (body?.data ?? (body as unknown as T)) ?? fallback;
        };
        const dashRes = pick(results[0] as PromiseSettledResult<{ data: { data?: { kpis?: DashboardKPIs } } }>, { kpis: undefined } as { kpis?: DashboardKPIs });
        setKpis(dashRes.kpis ?? null);
        setRevenue(pick(results[1] as PromiseSettledResult<{ data: { data?: RevenuePoint[] } }>, []));
        setServices(pick(results[2] as PromiseSettledResult<{ data: { data?: ServiceSlice[] } }>, []));
        setTopDoctors(pick(results[3] as PromiseSettledResult<{ data: { data?: TopDoctor[] } }>, []));
        setUpcoming(pick(results[4] as PromiseSettledResult<{ data: { data?: UpcomingAppt[] } }>, []));
        setPayments(pick(results[5] as PromiseSettledResult<{ data: { data?: PaymentRow[] } }>, []));
        setActivity(pick(results[6] as PromiseSettledResult<{ data: { data?: ActivityEvent[] } }>, []));
        setContent(pick(results[7] as PromiseSettledResult<{ data: { data?: ContentSummary } }>, null as unknown as ContentSummary));
        setPatientGrowth(pick(results[8] as PromiseSettledResult<{ data: { data?: PatientGrowthPoint[] } }>, []));

        if (results.every((r) => r.status === 'rejected')) {
          setError('Could not load analytics. Make sure the backend is running.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Trend reloads when range changes
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await analyticsApi.getAppointmentTrend({ days: trendRange });
        if (!cancelled) setTrend(r.data?.data ?? []);
      } catch {
        if (!cancelled) setTrend([]);
      }
    })();
    return () => { cancelled = true; };
  }, [trendRange]);

  const kpiCards = useMemo(
    () => [
      {
        label: 'Total Patients',
        value: kpis?.totalPatients ?? 0,
        icon: 'ri-team-line',
        surface: 'var(--color-primary-50)',
        trend: kpis ? { value: kpis.patientGrowth, suffix: '% MoM' } : null,
      },
      {
        label: "Today's Appts",
        value: kpis?.todayAppointments ?? 0,
        icon: 'ri-calendar-event-line',
        surface: 'var(--color-tint-mint)',
        trend: kpis ? { value: 0, label: `${kpis.weeklyAppointments ?? 0} this week`, neutral: true } : null,
      },
      {
        label: 'Upcoming',
        value: kpis?.upcomingAppointments ?? 0,
        icon: 'ri-calendar-2-line',
        surface: 'var(--color-tint-sky)',
        trend: { value: 0, label: 'next 30 days', neutral: true },
      },
      {
        label: 'Monthly Revenue',
        value: formatCurrency(kpis?.monthlyRevenue ?? 0),
        icon: 'ri-money-rupee-circle-line',
        surface: 'var(--color-tint-yellow)',
        trend: kpis ? { value: kpis.revenueGrowth, suffix: '% MoM' } : null,
      },
      {
        label: 'Pending Dues',
        value: formatCurrency(kpis?.pendingDues ?? 0),
        icon: 'ri-error-warning-line',
        surface: 'var(--color-tint-rose)',
        trend: { value: 0, label: 'across all invoices', neutral: true },
      },
      {
        label: 'Active Doctors',
        value: kpis?.activeDoctors ?? 0,
        icon: 'ri-user-heart-line',
        surface: 'var(--color-tint-lavender)',
        trend: { value: 0, label: 'on the public site', neutral: true },
      },
      {
        label: 'New Patients',
        value: kpis?.newPatientsThisMonth ?? 0,
        icon: 'ri-user-add-line',
        surface: 'var(--color-tint-peach)',
        trend: kpis ? { value: kpis.patientGrowth, suffix: '% MoM' } : null,
      },
      {
        label: 'Approved Reviews',
        value: kpis?.approvedTestimonials ?? 0,
        icon: 'ri-message-3-line',
        surface: 'var(--color-tint-cream)',
        trend: kpis ? { value: 0, label: `${kpis.publishedBlogs ?? 0} blogs published`, neutral: true } : null,
      },
    ],
    [kpis],
  );

  return (
    <>
      {error && (
        <div className={styles.errorBox}>
          <i className="ri-error-warning-line" style={{ fontSize: 16 }} />
          {error}
        </div>
      )}

      {/* ── KPI ROW (6 cards) ─────────────────────────────────────────────── */}
      <div className={`${styles.kpiGrid} ${styles.kpiGridWide}`}>
        {kpiCards.map((k) => (
          <div key={k.label} className={styles.kpi} style={{ background: k.surface }}>
            <div className={styles.kpiIcon}><i className={k.icon} style={{ fontSize: 22 }} /></div>
            <div style={{ minWidth: 0 }}>
              <div className={styles.kpiLabel}>{k.label}</div>
              <div className={styles.kpiValue}>{loading ? <SkeletonBar width="60%" height={20} /> : k.value}</div>
              {k.trend && !loading && (
                <div className={`${styles.kpiTrend} ${
                  k.trend.neutral ? styles.kpiTrendFlat
                    : k.trend.value > 0 ? styles.kpiTrendUp
                      : k.trend.value < 0 ? styles.kpiTrendDown
                        : styles.kpiTrendFlat
                }`}>
                  {!k.trend.neutral && (
                    <i className={k.trend.value > 0 ? 'ri-arrow-up-line' : k.trend.value < 0 ? 'ri-arrow-down-line' : 'ri-subtract-line'} />
                  )}
                  {k.trend.label ?? `${k.trend.value > 0 ? '+' : ''}${k.trend.value}${k.trend.suffix ?? ''}`}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ── ROW 1: Appointments trend (2/3) + Service breakdown (1/3) ─────── */}
      <div className={`${styles.widgetRow} ${styles['widgetRow-2']}`}>
        <div className={styles.widgetCard}>
          <div className={styles.widgetHeader}>
            <div className={styles.widgetTitle}>
              <i className="ri-line-chart-line" style={{ color: 'var(--color-primary)' }} />
              Appointments Trend
            </div>
            <div className={styles.segGroup}>
              {TREND_RANGES.map((r) => (
                <button
                  key={r.days}
                  className={`${styles.segBtn} ${trendRange === r.days ? styles.segBtnActive : ''}`}
                  onClick={() => setTrendRange(r.days)}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
          <div className={styles.widgetBody}>
            {trend.length === 0 ? (
              <div className={styles.empty}>
                <i className={`ri-inbox-line ${styles.emptyIcon}`} style={{ fontSize: 32 }} />
                <span>No data for this period</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={trend}>
                  <defs>
                    <linearGradient id="trendArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#46a2b7" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#46a2b7" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-hairline)" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(d: string) => fmtDate(d, { day: '2-digit', month: 'short' })}
                    minTickGap={20}
                  />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip
                    labelFormatter={(d: string) => fmtDate(d, { day: '2-digit', month: 'long', year: 'numeric' })}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#46a2b7"
                    strokeWidth={2.5}
                    fill="url(#trendArea)"
                    name="Appointments"
                  />
                  <Line type="monotone" dataKey="completed" stroke="#1aae39" strokeWidth={1.5} dot={false} name="Completed" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className={styles.widgetCard}>
          <div className={styles.widgetHeader}>
            <div className={styles.widgetTitle}>
              <i className="ri-pie-chart-line" style={{ color: 'var(--color-primary)' }} />
              Service Breakdown
            </div>
          </div>
          <div className={styles.widgetBody}>
            {services.length === 0 ? (
              <div className={styles.empty}>
                <i className={`ri-inbox-line ${styles.emptyIcon}`} style={{ fontSize: 32 }} />
                <span>No data</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={services} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95} paddingAngle={2}>
                    {services.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Legend wrapperStyle={{ fontSize: 11 }} iconSize={8} />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* ── ROW 2: Revenue breakdown (full width) ─────────────────────────── */}
      <div className={`${styles.widgetRow}`} style={{ gridTemplateColumns: '1fr' }}>
        <div className={styles.widgetCard}>
          <div className={styles.widgetHeader}>
            <div className={styles.widgetTitle}>
              <i className="ri-bar-chart-2-line" style={{ color: 'var(--color-accent-cta)' }} />
              Revenue Breakdown — last 12 months
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginRight: 16 }}>
                <span style={{ width: 10, height: 10, background: '#46a2b7', borderRadius: 2, display: 'inline-block' }} /> Collected
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 10, height: 10, background: '#eb783d', borderRadius: 2, display: 'inline-block' }} /> Outstanding
              </span>
            </div>
          </div>
          <div className={styles.widgetBody}>
            {revenue.length === 0 ? (
              <div className={styles.empty}>
                <i className={`ri-inbox-line ${styles.emptyIcon}`} style={{ fontSize: 32 }} />
                <span>No revenue data yet</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-hairline)" />
                  <XAxis dataKey="period" tickFormatter={fmtPeriod} tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => v >= 100000 ? `₹${(v / 100000).toFixed(1)}L` : `₹${v / 1000}k`} />
                  <Tooltip
                    labelFormatter={fmtPeriod}
                    formatter={(v: number, name: string) => [formatCurrency(v), name === 'collected' ? 'Collected' : name === 'outstanding' ? 'Outstanding' : name]}
                  />
                  <Bar dataKey="collected" stackId="rev" fill="#46a2b7" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="outstanding" stackId="rev" fill="#eb783d" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* ── ROW 3: Top doctors + Patient growth ───────────────────────────── */}
      <div className={`${styles.widgetRow} ${styles['widgetRow-1-1']}`}>
        <div className={styles.widgetCard}>
          <div className={styles.widgetHeader}>
            <div className={styles.widgetTitle}>
              <i className="ri-trophy-line" style={{ color: 'var(--color-accent-cta)' }} />
              Top Performing Doctors
            </div>
            <span className={styles.widgetLink} style={{ color: 'var(--color-text-muted)' }}>Last 30 days</span>
          </div>
          <div className={styles.widgetBody} style={{ padding: 0 }}>
            {topDoctors.length === 0 ? (
              <div className={styles.empty}>
                <i className={`ri-user-heart-line ${styles.emptyIcon}`} style={{ fontSize: 28 }} />
                <span>No doctor activity yet</span>
              </div>
            ) : (
              topDoctors.map((d, i) => {
                const max = topDoctors[0]?.appointments || 1;
                return (
                  <div key={d._id} className={styles.lbRow}>
                    <div className={styles.lbRank}>#{i + 1}</div>
                    <div style={{ minWidth: 0 }}>
                      <div className={styles.lbName}>{d.name}</div>
                      <div className={styles.lbSub}>
                        {d.specialization ?? 'Physiotherapist'} · {Math.round(d.completionRate)}% completed
                      </div>
                      <div className={styles.lbBar} style={{ marginTop: 6 }}>
                        <div className={styles.lbBarFill} style={{ width: `${(d.appointments / max) * 100}%` }} />
                      </div>
                    </div>
                    <div className={styles.lbCount}>{d.appointments}</div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className={styles.widgetCard}>
          <div className={styles.widgetHeader}>
            <div className={styles.widgetTitle}>
              <i className="ri-user-add-line" style={{ color: 'var(--color-primary)' }} />
              Patient Growth — 12 months
            </div>
          </div>
          <div className={styles.widgetBody}>
            {patientGrowth.length === 0 ? (
              <div className={styles.empty}>
                <i className={`ri-inbox-line ${styles.emptyIcon}`} style={{ fontSize: 28 }} />
                <span>No growth data</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={patientGrowth}>
                  <defs>
                    <linearGradient id="growthArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7b3ff2" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#7b3ff2" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-hairline)" />
                  <XAxis dataKey="period" tickFormatter={fmtPeriod} tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip
                    labelFormatter={fmtPeriod}
                    formatter={(v: number, name: string) => [v, name === 'newPatients' ? 'New patients' : 'Cumulative total']}
                  />
                  <Area type="monotone" dataKey="total" stroke="#7b3ff2" strokeWidth={2.5} fill="url(#growthArea)" name="Cumulative" />
                  <Line type="monotone" dataKey="newPatients" stroke="#eb783d" strokeWidth={2} dot={{ r: 3 }} name="New patients" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* ── ROW 4: Upcoming + Recent payments ──────────────────────────────── */}
      <div className={`${styles.widgetRow} ${styles['widgetRow-1-1']}`}>
        <div className={styles.widgetCard}>
          <div className={styles.widgetHeader}>
            <div className={styles.widgetTitle}>
              <i className="ri-calendar-todo-line" style={{ color: 'var(--color-primary)' }} />
              Upcoming Appointments
            </div>
            <Link href="/admin/appointments" className={styles.widgetLink}>View all →</Link>
          </div>
          <div className={styles.widgetBody} style={{ padding: 0 }}>
            {upcoming.length === 0 ? (
              <div className={styles.empty}>
                <i className={`ri-calendar-line ${styles.emptyIcon}`} style={{ fontSize: 28 }} />
                <span>No upcoming bookings</span>
              </div>
            ) : (
              upcoming.map((a) => {
                const pname = a.patient?.personalInfo?.name ?? 'Patient';
                const dname = a.doctor?.name ?? '—';
                const svc = a.service?.name ?? '';
                return (
                  <div key={a._id} className={styles.listRow}>
                    <div className={styles.listAvatar}>{initialsOf(pname)}</div>
                    <div className={styles.listMain}>
                      <div className={styles.listTitle}>{pname}</div>
                      <div className={styles.listSubtitle}>{dname} · {svc}</div>
                    </div>
                    <div className={styles.listMeta}>
                      <div className={styles.listMetaStrong}>{fmtDate(a.scheduledAt)}</div>
                      <div>{fmtTime(a.scheduledAt)}</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className={styles.widgetCard}>
          <div className={styles.widgetHeader}>
            <div className={styles.widgetTitle}>
              <i className="ri-money-rupee-circle-line" style={{ color: 'var(--color-success)' }} />
              Recent Payments
            </div>
            <Link href="/admin/billing" className={styles.widgetLink}>View all →</Link>
          </div>
          <div className={styles.widgetBody} style={{ padding: 0 }}>
            {payments.length === 0 ? (
              <div className={styles.empty}>
                <i className={`ri-money-rupee-circle-line ${styles.emptyIcon}`} style={{ fontSize: 28 }} />
                <span>No payments yet</span>
              </div>
            ) : (
              payments.map((p) => {
                const pname = p.patient?.personalInfo?.name ?? 'Patient';
                return (
                  <div key={p._id} className={styles.listRow}>
                    <div className={`${styles.listAvatar} ${styles.listAvatarSuccess}`}>
                      <i className="ri-arrow-down-line" />
                    </div>
                    <div className={styles.listMain}>
                      <div className={styles.listTitle}>{pname}</div>
                      <div className={styles.listSubtitle}>
                        {p.invoiceNumber} · {p.paymentMethod.replace('_', ' ')}
                      </div>
                    </div>
                    <div className={styles.listMeta}>
                      <div className={styles.listMetaStrong}>{formatCurrency(p.amountPaid)}</div>
                      <div>{p.paymentDate ? timeAgo(p.paymentDate) : '—'}</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ── ROW 5: Recent activity + Most viewed blogs + Latest testimonials ─ */}
      <div className={`${styles.widgetRow} ${styles['widgetRow-1-1-1']}`}>
        <div className={styles.widgetCard}>
          <div className={styles.widgetHeader}>
            <div className={styles.widgetTitle}>
              <i className="ri-flashlight-line" style={{ color: 'var(--color-accent-cta)' }} />
              Recent Activity
            </div>
          </div>
          <div className={styles.widgetBody} style={{ padding: 0 }}>
            {activity.length === 0 ? (
              <div className={styles.empty}>
                <i className={`ri-history-line ${styles.emptyIcon}`} style={{ fontSize: 28 }} />
                <span>Nothing yet</span>
              </div>
            ) : (
              activity.slice(0, 8).map((ev, i) => {
                const toneClass =
                  ev.kind === 'payment' ? styles.listAvatarSuccess
                    : ev.kind === 'patient' ? styles.listAvatarInfo
                      : styles.listAvatarPrimary;
                return (
                  <div key={`${ev.kind}-${i}`} className={styles.listRow}>
                    <div className={`${styles.listAvatar} ${toneClass}`}>
                      <i className={ev.icon} />
                    </div>
                    <div className={styles.listMain}>
                      <div className={styles.listTitle}>{ev.title}</div>
                      <div className={styles.listSubtitle}>{ev.subtitle ?? ''}</div>
                    </div>
                    <div className={styles.listMeta}>{timeAgo(ev.at)}</div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className={styles.widgetCard}>
          <div className={styles.widgetHeader}>
            <div className={styles.widgetTitle}>
              <i className="ri-eye-line" style={{ color: 'var(--color-info)' }} />
              Most Viewed Blogs
            </div>
            <Link href="/admin/blog" className={styles.widgetLink}>View all →</Link>
          </div>
          <div className={styles.widgetBody} style={{ padding: 0 }}>
            {!content?.mostViewedBlogs?.length ? (
              <div className={styles.empty}>
                <i className={`ri-file-text-line ${styles.emptyIcon}`} style={{ fontSize: 28 }} />
                <span>No published blogs</span>
              </div>
            ) : (
              content.mostViewedBlogs.map((b, i) => (
                <div key={b._id} className={styles.listRow}>
                  <div className={`${styles.listAvatar} ${styles.listAvatarInfo}`}>#{i + 1}</div>
                  <div className={styles.listMain}>
                    <div className={styles.listTitle}>{b.title}</div>
                    <div className={styles.listSubtitle}>{b.category ?? 'Health Tips'}</div>
                  </div>
                  <div className={styles.listMeta}>
                    <div className={styles.listMetaStrong}>{b.views.toLocaleString('en-IN')}</div>
                    <div>views</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className={styles.widgetCard}>
          <div className={styles.widgetHeader}>
            <div className={styles.widgetTitle}>
              <i className="ri-message-3-line" style={{ color: 'var(--color-primary)' }} />
              Latest Testimonials
            </div>
            <Link href="/admin/testimonials" className={styles.widgetLink}>View all →</Link>
          </div>
          <div className={styles.widgetBody} style={{ padding: 0 }}>
            {!content?.latestTestimonials?.length ? (
              <div className={styles.empty}>
                <i className={`ri-chat-quote-line ${styles.emptyIcon}`} style={{ fontSize: 28 }} />
                <span>No testimonials yet</span>
              </div>
            ) : (
              content.latestTestimonials.map((t) => (
                <div key={t._id} className={styles.listRow}>
                  <div className={`${styles.listAvatar} ${styles.listAvatarPrimary}`}>{initialsOf(t.patientName)}</div>
                  <div className={styles.listMain}>
                    <div className={styles.listTitle}>
                      {t.patientName}
                      {t.isFeatured && (
                        <i className="ri-star-fill" style={{ fontSize: 11, color: 'var(--color-warning)', marginLeft: 6 }} />
                      )}
                    </div>
                    <div className={styles.listSubtitle}>{t.condition} · {'★'.repeat(t.rating)}</div>
                  </div>
                  <StatusBadge label="Approved" tone={toneFor('approved')} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── ROW 6: Recent appointments / status pie ────────────────────────── */}
      <div className={`${styles.widgetRow} ${styles['widgetRow-1-1']}`}>
        <div className={styles.widgetCard}>
          <div className={styles.widgetHeader}>
            <div className={styles.widgetTitle}>
              <i className="ri-file-text-line" style={{ color: 'var(--color-primary)' }} />
              Recently Published Blogs
            </div>
            <Link href="/admin/blog" className={styles.widgetLink}>Manage →</Link>
          </div>
          <div className={styles.widgetBody} style={{ padding: 0 }}>
            {!content?.recentBlogs?.length ? (
              <div className={styles.empty}>
                <i className={`ri-file-text-line ${styles.emptyIcon}`} style={{ fontSize: 28 }} />
                <span>No recent posts</span>
              </div>
            ) : (
              content.recentBlogs.map((b) => (
                <div key={b._id} className={styles.listRow}>
                  <div className={`${styles.listAvatar} ${styles.listAvatarInfo}`}>
                    <i className="ri-article-line" />
                  </div>
                  <div className={styles.listMain}>
                    <div className={styles.listTitle}>{b.title}</div>
                    <div className={styles.listSubtitle}>
                      {b.views.toLocaleString('en-IN')} views · {fmtDate(b.publishedAt)}
                    </div>
                  </div>
                  <a
                    href={`/blog/${b.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.widgetLink}
                  >
                    Open ↗
                  </a>
                </div>
              ))
            )}
          </div>
        </div>

        <div className={styles.widgetCard}>
          <div className={styles.widgetHeader}>
            <div className={styles.widgetTitle}>
              <i className="ri-pie-chart-2-line" style={{ color: 'var(--color-info)' }} />
              Quick Stats
            </div>
          </div>
          <div className={styles.widgetBody}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-4)' }}>
              <QuickStat icon="ri-stethoscope-line" label="Active services" value={content?.serviceCount ?? 0} tone="primary" />
              <QuickStat icon="ri-image-2-line" label="Gallery items" value={content?.gallerySize ?? 0} tone="info" />
              <QuickStat icon="ri-file-text-line" label="Published blogs" value={kpis?.publishedBlogs ?? 0} tone="success" />
              <QuickStat icon="ri-message-3-line" label="Approved reviews" value={kpis?.approvedTestimonials ?? 0} tone="warning" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function QuickStat({
  icon,
  label,
  value,
  tone,
}: {
  icon: string;
  label: string;
  value: number;
  tone: 'primary' | 'info' | 'success' | 'warning';
}) {
  const toneMap: Record<string, { bg: string; fg: string }> = {
    primary: { bg: 'var(--color-primary-50)', fg: 'var(--color-primary-deep)' },
    info: { bg: 'var(--color-info-bg)', fg: 'var(--color-info)' },
    success: { bg: 'var(--color-success-bg)', fg: 'var(--color-success)' },
    warning: { bg: 'var(--color-warning-bg)', fg: 'var(--color-warning)' },
  };
  const t = toneMap[tone];
  return (
    <div
      style={{
        background: t.bg,
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-4)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 'var(--radius-md)',
          background: 'var(--color-canvas)',
          color: t.fg,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 18,
        }}
      >
        <i className={icon} />
      </div>
      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-xl)', color: 'var(--color-text)' }}>
          {value}
        </div>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontWeight: 600 }}>
          {label}
        </div>
      </div>
    </div>
  );
}

void STATUS_COLORS;
