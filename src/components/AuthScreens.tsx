"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { login, saveSession, clearSession, updateSessionUser, normalizePhone, latinDigits, validNationalId, errorMessage } from "@/lib/api";
import { useSessionState } from "@/lib/session";
import {requestOtp,verifyOtp,resetPassword,completeProfile,type OtpChallenge,type OtpPurpose,safeReturnPath} from "@/lib/customer-auth";
import {useSearchParams} from "next/navigation";
import "./customer-auth.css";
import { BrandLogo, Icon } from "@/components/Icons";

function AuthVisual() {
  return (
    <aside className="auth-visual" aria-label="پیام خودرو چاره">
      <div className="auth-logo-frame">
        <Image
          src="/khodrochare-wordmark.png"
          alt="لوگوی خودرو چاره"
          width={2172}
          height={724}
          sizes="(max-width: 640px) 262px, 420px"
          priority
          className="auth-logo-image"
        />
      </div>
      <span className="auth-visual-orbit auth-visual-orbit--one" aria-hidden="true" />
      <span className="auth-visual-orbit auth-visual-orbit--two" aria-hidden="true" />
    </aside>
  );
}

function Field({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  autoComplete,
  inputMode,
  minLength,
  maxLength,
  ltr = false,
  showToggle = false,
  onToggle,
  visible = false,
  pattern,
  autoFocus = false,
}: {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  autoComplete?: string;
  inputMode?: "text" | "numeric" | "email" | "tel" | "search" | "url" | "none" | "decimal";
  minLength?: number;
  maxLength?: number;
  ltr?: boolean;
  showToggle?: boolean;
  onToggle?: () => void;
  visible?: boolean;
  pattern?: string;
  autoFocus?: boolean;
}) {
  return (
    <label className="form-field" htmlFor={name}>
      <span className="field-label">{label}</span>
      <span className={`field-control${ltr ? " field-control--ltr" : ""}`}>
        <input
          id={name}
          name={name}
          type={showToggle && visible ? "text" : type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          autoComplete={autoComplete}
          inputMode={inputMode}
          minLength={minLength}
          maxLength={maxLength}
          pattern={pattern}
          required
          dir={ltr ? "ltr" : "rtl"}
        />
        {showToggle && (
          <button className="field-toggle" type="button" onClick={onToggle} aria-label={visible ? "پنهان کردن رمز عبور" : "نمایش رمز عبور"}>
            <Icon name={visible ? "eye-off" : "eye"} size={17} />
          </button>
        )}
      </span>
    </label>
  );
}

export function LoginScreen() {
  const router=useRouter(),{authenticate}=useSessionState();
  const [phone,setPhone]=useState(""),[password,setPassword]=useState(""),[visible,setVisible]=useState(false),[remember,setRemember]=useState(true),[busy,setBusy]=useState(false),[error,setError]=useState("");
  async function submit(event:FormEvent){event.preventDefault();if(busy)return;setBusy(true);setError("");try{const session=await login(phone,password,remember);saveSession(session,remember);authenticate(session.user);router.replace("/home");}catch(e){setError(errorMessage(e));}finally{setBusy(false);}}
  return <main className="auth-page" dir="rtl"><div className="auth-layout"><section className="auth-form-panel" aria-labelledby="login-heading"><div className="auth-mobile-brand"><BrandLogo/></div><div className="auth-heading"><span className="auth-kicker auth-kicker--light">خودرو چاره، همیشه کنارته</span><h1 id="login-heading">خوش برگشتی</h1><p>با شماره همراه و رمز عبور وارد حساب کاربری‌ات شو.</p></div><form className="auth-form" onSubmit={submit}>
    <Field label="شماره تماس" name="username" type="tel" value={phone} onChange={setPhone} placeholder="۰۹۱۲۳۴۵۶۷۸۹" autoComplete="username" inputMode="tel" minLength={10} maxLength={16} ltr/>
    <Field label="رمز عبور" name="password" type="password" value={password} onChange={setPassword} placeholder="رمز عبورت را وارد کن" autoComplete="current-password" minLength={6} showToggle visible={visible} onToggle={()=>setVisible(v=>!v)}/>
    <div className="form-options"><label className="check-label"><input type="checkbox" checked={remember} onChange={e=>setRemember(e.target.checked)}/><span className="custom-check"><Icon name="check" size={12}/></span><span>مرا به خاطر بسپار</span></label><Link className="auth-inline-link" href="/forgot-password">فراموشی رمز عبور</Link></div>
    {error&&<p className="form-error" role="alert">{error}</p>}<button className="primary-button auth-submit" type="submit" disabled={busy} aria-busy={busy}>{busy?'در حال ورود…':'ورود به حساب'}<Icon name="arrow-left" size={18}/></button>
    </form><div className="otp-login-section"><span>بدون رمز عبور وارد شو</span><Link className="otp-login-link" href="/login-otp">ورود / ثبت‌نام با کد تأیید <Icon name="phone" size={17}/></Link></div><p className="auth-legal">با ورود، قوانین و مقررات خودرو چاره را می‌پذیری.</p></section><AuthVisual/></div></main>;
}

function OtpScreen({mode}:{mode:'login'|'reset'}){
 const router=useRouter(),{authenticate}=useSessionState();
 const [phone,setPhone]=useState(""),[code,setCode]=useState(""),[password,setPassword]=useState(""),[confirm,setConfirm]=useState(""),[visible,setVisible]=useState(false),[remember,setRemember]=useState(true),[challenge,setChallenge]=useState<OtpChallenge|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState(""),[done,setDone]=useState(false),[retryAt,setRetryAt]=useState(0),[tick,setTick]=useState(0);
 const submitting=useRef(false);
 const title=mode==='login'?'ورود / ثبت‌نام با کد تأیید':'فراموشی رمز عبور';
 const purpose:OtpPurpose=mode==='login'?'REGISTER':'RESET_PASSWORD';
 useEffect(()=>{if(!challenge||done)return;const timer=window.setInterval(()=>setTick(Date.now()),1000);return()=>window.clearInterval(timer);},[challenge,done]);
 const seconds=Math.max(0,Math.ceil((retryAt-tick)/1000));
 async function send(){if(submitting.current)return;const normalized=normalizePhone(phone);if(!/^09\d{9}$/.test(normalized)){setError('شماره همراه معتبر وارد کنید.');return;}submitting.current=true;setBusy(true);setError('');try{const result=await requestOtp(normalized,purpose);setPhone(normalized);setChallenge(result);setCode('');const now=Date.now();setTick(now);setRetryAt(now+result.retryAfterSeconds*1000);}catch(e){setError(errorMessage(e));}finally{submitting.current=false;setBusy(false);}}
 async function submit(event:FormEvent){event.preventDefault();if(!challenge){await send();return;}if(submitting.current)return;if(mode==='reset'&&password!==confirm){setError('رمز عبور و تکرار آن یکسان نیستند.');return;}submitting.current=true;setBusy(true);setError('');try{if(mode==='reset'){await resetPassword(challenge.challengeId,latinDigits(code),password);clearSession();window.dispatchEvent(new Event('khodrochare:unauthorized'));setPassword('');setConfirm('');setCode('');setDone(true);}else{const session=await verifyOtp(challenge.challengeId,latinDigits(code),remember);saveSession(session,remember);authenticate(session.user);router.replace('/home');}}catch(e){setError(errorMessage(e));}finally{submitting.current=false;setBusy(false);}}
 return <main className="auth-page" dir="rtl"><div className="auth-layout"><section className="auth-form-panel" aria-labelledby="otp-heading"><div className="auth-mobile-brand"><BrandLogo/></div><div className="auth-heading"><span className="auth-kicker auth-kicker--light">ورود امن به خودرو چاره</span><h1 id="otp-heading">{title}</h1><p>{done?'رمز عبور جدید ذخیره شد. با رمز جدید وارد حساب شوید.':challenge?`کد پیامک‌شده به ${phone} را وارد کنید.`:mode==='login'?'شماره همراهت را وارد کن؛ اگر حساب نداری، پس از تأیید کد برایت ساخته می‌شود.':'شماره همراه حساب خود را وارد کنید.'}</p></div>
 {done?<><p className="form-notice" role="status">رمز عبور با موفقیت تغییر کرد.</p><Link className="primary-button auth-submit" href="/">ورود با رمز عبور</Link></>:<form className="auth-form" onSubmit={submit}>
  {!challenge?<Field label="شماره تماس" name="otp-phone" type="tel" value={phone} onChange={setPhone} placeholder="۰۹۱۲۳۴۵۶۷۸۹" autoComplete="tel" inputMode="tel" minLength={10} maxLength={16} ltr/>:<><div className="otp-phone-summary"><span dir="ltr">{phone}</span><button className="auth-inline-link" type="button" disabled={busy} onClick={()=>{setChallenge(null);setCode('');setError('');}}>ویرایش شماره</button></div><Field label="کد تأیید" name="otp-code" value={code} onChange={v=>setCode(latinDigits(v).replace(/\D/g,'').slice(0,6))} placeholder="کد ۶ رقمی" inputMode="numeric" autoComplete="one-time-code" minLength={6} maxLength={6} pattern="[0-9]{6}" autoFocus ltr/>
  {mode==='reset'&&<><Field label="رمز عبور جدید" name="reset-password" type="password" value={password} onChange={setPassword} placeholder="حداقل ۸ کاراکتر" autoComplete="new-password" minLength={8} maxLength={128} showToggle visible={visible} onToggle={()=>setVisible(v=>!v)}/><Field label="تکرار رمز عبور جدید" name="confirm-password" type="password" value={confirm} onChange={setConfirm} placeholder="رمز جدید را دوباره وارد کنید" autoComplete="new-password" minLength={8} maxLength={128} showToggle visible={visible} onToggle={()=>setVisible(v=>!v)}/></>}
  <p className="otp-help">کد تأیید ۵ دقیقه اعتبار دارد. آن را در اختیار دیگران نگذارید.</p><button className="auth-inline-link otp-resend" type="button" disabled={busy||seconds>0} onClick={()=>void send()}>ارسال دوباره کد{seconds>0?` (${seconds.toLocaleString('fa-IR')} ثانیه)`:''}</button></>}
  {mode==='login'&&<label className="check-label"><input type="checkbox" checked={remember} onChange={e=>setRemember(e.target.checked)}/><span>مرا به خاطر بسپار</span></label>}{error&&<p className="form-error" role="alert">{error}</p>}<button className="primary-button auth-submit" type="submit" disabled={busy} aria-busy={busy}>{busy?'در حال بررسی…':!challenge?'دریافت کد تأیید':mode==='reset'?'تغییر رمز عبور':'تأیید و ورود'}<Icon name="arrow-left" size={18}/></button></form>}
 <p className="auth-switch"><Link href="/">بازگشت به ورود با رمز عبور</Link></p></section><AuthVisual/></div></main>;
}
export function OtpLoginScreen(){return <OtpScreen mode="login"/>;}
export function ForgotPasswordScreen(){return <OtpScreen mode="reset"/>;}

export function CompleteProfileScreen(){
 const router=useRouter(),params=useSearchParams(),{user,authenticate}=useSessionState(),next=safeReturnPath(params.get('next'));
 const [name,setName]=useState(user?.nationalId?user.fullName:''),[nationalId,setNationalId]=useState(user?.nationalId||''),[password,setPassword]=useState(''),[visible,setVisible]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const needsPassword=user?.hasPassword===false;
 async function submit(event:FormEvent){event.preventDefault();if(busy)return;setError('');const normalized=latinDigits(nationalId);if(!validNationalId(normalized)){setError('کد ملی معتبر ۱۰ رقمی وارد کنید.');return;}setBusy(true);try{const updated=await completeProfile({fullName:name.trim(),nationalId:normalized,...(needsPassword?{password}:{})});updateSessionUser(updated);authenticate(updated);router.replace(next);}catch(e){setError(errorMessage(e));}finally{setBusy(false);}}
 return <main className="auth-page" dir="rtl"><div className="auth-layout"><section className="auth-form-panel" aria-labelledby="complete-profile-heading"><div className="auth-mobile-brand"><BrandLogo/></div><div className="auth-heading"><span className="auth-kicker auth-kicker--light">تکمیل مشخصات حساب</span><h1 id="complete-profile-heading">یک قدم تا استفاده از خدمات</h1><p>شماره همراه شما تأیید شده است. برای استفاده از این بخش، مشخصات هویتی حساب را تکمیل کنید.</p></div><div className="otp-phone-summary"><span>شماره تأییدشده</span><strong dir="ltr">{user?.phone}</strong></div><form className="auth-form" onSubmit={submit}><Field label="نام و نام خانوادگی" name="complete-name" value={name} onChange={setName} placeholder="نام و نام خانوادگی" autoComplete="name" minLength={3} maxLength={150}/><Field label="کد ملی" name="complete-national-id" value={nationalId} onChange={v=>setNationalId(latinDigits(v).replace(/\D/g,'').slice(0,10))} placeholder="۱۰ رقم کد ملی" inputMode="numeric" minLength={10} maxLength={10} ltr/>{needsPassword&&<Field label="رمز عبور" name="complete-password" type="password" value={password} onChange={setPassword} placeholder="حداقل ۸ کاراکتر" autoComplete="new-password" minLength={8} maxLength={128} showToggle visible={visible} onToggle={()=>setVisible(v=>!v)}/>}{error&&<p className="form-error" role="alert">{error}</p>}<button className="primary-button auth-submit" type="submit" disabled={busy} aria-busy={busy}>{busy?'در حال ذخیره…':'تکمیل مشخصات و ادامه'}<Icon name="arrow-left" size={18}/></button></form><p className="auth-switch"><Link href="/home">فعلاً بازگشت به صفحه اصلی</Link></p></section><AuthVisual/></div></main>;
}
