"use client";
import './main-service-shortcuts.css';
import Link from 'next/link';
import {MainServiceIcon} from './MainServiceIcon';
export function MainServiceShortcuts({onSell,onMarket,sellHref}:{onSell?:()=>void;onMarket:()=>void;sellHref?:string}){
 return <div className="main-service-shortcuts" aria-label="خدمات اصلی تکمیلی"><Link href="/imports/cars"><MainServiceIcon name="car-import"/><strong>واردات خودرو</strong></Link><Link className="shortcut-parts" href="/imports/parts"><MainServiceIcon name="parts-import"/><strong className="shortcut-parts-label">واردات قطعات خاص</strong></Link>{sellHref?<a href={sellHref} target="_blank" rel="noreferrer"><MainServiceIcon name="car-sale"/><strong>فروش خودرو</strong></a>:<button type="button" onClick={onSell}><MainServiceIcon name="car-sale"/><strong>فروش خودرو</strong></button>}<button type="button" onClick={onMarket}><MainServiceIcon name="friday-market"/><strong>جمعه بازار</strong></button></div>;
}
