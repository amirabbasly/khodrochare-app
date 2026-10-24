"use client";
import { useCallback, useEffect, useState } from 'react';
import { api, errorMessage, type Place } from '@/lib/api';
import { LocationPickerMap } from './Maps';
export function MapAddressPicker({ label, onSelect }: { label: string; onSelect: (place: Place | null) => void }) {
  const [point, setPoint] = useState<{ latitude: number; longitude: number } | null>(null);
  const [address, setAddress] = useState('روی نقشه نقطه را انتخاب کنید.');
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const pick = useCallback((latitude: number, longitude: number) => { onSelect(null); setPoint({ latitude, longitude }); }, [onSelect]);
  useEffect(() => {
    if (!point) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      setAddress('در حال شناسایی استان و خیابان…'); setError('');
      api<Place>('/locations/reverse', { method: 'POST', body: point, signal: controller.signal }).then(place => { if (!controller.signal.aborted) { setAddress(place.label); onSelect(place); } }).catch(error => { if (!controller.signal.aborted) { setError(errorMessage(error)); setAddress('نشانی شناسایی نشد.'); } });
    }, 500);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [point, onSelect, retry]);
  return <section className="map-address-picker" aria-label={label}><LocationPickerMap onPick={pick} hideCoordinates /><p className="map-address-label" role="status"><strong>{label}: </strong>{address}</p>{error && <p role="alert">{error} <button type="button" onClick={() => setRetry(n => n + 1)}>تلاش دوباره</button></p>}</section>;
}
