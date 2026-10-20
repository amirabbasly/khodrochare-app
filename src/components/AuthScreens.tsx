"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { api, type User, login, register, saveSession, normalizePhone, latinDigits, validNationalId, errorMessage } from "@/lib/api";
import { BrandLogo, Icon } from "@/components/Icons";

function AuthVisual() {
  return (
    <aside className="auth-visual" aria-label="پیام خودرو چاره">
      <div className="auth-logo-frame">
        <Image
          src="/khodrochare-3d-logo.webp"
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
  const router = useRouter();
  useEffect(() => {
    const controller = new AbortController();
    api<User>("/me", { signal: controller.signal }).then(() => { if (!controller.signal.aborted) router.replace("/home"); }).catch(() => {});
    return () => controller.abort();
  }, [router]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [busy, setBusy] = useState(false);
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setError(""); setNotice(""); setBusy(true);
    try {
      const session = await login(username, password, remember);
      saveSession(session, remember);
      router.replace("/home");
    } catch (error) { setError(errorMessage(error)); }
    finally { setBusy(false); }
  }

  return (
    <main className="auth-page" dir="rtl">
      <div className="auth-layout">
        <section className="auth-form-panel" aria-labelledby="login-heading">
          <div className="auth-mobile-brand"><BrandLogo /></div>
          <div className="auth-heading">
            <span className="auth-kicker auth-kicker--light">خودرو چاره، همیشه کنارته</span>
            <h1 id="login-heading">خوش برگشتی</h1>
            <p>برای ادامه، وارد حساب کاربری‌ات شو.</p>
          </div>
          <form className="auth-form" onSubmit={handleSubmit}>
            <Field label="شماره تماس" name="username" value={username} onChange={setUsername} placeholder="۰۹۱۲۳۴۵۶۷۸۹" autoComplete="username" inputMode="tel" minLength={3} maxLength={32} ltr />
            <Field label="رمز عبور" name="password" type="password" value={password} onChange={setPassword} placeholder="رمز عبورت را وارد کن" autoComplete="current-password" minLength={6} showToggle visible={passwordVisible} onToggle={() => setPasswordVisible((current) => !current)} />
            <div className="form-options">
              <label className="check-label"><input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} /><span className="custom-check"><Icon name="check" size={12} /></span><span>مرا به خاطر بسپار</span></label>
              <button type="button" className="auth-inline-link" onClick={() => setNotice("ورود با کد یک بار مصرف به‌زودی فعال می‌شود.")}>ورود با کد یک بار مصرف</button>
            </div>
            {error && <p className="form-error" role="alert">{error}</p>}
            {notice && <p className="form-notice" role="status">{notice}</p>}
            <button className="primary-button auth-submit" type="submit" disabled={busy} aria-busy={busy}>ورود به حساب <Icon name="arrow-left" size={18} /></button>
          </form>
          <p className="auth-switch">حساب کاربری نداری؟ <Link href="/register">ثبت‌نام کن</Link></p>
          <p className="auth-legal">با ورود، <a href="#terms">قوانین و مقررات خودرو چاره</a> را می‌پذیری.</p>
        </section>
        <AuthVisual />
      </div>
    </main>
  );
}

export function RegisterScreen() {
  const router = useRouter();
  useEffect(() => {
    const controller = new AbortController();
    api<User>("/me", { signal: controller.signal }).then(() => { if (!controller.signal.aborted) router.replace("/home"); }).catch(() => {});
    return () => controller.abort();
  }, [router]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [nationalCode, setNationalCode] = useState("");
  const [error, setError] = useState("");

  const [busy, setBusy] = useState(false);
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setError("");
    if (!validNationalId(nationalCode)) { setError("کد ملی معتبر ۱۰ رقمی وارد کنید."); return; }
    setBusy(true);
    try {
      const session = await register({ fullName: name.trim(), phone: normalizePhone(phone), password, nationalId: latinDigits(nationalCode) });
      saveSession(session, true);
      router.replace("/home");
    } catch (error) { setError(errorMessage(error)); }
    finally { setBusy(false); }
  }

  return (
    <main className="auth-page" dir="rtl">
      <div className="auth-layout auth-layout--register">
        <section className="auth-form-panel auth-form-panel--register" aria-labelledby="register-heading">
          <div className="auth-mobile-brand"><BrandLogo /></div>
          <div className="auth-heading">
            <span className="auth-kicker auth-kicker--light">شروع یک تجربهٔ بهتر</span>
            <h1 id="register-heading">حساب بساز، <span>راه بیفت!</span></h1>
            <p>با یک حساب ساده، همهٔ خدمات خودرو چاره در دسترس توست.</p>
          </div>
          <form className="auth-form" onSubmit={handleSubmit}>
            <Field label="نام و نام خانوادگی" name="full-name" value={name} onChange={setName} placeholder="مثلاً آرمان رضایی" autoComplete="name" minLength={3} maxLength={50} />
            <Field label="شماره تماس" name="phone" type="tel" value={phone} onChange={setPhone} placeholder="۰۹۱۲۳۴۵۶۷۸۹" autoComplete="tel" inputMode="tel" minLength={10} maxLength={16} ltr />
            <Field label="کد ملی" name="national-code" value={nationalCode} onChange={setNationalCode} placeholder="۱۰ رقم کد ملی" inputMode="numeric" minLength={10} maxLength={10} ltr />
            <Field label="رمز عبور" name="new-password" type="password" value={password} onChange={setPassword} placeholder="حداقل ۸ کاراکتر" autoComplete="new-password" minLength={8} showToggle visible={passwordVisible} onToggle={() => setPasswordVisible((current) => !current)} />
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="primary-button auth-submit" type="submit" disabled={busy} aria-busy={busy}>ساخت حساب کاربری <Icon name="arrow-left" size={18} /></button>
          </form>
          <p className="auth-switch">قبلاً حساب ساخته‌ای؟ <Link href="/">وارد شو</Link></p>
          <p className="auth-legal">با ساخت حساب، قوانین و حریم خصوصی خودرو چاره را می‌پذیری.</p>
        </section>
        <AuthVisual />
      </div>
    </main>
  );
}
