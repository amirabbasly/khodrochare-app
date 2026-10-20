"use client";
import { useEffect, useRef, useState } from 'react';
import { api, errorMessage, latinDigits, type Payment } from '@/lib/api';
import './location-permission.css';
import './search-fields.css';
const statusLabel = { AWAITING_TRANSFER: 'در انتظار واریز', SUBMITTED: 'واریز اعلام شده؛ در انتظار بررسی', VERIFIED: 'واریز تأیید شد', REJECTED: 'واریز تأیید نشد؛ اطلاعات را بررسی کنید' };
export function PaymentDialog({ requestId, onClose }: { requestId: string; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [reference, setReference] = useState('');
  const [transferredAt, setTransferredAt] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    const controller = new AbortController();
    api<Payment>(`/requests/${requestId}/payment`, { method: 'POST', signal: controller.signal }).then(value => { if (!controller.signal.aborted) setPayment(value); }).catch(error => { if (!controller.signal.aborted) setError(errorMessage(error)); });
    const timer = window.setInterval(() => {
      api<Payment | null>(`/requests/${requestId}/payment`, { signal: controller.signal }).then(value => { if (value && !controller.signal.aborted) setPayment(value); }).catch(() => {});
    }, 5000);
    return () => { controller.abort(); window.clearInterval(timer); element?.close(); };
  }, [requestId]);
  async function submit(event: React.FormEvent) {
    event.preventDefault(); if (busy) return;
    setBusy(true); setError('');
    try { setPayment(await api<Payment>(`/requests/${requestId}/payment/report`, { method: 'POST', body: { bankReference: latinDigits(reference.trim()), transferredAt: new Date(transferredAt).toISOString() } })); }
    catch (error) { setError(errorMessage(error)); }
    finally { setBusy(false); }
  }
  return <dialog ref={dialog} className="location-permission" aria-labelledby="payment-title" dir="rtl" onCancel={onClose}>
    <h2 id="payment-title">پرداخت کارت‌به‌کارت</h2>
    {error && <p className="form-error" role="alert">{error}</p>}
    {!payment && !error && <p role="status">در حال دریافت اطلاعات پرداخت…</p>}
    {payment && <>
      <p>{statusLabel[payment.status]}</p>
      <div className="payment-breakdown">
        <span>مبلغ خدمت <b>{payment.serviceToman.toLocaleString('fa-IR')} تومان</b></span>
        <span>قطعات تأییدشده <b>{payment.partsToman.toLocaleString('fa-IR')} تومان</b></span>
        <span>مجموع قابل واریز <b>{payment.amountToman.toLocaleString('fa-IR')} تومان</b></span>
        <span>سهم اپلیکیشن ({payment.commissionPercent.toLocaleString('fa-IR')}٪) <b>{payment.commissionToman.toLocaleString('fa-IR')} تومان</b></span>
        <span>سهم خالص امدادگر <b>{payment.driverShareToman.toLocaleString('fa-IR')} تومان</b></span>
      </div>
      <strong className="bank-card-number">{payment.cardNumber.match(/.{1,4}/g)?.join(' ')}</strong>
      <p>{payment.accountName}</p>
      <button className="location-permission-later" type="button" onClick={async () => { try { await navigator.clipboard.writeText(payment.cardNumber); } catch { setError('کپی خودکار ممکن نیست؛ شماره کارت را دستی کپی کنید.'); } }}>کپی شماره کارت</button>
      {['AWAITING_TRANSFER', 'REJECTED'].includes(payment.status) && <form onSubmit={submit}>
        <label className="form-field"><span className="field-label">شماره پیگیری واریز</span><span className="field-control"><input value={reference} onChange={event => setReference(event.target.value)} minLength={6} maxLength={64} dir="ltr" required /></span></label>
        <label className="form-field"><span className="field-label">زمان واریز</span><span className="field-control"><input type="datetime-local" value={transferredAt} onChange={event => setTransferredAt(event.target.value)} required /></span></label>
        <p>ثبت شماره پیگیری به معنی تأیید بانکی نیست؛ واریز پس از بررسی حساب تأیید می‌شود.</p>
        <button className="primary-button" type="submit" disabled={busy}>ثبت اطلاعات واریز</button>
      </form>}
      {payment.attempts?.[0]?.reviewNote && <p>{payment.attempts[0].reviewNote}</p>}
    </>}
    <button className="location-permission-later" type="button" onClick={onClose}>بستن</button>
  </dialog>;
}
