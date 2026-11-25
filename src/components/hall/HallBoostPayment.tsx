"use client";
import {useRef,useState} from 'react';
import {api,errorMessage} from '@/lib/api';
import {useWallet,startGateway} from '@/lib/use-wallet';
import {type Plan,type Order,money} from './types';
export function HallBoostPayment({listingId,plans,onClose,onBack,publication=true}:{listingId:string;plans:Plan[];onClose:()=>void;onBack?:()=>void;publication?:boolean}){
 const wallet=useWallet(),key=useRef<string|null>(null);
 const [paid,setPaid]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const total=plans.reduce((sum,p)=>sum+p.priceToman,0);
 async function pay(method:'WALLET'|'GATEWAY'){
  if(!plans.length||busy||paid)return;
  setBusy(true);setError('');key.current??=crypto.randomUUID();
  const path=`/hall/mine/${listingId}/checkout`,body={planCodes:plans.map(p=>p.code),idempotencyKey:key.current,method};
  try{
   if(method==='GATEWAY'){await startGateway(path,body);return;}
   const result=await api<Order>(path,{method:'POST',body});
   if(result.status!=='VERIFIED')throw new Error('وضعیت پرداخت نیازمند بررسی است؛ دوباره پرداخت نکنید.');
   setPaid(true);window.dispatchEvent(new Event('khodrochare:wallet-refresh'));
  }catch(e){setError(errorMessage(e));}finally{setBusy(false);}
 }
 return <section className="ch-panel ch-bundle-payment" aria-label="پرداخت خدمات آگهی"><h2>پرداخت خدمات آگهی</h2><p>{publication?'پس از پرداخت موفق، آگهی برای بررسی ارسال می‌شود. مدت خدمات از زمان تأیید آگهی شروع می‌شود.':'خدمات انتخاب‌شده با یک پرداخت برای آگهی شما فعال می‌شوند.'}</p>{plans.map(p=><div className="ch-checkout-summary" key={p.code}><span>{p.name}</span><strong>{money(p.priceToman)}</strong></div>)}<div className="ch-checkout-summary"><span>مبلغ نهایی قابل پرداخت</span><strong>{money(total)}</strong></div>{paid?<p role="status">پرداخت از کیف پول با موفقیت انجام شد. {publication?'آگهی شما برای بررسی ارسال شد.':'خدمات انتخاب‌شده فعال شدند.'}</p>:<><button type="button" className="ch-primary" disabled={busy} onClick={()=>void pay('GATEWAY')}>پرداخت آنلاین</button><p>موجودی کیف پول: {wallet.data?money(wallet.data.balanceToman):'در حال دریافت…'}</p><button type="button" className="ch-secondary" disabled={busy||!wallet.data||wallet.data.balanceToman<total} onClick={()=>void pay('WALLET')}>برداشت از کیف پول</button>{wallet.data&&wallet.data.balanceToman<total&&<p role="status">موجودی کافی نیست؛ ابتدا کیف پول را شارژ کنید.</p>}</>}{error&&<p className="ch-error" role="alert">{error}</p>}{!paid&&onBack&&<button className="ch-back" disabled={busy} onClick={onBack}>بازگشت به تأیید آگهی</button>}<button type="button" className="ch-back" disabled={busy} onClick={onClose}>رفتن به آگهی‌های من</button></section>;
}
