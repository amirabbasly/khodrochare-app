"use client";
import {useId,type ReactNode} from 'react';
import Image from 'next/image';
import './main-service-icon.css';

const colours:Record<string,[string,string,string]>={
 roadside:['#A6C9FF','#4C7FE7','#3154A4'],transport:['#FFD399','#F2953C','#C56B25'],
 maintenance:['#FFC5A2','#EE8555','#BD5736'],carwash:['#A1E4FF','#48B7E2','#2481BA'],
 'car-import':['#B2D2FF','#6494E8','#3B64AF'],'parts-import':['#C6BFFF','#9180E0','#6554AF'],
 'car-sale':['#A3E3D4','#54BBA5','#318C7B'],'friday-market':['#E1C5F7','#AF87D5','#7F5CA8'],
};
export function MainServiceIcon({name}:{name:string}){
 const instance=useId().replace(/:/g,''),[light,base,dark]=colours[name]||colours.roadside;
 if(name==='parts-import'||name==='car-import')return <span className={`main-service-icon main-service-icon--${name}`} aria-hidden="true"><Image className="main-service-icon-object" src={name==='car-import'?'/icons/car-import-emblem.png':'/icons/parts-import-emblem.png'} width={64} height={64} sizes="(max-width: 600px) 52px, 64px" alt=""/></span>;
 const paint=(part:string)=>`url(#${instance}-${part})`;
 let drawing:ReactNode;
 switch(name){
  case 'transport':drawing=<>
   {/* A single tow truck: empty rear deck, towing boom and a hanging hook. */}
   <path d="M9 37h29v12H9z" fill={dark}/><path d="M9 34h29v12H9z" fill={paint('body')}/>
   <path d="M38 46V24h10l9 12v10z" fill={dark}/><path d="M35 44V22h11l9 12v10z" fill={paint('body')}/>
   <path d="M39 26h5l7 9H39z" fill={paint('glass')}/><path d="M35 22h11l3 2H38z" fill={light}/>
   <path d="M29 34 19 18H9" fill="none" stroke={dark} strokeWidth="6"/>
   <path d="M28 33 18 17H9" fill="none" stroke={paint('body')} strokeWidth="5"/>
   <path d="M9 20v7c-4 0-4 6 0 6 2 0 3-1 3-3" fill="none" stroke="#3D5267" strokeWidth="2.8"/>
   <rect x="9" y="41" width="45" height="5" rx="2" fill="#34495D"/>
   <circle cx="18" cy="47" r="6" fill="#2B3C4E"/><circle cx="18" cy="47" r="2.8" fill={paint('metal')}/>
   <circle cx="46" cy="47" r="6" fill="#2B3C4E"/><circle cx="46" cy="47" r="2.8" fill={paint('metal')}/>
   <rect x="50" y="37" width="5" height="3" rx="1.3" fill="#FFF3D0"/>
  </>;break;
  case 'maintenance':drawing=<>
   <path d="M17 17h25l8 8v27H17z" fill={dark}/><path d="M14 14h25l8 8v27H14z" fill={paint('body')}/>
   <path d="m14 14 3-3h25l-3 3zm25 0 3-3 8 8-3 3z" fill={light}/>
   <path d="m47 23 8-5v-6h-6l-7 5z" fill={dark}/><path d="m44 21 8-5v-6h-6l-7 5z" fill={paint('body')}/>
   <rect x="19" y="7" width="15" height="8" rx="2.5" fill="#40546A"/><path d="M21 8h11" stroke="#7D91A6" strokeWidth="2"/>
   <path d="M29 23c-3 5-7 9-7 13a7 7 0 0 0 14 0c0-4-4-8-7-13Z" fill="#FFF5E8"/>
   <path d="M18 19v23" stroke="#FFE0C7" strokeWidth="2" opacity=".65"/>
  </>;break;
  case 'carwash':drawing=<>
   <path d="M33 7C27 17 14 30 14 40a19 19 0 0 0 38 0C52 30 39 17 33 7Z" fill={dark}/>
   <path d="M30 5C24 15 11 28 11 38a19 19 0 0 0 38 0C49 28 36 15 30 5Z" fill={paint('body')}/>
   <path d="M24 21c-6 8-8 12-8 17 0 4 1 7 4 9" stroke="#E0F7FF" strokeWidth="3.5" fill="none" opacity=".8"/>
  </>;break;
  case 'car-import':drawing=<>
   {/* Front-facing BMW: sharp light signatures and the twin kidney grille. */}
   <path d="M12 46V31l6-15 8-5h15l8 6 5 15v14z" fill="#17263B"/>
   <path d="m10 32 7-16 8-6h14l8 6 7 16-3 16H13z" fill={paint('body')}/>
   <path d="m20 17 6-4h11l7 4 4 11H16z" fill="#192C43"/>
   <path d="m23 17 4-2h10l5 3H22z" fill="#8BB6E4" opacity=".65"/>
   <path d="m16 29 10-2h12l11 2-5 6H20z" fill={light}/>
   <path d="m21 30 5 3m17-3-5 3" stroke="#D1E4FF" strokeWidth="1.3"/>
   <path d="M27 33h4v10h-5l-1-7zm6 0h4l2 3-1 7h-5z" fill="#101D30" stroke="#CBD8ED" strokeWidth="1.3"/>
   <path d="M28 35v6m7-6v6" stroke="#5A718A" strokeWidth=".8"/>
   <path d="m13 33 8 2 2 3-9-1m36-4-8 2-2 3 9-1" stroke="#EDFAFF" strokeWidth="2.3"/>
   <path d="m14 41 6 1-2 3h-5zm36 0-6 1 2 3h5z" fill="#13243C"/>
   <path d="M23 47h18l3-2H20z" fill="#182B43"/>
   <rect x="13" y="46" width="7" height="7" rx="2" fill="#142136"/><rect x="44" y="46" width="7" height="7" rx="2" fill="#142136"/>
   <circle cx="32" cy="30" r="1.8" fill="#F4F8FF"/>
   <path d="M32 28.6a1.4 1.4 0 0 1 1.4 1.4H32zm0 2.8a1.4 1.4 0 0 1-1.4-1.4H32z" fill="#3D8DE4"/>
   <path d="M11 28H7m47 0h3" stroke="#314D71" strokeWidth="3"/>
  </>;break;
  case 'car-sale':drawing=<>
   {/* A single round clock with an unmistakable 24-hour mark. */}
   <circle cx="33" cy="33" r="24" fill={dark}/>
   <circle cx="30" cy="30" r="24" fill={paint('body')}/>
   <circle cx="30" cy="30" r="18.5" fill="#F1FBF8"/>
   <path d="M30 14v3m-16 13h3m26 0h3M30 43v3" stroke={base} strokeWidth="2"/>
   <g stroke={dark} strokeWidth="2.8" fill="none">
    <path d="M20 25c0-5 8-5 8 0 0 3-8 5-8 10h8"/>
    <path d="m39 22-7 9h10m-3-9v14"/>
   </g>
   <path d="M48 16a24 24 0 0 1 5 12" stroke="#DBFFF2" strokeWidth="3"/>
   <path d="m47 20 1-6 6 1" stroke="#F1FFF9" strokeWidth="2.6" fill="none"/>
  </>;break;
  case 'friday-market':drawing=<>
   {/* Magnifying glass finds a low price: one search lens and a down arrow. */}
   <path d="m42 40 14 13a4 4 0 0 1-6 6L37 45z" fill={dark}/>
   <path d="m41 38 14 13a4 4 0 0 1-6 6L36 43z" fill={paint('body')}/>
   <circle cx="28" cy="27" r="21" fill={dark}/>
   <circle cx="26" cy="25" r="21" fill={paint('body')}/>
   <circle cx="26" cy="25" r="15.8" fill="#FAF6FF"/>
   <path d="M26 15v18m-6-6 6 6 6-6" stroke={dark} strokeWidth="3.6" fill="none"/>
   <path d="M18 37h16" stroke={base} strokeWidth="2"/>
   <path d="M12 20a15 15 0 0 1 10-9" stroke="#FFFFFF" strokeWidth="2.4" opacity=".85"/>
   <path d="m44 45 6 6" stroke={light} strokeWidth="2"/>
  </>;break;
  default:drawing=<>
   <path d="M45 8a12 12 0 0 0-17 15L9 42a6 6 0 0 0 9 9l19-19A12 12 0 0 0 52 15l-9 9-7-7z" fill={dark}/>
   <path d="M42 5a12 12 0 0 0-17 15L6 39a6 6 0 0 0 9 9l19-19A12 12 0 0 0 49 12l-9 9-7-7z" fill={paint('body')}/>
   <path d="M11 40 27 24" stroke="#DCEBFF" strokeWidth="2.2" opacity=".7"/><circle cx="11" cy="43" r="2.2" fill={dark}/>
  </>;
 }
 return <span className={`main-service-icon main-service-icon--${name}`} aria-hidden="true"><svg viewBox="0 0 64 64" width="64" height="64" fill="none" strokeLinecap="round" strokeLinejoin="round">
  <defs>
   <linearGradient id={`${instance}-body`} x1="8" y1="6" x2="48" y2="52" gradientUnits="userSpaceOnUse"><stop stopColor={light}/><stop offset="1" stopColor={base}/></linearGradient>
   <linearGradient id={`${instance}-metal`} x1="15" y1="17" x2="42" y2="51" gradientUnits="userSpaceOnUse"><stop stopColor="#FBFDFF"/><stop offset="1" stopColor="#C7D3E3"/></linearGradient>
   <linearGradient id={`${instance}-glass`} x1="25" y1="18" x2="49" y2="42" gradientUnits="userSpaceOnUse"><stop stopColor="#BCDAEF"/><stop offset="1" stopColor="#6286A8"/></linearGradient>
  </defs>
  <ellipse cx="32" cy="57" rx="19" ry="3" fill="#233B56" opacity=".1"/>
  <g className="main-service-icon-object">{drawing}</g>
 </svg></span>;
}
