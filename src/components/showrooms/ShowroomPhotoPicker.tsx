"use client";
import {useRef} from 'react';

export function ShowroomPhotoPicker({label,disabled,onPick}:{label:string;disabled?:boolean;onPick:(file:File|undefined)=>void}){
 const input=useRef<HTMLInputElement>(null);
 return <div className="sr-photo-field"><span>{label}</span><input ref={input} className="sr-file-input" type="file" aria-label={label} accept="image/jpeg,image/png,image/webp,image/avif" disabled={disabled} onChange={e=>{onPick(e.target.files?.[0]);e.target.value='';}}/><button type="button" className="sr-secondary sr-photo-picker" disabled={disabled} onClick={()=>input.current?.click()}>بارگذاری {label.startsWith('عکس ')?label:'تصویر نمایشگاه'}</button><small>JPG، PNG، WebP یا AVIF؛ کمتر از ۸ مگابایت</small></div>;
}
