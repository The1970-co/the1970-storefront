import './globals.css';import {headers} from 'next/headers';import Header from '@/components/Header';import Footer from '@/components/Footer';import {marketFromHost} from '@/lib/market';
export const metadata={title:'THE 1970',description:'The 1970 — Vintage menswear'};
export default async function Layout({children}:{children:React.ReactNode}){const h=await headers();const market=marketFromHost(h.get('host')||'');return <html lang={market.code==='VN'?'vi':'en'}><body><Header market={market.code}/>{children}<Footer market={market.code}/></body></html>}
