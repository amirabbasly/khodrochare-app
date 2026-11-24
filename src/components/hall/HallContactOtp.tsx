"use client";
import {useCallback,useEffect,useRef,useState,type FormEvent} from 'react';
import {api,errorMessage,latinDigits} from '@/lib/api';
import type {OtpChallenge} from '@/lib/customer-auth';
import {HallModal} from './HallModal';

export function HallContactOtp({listingId,phone,onClose,onVerified}:{listingId:string;phone:string;onClose:()=>void;onVerified:(phone:string)=>Promise<void>}){
 const [challenge,setChallenge]=useState<OtpChallenge|null>(null),[code,setCode]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState(''),[retryAt,setRetryAt]=useState(0),[tick,setTick]=useState(0);
 const working=useRef(false);
 const send=useCallback(async(signal?:AbortSignal)=>{if(working.current)return;working.current=true;setBusy(true);setError('');try{const next=await api<OtpChallenge>(`/hall/mine/${listingId}/contact/otp`,{method:'POST',body:{phone},signal,timeoutMs:25000});if(signal?.aborted)return;const now=Date.now();setChallenge(next);setCode('');setTick(now);setRetryAt(now+next.retryAfterSeconds*1000);}catch(e){if(!signal?.aborted)setError(errorMessage(e));}finally{working.current=false;if(!signal?.aborted)setBusy(false);}},[listingId,phone]);
 useEffect(()=>{const c=new AbortController();const timer=window.setTimeout(()=>void send(c.signal),0);return()=>{window.clearTimeout(timer);c.abort();};},[send]);
 useEffect(()=>{if(!challenge)return;const timer=window.setInterval(()=>setTick(Date.now()),1000);return()=>window.clearInterval(timer);},[challenge]);
 const remaining=Math.max(0,Math.ceil((retryAt-tick)/1000));
 async function verify(event:FormEvent){event.preventDefault();if(!challenge||working.current)return;working.current=true;setBusy(true);setError('');try{const result=await api<{verifiedPhone:string}>(`/hall/mine/${listingId}/contact/verify`,{method:'POST',body:{challengeId:challenge.challengeId,code}});await onVerified(result.verifiedPhone);}catch(e){setError(errorMessage(e));}finally{working.current=false;setBusy(false);}}
 return <HallModal title="تأیید شماره تماس آگهی" onClose={()=>{if(!busy)onClose();}}><p>برای ادامه، کد ارسال‌شده به <b dir="ltr">{phone}</b> را وارد کنید. شمارهٔ حساب خودتان نیاز به کد مجدد ندارد.</p><form onSubmit={verify}><label>کد تأیید<input dir="ltr" aria-label="کد تأیید شماره آگهی" inputMode="numeric" autoComplete="one-time-code" value={code} onChange={e=>setCode(latinDigits(e.target.value).replace(/\D/g,'').slice(0,6))} minLength={6} maxLength={6} pattern="[0-9]{6}" required disabled={!challenge||busy}/></label><p>کد ۵ دقیقه اعتبار دارد.</p>{error&&<p className="ch-error" role="alert">{error}</p>}<button className="ch-primary" type="submit" disabled={busy||!challenge||code.length!==6}>{busy?'در حال بررسی…':'تأیید و ادامه'}</button><button className="ch-secondary" type="button" disabled={busy||remaining>0} onClick={()=>void send()}>{challenge?'ارسال دوباره کد':'دریافت کد'}{remaining>0?` (${remaining.toLocaleString('fa-IR')} ثانیه)`:''}</button></form></HallModal>;
}
