'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  Chart as ChartJS,
  TimeScale,
  LogarithmicScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
  Title,
} from 'chart.js';
import 'chartjs-adapter-luxon';
import { Line } from 'react-chartjs-2';
import { DateTime } from 'luxon';

ChartJS.register(TimeScale, LogarithmicScale, PointElement, LineElement, Tooltip, Legend, Filler, Title);

// ── Types ──────────────────────────────────────────────────────────────────────
interface PricePoint {
  x: number; // store as ms epoch so Chart.js time scale works correctly
  y: number;
}

// ── Constants ─────────────────��────────────────────────────────────────────────
const ADMIN_EMAIL = 'asweinrich@gmail.com';
const PT_ZONE = 'America/Los_Angeles'; // handles PST/PDT automatically

const CONTESTANT_COLORS = [
  '#f97316', '#3b82f6', '#22c55e', '#ec4899', '#a855f7',
  '#14b8a6', '#eab308', '#ef4444', '#6366f1', '#f59e0b',
  '#10b981', '#8b5cf6', '#06b6d4', '#84cc16', '#f43f5e',
  '#0ea5e9', '#d946ef', '#fb923c', '#34d399', '#60a5fa',
  '#facc15', '#c084fc', '#4ade80', '#f87171',
];

// ── Helpers ────────────────────────────────────────────────────────────────────
function parseCSV(text: string): Record<string, PricePoint[]> {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const contestantNames = headers.slice(1);

  const result: Record<string, PricePoint[]> = {};
  contestantNames.forEach(name => { if (name) result[name] = []; });

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
    if (cols.length < 2) continue;

    // Parse as UTC then store as ms epoch — Chart.js time scale uses epoch internally
    const utcMs = DateTime.fromISO(cols[0], { zone: 'utc' }).toMillis();
    if (isNaN(utcMs)) continue;

    contestantNames.forEach((name, idx) => {
      if (!name) return;
      const raw = cols[idx + 1];
      if (raw === '' || raw === undefined) return;
      const price = parseFloat(raw);
      if (isNaN(price)) return;
      result[name].push({ x: utcMs, y: price });
    });
  }

  return result;
}

// Format an epoch ms timestamp in Pacific Time for display
function formatPT(ms: number): string {
  return DateTime.fromMillis(ms, { zone: PT_ZONE }).toFormat("MMM d, h:mm a 'PT'");
}

// ── Component ──────────────────────────────────────────────────────────────────
export default function KalshiPricesPage() {
  const { data: session, status } = useSession();

  const isAdmin =
    status === 'authenticated' &&
    session?.user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  const [allData, setAllData] = useState<Record<string, PricePoint[]>>({});
  const [contestants, setContestants] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const parsed = parseCSV(evt.target?.result as string);
        const names = Object.keys(parsed).sort();
        setAllData(parsed);
        setContestants(names);
      } catch (err: any) {
        setError(err.message);
      }
    };
    reader.readAsText(file);
  }

  const chartData = contestants.length > 0
    ? {
        datasets: contestants.map((name, idx) => ({
          label: name,
          data: allData[name],
          borderColor: CONTESTANT_COLORS[idx % CONTESTANT_COLORS.length],
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          pointRadius: 0,
          pointHoverRadius: 4,
          tension: 0.2,
        })),
      }
    : null;

  const chartOptions = {
    responsive: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    scales: {
      x: {
        type: 'time' as const,
        time: {
          unit: 'day' as const,
          // Tell chartjs-adapter-luxon to display in PT
          tooltipFormat: "MMM d, h a",
        },
        adapters: {
          date: {
            zone: PT_ZONE,
          },
        },
        ticks: {
          color: '#a8a29e',
        },
        grid: { color: '#292524' },
      },
      y: {
        type: 'logarithmic' as const,
        min: 0.8,
        title: { display: true, text: 'Kalshi Price (¢)', color: '#a8a29e' },
        ticks: {
          color: '#a8a29e',
          callback: (v: number | string) => {
            const n = Number(v);
            if ([1, 2, 3, 5, 10, 20, 50, 100].includes(Math.round(n))) {
              return `${n}¢`;
            }
            return '';
          },
        },
        grid: { color: '#292524' },
      },
    },
    plugins: {
      legend: {
        labels: {
          color: '#e7e5e4',
          boxWidth: 12,
          padding: 10,
          font: { size: 11 },
        },
      },
      tooltip: {
        // Sort tooltip items highest price → lowest
        itemSort: (a: any, b: any) => b.raw.y - a.raw.y,
        callbacks: {
          // Show the timestamp in PT at the top of the tooltip
          title: (items: any[]) => {
            if (!items.length) return '';
            return formatPT(items[0].raw.x);
          },
          label: (ctx: any) => ` ${ctx.dataset.label}: ${ctx.raw.y.toFixed(2)}¢`,
        },
      },
    },
  };

  // ── Auth gates ───────────────────────────────────────────────────────────────
  if (status === 'loading') return null;

  if (!isAdmin) {
    return (
      <div className="bg-stone-900 text-stone-200 min-h-screen flex items-center justify-center font-lostIsland">
        <p className="text-stone-500 tracking-wider">Access denied.</p>
      </div>
    );
  }

  // ── Page ─────────────────────────────────────────────────────────────────────
  return (
    <div className="bg-stone-900 text-stone-200 min-h-screen font-lostIsland max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-survivor tracking-wider text-orange-500 mb-1">
        Kalshi Price Explorer
      </h1>
      <p className="text-stone-400 text-sm mb-6 tracking-wide">
        S50 · &quot;Who Will Win&quot; market · Feb 25 – Mar 5, 2026 · Pacific Time
      </p>

      {/* File upload */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-6">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-stone-400 uppercase tracking-widest">Upload CSV</span>
          <input
            type="file"
            accept=".csv"
            onChange={handleFile}
            className="text-sm text-stone-300 file:mr-3 file:py-1.5 file:px-4 file:rounded file:border-0 file:bg-orange-600 file:text-white file:cursor-pointer hover:file:bg-orange-500"
          />
        </label>
        {contestants.length > 0 && (
          <p className="text-stone-500 text-xs tracking-wide self-end pb-1">
            {contestants.length} contestants · hover to compare · times in PT
          </p>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-900/40 border border-red-700 text-red-300 rounded p-3 mb-6 text-sm">
          <strong>CSV parse error:</strong> {error}
        </div>
      )}

      {/* Chart */}
      {chartData ? (
        <div className="bg-stone-800 rounded-lg p-4 border border-stone-700">
          <Line data={chartData} options={chartOptions} />
        </div>
      ) : (
        <div className="bg-stone-800 rounded-lg p-12 border border-stone-700 text-center text-stone-500 text-sm tracking-wide">
          Upload a CSV to get started
        </div>
      )}
    </div>
  );
}