"use client";
import { useEffect, useState, type FormEvent } from 'react';
import { api, errorMessage, getSession, updateSessionUser, type AssistanceRequest, type User } from '@/lib/api';
import { Icon } from './Icons';
export function CustomerProfile({ onBack }: { onBack: () => void }) {
  const [user, setUser] = useState<User | null>(() => getSession()?.user || null);
  const [name, setName] = useState(() => getSession()?.user.fullName || '');
  const [requests, setRequests] = useState<AssistanceRequest[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  useEffect(() => { const c = new AbortController(); api<AssistanceRequest[]>('/requests', { signal: c.signal }).then(setRequests).catch(() => {}); return () => c.abort(); }, []);
  async function save(event: FormEvent) {
    event.preventDefault(); setBusy(true); setMessage('');
    try { const updated = await api<User>('/me', { method: 'PATCH', body: { fullName: name.trim() } }); updateSessionUser(updated); setUser(updated); window.dispatchEvent(new CustomEvent('khodrochare:user', { detail: updated })); setMessage('نام شما ذخیره شد.'); }
    catch (error) { setMessage(errorMessage(error)); } finally { setBusy(false); }
  }
  return <div className="subpage account-page"><div className="page-title-row"><button className="back-button" onClick={onBack} aria-label="بازگشت"><Icon name="arrow-right" size={20}/></button><div><h1>حساب کاربری</h1><p>اطلاعات شما، همراه امن سفرهایتان</p></div></div><div className="account-grid"><section className="account-identity panel-card"><div className="account-avatar"><Icon name="user" size={36}/></div><h2>{user?.fullName}</h2><p dir="ltr">{user?.phone}</p><span className="account-tag">عضو خودرو چاره</span><dl><div><dt>درخواست‌های اخیر</dt><dd>{requests.length.toLocaleString('fa-IR')}</dd></div><div><dt>خودروهای ثبت‌شده</dt><dd>{(user?.vehicles?.length || 0).toLocaleString('fa-IR')}</dd></div></dl><p className="account-help">کد ملی و شماره تماس، مشخصات هویتی حساب شما هستند.</p></section><section className="panel-card account-form"><h2>اطلاعات شخصی</h2><p>نام نمایشی خود را ویرایش کنید.</p><form onSubmit={save}><label className="form-field"><span className="field-label">نام و نام خانوادگی</span><span className="field-control"><input value={name} onChange={e => setName(e.target.value)} minLength={3} maxLength={150} required/></span></label><label className="form-field"><span className="field-label">شماره تماس</span><span className="field-control"><input value={user?.phone || ''} dir="ltr" readOnly/></span></label><label className="form-field"><span className="field-label">کد ملی</span><span className="field-control"><input value={user?.nationalId || ''} dir="ltr" readOnly/></span></label>{message && <p role="status">{message}</p>}<button className="primary-button" disabled={busy}>ذخیره نام <Icon name="check" size={18}/></button></form></section></div></div>;
}
