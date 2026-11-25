import Dashboard from '@/components/Dashboard';
export const instant=false;
export default async function Page({params}:{params:Promise<{id:string}>}){const {id}=await params;return <Dashboard key={id} hallRoute={{view:'showroomDetail',id}}/>;}
