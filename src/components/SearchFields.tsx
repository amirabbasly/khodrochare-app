"use client";
import { useEffect, useId, useState } from "react";
import { api, errorMessage, type Place, type VehicleModel } from "@/lib/api";
import "./search-fields.css";

function Results<T extends { id: string }>({ label, value, onChange, items, onPick, render, busy, error, placeholder }: { label: string; value: string; onChange: (value: string) => void; items: T[]; onPick: (item: T) => void; render: (item: T) => string; busy: boolean; error: string; placeholder: string }) {
  const id = useId();
  const [active, setActive] = useState(0);
  return <div className="search-field-group">
    <label className="form-field" htmlFor={id}><span className="field-label">{label}</span><span className="field-control"><input id={id} role="combobox" aria-autocomplete="list" aria-expanded={items.length > 0} aria-controls={`${id}-options`} aria-activedescendant={items[active] ? `${id}-option-${active}` : undefined} value={value} placeholder={placeholder} autoComplete="off" maxLength={150} onChange={event => { setActive(0); onChange(event.target.value); }} onKeyDown={event => {
      if (!items.length) return;
      if (event.key === 'ArrowDown') { event.preventDefault(); setActive(index => (index + 1) % items.length); }
      if (event.key === 'ArrowUp') { event.preventDefault(); setActive(index => (index + items.length - 1) % items.length); }
      if (event.key === 'Enter') { event.preventDefault(); onPick(items[active] || items[0]); }
    }} /></span></label>
    {busy && <small role="status">در حال جست‌وجو…</small>}
    {error && <p className="form-error" role="alert">{error}</p>}
    {items.length > 0 && <ul className="address-results" id={`${id}-options`} role="listbox" aria-label={label}>{items.map((item, index) => <li key={item.id} role="option" aria-selected={active === index} id={`${id}-option-${index}`}><button type="button" onClick={() => onPick(item)}>{render(item)}</button></li>)}</ul>}
  </div>;
}

export function AddressSearch({ label, value, onSelect }: { label: string; value: Place | null; onSelect: (place: Place | null) => void }) {
  const [text, setText] = useState('');
  const [items, setItems] = useState<Place[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    if (value || text.trim().length < 3) return;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setBusy(true); setError('');
      try {
        const results = await api<Place[]>(`/locations/search?q=${encodeURIComponent(text.trim())}`, { signal: controller.signal });
        if (!controller.signal.aborted) { setItems(results); if (!results.length) setError('نشانی پیدا نشد؛ نام شهر و خیابان را دقیق‌تر وارد کنید.'); }
      } catch (error) { if (!controller.signal.aborted) setError(errorMessage(error)); }
      finally { if (!controller.signal.aborted) setBusy(false); }
    }, 500);
    return () => { controller.abort(); window.clearTimeout(timer); };
  }, [text, value]);
  return <Results label={label} value={text} onChange={next => { setText(next); setItems([]); setBusy(false); setError(''); onSelect(null); }} items={items} onPick={place => { setText(place.label); onSelect(place); setItems([]); setError(''); }} render={place => place.label} busy={busy} error={error} placeholder="مثلاً تهران، خیابان ولیعصر" />;
}

export function VehicleSearch({ value, modelId, onChange, onSelect }: { value: string; modelId: string | null; onChange: (value: string) => void; onSelect: (model: VehicleModel) => void }) {
  const [items, setItems] = useState<VehicleModel[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    if (modelId || value.trim().length < 2) return;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setBusy(true); setError('');
      try {
        const results = await api<VehicleModel[]>(`/vehicle-models?q=${encodeURIComponent(value.trim())}`, { signal: controller.signal });
        if (!controller.signal.aborted) { setItems(results); if (!results.length) setError('خودرو پیدا نشد؛ نام مدل را تغییر دهید یا «سایر خودروها» را جست‌وجو کنید.'); }
      } catch (error) { if (!controller.signal.aborted) setError(errorMessage(error)); }
      finally { if (!controller.signal.aborted) setBusy(false); }
    }, 350);
    return () => { controller.abort(); window.clearTimeout(timer); };
  }, [value, modelId]);
  return <Results label="خودروی شما" value={value} placeholder="نام خودرو" onChange={text => { onChange(text); setItems([]); setBusy(false); setError(''); }} items={items} onPick={model => { onSelect(model); setItems([]); setError(''); }} render={model => `${model.name} · ${model.group.title}`} busy={busy} error={error} />;
}
