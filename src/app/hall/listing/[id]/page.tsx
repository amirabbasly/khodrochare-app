import {PublicListing} from '@/components/showrooms/PublicListing';
export const instant=false;
export default async function Page({params}:{params:Promise<{id:string}>}){const {id}=await params;return <PublicListing id={id}/>;}
