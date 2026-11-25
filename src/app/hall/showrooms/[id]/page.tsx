import {ShowroomDetail} from '@/components/showrooms/ShowroomPublic';
export const instant=false;
export default async function Page({params}:{params:Promise<{id:string}>}){const {id}=await params;return <ShowroomDetail id={id}/>;}
