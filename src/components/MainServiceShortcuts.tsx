"use client";
import './main-service-shortcuts.css';
import {ServiceIllustration} from './ServiceIllustration';
export function MainServiceShortcuts({onImport,onSell,onMarket,sellHref}:{onImport:()=>void;onSell?:()=>void;onMarket:()=>void;sellHref?:string}){
 return <div className="main-service-shortcuts" aria-label="خدمات اصلی تکمیلی"><button type="button" onClick={onImport} aria-haspopup="dialog"><ServiceIllustration type="car-import" size="sm"/><strong>واردات خودرو</strong></button><button className="shortcut-parts" type="button" onClick={onImport} aria-haspopup="dialog"><ServiceIllustration type="parts-import" size="sm" delay={.35}/><strong className="shortcut-parts-label">واردات قطعات خاص</strong></button>{sellHref?<a href={sellHref} target="_blank" rel="noreferrer"><ServiceIllustration type="car-sale" size="sm" delay={.7}/><strong>فروش خودرو</strong></a>:<button type="button" onClick={onSell}><ServiceIllustration type="car-sale" size="sm" delay={.7}/><strong>فروش خودرو</strong></button>}<button type="button" onClick={onMarket}><ServiceIllustration type="friday-market" size="sm" delay={1.05}/><strong>جمعه بازار</strong></button></div>;
}
