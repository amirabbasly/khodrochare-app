"use client";
import {useEffect,useRef,type ReactNode} from 'react';
export function HallModal({title,onClose,children}:{title:string;onClose:()=>void;children:ReactNode}){
  const ref=useRef<HTMLDialogElement>(null);
  useEffect(()=>{const dialog=ref.current,previous=document.activeElement as HTMLElement|null;const overflow=document.body.style.overflow;dialog?.showModal();document.body.style.overflow='hidden';return()=>{dialog?.close();document.body.style.overflow=overflow;previous?.focus();};},[]);
  return <dialog ref={ref} className="ch-native-modal ch-panel" aria-label={title} onCancel={e=>{e.preventDefault();onClose();}} onClick={e=>{if(e.target===e.currentTarget){const r=e.currentTarget.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)onClose();}}}><header className="ch-modal-heading"><h2>{title}</h2><button type="button" className="ch-secondary" onClick={onClose} aria-label="بستن پنجره">بستن ×</button></header>{children}</dialog>;
}
