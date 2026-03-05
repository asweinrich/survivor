'use client';

import { useEffect } from 'react';
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

// --- Raw data (timestamps are UTC) ---
const RAW_49 = [
  { bucket_start_pt: '2025-09-25 05:00:00', tribes_drafted: 1 },
  { bucket_start_pt: '2025-09-25 17:00:00', tribes_drafted: 4 },
  { bucket_start_pt: '2025-09-25 21:00:00', tribes_drafted: 1 },
  { bucket_start_pt: '2025-09-26 01:00:00', tribes_drafted: 10 },
  { bucket_start_pt: '2025-09-26 13:00:00', tribes_drafted: 1 },
  { bucket_start_pt: '2025-09-27 01:00:00', tribes_drafted: 5 },
  { bucket_start_pt: '2025-09-28 01:00:00', tribes_drafted: 2 },
  { bucket_start_pt: '2025-09-28 17:00:00', tribes_drafted: 2 },
  { bucket_start_pt: '2025-09-28 21:00:00', tribes_drafted: 2 },
  { bucket_start_pt: '2025-09-29 01:00:00', tribes_drafted: 2 },
  { bucket_start_pt: '2025-09-29 13:00:00', tribes_drafted: 2 },
  { bucket_start_pt: '2025-09-29 21:00:00', tribes_drafted: 3 },
  { bucket_start_pt: '2025-09-30 01:00:00', tribes_drafted: 4 },
  { bucket_start_pt: '2025-09-30 13:00:00', tribes_drafted: 1 },
  { bucket_start_pt: '2025-09-30 17:00:00', tribes_drafted: 3 },
  { bucket_start_pt: '2025-09-30 21:00:00', tribes_drafted: 2 },
  { bucket_start_pt: '2025-10-01 01:00:00', tribes_drafted: 13 },
  { bucket_start_pt: '2025-10-01 05:00:00', tribes_drafted: 2 },
  { bucket_start_pt: '2025-10-01 13:00:00', tribes_drafted: 4 },
  { bucket_start_pt: '2025-10-01 17:00:00', tribes_drafted: 5 },
  { bucket_start_pt: '2025-10-01 21:00:00', tribes_drafted: 16 },
  { bucket_start_pt: '2025-10-02 17:00:00', tribes_drafted: 1 },
  { bucket_start_pt: '2025-10-03 01:00:00', tribes_drafted: 1 },
];

const RAW_50 = [
  { bucket_start_pt: '2026-02-26 17:00:00', tribes_drafted: 1 },
  { bucket_start_pt: '2026-02-26 21:00:00', tribes_drafted: 3 },
  { bucket_start_pt: '2026-02-27 01:00:00', tribes_drafted: 1 },
  { bucket_start_pt: '2026-02-27 05:00:00', tribes_drafted: 0 },
  { bucket_start_pt: '2026-02-27 09:00:00', tribes_drafted: 0 },
  { bucket_start_pt: '2026-02-27 13:00:00', tribes_drafted: 4 },
  { bucket_start_pt: '2026-02-27 17:00:00', tribes_drafted: 0 },
  { bucket_start_pt: '2026-02-27 21:00:00', tribes_drafted: 2 },
  { bucket_start_pt: '2026-02-28 01:00:00', tribes_drafted: 1 },
  { bucket_start_pt: '2026-02-28 05:00:00', tribes_drafted: 4 },
  { bucket_start_pt: '2026-02-28 09:00:00', tribes_drafted: 0 },
  { bucket_start_pt: '2026-02-28 13:00:00', tribes_drafted: 2 },
  { bucket_start_pt: '2026-02-28 17:00:00', tribes_drafted: 0 },
  { bucket_start_pt: '2026-02-28 21:00:00', tribes_drafted: 1 },
  { bucket_start_pt: '2026-03-01 01:00:00', tribes_drafted: 3 },
  { bucket_start_pt: '2026-03-01 05:00:00', tribes_drafted: 0 },
  { bucket_start_pt: '2026-03-01 09:00:00', tribes_drafted: 2 },
  { bucket_start_pt: '2026-03-01 13:00:00', tribes_drafted: 0 },
  { bucket_start_pt: '2026-03-01 17:00:00', tribes_drafted: 1 },
  { bucket_start_pt: '2026-03-01 21:00:00', tribes_drafted: 0 },
  { bucket_start_pt: '2026-03-02 01:00:00', tribes_drafted: 2 },
  { bucket_start_pt: '2026-03-02 05:00:00', tribes_drafted: 2 },
  { bucket_start_pt: '2026-03-02 09:00:00', tribes_drafted: 0 },
  { bucket_start_pt: '2026-03-02 13:00:00', tribes_drafted: 0 },
  { bucket_start_pt: '2026-03-02 17:00:00', tribes_drafted: 0 },
  { bucket_start_pt: '2026-03-02 21:00:00', tribes_drafted: 2 },
  { bucket_start_pt: '2026-03-03 01:00:00', tribes_drafted: 6 },
];

// --- Helpers ---

// Parse "YYYY-MM-DD HH:MM:SS" as UTC → ms timestamp
function parseUTC(s: string): number {
  return Date.parse(s.replace(' ', 'T') + 'Z');
}

// Convert a UTC ms timestamp to a canonical week-slot key:
// day-of-week (0=Sun) * 24 + hour-in-PST, anchored so WED=0
// We use WED as the start of the week (day index 3),
// so slots go WED(0)...TUE(6), each day has 6 four-hour buckets.
function toWeekSlot(utcMs: number): number {
  const pstMs = utcMs - PST_OFFSET_MS;
  const d = new Date(pstMs);
  const dow = d.getUTCDay(); // 0=Sun … 6=Sat in PST
  const hour = d.getUTCHours(); // hour in PST
  // Shift so WED (3) = day 0, wrapping around Sunday
  const shiftedDay = (dow - 3 + 7) % 7;
  return shiftedDay * 24 + hour;
}

// Build a human-readable label like "WED 9PM-1AM" from a UTC ms timestamp
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

// Build a map of weekSlot → tribes_drafted and weekSlot → label
function toSlotMap(raw: typeof RAW_49): Map<number, number> {
  const map = new Map<number, number>();
  for (const row of raw) {
    const slot = toWeekSlot(parseUTC(row.bucket_start_pt));
    map.set(slot, (map.get(slot) ?? 0) + row.tribes_drafted);
  }
  return map;
}

function toSlotLabelMap(raw: typeof RAW_49): Map<number, string> {
  const map = new Map<number, string>();
  for (const row of raw) {
    const utcMs = parseUTC(row.bucket_start_pt);
    const slot = toWeekSlot(utcMs);
    if (!map.has(slot)) map.set(slot, bucketLabel(utcMs));
  }
  return map;
}

function buildCumulative(slots: number[], map: Map<number, number>): (number | null)[] {
  // Only accumulate from the first non-zero slot for each season
  let started = false;
  let running = 0;
  return slots.map((s) => {
    const val = map.get(s) ?? 0;
    if (!started && val === 0) return null; // null = no point rendered before season started
    started = true;
    running += val;
    return running;
  });
}

// --- Build chart data ---
const slotMap49 = toSlotMap(RAW_49);
const slotMap50 = toSlotMap(RAW_50);
const labelMap49 = toSlotLabelMap(RAW_49);
const labelMap50 = toSlotLabelMap(RAW_50);

// Union of all slots across both seasons, sorted chronologically
const allSlots = Array.from(
  new Set([...slotMap49.keys(), ...slotMap50.keys()])
).sort((a, b) => a - b);

const bars49  = allSlots.map((s) => slotMap49.get(s) ?? 0);
const bars50  = allSlots.map((s) => slotMap50.get(s) ?? 0);
const cumul49 = buildCumulative(allSlots, slotMap49);
const cumul50 = buildCumulative(allSlots, slotMap50);

const total49 = bars49.reduce((sum, v) => sum + v, 0);
const total50 = bars50.reduce((sum, v) => sum + v, 0);

// X-axis labels: prefer S50's label for a slot, fall back to S49's
const xLabels = allSlots.map((s) => labelMap50.get(s) ?? labelMap49.get(s) ?? `slot${s}`);

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
      title: { display: true, text: 'Draft Window (PST)', color: '#e7e5e4' },
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

export default function DraftStatsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    if (
      status === 'unauthenticated' ||
      (status === 'authenticated' &&
        session?.user?.email?.toLowerCase() !== 'asweinrich@gmail.com')
    ) {
      router.replace('/');
    }
  }, [session, status, router]);

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

        {/* Heading */}
        <h1 className="text-3xl font-survivor tracking-wider text-center mb-2 uppercase">
          Draft Activity
        </h1>
        <p className="text-center text-stone-400 uppercase tracking-wider text-sm mb-8">
          Season 49 vs Season 50 · Tribes drafted per 4-hour window (PST)
        </p>

        {/* Summary boxes */}
        <div className="flex gap-4 justify-center mb-8">
          <div className="bg-stone-800 border border-stone-700 rounded-xl px-8 py-4 text-center">
            <div className="text-orange-400 text-3xl font-bold font-survivor">{total49}</div>
            <div className="text-stone-400 text-xs uppercase tracking-wider mt-1">Season 49 Total</div>
          </div>
          <div className="bg-stone-800 border border-stone-700 rounded-xl px-8 py-4 text-center">
            <div className="text-blue-400 text-3xl font-bold font-survivor">{total50}</div>
            <div className="text-stone-400 text-xs uppercase tracking-wider mt-1">Season 50 Total</div>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-stone-800 rounded-xl p-6 border border-stone-700">
          <Chart type="bar" data={chartData} options={chartOptions} />
        </div>

        {/* Legend note */}
        <p className="text-center text-stone-500 text-xs uppercase tracking-wider mt-4">
          Bars = tribes drafted per bucket · Dashed lines = running cumulative total (right axis)
        </p>
      </div>
    </div>
  );
}