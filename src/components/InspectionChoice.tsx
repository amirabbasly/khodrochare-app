"use client";
import {useEffect,useRef} from 'react';
import {Icon} from './Icons';
import './inspection-choice.css';
export function InspectionChoice({onChoose}:{onChoose:()=>void}){
 const dialog=useRef<HTMLDialogElement>(null);
 useEffect(()=>{const element=dialog.current;element?.showModal();return()=>element?.close();},[]);
 return <dialog ref={dialog} className="inspection-choice-modal" aria-label="انتخاب کارشناسی خودرو" dir="rtl" onCancel={e=>e.preventDefault()}><span className="inspection-choice-icon"><Icon name="shield" size={28}/></span><h2>انتخاب کارشناسی خودرو</h2><button type="button" className="inspection-choice-button inspection-choice-button--active" onClick={onChoose}>کارشناسی خودرو با گارانتی خودرو چاره</button><button type="button" className="inspection-choice-button inspection-choice-button--soon" disabled><span>کارشناسی رایگان تا فروش ۲۴ ساعته</span><span className="inspection-soon-tag">به‌زودی</span></button></dialog>;
}
