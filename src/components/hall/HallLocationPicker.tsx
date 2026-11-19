"use client";
import {useEffect,useState} from 'react';
import {api,type Place} from '@/lib/api';
import {HallLocationMap} from './HallLocationMap';
import {type HallLocation} from './types';
export function HallLocationPicker({value,onChange,onCity}:{value?:HallLocation;onChange:(location:HallLocation)=>void;onCity:(city:string)=>void}){
  const [visibility,setVisibility]=useState<'AREA'|'EXACT'>(value?.visibility||'AREA'),[address,setAddress]=useState(value?.address||''),[warning,setWarning]=useState('');
  const latitude=value?.latitude,longitude=value?.longitude;
  useEffect(()=>{
    if(latitude===undefined||longitude===undefined)return;const controller=new AbortController(),timer=setTimeout(()=>{api<Place>('/locations/reverse',{method:'POST',body:{latitude,longitude},signal:controller.signal}).then(place=>{if(!controller.signal.aborted){setAddress(place.label);setWarning('');if(place.city)onCity(place.city);onChange({latitude,longitude,visibility,address:place.label});}}).catch(()=>{if(!controller.signal.aborted)setWarning('نشانی شناسایی نشد؛ شهر را دستی وارد کنید. نقطه انتخاب‌شده حفظ شده است.');});},500);return()=>{clearTimeout(timer);controller.abort();};
  },[latitude,longitude,visibility]); // eslint-disable-line react-hooks/exhaustive-deps
  return <section className="ch-panel ch-location-picker"><h3>موقعیت خودرو</h3><p>روی نقشه نقطه خودرو را انتخاب کنید؛ شهر را هم بررسی کنید.</p><fieldset className="ch-location-privacy"><legend>شیوه نمایش موقعیت در آگهی</legend>{([['EXACT','نمایش دقیق موقعیت'],['AREA','نمایش محدوده موقعیت (شعاع ۲ کیلومتر)']] as const).map(([mode,label])=><label key={mode}><input type="radio" name="location-privacy" value={mode} checked={visibility===mode} onChange={()=>{setVisibility(mode);if(value)onChange({...value,visibility:mode});}}/>{label}</label>)}</fieldset><HallLocationMap value={value} onPick={(lat,lng)=>{setAddress('');setWarning('');onChange({latitude:lat,longitude:lng,visibility});}}/><p role="status">{address||(!value?'هنوز نقطه‌ای انتخاب نشده است.':'نقطه خودرو انتخاب شد.')}</p>{warning&&<p className="ch-note">{warning}</p>}<small>{visibility==='AREA'?'در آگهی فقط یک محدوده ۲ کیلومتری نمایش داده می‌شود؛ مختصات دقیق و نشانی کامل منتشر نمی‌شوند.':'با این انتخاب، نقطه دقیق خودرو برای همه قابل مشاهده است.'}</small></section>;
}
