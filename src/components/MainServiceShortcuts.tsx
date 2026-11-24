"use client";
import './main-service-shortcuts.css';
import {MainServiceIcon} from './MainServiceIcon';
export function MainServiceShortcuts({onImport,onSell,onMarket,sellHref}:{onImport:()=>void;onSell?:()=>void;onMarket:()=>void;sellHref?:string}){
 return <div className="main-service-shortcuts" aria-label="خدمات اصلی تکمیلی"><button type="button" onClick={onImport} aria-haspopup="dialog"><MainServiceIcon name="car-import"/><strong>واردات خودرو</strong></button><button className="shortcut-parts" type="button" onClick={onImport} aria-haspopup="dialog"><MainServiceIcon name="parts-import"/><strong className="shortcut-parts-label">واردات قطعات خاص</strong></button>{sellHref?<a href={sellHref} target="_blank" rel="noreferrer"><MainServiceIcon name="car-sale"/><strong>فروش خودرو</strong></a>:<button type="button" onClick={onSell}><MainServiceIcon name="car-sale"/><strong>فروش خودرو</strong></button>}<button type="button" onClick={onMarket}><MainServiceIcon name="friday-market"/><strong>جمعه بازار</strong></button></div>;
}
