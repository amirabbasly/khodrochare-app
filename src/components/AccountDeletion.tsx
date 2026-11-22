"use client";
import {useEffect,useRef,useState,type FormEvent} from 'react';
import {useRouter} from 'next/navigation';
import {api,clearSession,errorMessage,getSession,latinDigits} from '@/lib/api';
import type {OtpChallenge} from '@/lib/customer-auth';
import {HallModal} from './hall/HallModal';
import './account-deletion.css';

export function AccountDeletion({phone}:{phone:string}){
 const router=useRouter();
 const [open,setOpen]=useState(false),[challenge,setChallenge]=useState<OtpChallenge|null>(null),[code,setCode]=useState(''),[confirmed,setConfirmed]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[retryAt,setRetryAt]=useState(0),[tick,setTick]=useState(0);
 const submitting=useRef(false);
 useEffect(()=>{if(!open||!challenge)return;const timer=window.setInterval(()=>setTick(Date.now()),1000);return()=>window.clearInterval(timer);},[open,challenge]);
 const seconds=Math.max(0,Math.ceil((retryAt-tick)/1000));
 function close(){if(submitting.current)return;setOpen(false);setCode('');setConfirmed(false);setError('');}
 async function send(){
  if(submitting.current)return;submitting.current=true;setBusy(true);setError('');
  try{const next=await api<OtpChallenge>('/me/account-deletion/otp',{method:'POST',body:{},timeoutMs:25000});const now=Date.now();setChallenge(next);setCode('');setTick(now);setRetryAt(now+next.retryAfterSeconds*1000);}
  catch(e){setError(errorMessage(e));}finally{submitting.current=false;setBusy(false);}
 }
 async function remove(event:FormEvent){
  event.preventDefault();if(!confirmed||code.length!==6||!challenge||submitting.current)return;
  submitting.current=true;setBusy(true);setError('');
  try{const userId=getSession()?.user.id;await api('/me',{method:'DELETE',body:{challengeId:challenge.challengeId,code,confirmation:'DELETE'}});if(userId){for(const storage of [localStorage,sessionStorage]){try{for(const key of Object.keys(storage)){if(key.startsWith(`khodrochare_hall_${userId}_`))storage.removeItem(key);}storage.removeItem('khodrochare_location_v1');}catch{}}}clearSession();window.dispatchEvent(new Event('khodrochare:unauthorized'));router.replace('/');}
  catch(e){setError(errorMessage(e));}finally{submitting.current=false;setBusy(false);}
 }
 return <section className="account-deletion"><h2>حذف حساب کاربری</h2><p>برای حذف حساب، کد تأیید به شمارهٔ همین حساب ارسال می‌شود.</p><button className="account-delete-button" type="button" onClick={()=>{setTick(Date.now());setOpen(true);}}>حذف حساب کاربری</button>
 {open&&<HallModal title="حذف حساب کاربری" onClose={close}><div className="account-deletion-content" dir="rtl"><p>حذف حساب دائمی است. مشخصات حساب، خودروها و آگهی‌ها حذف می‌شوند و همهٔ دستگاه‌ها از حساب خارج خواهند شد. سوابق خدمت و تراکنش‌های قبلی باقی می‌مانند؛ مشخصات پروفایل از آن‌ها جدا می‌شود.</p><p>اگر درخواست فعال، پرداخت باز یا موجودی کیف پول دارید، ابتدا با پشتیبانی تعیین تکلیف کنید.</p><p>شمارهٔ دریافت کد: <b dir="ltr">{phone}</b></p>
 {!challenge?<button className="primary-button" type="button" disabled={busy} onClick={()=>void send()}>{busy?'در حال ارسال…':'دریافت کد حذف حساب'}</button>:<form onSubmit={remove} className="auth-form"><label className="form-field"><span className="field-label">کد تأیید حذف حساب</span><span className="field-control"><input aria-label="کد تأیید حذف حساب" dir="ltr" inputMode="numeric" autoComplete="one-time-code" value={code} onChange={e=>setCode(latinDigits(e.target.value).replace(/\D/g,'').slice(0,6))} minLength={6} maxLength={6} pattern="[0-9]{6}" required disabled={busy}/></span></label><p>کد ۵ دقیقه اعتبار دارد. کد ورود و بازیابی رمز برای حذف حساب معتبر نیست.</p><button className="auth-inline-link" type="button" disabled={busy||seconds>0} onClick={()=>void send()}>ارسال مجدد کد{seconds>0?` (${seconds.toLocaleString('fa-IR')} ثانیه)`:''}</button><label className="account-delete-consent"><input type="checkbox" checked={confirmed} onChange={e=>setConfirmed(e.target.checked)} disabled={busy} required/><span>پیامدهای حذف دائمی حساب را می‌پذیرم.</span></label><button className="account-delete-button" type="submit" disabled={busy||!confirmed||code.length!==6} aria-busy={busy}>{busy?'در حال حذف…':'حذف دائمی حساب'}</button></form>}
 {error&&<p className="form-error" role="alert">{error}</p>}<button className="ch-secondary" type="button" disabled={busy} onClick={close}>انصراف</button></div></HallModal>}
 </section>;
}
