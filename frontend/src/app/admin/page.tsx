'use client';
import { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { analyticsApi } from '@/lib/api';
import { formatCurrency } from '@sai-physio/utils';
import styles from './admin.module.css';

interface Dashboard {
  totalPatients?: number;
  todayAppointments?: number;
  monthlyRevenue?: number;
  pendingDues?: number;
}

interface TrendPoint { date: string; count: number }
interface RevenuePoint { period: string; revenue: number }
interface ServiceSlice { name: string; value: number }

const PIE_COLORS = ['#2D6A9F', '#C9A96E', '#10B981', '#5B95C7', '#D69E2E', '#DC6262', '#8B5CF6'];

export default function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [revenue, setRevenue] = useState<RevenuePoint[]>([]);
  const [services, setServices] = useState<ServiceSlice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [d, t, r, s] = await Promise.allSettled([
          analyticsApi.getDashboard(),
          analyticsApi.getAppointmentTrend(),
          analyticsApi.getRevenue(),
          analyticsApi.getServiceBreakdown(),
        ]);
        if (cancelled) return;
        if (d.status === 'fulfilled') {
          const payload = d.value.data?.data ?? d.value.data ?? {};
          setDashboard(payload.kpis ?? payload);
        }
        if (t.status === 'fulfilled') setTrend(t.value.data?.data ?? t.value.data ?? []);
        if (r.status === 'fulfilled') setRevenue(r.value.data?.data ?? r.value.data ?? []);
        if (s.status === 'fulfilled') setServices(s.value.data?.data ?? s.value.data ?? []);
        if ([d, t, r, s].every((x) => x.status === 'rejected')) {
          setError('Could not load analytics. Make sure the backend is running.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const kpis = [
    { label: 'Total Patients', value: dashboard?.totalPatients ?? 0, icon: 'ri-team-line', surface: 'var(--color-primary-50)' },
    { label: "Today's Appointments", value: dashboard?.todayAppointments ?? 0, icon: 'ri-calendar-line', surface: 'var(--color-mint-50)' },
    { label: 'Monthly Revenue', value: formatCurrency(dashboard?.monthlyRevenue ?? 0), icon: 'ri-money-rupee-circle-line', surface: 'var(--color-sand-50)' },
    { label: 'Pending Dues', value: formatCurrency(dashboard?.pendingDues ?? 0), icon: 'ri-error-warning-line', surface: 'var(--color-blush-50)' },
  ];

  if (loading) {
    return (
      <>
        <div className={styles.kpiGrid}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={styles.kpi}>
              <div className={styles.skeleton} style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)' }} />
              <div style={{ flex: 1 }}>
                <div className={styles.skeleton} style={{ height: 12, width: '60%', marginBottom: 8 }} />
                <div className={styles.skeleton} style={{ height: 22, width: '40%' }} />
              </div>
            </div>
          ))}
        </div>
        <div className={styles.spinner} />
      </>
    );
  }

  return (
    <>
      {error && <div className={styles.errorBox}><i className="ri-error-warning-line" style={{ fontSize: 16 }} />{error}</div>}

      <div className={styles.kpiGrid}>
        {kpis.map(({ label, value, icon, surface }) => (
          <div key={label} className={styles.kpi} style={{ background: surface }}>
            <div className={styles.kpiIcon}><i className={icon} style={{ fontSize: 22 }} /></div>
            <div>
              <div className={styles.kpiLabel}>{label}</div>
              <div className={styles.kpiValue}>{value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.chartGrid}>
        <div className={styles.chartCard}>
          <div className={styles.chartTitle}><i className="ri-line-chart-line" style={{ fontSize: 16, marginRight: 6 }} /> Appointments Trend</div>
          {trend.length === 0 ? (
            <div className={styles.empty}><i className={`ri-inbox-line ${styles.emptyIcon}`} style={{ fontSize: 32 }} /><span>No data yet</span></div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#2D6A9F" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className={styles.chartCard}>
          <div className={styles.chartTitle}>Service Breakdown</div>
          {services.length === 0 ? (
            <div className={styles.empty}><i className={`ri-inbox-line ${styles.emptyIcon}`} style={{ fontSize: 32 }} /><span>No data</span></div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={services} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={2}>
                  {services.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className={styles.chartCard} style={{ marginTop: 'var(--space-5)' }}>
        <div className={styles.chartTitle}>Revenue</div>
        {revenue.length === 0 ? (
          <div className={styles.empty}><i className={`ri-inbox-line ${styles.emptyIcon}`} style={{ fontSize: 32 }} /><span>No revenue data</span></div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={revenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="period" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Bar dataKey="revenue" fill="#C9A96E" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </>
  );
}
