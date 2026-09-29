'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Title,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Title
);

const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const PST_OFFSET_MS = 8 * 60 * 60 * 1000; // UTC-8

type DraftBucket = {
  season: number
  bucket_start_pt: string
  tribes_drafted: number
}

// --- Helpers ---

function parseUTC(s: string): number {
  return Date.parse(s.replace(' ', 'T') + 'Z');
}

function toWeekSlot(utcMs: number): number {
  const pstMs = utcMs - PST_OFFSET_MS;
  const d = new Date(pstMs);
  const dow = d.getUTCDay();
  const hour = d.getUTCHours();
  const shiftedDay = (dow - 3 + 7) % 7;
  return shiftedDay * 24 + hour;
}

function bucketLabel(utcMs: number): string {
  const pstMs = utcMs - PST_OFFSET_MS;
  const d = new Date(pstMs);
  const day = DAYS[d.getUTCDay()];
  const startH = d.getUTCHours();
  const endH = (startH + 4) % 24;
  const fmt = (h: number) => {
    const suffix = h % 12 === 0 ? 12 : h % 12;
    const ampm = h < 12 ? 'AM' : 'PM';
    return `${suffix}${ampm}`;
  };
  return `${day} ${fmt(startH)}-${fmt(endH)}`;
}

function toSlotMap(raw: Array<{ bucket_start_pt: string; tribes_drafted: number }>): Map<number, number> {
  const map = new Map<number, number>();
  for (const row of raw) {
    const slot = toWeekSlot(parseUTC(row.bucket_start_pt));
    map.set(slot, (map.get(slot) ?? 0) + row.tribes_drafted);
  }
  return map;
}

function toSlotLabelMap(raw: Array<{ bucket_start_pt: string; tribes_drafted: number }>): Map<number, string> {
  const map = new Map<number, string>();
  for (const row of raw) {
    const utcMs = parseUTC(row.bucket_start_pt);
    const slot = toWeekSlot(utcMs);
    if (!map.has(slot)) map.set(slot, bucketLabel(utcMs));
  }
  return map;
}

function buildCumulative(slots: number[], map: Map<number, number>): (number | null)[] {
  let started = false;
  let running = 0;
  return slots.map((s) => {
    const val = map.get(s) ?? 0;
    if (!started && val === 0) return null;
    started = true;
    running += val;
    return running;
  });
}

export default function DraftStatsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [raw49, setRaw49] = useState<DraftBucket[]>([])
  const [raw50, setRaw50] = useState<DraftBucket[]>([])
  const [raw51, setRaw51] = useState<DraftBucket[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [dataError, setDataError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'loading') return;
    if (
      status === 'unauthenticated' ||
      (status === 'authenticated' &&
        (session?.user as any)?.phone !== process.env.NEXT_PUBLIC_ADMIN_PHONE)
    ) {
      router.replace('/');
    }
  }, [session, status, router]);

  useEffect(() => {
    async function load() {
      try {
        setLoadingData(true)
        setDataError(null)

        const res = await fetch('/api/draft-stats?seasons=49,50,51', { cache: 'no-store' })
        if (!res.ok) throw new Error('Failed to load draft stats')

        const json = await res.json()

        setRaw49(Array.isArray(json?.bySeason?.['49']) ? json.bySeason['49'] : [])
        setRaw50(Array.isArray(json?.bySeason?.['50']) ? json.bySeason['50'] : [])
        setRaw51(Array.isArray(json?.bySeason?.['51']) ? json.bySeason['51'] : [])
      } catch (err: any) {
        setDataError(err?.message || 'Failed to load draft stats')
        setRaw49([])
        setRaw50([])
        setRaw51([])
      } finally {
        setLoadingData(false)
      }
    }

    load()
  }, [])

  const { chartData, chartOptions, total49, total50, total51 } = useMemo(() => {
    const slotMap49 = toSlotMap(raw49);
    const slotMap50 = toSlotMap(raw50);
    const slotMap51 = toSlotMap(raw51);

    const labelMap49 = toSlotLabelMap(raw49);
    const labelMap50 = toSlotLabelMap(raw50);
    const labelMap51 = toSlotLabelMap(raw51);

    const allSlots = Array.from(
      new Set([...slotMap49.keys(), ...slotMap50.keys(), ...slotMap51.keys()])
    ).sort((a, b) => a - b);

    const bars49  = allSlots.map((s) => slotMap49.get(s) ?? 0);
    const bars50  = allSlots.map((s) => slotMap50.get(s) ?? 0);
    const bars51  = allSlots.map((s) => slotMap51.get(s) ?? 0);

    const cumul49 = buildCumulative(allSlots, slotMap49);
    const cumul50 = buildCumulative(allSlots, slotMap50);
    const cumul51 = buildCumulative(allSlots, slotMap51);

    const total49 = bars49.reduce((sum, v) => sum + v, 0);
    const total50 = bars50.reduce((sum, v) => sum + v, 0);
    const total51 = bars51.reduce((sum, v) => sum + v, 0);

    const xLabels = allSlots.map(
      (s) =>
        labelMap51.get(s) ??
        labelMap50.get(s) ??
        labelMap49.get(s) ??
        `slot${s}`
    );

    const chartData = {
      labels: xLabels,
      datasets: [
        {
          type: 'bar' as const,
          label: 'Season 49 (per bucket)',
          data: bars49,
          backgroundColor: '#fb923c',
          yAxisID: 'y',
          order: 2,
        },
        {
          type: 'bar' as const,
          label: 'Season 50 (per bucket)',
          data: bars50,
          backgroundColor: '#60a5fa',
          yAxisID: 'y',
          order: 2,
        },
        {
          type: 'bar' as const,
          label: 'Season 51 (per bucket)',
          data: bars51,
          backgroundColor: '#34d399',
          yAxisID: 'y',
          order: 2,
        },
        {
          type: 'line' as const,
          label: 'Season 49 (running total)',
          data: cumul49,
          borderColor: '#f97316',
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderDash: [5, 4],
          pointRadius: 3,
          pointBackgroundColor: '#f97316',
          tension: 0.3,
          yAxisID: 'y2',
          order: 1,
          spanGaps: false,
        },
        {
          type: 'line' as const,
          label: 'Season 50 (running total)',
          data: cumul50,
          borderColor: '#3b82f6',
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderDash: [5, 4],
          pointRadius: 3,
          pointBackgroundColor: '#3b82f6',
          tension: 0.3,
          yAxisID: 'y2',
          order: 1,
          spanGaps: false,
        },
        {
          type: 'line' as const,
          label: 'Season 51 (running total)',
          data: cumul51,
          borderColor: '#10b981',
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderDash: [5, 4],
          pointRadius: 3,
          pointBackgroundColor: '#10b981',
          tension: 0.3,
          yAxisID: 'y2',
          order: 1,
          spanGaps: false,
        },
      ],
    };

    const chartOptions = {
      responsive: true,
      interaction: { mode: 'index' as const, intersect: false },
      plugins: {
        legend: {
          position: 'top' as const,
          labels: { color: '#e7e5e4' },
        },
        tooltip: { mode: 'index' as const, intersect: false },
      },
      scales: {
        x: {
          ticks: {
            color: '#a8a29e',
            maxRotation: 45,
            minRotation: 30,
          },
          grid: { color: '#44403c' },
          title: { display: true, text: 'Draft Window (PT)', color: '#e7e5e4' },
        },
        y: {
          type: 'linear' as const,
          position: 'left' as const,
          min: 0,
          ticks: { color: '#fb923c' },
          grid: { color: '#44403c' },
          title: { display: true, text: 'Tribes Drafted (per bucket)', color: '#fb923c' },
        },
        y2: {
          type: 'linear' as const,
          position: 'right' as const,
          min: 0,
          ticks: { color: '#60a5fa' },
          grid: { drawOnChartArea: false },
          title: { display: true, text: 'Running Total', color: '#60a5fa' },
        },
      },
    };

    return { chartData, chartOptions, total49, total50, total51 };
  }, [raw49, raw50, raw51]);

  if (status === 'loading') {
    return (
      <div className="bg-stone-900 min-h-screen flex items-center justify-center text-stone-400 font-lostIsland text-xl uppercase tracking-wider">
        Loading…
      </div>
    );
  }

  return (
    <div className="bg-stone-900 text-stone-200 font-lostIsland min-h-screen px-4 py-10">
      <div className="max-w-5xl mx-auto">

        <h1 className="text-3xl font-survivor tracking-wider text-center mb-2 uppercase">
          Draft Activity
        </h1>
        <p className="text-center text-stone-400 uppercase tracking-wider text-sm mb-8">
          Season 49 vs Season 50 vs Season 51 · Tribes drafted per 4-hour window (PT)
        </p>

        {loadingData && (
          <p className="text-center text-stone-400 uppercase tracking-wider mb-4">
            Loading draft stats...
          </p>
        )}
        {dataError && (
          <p className="text-center text-red-400 uppercase tracking-wider mb-4">
            {dataError}
          </p>
        )}

        <div className="flex gap-4 justify-center mb-8 flex-wrap">
          <div className="bg-stone-800 border border-stone-700 rounded-xl px-8 py-4 text-center">
            <div className="text-orange-400 text-3xl font-bold font-survivor">{total49}</div>
            <div className="text-stone-400 text-xs uppercase tracking-wider mt-1">Season 49 Total</div>
          </div>
          <div className="bg-stone-800 border border-stone-700 rounded-xl px-8 py-4 text-center">
            <div className="text-blue-400 text-3xl font-bold font-survivor">{total50}</div>
            <div className="text-stone-400 text-xs uppercase tracking-wider mt-1">Season 50 Total</div>
          </div>
          <div className="bg-stone-800 border border-stone-700 rounded-xl px-8 py-4 text-center">
            <div className="text-emerald-400 text-3xl font-bold font-survivor">{total51}</div>
            <div className="text-stone-400 text-xs uppercase tracking-wider mt-1">Season 51 Total</div>
          </div>
        </div>

        <div className="bg-stone-800 rounded-xl p-6 border border-stone-700">
          <Chart type="bar" data={chartData} options={chartOptions} />
        </div>

        <p className="text-center text-stone-500 text-xs uppercase tracking-wider mt-4">
          Bars = tribes drafted per bucket · Dashed lines = running cumulative total (right axis)
        </p>
      </div>
    </div>
  );
}