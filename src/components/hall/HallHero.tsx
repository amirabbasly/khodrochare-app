/* eslint-disable @next/next/no-img-element -- Configured banners can be served by the API. */
"use client";
import {useEffect,useState} from 'react';
import {API_BASE_URL} from '@/lib/api';
import {Icon} from '../Icons';
import {type Catalog} from './types';

type HeroSlide={id:string;imageUrl:string;title:string;subtitle:string;linkUrl?:string};
const defaults:HeroSlide[]=[
  {id:'buy',imageUrl:'/slides/hall-buy.webp',title:'خودروی بعدی‌ات را اینجا پیدا کن',subtitle:'آگهی‌ها را ببین، مقایسه کن و مستقیم با فروشنده گفتگو کن.'},
  {id:'inspection',imageUrl:'/slides/hall-inspection.webp',title:'یک انتخاب آگاهانه، یک مسیر تازه',subtitle:'مشخصات روشن، تصاویر واقعی آگهی و ارتباط مستقیم با مالک.'},
];

export function HallHero({catalog,onCreate}:{catalog:Catalog|null;onCreate:()=>void}){
  const [index,setIndex]=useState(0),[paused,setPaused]=useState(false),[hovered,setHovered]=useState(false),[focused,setFocused]=useState(false);
  const slides:HeroSlide[]=catalog?.banners.length?catalog.banners:defaults;
  const current=index%slides.length,slide=slides[current];
  useEffect(()=>{
    if(slides.length<2||paused||hovered||focused)return;
    const media=window.matchMedia('(prefers-reduced-motion: reduce)');
    const timer=window.setInterval(()=>{if(!document.hidden&&!media.matches)setIndex(i=>(i+1)%slides.length);},6500);
    return()=>window.clearInterval(timer);
  },[slides.length,paused,hovered,focused]);
  const move=(delta:number)=>setIndex(i=>(i+delta+slides.length)%slides.length);
  const src=slide.imageUrl.startsWith('/hall/')?API_BASE_URL+slide.imageUrl:slide.imageUrl;
  return <section className="ch-carousel" aria-label="پیشنهادهای تالار خودرو" aria-roledescription="اسلایدر" onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)} onFocusCapture={()=>setFocused(true)} onBlurCapture={e=>{if(!e.currentTarget.contains(e.relatedTarget as Node|null))setFocused(false);}}>
    <img key={slide.id} className="ch-carousel-image" src={src} alt="" fetchPriority="high"/>
    <div className="ch-carousel-shade"/>
    <div className="ch-carousel-copy" aria-live={paused?'polite':'off'}><span className="ch-carousel-kicker">تالار خودرو چاره</span><h2>{slide.title}</h2><p>{slide.subtitle}</p><div className="ch-carousel-actions">{'linkUrl' in slide?<a className="ch-primary" href={slide.linkUrl}>بیشتر بدانید<Icon name="arrow-left" size={17}/></a>:<><button type="button" className="ch-primary" onClick={()=>document.getElementById('ch-listings')?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'})}>دیدن آگهی‌ها<Icon name="arrow-left" size={17}/></button><button type="button" className="ch-carousel-create" onClick={onCreate}>ثبت آگهی رایگان</button></>}</div></div>
    <div className="ch-carousel-controls" role="group" aria-label="کنترل اسلایدر"><button type="button" onClick={()=>move(-1)} aria-label="اسلاید قبل"><Icon name="arrow-right" size={18}/></button><div className="ch-carousel-dots">{slides.map((s,i)=><button key={s.id} type="button" aria-label={`نمایش اسلاید ${(i+1).toLocaleString('fa-IR')}`} aria-current={current===i?'true':undefined} onClick={()=>setIndex(i)}><span/></button>)}</div><button type="button" onClick={()=>move(1)} aria-label="اسلاید بعد"><Icon name="arrow-left" size={18}/></button><button type="button" className="ch-carousel-pause" onClick={()=>setPaused(p=>!p)} aria-pressed={paused}>{paused?'پخش':'توقف'}</button></div>
  </section>;
}
