import { NextResponse } from 'next/server';import { customerCoreFetch } from '@/lib/customer-bff';
export async function GET(_:Request,{params}:{params:Promise<{id:string}>}){const {id}=await params;const r=await customerCoreFetch('/storefront/orders/'+encodeURIComponent(id));const data=await r.json().catch(()=>({}));return NextResponse.json(data,{status:r.status});}
