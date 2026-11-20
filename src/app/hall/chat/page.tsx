import {Suspense} from 'react';
import {HallChatPage} from '@/components/hall/HallChatPage';
export default function Page(){return <Suspense fallback={<main dir="rtl" aria-busy="true"><p role="status">در حال آماده‌سازی چت تالار خودرو…</p></main>}><HallChatPage/></Suspense>;}
