"use client";
import {useEffect,useRef,useState} from 'react';
import type * as Leaflet from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {type HallLocation} from './types';
type LModule=typeof import('leaflet');
export const areaCenter=(value:HallLocation):[number,number]=>[Number((Math.round(value.latitude/.02)*.02).toFixed(2)),Number((Math.round(value.longitude/.02)*.02).toFixed(2))];
export function HallLocationMap({value,onPick,readOnly=false}:{value?:HallLocation;onPick?:(latitude:number,longitude:number)=>void;readOnly?:boolean}){
  const container=useRef<HTMLDivElement>(null),map=useRef<Leaflet.Map|null>(null),leafletModule=useRef<LModule|null>(null),layers=useRef<Leaflet.Layer[]>([]),current=useRef(value),callback=useRef(onPick);
  const [ready,setReady]=useState(false),[error,setError]=useState(''),[locating,setLocating]=useState(false);
  useEffect(()=>{callback.current=onPick;},[onPick]);
  function draw(location?:HallLocation){
    const L=leafletModule.current,m=map.current;if(!L||!m)return;layers.current.forEach(layer=>m.removeLayer(layer));layers.current=[];if(!location)return;
    const point:[number,number]=[location.latitude,location.longitude];
    if(location.visibility==='AREA'){
      const center=readOnly?point:areaCenter(location),circle=L.circle(center,{radius:2000,color:'#ed6a20',weight:2,fillColor:'#ed6a20',fillOpacity:.15}).addTo(m);layers.current.push(circle);m.fitBounds(circle.getBounds(),{padding:[18,18],animate:false});
    }else m.setView(point,15,{animate:false});
    if(!readOnly||location.visibility==='EXACT'){
      const marker=L.marker(point,{draggable:!readOnly,icon:L.divIcon({className:'ch-map-pin',html:'<span></span>',iconSize:[30,40],iconAnchor:[15,40]}),title:readOnly?'موقعیت خودرو':'موقعیت انتخاب‌شده؛ برای جابه‌جایی بکشید'}).addTo(m);layers.current.push(marker);marker.on('dragend',()=>{const p=marker.getLatLng();callback.current?.(p.lat,p.lng);});
    }
  }
  useEffect(()=>{current.current=value;},[value]);
  // Reverse-geocoding adds an address without changing the point; retain manual map zoom.
  useEffect(()=>{draw(current.current);},[value?.latitude,value?.longitude,value?.visibility,readOnly]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(()=>{
    let disposed=false;const observer=new ResizeObserver(()=>map.current?.invalidateSize());
    void import('leaflet').then(({default:L})=>{if(disposed||!container.current)return;leafletModule.current=L;const m=L.map(container.current,{center:[35.6892,51.389],zoom:12,scrollWheelZoom:false,zoomControl:!readOnly,dragging:!readOnly,doubleClickZoom:!readOnly,touchZoom:!readOnly});map.current=m;L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'}).addTo(m);if(!readOnly)m.on('click',e=>callback.current?.(e.latlng.lat,e.latlng.lng));draw(current.current);observer.observe(container.current);setReady(true);}).catch(()=>{if(!disposed)setError('نقشه بارگذاری نشد؛ اتصال را بررسی کنید.');});
    return()=>{disposed=true;observer.disconnect();map.current?.remove();map.current=null;leafletModule.current=null;layers.current=[];};
  },[readOnly]); // eslint-disable-line react-hooks/exhaustive-deps
  function locate(){setLocating(true);setError('');if(!navigator.geolocation){setError('مرورگر از موقعیت مکانی پشتیبانی نمی‌کند.');setLocating(false);return;}navigator.geolocation.getCurrentPosition(p=>{callback.current?.(p.coords.latitude,p.coords.longitude);setLocating(false);},()=>{setError('دسترسی موقعیت ممکن نشد؛ نقطه را روی نقشه انتخاب کنید.');setLocating(false);},{enableHighAccuracy:true,timeout:15000,maximumAge:10000});}
  return <div className="ch-location-map-wrap">{error&&<p className="ch-error" role="alert">{error}</p>}<div ref={container} className="ch-location-map" role="region" aria-label={readOnly?(value?.visibility==='AREA'?'محدوده خودرو با شعاع ۲ کیلومتر':'موقعیت دقیق خودرو'):'انتخاب موقعیت خودرو روی نقشه'} data-visibility={value?.visibility} data-radius={readOnly&&value?.visibility==='AREA'?2000:undefined}/>{!readOnly&&<div className="ch-map-actions"><button type="button" className="ch-secondary" disabled={locating||!ready} onClick={locate}>{locating?'در حال دریافت موقعیت…':'موقعیت فعلی من'}</button><button type="button" className="ch-secondary" disabled={!ready} onClick={()=>{const point=map.current?.getCenter();if(point)callback.current?.(point.lat,point.lng);}}>انتخاب مرکز نقشه</button></div>}</div>;
}
