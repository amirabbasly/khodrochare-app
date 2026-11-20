/* eslint-disable @next/next/no-img-element -- Locally stored official source icons with visible text fallback. */
"use client";
import {useState} from 'react';
import Image from 'next/image';
import type {CSSProperties} from 'react';
const sources=[['ترب','/market-sources/torob.png'],['یدک کار','/market-sources/yadakcar.webp'],['مستر یدکی','/market-sources/mryadaki.ico'],['یدک پارت','/market-sources/yadakpart.webp'],['اعتماد یدک','/market-sources/etemadyadak.png'],['پارتس‌مال','/market-sources/partsmall.webp']];
function Source({name,domain,index}:{name:string;domain:string;index:number}){
 const[failed,setFailed]=useState(false);
 return <span className="jm-source-satellite" style={{'--source-angle':`${index*60}deg`} as CSSProperties}><span className="jm-source-chip">{!failed&&<img src={domain} alt="" referrerPolicy="no-referrer" onError={()=>setFailed(true)}/>}<b>{name}</b></span></span>;
}
export function MarketSourceCloud(){return <section className="jm-source-cloud"><div className="jm-source-orbit" aria-hidden="true"><div className="jm-orbit-track">{sources.map(([name,domain],i)=><Source key={domain} name={name} domain={domain} index={i}/>)}</div></div><div className="jm-source-message"><h2>نیازی نیست دنبال قطعه بگردی،<br/><em>خودرو چاره اینجاست <Image className="jm-source-brand-symbol" src="/khodrochare-symbol-transparent.webp" alt="نشان خودرو چاره" width={44} height={44} sizes="44px"/></em></h2><p>مراجع بازار قطعات؛ پیشنهادهای فعلی از ترب دریافت می‌شوند.</p></div></section>;}
