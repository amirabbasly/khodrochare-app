"use client";
import {useEffect,useRef,useState} from 'react';
import {api,errorMessage,type Payment} from '@/lib/api';
import {startGateway} from '@/lib/use-wallet';
import './location-permission.css';
import './search-fields.css';
export function PaymentDialog({requestId,onClose}:{requestId:string;onClose:()=>void}){
  const dialog=useRef<HTMLDialogElement>(null),key=useRef<string|null>(null);const[payment,setPayment]=useState<Payment|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState('');
  useEffect(()=>{const element=dialog.current;const controller=new AbortController();element?.showModal();api<Payment>(`/requests/${requestId}/payment`,{method:'POST',signal:controller.signal}).then(setPayment).catch(e=>{if(!controller.signal.aborted)setError(errorMessage(e));});return()=>{controller.abort();element?.close();};},[requestId]);
  async function pay(){if(busy)return;setBusy(true);setError('');key.current??=crypto.randomUUID();try{await startGateway(`/requests/${requestId}/payment/checkout`,{idempotencyKey:key.current});}catch(e){setError(errorMessage(e));key.current=null;setBusy(false);}}
  const done=payment?.status==='VERIFIED'||payment?.status==='SANDBOX_VERIFIED'&&payment.gatewayMode!=='live';
  return <dialog ref={dialog} className="location-permission" aria-labelledby="payment-title" dir="rtl" onCancel={onClose}><h2 id="payment-title">پرداخت آنلاین خدمات</h2>{error&&<p className="form-error" role="alert">{error}</p>}{!payment&&!error&&<p role="status">در حال دریافت مبلغ…</p>}{payment&&<><div className="payment-breakdown"><span>مبلغ خدمت <b>{payment.serviceToman.toLocaleString('fa-IR')} تومان</b></span><span>قطعات تأییدشده <b>{payment.partsToman.toLocaleString('fa-IR')} تومان</b></span><span>مجموع پرداخت <b>{payment.amountToman.toLocaleString('fa-IR')} تومان</b></span><span>سهم اپلیکیشن ({payment.commissionPercent}٪) <b>{payment.commissionToman.toLocaleString('fa-IR')} تومان</b></span><span>سهم امدادگر <b>{payment.driverShareToman.toLocaleString('fa-IR')} تومان</b></span></div>{done?<p role="status">{payment.status==='SANDBOX_VERIFIED'?'پرداخت آزمایشی تأیید شد؛ وجه واقعی دریافت نشده است.':'پرداخت شما تأیید شده است.'}</p>:<><p>پرداخت از طریق زرین‌پال انجام می‌شود. در حالت آزمایشی، وجه واقعی دریافت نمی‌شود.</p><button type="button" className="primary-button" disabled={busy} onClick={pay}>{busy?'در حال اتصال…':'پرداخت با زرین‌پال'}</button></>}</>}<button className="location-permission-later" type="button" onClick={onClose}>بستن</button></dialog>;
}
