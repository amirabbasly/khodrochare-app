"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { BrandLogo, Icon } from "@/components/Icons";

const USERS_KEY = "khodrochare_users_v1";
const SESSION_KEY = "khodrochare_session_v1";

type LocalUser = {
  name: string;
  username: string;
  password: string;
};

function readUsers(): LocalUser[] {
  try {
    const value = localStorage.getItem(USERS_KEY);
    const parsed: unknown = value ? JSON.parse(value) : [];
    return Array.isArray(parsed) ? (parsed as LocalUser[]) : [];
  } catch {
    return [];
  }
}

function openDemoSession() {
  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({ name: "آرمان رضایی", username: "arman", wallet: "۱٬۲۵۰٬۰۰۰" }),
  );
}

function AuthVisual({ mode }: { mode: "login" | "register" }) {
  return (
    <aside className="auth-visual" aria-label="خدمات خودرو چاره">
      <div className="auth-visual-top">
        <div className="auth-logo-frame">
          <Image
            src="/khodrochare-3d-logo.webp"
            alt="لوگوی خودرو چاره"
            width={1568}
            height={447}
            priority
            className="auth-logo-image"
          />
        </div>
        <span className="auth-status-pill"><span className="status-dot" /> همیشه همراه ماشینت</span>
      </div>
      <div className="auth-visual-copy">
        <span className="auth-kicker"><Icon name="sparkles" size={16} /> سفر آسوده از همین‌جا شروع می‌شود</span>
        <h2>{mode === "login" ? "ماشینت تنها نیست." : "به خانوادهٔ خودرو چاره خوش آمدی."}</h2>
        <p>از امداد و سرویس تا خرید و فروش خودرو؛ هر چیزی که ماشینت لازم دارد، یک‌جا و در دسترس توست.</p>
        <div className="auth-points">
          <span><Icon name="check" size={15} /> خدمات مطمئن و سریع</span>
          <span><Icon name="check" size={15} /> همراهی هوشمند، هر لحظه</span>
        </div>
      </div>
      <div className="auth-art-stage">
        <div className="auth-art-glow" />
        <svg className="auth-car-art" viewBox="0 0 520 250" fill="none" aria-hidden="true">
          <ellipse cx="273" cy="212" rx="197" ry="17" fill="#071019" opacity=".65" />
          <circle cx="348" cy="135" r="104" fill="#FF862E" opacity=".11" />
          <path d="m66 168 24-45c9-17 23-28 43-31l53-7 48-43c11-10 25-15 40-15h42c14 0 25 6 34 17l42 49 31 10c12 4 21 15 23 28l4 37c2 12-8 22-20 22H81c-13 0-21-10-15-22Z" fill="url(#auth-car-body)" stroke="#C8D2D9" strokeWidth="2" />
          <path d="m190 82 46-42c9-8 20-12 32-12h43c10 0 18 5 25 12l34 42H190Z" fill="#152632" stroke="#8395A2" strokeWidth="2" />
          <path d="m260 30-3 52m24-52 5 52m90 4H122" stroke="#718593" strokeOpacity=".8" strokeWidth="2" />
          <path d="M72 151h48l-7 27H62m411-29 24 7 2 22h-25l-1-29Z" fill="#FFCEAC" />
          <path d="M72 151h48l-7 27H62m411-29 24 7 2 22h-25l-1-29Z" stroke="#F59454" strokeWidth="2" />
          <path d="M121 169h279" stroke="#192A36" strokeWidth="2" />
          <circle cx="148" cy="186" r="32" fill="#101820" stroke="#8295A3" strokeWidth="3" /><circle cx="148" cy="186" r="18" fill="#314454" stroke="#D5DDE2" strokeWidth="2" /><circle cx="148" cy="186" r="5" fill="#FF7929" />
          <circle cx="403" cy="186" r="32" fill="#101820" stroke="#8295A3" strokeWidth="3" /><circle cx="403" cy="186" r="18" fill="#314454" stroke="#D5DDE2" strokeWidth="2" /><circle cx="403" cy="186" r="5" fill="#FF7929" />
          <path d="M146 169v34m-17-17h34m240-17v34m-17-17h34" stroke="#CAD3DA" strokeWidth="2" strokeLinecap="round" />
          <path d="m389 43 5-11 5 11 11 5-11 5-5 11-5-11-11-5 11-5Z" fill="#FF9D57" />
          <defs><linearGradient id="auth-car-body" x1="83" y1="86" x2="457" y2="206" gradientUnits="userSpaceOnUse"><stop stopColor="#F9FBFC" /><stop offset=".48" stopColor="#B9C5CD" /><stop offset="1" stopColor="#758996" /></linearGradient></defs>
        </svg>
        <div className="auth-floating-card"><span className="auth-mini-icon"><Icon name="shield" size={20} /></span><span><strong>با خیال راحت بران</strong><small>پشتیبانی در تمام مسیر</small></span><span className="auth-mini-check"><Icon name="check" size={14} /></span></div>
      </div>
      <div className="auth-visual-footer"><span>راهِ بهترِ مراقبت از خودرو</span><span>خودرو چاره <b>©</b> ۱۴۰۴</span></div>
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
            <span>{visible ? "پنهان" : "نمایش"}</span>
          </button>
        )}
      </span>
    </label>
  );
}

export function LoginScreen() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const normalizedUsername = username.trim().toLowerCase();
    const user = readUsers().find((item) => item.username.toLowerCase() === normalizedUsername && item.password === password);
    if (!user) {
      setError("نام کاربری یا رمز عبور درست نیست. اگر هنوز حساب نساخته‌ای، ثبت‌نام کن.");
      return;
    }
    const session = { name: user.name, username: user.username, wallet: "۰" };
    if (remember) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    else sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    router.push("/home");
  }

  function handleDemo() {
    openDemoSession();
    router.push("/home");
  }

  return (
    <main className="auth-page" dir="rtl">
      <div className="auth-layout">
        <section className="auth-form-panel" aria-labelledby="login-heading">
          <div className="auth-mobile-brand"><BrandLogo /></div>
          <div className="auth-heading">
            <span className="auth-kicker auth-kicker--light">خودرو چاره، همیشه کنارته</span>
            <h1 id="login-heading">خوش برگشتی <span>👋</span></h1>
            <p>برای ادامه، وارد حساب کاربری‌ات شو.</p>
          </div>
          <form className="auth-form" onSubmit={handleSubmit}>
            <Field label="نام کاربری" name="username" value={username} onChange={setUsername} placeholder="نام کاربری‌ات را وارد کن" autoComplete="username" minLength={3} maxLength={20} ltr pattern="[A-Za-z0-9._-]+" />
            <Field label="رمز عبور" name="password" type="password" value={password} onChange={setPassword} placeholder="رمز عبورت را وارد کن" autoComplete="current-password" minLength={6} showToggle visible={passwordVisible} onToggle={() => setPasswordVisible((current) => !current)} />
            <div className="form-options">
              <label className="check-label"><input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} /><span className="custom-check"><Icon name="check" size={12} /></span><span>مرا به خاطر بسپار</span></label>
              <span className="password-hint">حداقل ۶ کاراکتر</span>
            </div>
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="primary-button auth-submit" type="submit">ورود به حساب <Icon name="arrow-left" size={18} /></button>
          </form>
          <div className="auth-divider"><span>یا</span></div>
          <button className="demo-button" type="button" onClick={handleDemo}><span className="demo-sparkle"><Icon name="sparkles" size={17} /></span> ورود به نسخهٔ نمایشی</button>
          <p className="auth-switch">حساب کاربری نداری؟ <Link href="/register">ثبت‌نام کن</Link></p>
          <p className="auth-legal">با ورود به خودرو چاره، <a href="#terms">قوانین و مقررات</a> را می‌پذیری.</p>
        </section>
        <AuthVisual mode="login" />
      </div>
    </main>
  );
}

export function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const normalizedUsername = username.trim().toLowerCase();
    if (!/^[a-z0-9._-]{3,20}$/.test(normalizedUsername)) {
      setError("نام کاربری باید ۳ تا ۲۰ کاراکتر و شامل حروف انگلیسی یا عدد باشد.");
      return;
    }
    if (password.length < 6) {
      setError("رمز عبور باید دست‌کم ۶ کاراکتر باشد.");
      return;
    }
    if (password !== confirmPassword) {
      setError("تکرار رمز عبور با رمز واردشده مطابقت ندارد.");
      return;
    }
    const users = readUsers();
    if (users.some((item) => item.username.toLowerCase() === normalizedUsername)) {
      setError("این نام کاربری قبلاً ثبت شده؛ یک نام کاربری دیگر انتخاب کن.");
      return;
    }
    const user: LocalUser = { name: name.trim(), username: normalizedUsername, password };
    localStorage.setItem(USERS_KEY, JSON.stringify([...users, user]));
    localStorage.setItem(SESSION_KEY, JSON.stringify({ name: user.name, username: user.username, wallet: "۰" }));
    router.push("/home");
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
            <Field label="نام و نام خانوادگی" name="full-name" value={name} onChange={setName} placeholder="مثلاً آرمان رضایی" autoComplete="name" minLength={2} maxLength={50} />
            <Field label="نام کاربری یکتا" name="new-username" value={username} onChange={setUsername} placeholder="مثلاً arman.rezaei" autoComplete="username" minLength={3} maxLength={20} ltr pattern="[A-Za-z0-9._-]+" />
            <div className="username-help"><Icon name="shield" size={14} /> نام کاربری باید یکتا و با حروف انگلیسی باشد.</div>
            <Field label="رمز عبور" name="new-password" type="password" value={password} onChange={setPassword} placeholder="حداقل ۶ کاراکتر" autoComplete="new-password" minLength={6} showToggle visible={passwordVisible} onToggle={() => setPasswordVisible((current) => !current)} />
            <Field label="تکرار رمز عبور" name="confirm-password" type="password" value={confirmPassword} onChange={setConfirmPassword} placeholder="رمز عبورت را دوباره وارد کن" autoComplete="new-password" minLength={6} />
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="primary-button auth-submit" type="submit">ساخت حساب کاربری <Icon name="arrow-left" size={18} /></button>
          </form>
          <p className="auth-switch">قبلاً حساب ساخته‌ای؟ <Link href="/">وارد شو</Link></p>
          <p className="auth-legal">اطلاعات این نسخهٔ نمایشی فقط در مرورگر شما ذخیره می‌شود.</p>
        </section>
        <AuthVisual mode="register" />
      </div>
    </main>
  );
}
