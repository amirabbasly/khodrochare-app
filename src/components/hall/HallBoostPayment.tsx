"use client";
import {useRef,useState} from 'react';
import {api,errorMessage} from '@/lib/api';
import {useWallet,startGateway} from '@/lib/use-wallet';
import {type Plan,type Order,money} from './types';
export function HallBoostPayment({listingId,plans,onClose}:{listingId:string;plans:Plan[];onClose:()=>void}){
 const wallet=useWallet(),keys=useRef<Record<string,string>>({});
 const [selected,setSelected]=useState(plans[0]?.code),[paid,setPaid]=useState<string[]>([]),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const plan=plans.find(p=>p.code===selected);
 async function pay(method:'WALLET'|'GATEWAY'){
  if(!plan||busy||paid.includes(plan.code))return;
  setBusy(true);setError('');keys.current[plan.code]??=crypto.randomUUID();
  const path=`/hall/mine/${listingId}/checkout`,body={planCode:plan.code,idempotencyKey:keys.current[plan.code],method};
  try{
   if(method==='GATEWAY'){await startGateway(path,body);return;}
   const result=await api<Order>(path,{method:'POST',body});
   if(result.status!=='VERIFIED')throw new Error('وضعیت پرداخت نیازمند بررسی است؛ دوباره پرداخت نکنید.');
   setPaid(old=>[...old,plan.code]);window.dispatchEvent(new Event('khodrochare:wallet-refresh'));
  }catch(e){setError(errorMessage(e));}finally{setBusy(false);}
 }
 return <section className="ch-panel" aria-label="پرداخت خدمات آگهی"><h2>پرداخت خدمات آگهی</h2><p>انتشار آگهی رایگان است. خدمات خریداری‌شده پس از تأیید آگهی فعال می‌شوند و مدت آن‌ها از زمان تأیید محاسبه می‌شود.</p><div className="ch-tabs">{plans.map(p=><button disabled={busy} key={p.code} aria-pressed={selected===p.code} onClick={()=>setSelected(p.code)}>{p.name} · {money(p.priceToman)}{paid.includes(p.code)?' · پرداخت شد':''}</button>)}</div>{plan&&<><h3>{plan.name}</h3><p>مبلغ پرداخت: {money(plan.priceToman)}</p>{paid.includes(plan.code)?<p role="status">پرداخت از کیف پول با موفقیت انجام شد.</p>:<><button type="button" className="ch-primary" disabled={busy} onClick={()=>void pay('GATEWAY')}>پرداخت آنلاین</button><p>موجودی کیف پول: {wallet.data?money(wallet.data.balanceToman):'در حال دریافت…'}</p><button type="button" className="ch-secondary" disabled={busy||!wallet.data||wallet.data.balanceToman<plan.priceToman} onClick={()=>void pay('WALLET')}>برداشت از کیف پول</button>{wallet.data&&wallet.data.balanceToman<plan.priceToman&&<p role="status">موجودی کافی نیست؛ ابتدا کیف پول را شارژ کنید.</p>}</>}</>}{error&&<p className="ch-error" role="alert">{error}</p>}<button type="button" className="ch-back" disabled={busy} onClick={onClose}>رفتن به آگهی‌های من</button></section>;
}
