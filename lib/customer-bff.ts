import { cookies } from 'next/headers';
const ACCESS='the1970_customer_access';
const REFRESH='the1970_customer_refresh';
export async function customerCoreFetch(path:string, init:RequestInit={}){
  const base=process.env.CORE_API_URL?.replace(/\/$/,''); if(!base) return new Response(JSON.stringify({message:'CORE_API_URL missing'}),{status:503});
  const jar=await cookies();
  const token=jar.get(ACCESS)?.value;
  const headers=new Headers(init.headers); headers.set('Content-Type','application/json'); if(token) headers.set('Authorization',`Bearer ${token}`);
  return fetch(base+path,{...init,headers,cache:'no-store'});
}
export const customerCookieNames={ACCESS,REFRESH};
export function authCookieOptions(maxAge:number){return{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax' as const,path:'/',maxAge}}
