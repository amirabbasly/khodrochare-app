"use client";
import {useEffect,useState} from 'react';
import {useRouter} from 'next/navigation';
import {api,errorMessage} from '@/lib/api';
import {HallListingDetail} from '../hall/HallListingDetail';
import {type Listing} from '../hall/types';
import {ShowroomNav} from './ShowroomPublic';
import '../hall/hall.css';
import '../hall/hall-details.css';
import './showrooms.css';
export function PublicListing({id}:{id:string}){const [listing,setListing]=useState<Listing|null>(null),[error,setError]=useState(''),router=useRouter();useEffect(()=>{const c=new AbortController();api<Listing>(`/hall/listings/${id}`,{auth:false,signal:c.signal}).then(setListing).catch(e=>{if(!c.signal.aborted)setError(errorMessage(e));});return()=>c.abort();},[id]);return <section className="sr-page ch-hall" dir="rtl"><ShowroomNav/>{listing?<HallListingDetail listing={listing} onBack={()=>router.back()} onChat={()=>router.push('/hall/chat?listing='+id)}/>:<p role={error?'alert':'status'}>{error||'در حال دریافت آگهی…'}</p>}</section>;}
