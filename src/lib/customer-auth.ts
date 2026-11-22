"use client";
import {useCallback,useEffect} from 'react';
import {useRouter} from 'next/navigation';
import {useSessionState} from './session';
import {api,type Session,type User} from './api';

export type OtpPurpose='REGISTER'|'LOGIN'|'RESET_PASSWORD';
export type OtpChallenge={challengeId:string;expiresInSeconds:number;retryAfterSeconds:number};
export function requestOtp(phone:string,purpose:OtpPurpose){return api<OtpChallenge>('/auth/customers/otp/request',{auth:false,method:'POST',body:{phone,purpose},timeoutMs:25000});}
export function verifyOtp(challengeId:string,code:string,remember=true){return api<Session>('/auth/customers/otp/verify',{auth:false,method:'POST',body:{challengeId,code,remember}});}
export function resetPassword(challengeId:string,code:string,password:string){return api<{reset:true}>('/auth/customers/password/reset',{auth:false,method:'POST',body:{challengeId,code,password}});}
export function completeProfile(input:{fullName:string;nationalId:string;password?:string}){return api<User>('/me/complete-profile',{method:'POST',body:input});}

export function safeReturnPath(value:string|null|undefined){
 try{const base='https://app.invalid',url=new URL(value||'/home',base);return url.origin===base&&['/home','/hall/chat'].includes(url.pathname)?url.pathname+url.search:'/home';}catch{return '/home';}
}
export function useCustomerProfileGate(){
 const {user}=useSessionState(),router=useRouter();
 return useCallback((next='/home')=>{if(user?.profileComplete!==false)return true;router.push('/complete-profile?next='+encodeURIComponent(safeReturnPath(next)));return false;},[router,user?.profileComplete]);
}
export function CustomerProfileListener(){
 const router=useRouter();
 useEffect(()=>{const open=()=>{const next=safeReturnPath(window.location.pathname+window.location.search);router.push('/complete-profile?next='+encodeURIComponent(next));};window.addEventListener('khodrochare:profile-required',open);return()=>window.removeEventListener('khodrochare:profile-required',open);},[router]);
 return null;
}
