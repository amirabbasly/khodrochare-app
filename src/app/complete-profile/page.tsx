import {Suspense} from 'react';
import {CompleteProfileScreen} from '@/components/AuthScreens';
export default function Page(){return <Suspense fallback={<main dir="rtl" aria-busy="true"><p role="status">در حال آماده‌سازی مشخصات حساب…</p></main>}><CompleteProfileScreen/></Suspense>;}
