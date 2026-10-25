import { NextResponse } from 'next/server';import { customerCoreFetch } from '@/lib/customer-bff';
export async function GET(){const r=await customerCoreFetch('/storefront/orders');const data=await r.json().catch(()=>[]);return NextResponse.json(data,{status:r.status});}
