import type { MarketCode } from '@/types/storefront';
export type Market = {code:MarketCode; locale:'vi-VN'|'en-US'; currency:'VND'|'USD'; domain:string};
export function marketFromHost(host=''): Market {
  const clean=host.split(':')[0].toLowerCase();
  const intl=(process.env.INTL_DOMAIN||'the1970.co').toLowerCase();
  if(clean===intl || clean.endsWith('.'+intl)) return {code:'INTL',locale:'en-US',currency:'USD',domain:intl};
  return {code:'VN',locale:'vi-VN',currency:'VND',domain:process.env.VN_DOMAIN||'the1970.vn'};
}
export function t(code:MarketCode){return code==='VN'?{
  new:'HÀNG MỚI',shop:'SẢN PHẨM',jackets:'ÁO KHOÁC',shirts:'SƠ MI',pants:'QUẦN',sale:'SALE',bag:'GIỎ HÀNG',add:'THÊM VÀO GIỎ',view:'XEM SẢN PHẨM',hero:'NEW SEASON',sub:'Vintage menswear, refined for everyday wear.'
}:{new:'NEW ARRIVALS',shop:'SHOP',jackets:'JACKETS',shirts:'SHIRTS',pants:'TROUSERS',sale:'SALE',bag:'BAG',add:'ADD TO BAG',view:'VIEW PRODUCT',hero:'NEW SEASON',sub:'Vintage menswear, refined for everyday wear.'}}
