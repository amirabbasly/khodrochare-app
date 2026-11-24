"use client";
import {useId,type ReactNode} from 'react';
import './main-service-icon.css';

const colours:Record<string,[string,string,string]>={
 roadside:['#A6C9FF','#4C7FE7','#3154A4'],transport:['#FFD399','#F2953C','#C56B25'],
 maintenance:['#FFC5A2','#EE8555','#BD5736'],carwash:['#A1E4FF','#48B7E2','#2481BA'],
 'car-import':['#B2D2FF','#6494E8','#3B64AF'],'parts-import':['#C6BFFF','#9180E0','#6554AF'],
 'car-sale':['#A3E3D4','#54BBA5','#318C7B'],'friday-market':['#E1C5F7','#AF87D5','#7F5CA8'],
};
export function MainServiceIcon({name}:{name:string}){
 const instance=useId().replace(/:/g,''),[light,base,dark]=colours[name]||colours.roadside;
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
   <path d="m17 19 6-9h20l7 10 5 7v21H14V27z" fill={dark}/>
   <path d="m13 17 6-9h20l7 10 5 7v21H10V25z" fill={paint('body')}/><path d="m19 12-4 11h28l-7-11z" fill={paint('glass')}/>
   <path d="M12 30h10m17 0h10" stroke="#F4FBFF" strokeWidth="3.5"/>
   <rect x="14" y="44" width="7" height="8" rx="3" fill="#2B3C4E"/><rect x="40" y="44" width="7" height="8" rx="3" fill="#2B3C4E"/>
   <rect x="24" y="36" width="13" height="3" rx="1.5" fill={dark}/>
   <path d="M49 5v13m-5-4 5 5 5-5" stroke="#F0FCF6" strokeWidth="7"/>
   <path d="M49 5v13m-5-4 5 5 5-5" stroke="#58BFA6" strokeWidth="3.5"/>
  </>;break;
  case 'parts-import':drawing=<>
   <path d="m11 19 21-11 23 12v27L34 58 11 46z" fill={dark}/><path d="m8 17 22-11 22 11-22 12z" fill={light}/>
   <path d="m8 17 22 12v27L8 44z" fill={paint('body')}/><path d="m30 29 22-12v27L30 56z" fill={dark}/>
   <path d="m21 11 22 11" stroke="#EAE3FF" strokeWidth="4"/>
   <path d="M19 29v13m-5-7 5 7 5-2" stroke="#F4F0FF" strokeWidth="3" fill="none"/>
   <path d="M12 23v18" stroke="#E4DCFF" strokeWidth="1.8" opacity=".55"/>
  </>;break;
  case 'car-sale':drawing=<>
   <path d="M11 9h25l21 21-26 26L10 35z" fill={dark}/><path d="M8 6h25l21 21-26 26L7 32z" fill={paint('body')}/>
   <path d="M8 6h25l3 3H11L10 33l-3-1z" fill={light}/><circle cx="20" cy="18" r="4.5" fill={dark}/><circle cx="19" cy="17" r="3.2" fill="#F1FCF8"/>
   <path d="m24 35 12-12m-7 17 12-12" stroke="#EBFFF7" strokeWidth="3.2"/>
  </>;break;
  case 'friday-market':drawing=<>
   <path d="M15 22h36v32H15z" fill={dark}/><path d="M11 19h36v32H11z" fill={paint('metal')}/><path d="m47 19 4 3v32l-4-3z" fill="#A9B7CA"/>
   <rect x="24" y="32" width="12" height="19" rx="2" fill={paint('glass')}/><path d="M11 11h35l6 12H6z" fill={paint('body')}/>
   <path d="M16 11h7l-1 12h-9zm14 0h7l3 12H30z" fill="#F6EEFF"/>
   <path d="M6 23c0 7 9 7 9 0 0 7 9 7 9 0 0 7 9 7 9 0 0 7 9 7 9 0 0 7 10 7 10 0" fill={base}/>
   <path d="M15 23c0 7 9 7 9 0m9 0c0 7 9 7 9 0" fill="#F6EEFF"/><path d="M10 11h36" stroke={light} strokeWidth="2"/>
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
