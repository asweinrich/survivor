'use client';

import React, { useEffect, useState } from 'react';

type QType = 'contestant' | 'tribe' | 'boolean';

type Row = {
  key: string;          // local React key
  id: number;           // option id stored in DB
  label: string;
  pointValue: string;   // kept as string for input editing
  img?: string;
  inPlay?: boolean;
};

const SEASONS = [50, 51];
const WEEKS = Array.from({ length: 13 }, (_, i) => i + 1);
const DEFAULT_POINTS = '100';

export default function AdminPickEmsPage() {
  const [season, setSeason] = useState(51);
  const [week, setWeek] = useState(1);
  const [question, setQuestion] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<QType>('contestant');
  const [inPlayOnly, setInPlayOnly] = useState(false);

  // Full source list (contestants/tribes) and the currently included rows
  const [source, setSource] = useState<Row[]>([]);
  const [rows, setRows] = useState<Row[]>([]);
  const [defaultPoints, setDefaultPoints] = useState(DEFAULT_POINTS);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);

  // Load source list when season/type changes
  useEffect(() => {
    let ignore = false;
    (async () => {
      setError(null);
      if (type === 'boolean') {
        setSource([]);
        setRows([
          { key: crypto.randomUUID(), id: 1, label: 'Yes', pointValue: DEFAULT_POINTS },
          { key: crypto.randomUUID(), id: 2, label: 'No', pointValue: DEFAULT_POINTS },
        ]);
        return;
      }
      setLoading(true);
      try {
        const url = type === 'contestant' ? `/api/cast/${season}` : `/api/show-tribes/${season}`;
        const res = await fetch(url, { cache: 'no-store' });
        const data = res.ok ? await res.json() : [];
        const list: Row[] = (Array.isArray(data) ? data : []).map((x: any) => ({
          key: `${type}-${x.id}`,
          id: x.id,
          label: x.name,
          pointValue: DEFAULT_POINTS,
          img: x.img,
          inPlay: type === 'contestant' ? !!x.inPlay : undefined,
        }));
        if (!ignore) {
          setSource(list);
          setRows(list);
          if (!res.ok) setError(`No ${type}s found for season ${season}`);
        }
      } catch (e: any) {
        if (!ignore) setError(e?.message || 'Failed to load options');
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [season, type]);

  // In-play filter (contestants only): resets rows to the filtered source
  const applyInPlayFilter = (only: boolean) => {
    setInPlayOnly(only);
    setRows(
      source
        .filter((r) => (only ? r.inPlay : true))
        .map((r) => ({ ...r, pointValue: rows.find((x) => x.key === r.key)?.pointValue ?? r.pointValue }))
    );
  };

  const updateRow = (key: string, patch: Partial<Row>) =>
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));

  const removeRow = (key: string) => setRows((prev) => prev.filter((r) => r.key !== key));

  const restoreRemoved = () => {
    setInPlayOnly(false);
    setRows(source);
  };

  const addBooleanRow = () =>
    setRows((prev) => {
      const nextId = prev.reduce((m, r) => Math.max(m, r.id), 0) + 1;
      return [...prev, { key: crypto.randomUUID(), id: nextId, label: '', pointValue: defaultPoints }];
    });

  const applyDefaultToAll = () => setRows((prev) => prev.map((r) => ({ ...r, pointValue: defaultPoints })));

  const reset = () => {
    setQuestion('');
    setDescription('');
    if (type === 'boolean') {
      setRows([
        { key: crypto.randomUUID(), id: 1, label: 'Yes', pointValue: DEFAULT_POINTS },
        { key: crypto.randomUUID(), id: 2, label: 'No', pointValue: DEFAULT_POINTS },
      ]);
    } else {
      setRows(source);
      setInPlayOnly(false);
    }
  };

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    setBanner(null);
    try {
      if (!question.trim()) throw new Error('Question is required');
      if (rows.length < 2) throw new Error('Need at least 2 options');
      if (rows.some((r) => !r.label.trim())) throw new Error('All options need a label');
      if (rows.some((r) => r.pointValue === '' || !Number.isFinite(Number(r.pointValue)))) {
        throw new Error('All options need a numeric point value');
      }

      const options = rows.map((r, idx) => ({
        id: idx,
        type,
        value: type === 'boolean' ? null : r.id,
        label: r.label.trim(),
        pointValue: Number(r.pointValue),
      }));

      const res = await fetch('/api/admin/pick-ems', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ season, week, question, description, options }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j?.error || 'Submit failed');

      setBanner(`Created pick-em #${j.id} for season ${season}, week ${week}`);
      reset();
    } catch (e: any) {
      setError(e?.message || 'Submit failed');
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = 'px-2 py-1 rounded-md bg-stone-800 border border-stone-700 text-stone-200';

  return (
    <div className="min-h-screen bg-stone-900 text-stone-200 p-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-stone-100 font-survivor tracking-wider">Admin: Add Pick-Em</h1>

        {error && <div className="mb-4 p-3 rounded-lg border border-red-700 bg-red-900/30 text-red-200">{error}</div>}
        {banner && <div className="mb-4 p-3 rounded-lg border border-green-700 bg-green-900/30 text-green-200">{banner}</div>}

        {/* Meta */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
          <label className="flex flex-col text-sm gap-1">
            Season
            <select className={inputCls} value={season} onChange={(e) => setSeason(Number(e.target.value))}>
              {SEASONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <label className="flex flex-col text-sm gap-1">
            Week
            <select className={inputCls} value={week} onChange={(e) => setWeek(Number(e.target.value))}>
              {WEEKS.map((w) => <option key={w} value={w}>{w}</option>)}
            </select>
          </label>
          <label className="flex flex-col text-sm gap-1 col-span-2 sm:col-span-1">
            Type
            <select className={inputCls} value={type} onChange={(e) => setType(e.target.value as QType)}>
              <option value="contestant">Contestant</option>
              <option value="tribe">Tribe</option>
              <option value="boolean">Boolean / custom options</option>
            </select>
          </label>
        </div>

        <label className="flex flex-col text-sm gap-1 mb-3">
          Question
          <input className={inputCls} value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Who will win immunity?" />
        </label>
        <label className="flex flex-col text-sm gap-1 mb-4">
          Description (optional)
          <textarea className={inputCls} rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>

        {/* Option toolbar */}
        <div className="flex flex-wrap items-center gap-3 mb-2 text-sm">
          {type === 'contestant' && (
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={inPlayOnly} onChange={(e) => applyInPlayFilter(e.target.checked)} />
              In-play only
            </label>
          )}
          <div className="flex items-center gap-2 ms-auto">
            <span>Default pts</span>
            <input type="number" className={`${inputCls} w-20`} value={defaultPoints} onChange={(e) => setDefaultPoints(e.target.value)} />
            <button type="button" onClick={applyDefaultToAll} className="px-2 py-1 rounded-md bg-stone-700 border border-stone-600 hover:bg-stone-600">
              Apply to all
            </button>
          </div>
        </div>

        {/* Options */}
        {loading ? (
          <p className="py-6 text-stone-400">Loading…</p>
        ) : (
          <div className="border border-stone-700 rounded-lg divide-y divide-stone-700">
            {rows.length === 0 && <div className="p-4 text-stone-400">No options.</div>}
            {rows.map((r) => (
              <div key={r.key} className="flex items-center gap-2 p-2">
                {type === 'contestant' && r.img && (
                  <img src={`/imgs/${r.img}.png`} alt="" className="h-8 w-8 rounded-full object-cover border border-stone-600" />
                )}
                {type === 'boolean' ? (
                  <input
                    className={`${inputCls} flex-1`}
                    value={r.label}
                    placeholder="Option label"
                    onChange={(e) => updateRow(r.key, { label: e.target.value })}
                  />
                ) : (
                  <span className="flex-1">
                    {r.label}
                    {type === 'contestant' && r.inPlay === false && <span className="ml-2 text-xs text-stone-500">out</span>}
                  </span>
                )}
                <input
                  type="number"
                  className={`${inputCls} w-24 text-right`}
                  value={r.pointValue}
                  onChange={(e) => updateRow(r.key, { pointValue: e.target.value })}
                  aria-label="Point value"
                />
                <button
                  type="button"
                  onClick={() => removeRow(r.key)}
                  className="px-2 py-1 rounded-md bg-red-900/40 border border-red-700 hover:bg-red-800/60"
                  aria-label="Remove option"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3 mt-3">
          {type === 'boolean' ? (
            <button type="button" onClick={addBooleanRow} className="px-3 py-1.5 rounded-md bg-stone-700 border border-stone-600 hover:bg-stone-600">
              + Add option
            </button>
          ) : (
            <button type="button" onClick={restoreRemoved} className="px-3 py-1.5 rounded-md bg-stone-700 border border-stone-600 hover:bg-stone-600">
              Restore all
            </button>
          )}
          <button
            type="button"
            onClick={submit}
            disabled={submitting || loading}
            className={`ms-auto px-4 py-2 rounded-md border text-stone-50 ${
              submitting || loading ? 'bg-stone-700 border-stone-600 cursor-not-allowed' : 'bg-orange-600 border-orange-700 hover:bg-orange-500'
            }`}
          >
            {submitting ? 'Submitting…' : 'Create Pick-Em'}
          </button>
        </div>
      </div>
    </div>
  );
}