/* eslint-disable @next/next/no-img-element -- Uploaded photos retain their API URLs and layout. */
"use client";
import {useCallback,useState,type ImgHTMLAttributes} from 'react';
import {Icon} from '../Icons';
export function HallImage({src,alt,className='',...props}:ImgHTMLAttributes<HTMLImageElement>&{src:string;alt:string}){
 const[loaded,setLoaded]=useState(''),[failed,setFailed]=useState('');const ready=loaded===src,error=failed===src;
 const attach=useCallback((node:HTMLImageElement|null)=>{if(node?.complete&&node.naturalWidth>0)setLoaded(src);},[src]);
 return <>{!ready&&!error&&<span className="ch-image-skeleton" aria-hidden="true"/>}{error&&<span className="ch-image-failed"><Icon name="camera" size={24}/><span>تصویر در دسترس نیست</span></span>}<img {...props} ref={attach} src={src} alt={alt} className={`${className}${!ready?' ch-image-pending':''}`} decoding="async" onLoad={e=>{setLoaded(src);props.onLoad?.(e);}} onError={e=>{setFailed(src);props.onError?.(e);}}/></>;
}
export function HallCardsSkeleton(){return <div className="ch-list-grid ch-loading-cards" role="status" aria-label="دریافت آگهی‌ها">{[1,2,3,4].map(n=><article className="ch-card ch-card-skeleton" key={n} aria-hidden="true"><div className="ch-card-photo ch-skeleton-piece"/><div className="ch-card-body"><span className="ch-sk-line ch-sk-title"/><span className="ch-sk-line"/><span className="ch-sk-line"/><div className="ch-card-footer"><span className="ch-sk-line"/><span className="ch-sk-line ch-sk-price"/></div></div></article>)}</div>;}
