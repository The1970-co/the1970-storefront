import { NextResponse } from 'next/server';import { customerCoreFetch } from '@/lib/customer-bff';
export async function GET(){const r=await customerCoreFetch('/storefront/auth/me');const data=await r.json().catch(()=>({}));return NextResponse.json(data,{status:r.status});}
