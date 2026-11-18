"use client";
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {api,errorMessage} from '@/lib/api';
import {type Order,money,states} from './types';
import './hall.css';
export function HallPaymentReturn(){
  const[order,setOrder]=useState<Order|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false);
  useEffect(()=>{const id=new URLSearchParams(window.location.search).get('order');if(!id){setTimeout(()=>setError('شناسه پرداخت در نشانی وجود ندارد.'),0);return;}api<Order>(`/hall/orders/${encodeURIComponent(id)}`).then(setOrder).catch(e=>setError(errorMessage(e)));},[]);
  async function action(kind:'verify'|'cancel'){if(!order)return;setBusy(true);setError('');try{setOrder(await api<Order>(`/hall/orders/${order.id}/${kind}`,{method:'POST',body:{}}));}catch(e){setError(errorMessage(e));}finally{setBusy(false);}}
  return <main className="ch-hall ch-return" dir="rtl"><section className="ch-panel"><span className="ch-pill">تالار خودرو چاره</span><h1>{order?.status==='VERIFIED'?'پرداخت تأیید شد؛ آگهی آماده دیده‌شدن است.':'وضعیت پرداخت آگهی'}</h1>{error&&<p className="ch-error" role="alert">{error}</p>}{!order&&!error&&<p role="status">در حال دریافت وضعیت پرداخت از سرور…</p>}{order&&<><p role="status">{states[order.status]||order.status}</p><div className="ch-checkout-summary"><div><span>{order.planName}</span><strong>{money(order.amountToman)}</strong></div>{order.refId&&<div><span>شماره پیگیری</span><b>{order.refId}</b></div>}</div><p className="ch-sandbox-note">پرداخت در محیط آزمایشی زرین‌پال است؛ وجه واقعی دریافت نشده است.</p>{order.status==='REVIEW_REQUIRED'&&<p>وجه آزمایشی تأیید شده ولی وضعیت آگهی تغییر کرده است. سفارش برای بررسی پشتیبانی نگهداری شده و خدمت دوباره فعال نمی‌شود.</p>}{!['VERIFIED','REVIEW_REQUIRED'].includes(order.status)&&<><p>پیش‌نویس شما حفظ شده است. می‌توانید پرداخت را بررسی کنید یا پس از لغو، از آگهی‌های من دوباره اقدام کنید.</p><button className="ch-primary" disabled={busy} onClick={()=>action('verify')}>بررسی دوباره پرداخت</button>{order.status==='PENDING'&&<button className="ch-secondary" disabled={busy} onClick={()=>action('cancel')}>لغو این تلاش و بازگشت به پیش‌نویس</button>}</>}</>}<Link className="ch-primary" href="/home?view=hall">بازگشت به تالار و آگهی‌های من</Link></section></main>;
}
