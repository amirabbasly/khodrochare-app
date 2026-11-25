export type Person={name:string;bio:string;phone:string;position:string;photoId?:string};
export type Account={userId?:string;name:string;ownerName:string;activityType:string;province:string;city:string;district:string;landline:string;address:string;isActive?:boolean};
export type ShowroomDraft={location?:{province:string;city:string;district:string;landline:string;address:string};name:string;slogan:string;biography:string;manager:Person;staff:Person[]};
export type Showroom={id:string;ownerId:string;status:string;isActive:boolean;version:number;draft:ShowroomDraft;reviewNote?:string;photos:{id:string;kind:string;url:string}[];location:{province:string;city:string;district:string;address:string;landline:string};account?:Account;campaign?:Campaign;inventory?:{items:import('../hall/types').Listing[];total:number;page:number;limit:number}};
export type Campaign={id:string;bidToman:number;balanceToman:number;isActive:boolean};
export const statuses:Record<string,string>={DRAFT:'پیش‌نویس',PENDING_REVIEW:'در صف بررسی',PUBLISHED:'منتشرشده',REJECTED:'نیازمند اصلاح',DISABLED:'غیرفعال'};
export const money=(value:number)=>value.toLocaleString('fa-IR')+' تومان';
