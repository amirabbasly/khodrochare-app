/* eslint-disable @next/next/no-img-element -- Listing images come from the API. */
"use client";
import {useEffect,useState} from 'react';
import {API_BASE_URL} from '@/lib/api';
import {Icon} from '../Icons';
import {type Listing,money,number} from './types';
export function HallHero({listings,onOpen}:{listings:Listing[];onOpen:(listing:Listing)=>void}){
 const[index,setIndex]=useState(0),[paused,setPaused]=useState(false),[hovered,setHovered]=useState(false),[focused,setFocused]=useState(false);
 const[now,setNow]=useState(()=>Date.now());
 useEffect(()=>{const timer=setInterval(()=>setNow(Date.now()),10000);return()=>clearInterval(timer);},[]);
 const slides=listings.filter(r=>r.status==='PUBLISHED'&&r.featuredUntil&&Date.parse(r.featuredUntil)>now);
 const current=slides.length?index%slides.length:0,slide=slides[current];
 useEffect(()=>{if(slides.length<2||paused||hovered||focused)return;const media=window.matchMedia('(prefers-reduced-motion: reduce)');const timer=setInterval(()=>{if(!document.hidden&&!media.matches)setIndex(i=>i+1);},6500);return()=>clearInterval(timer);},[slides.length,paused,hovered,focused]);
 if(!slide)return null;
 const move=(delta:number)=>setIndex(i=>(i+delta+slides.length)%slides.length);
 const raw=slide.photos[0]?.url,src=raw?.startsWith('/hall/')?API_BASE_URL+raw:raw;
 return <section className="ch-carousel ch-ad-carousel" aria-label="آگهی‌های ویژه تالار خودرو" aria-roledescription="اسلایدر" onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)} onFocusCapture={()=>setFocused(true)} onBlurCapture={e=>{if(!e.currentTarget.contains(e.relatedTarget as Node|null))setFocused(false);}}>
 {src?<img className="ch-carousel-image" src={src} alt={`${slide.make} ${slide.model}`} fetchPriority="high"/>:<div className="ch-ad-placeholder"><Icon name="car" size={90}/></div>}<div className="ch-carousel-shade"/><div className="ch-carousel-copy"><span className="ch-ad-label">آگهی ویژه</span><h2>{slide.make} {slide.model} {slide.trim==='نامشخص'?'':slide.trim}</h2><p>{number(slide.year)} · {number(slide.mileage)} کیلومتر · {slide.city}</p><strong>{money(slide.priceToman)}</strong><button className="ch-primary" type="button" onClick={()=>onOpen(slide)}>نمایش آگهی <Icon name="arrow-left" size={16}/></button></div>{slides.length>1&&<div className="ch-carousel-controls" role="group" aria-label="کنترل اسلایدر"><button onClick={()=>move(-1)} aria-label="اسلاید قبل"><Icon name="arrow-right" size={18}/></button><span>{number(current+1)} / {number(slides.length)}</span><button onClick={()=>move(1)} aria-label="اسلاید بعد"><Icon name="arrow-left" size={18}/></button><button className="ch-carousel-pause" onClick={()=>setPaused(v=>!v)} aria-pressed={paused}>{paused?'پخش':'توقف'}</button></div>}
 </section>;
}
