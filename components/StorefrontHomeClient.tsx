"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import SiteHeader, { type StorefrontLocale } from "@/components/SiteHeader";
import type { HomepageBlock, HomepageConfig, HomepageItem } from "@/lib/homepage-api";

export type HomeProduct={
  id:string;slug:string;name:string;description?:string|null;imageUrl?:string|null;
  category?:string|null;price:number;color?:string;inStock:boolean;featured?:boolean;
};
type CartItem=HomeProduct&{qty:number};
const CART_KEY="the1970_cart";

const fmt=(v:number)=>new Intl.NumberFormat("vi-VN").format(v)+"đ";
function tx(item:HomepageItem,key:"title"|"subtitle"|"body"|"cta",locale:StorefrontLocale){
  const vi=item[`${key}Vi` as keyof HomepageItem] as string;
  const en=item[`${key}En` as keyof HomepageItem] as string;
  return locale==="en"?(en||vi):(vi||en);
}

function SlideMedia({item,locale,className=""}:{item:HomepageItem;locale:StorefrontLocale;className?:string}){
  const [index,setIndex]=useState(0);
  const images=item.images||[];
  useEffect(()=>setIndex(0),[item.id,images.length]);
  useEffect(()=>{
    if(item.mediaMode!=="slider"||images.length<2)return;
    const t=window.setInterval(()=>setIndex(x=>(x+1)%images.length),Math.max(1500,Number(item.autoplayMs||5000)));
    return ()=>window.clearInterval(t);
  },[item.mediaMode,item.autoplayMs,images.length]);
  if(!images.length)return <div className={className}/>;
  const image=images[index]||images[0];
  return <div className={`homepage-slide-media ${className}`}>
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img key={image.id} src={image.url} alt={locale==="en"?(image.altEn||image.altVi||""):(image.altVi||image.altEn||"")}/>
    {item.mediaMode==="slider"&&images.length>1?<div className="homepage-slide-dots">
      {images.map((img,i)=><button key={img.id} type="button" className={i===index?"is-active":""} onClick={e=>{e.preventDefault();setIndex(i)}}/> )}
    </div>:null}
  </div>
}

export default function StorefrontHomeClient({products,homepage}:{products:HomeProduct[];homepage:HomepageConfig|null}){
  const [locale,setLocale]=useState<StorefrontLocale>("vi");
  const [cartOpen,setCartOpen]=useState(false);
  const [quick,setQuick]=useState<HomeProduct|null>(null);
  const [cart,setCart]=useState<CartItem[]>([]);

  useEffect(()=>{
    const l=localStorage.getItem("the1970_locale"); if(l==="vi"||l==="en")setLocale(l);
    try{const c=JSON.parse(localStorage.getItem(CART_KEY)||"[]");setCart(Array.isArray(c)?c:[])}catch{setCart([])}
    document.querySelectorAll("header").forEach(node=>{if(!node.classList.contains("the1970-topbar"))(node as HTMLElement).style.display="none"});
    const els=document.querySelectorAll(".fade-up");
    const obs=new IntersectionObserver(entries=>entries.forEach(e=>e.isIntersecting&&e.target.classList.add("show")),{threshold:.12});
    els.forEach(el=>obs.observe(el)); return ()=>obs.disconnect();
  },[]);
  useEffect(()=>{localStorage.setItem(CART_KEY,JSON.stringify(cart))},[cart]);
  useEffect(()=>{localStorage.setItem("the1970_locale",locale);document.documentElement.lang=locale},[locale]);

  const total=useMemo(()=>cart.reduce((s,i)=>s+i.price*i.qty,0),[cart]);
  function add(product:HomeProduct){
    if(!product.inStock)return;
    setCart(old=>{const f=old.find(x=>x.id===product.id);return f?old.map(x=>x.id===product.id?{...x,qty:x.qty+1}:x):[...old,{...product,qty:1}]});
    setQuick(null);setCartOpen(true);
  }

  return <>
    <SiteHeader locale={locale} onLocaleChange={setLocale} onCart={()=>setCartOpen(true)}/>
    <main>{(homepage?.blocks||[]).filter(b=>b.enabled!==false).map(block=>
      <BlockView key={block.id} block={block} locale={locale} products={products} onQuick={setQuick} onBuy={add}/>
    )}</main>

    <div className={`quickview-modal${quick?" open":""}`} aria-hidden={!quick}>
      <button className="quickview-backdrop" type="button" onClick={()=>setQuick(null)}/>
      {quick?<div className="quickview-panel">
        <button className="quickview-close" type="button" onClick={()=>setQuick(null)}>×</button>
        <div className="quickview-grid">
          <div className="quickview-media">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={quick.imageUrl||"/placeholder.svg"} alt={quick.name}/></div>
          <div className="quickview-info"><div className="quickview-kicker">THE 1970</div><h2>{quick.name}</h2>
            <div className="quickview-color">{quick.color||quick.category||""}</div><div className="quickview-price">{fmt(quick.price)}</div>
            <p className="quickview-desc">{quick.description||""}</p>
            <div className="quickview-actions">
              <button className="quickview-addcart" onClick={()=>add(quick)}>{locale==="vi"?"Thêm vào giỏ":"Add to Cart"}</button>
              <Link className="quickview-link" href={`/products/${quick.slug}`}>{locale==="vi"?"Xem chi tiết":"View Detail"}</Link>
            </div>
          </div>
        </div>
      </div>:null}
    </div>

    <div className={`mini-cart${cartOpen?" open":""}`} aria-hidden={!cartOpen}>
      <button className="mini-cart-backdrop" type="button" onClick={()=>setCartOpen(false)}/>
      <aside className="mini-cart-panel">
        <div className="mini-cart-head"><h3>{locale==="vi"?"Giỏ hàng":"Cart"}</h3><button className="mini-cart-close" onClick={()=>setCartOpen(false)}>×</button></div>
        <div className="mini-cart-body">{!cart.length?<div className="mini-cart-empty">{locale==="vi"?"Chưa có sản phẩm nào.":"Your cart is empty."}</div>:
          cart.map(i=><div className="mini-cart-item" key={i.id}>
            {/* eslint-disable-next-line @next/next/no-img-element */}<img src={i.imageUrl||"/placeholder.svg"} alt={i.name}/>
            <div><h4>{i.name}</h4><p>{i.color||i.category||""}</p><div className="mini-cart-meta"><span>SL: {i.qty}</span><strong>{fmt(i.price)}</strong></div>
              <button className="mini-cart-remove" onClick={()=>setCart(old=>old.filter(x=>x.id!==i.id))}>{locale==="vi"?"Xóa":"Remove"}</button></div>
          </div>)}</div>
        <div className="mini-cart-foot"><div className="mini-cart-total"><span>{locale==="vi"?"Tạm tính":"Subtotal"}</span><strong>{fmt(total)}</strong></div>
          <div className="mini-cart-actions"><button className="mini-cart-view" onClick={()=>setCartOpen(false)}>{locale==="vi"?"Tiếp tục xem":"Continue"}</button><Link className="mini-cart-checkout" href="/cart">{locale==="vi"?"Xem giỏ hàng":"View Cart"}</Link></div>
        </div>
      </aside>
    </div>
  </>
}

function BlockView({block,locale,products,onQuick,onBuy}:{block:HomepageBlock;locale:StorefrontLocale;products:HomeProduct[];onQuick:(p:HomeProduct)=>void;onBuy:(p:HomeProduct)=>void}){
  if(block.type==="HERO_SPLIT"){
    const [hero,intro,...mini]=block.items;if(!hero)return null;
    return <section className="the1970-editorial"><div className="the1970-editorial-grid">
      <Link href={hero.link||"#"} className="editorial-hero"><SlideMedia item={hero} locale={locale} className="editorial-hero-image"/><div className="editorial-hero-overlay"/>
        <div className="editorial-hero-content"><div className="editorial-kicker">{tx(hero,"subtitle",locale)}</div><h2>{tx(hero,"title",locale)}</h2>{tx(hero,"body",locale)?<p>{tx(hero,"body",locale)}</p>:null}
          {tx(hero,"cta",locale)?<div className="editorial-hero-actions"><span className="btn-light">{tx(hero,"cta",locale)}</span></div>:null}</div>
      </Link>
      <div className="editorial-side">
        {intro?<Link href={intro.link||"#"} className="editorial-intro has-bg"><SlideMedia item={intro} locale={locale} className="editorial-intro-bg"/><div className="editorial-intro-overlay"/><div className="editorial-intro-inner"><div className="editorial-side-kicker">{tx(intro,"subtitle",locale)}</div><h3>{tx(intro,"title",locale)}</h3>{tx(intro,"body",locale)?<p>{tx(intro,"body",locale)}</p>:null}</div></Link>:<div/>}
        <div className="editorial-mini-grid">{mini.map(item=><Link href={item.link||"#"} className="editorial-mini-card" key={item.id}><SlideMedia item={item} locale={locale} className="editorial-mini-thumb"/><div className="editorial-mini-content"><h4>{tx(item,"title",locale)}</h4><span>{tx(item,"subtitle",locale)}</span></div></Link>)}</div>
      </div>
    </div></section>
  }

  if(block.type==="CARD_ROW")return <section className="the1970-featured-row fade-up"><div className="the1970-featured-grid" style={{gridTemplateColumns:`repeat(${Math.min(4,Math.max(1,block.items.length))},1fr)`}}>
    {block.items.map(item=><Link href={item.link||"#"} className="the1970-featured-card" key={item.id}><div className="the1970-featured-head"><span/><h3>{tx(item,"title",locale)}</h3></div><SlideMedia item={item} locale={locale} className="the1970-featured-image swap-hover"/></Link>)}
  </div></section>

  if(block.type==="STORY_WIDE"){
    const item=block.items[0];if(!item)return null;
    return <section className="the1970-story-block fade-up"><Link href={item.link||"#"} className="the1970-story-media"><SlideMedia item={item} locale={locale}/><div className="the1970-story-overlay"/><div className="the1970-story-content"><div className="the1970-story-kicker">{tx(item,"subtitle",locale)}</div><h2>{tx(item,"title",locale)}</h2>{tx(item,"body",locale)?<p>{tx(item,"body",locale)}</p>:null}{tx(item,"cta",locale)?<span className="the1970-story-btn">{tx(item,"cta",locale)}</span>:null}</div></Link></section>
  }

  if(block.type==="STORY_SPLIT")return <section className="the1970-story-split fade-up">{block.items.map(item=><Link href={item.link||"#"} className="the1970-story-media split" key={item.id}><SlideMedia item={item} locale={locale}/><div className="the1970-story-overlay"/><div className="the1970-story-content"><div className="the1970-story-kicker">{tx(item,"subtitle",locale)}</div><h2>{tx(item,"title",locale)}</h2>{tx(item,"cta",locale)?<span className="the1970-story-btn">{tx(item,"cta",locale)}</span>:null}</div></Link>)}</section>

  if(block.type==="PRODUCT_GRID"){
    const limit=Math.max(1,Math.min(24,Number(block.settings?.limit||8)));
    const src=block.settings?.onlyFeatured===true?products.filter(p=>p.featured):products;
    return <section className="the1970-products-section fade-up"><div className="the1970-products-head"><div className="the1970-products-title"><span/><h2>{locale==="en"?(block.titleEn||block.titleVi):(block.titleVi||block.titleEn)}</h2><span/></div><Link href="/collections/all" className="the1970-products-viewall">{locale==="vi"?"Xem tất cả":"View All"}</Link></div>
      <div className="the1970-products-grid">{src.slice(0,limit).map(p=><article className="product-card" key={p.id}><div className="product-thumb"><Link href={`/products/${p.slug}`}>{/* eslint-disable-next-line @next/next/no-img-element */}<img className="img-main" src={p.imageUrl||"/placeholder.svg"} alt={p.name}/>{/* eslint-disable-next-line @next/next/no-img-element */}<img className="img-hover" src={p.imageUrl||"/placeholder.svg"} alt=""/><div className="product-badge">{p.inStock?"New":locale==="vi"?"Hết hàng":"Sold Out"}</div></Link><div className="product-actions"><button className="btn-quickview" onClick={()=>onQuick(p)}>{locale==="vi"?"Xem nhanh":"Quick View"}</button><button className="btn-buy" disabled={!p.inStock} onClick={()=>onBuy(p)}>{p.inStock?(locale==="vi"?"Mua hàng":"Buy"):(locale==="vi"?"Hết hàng":"Sold Out")}</button></div></div>
        <Link href={`/products/${p.slug}`}><div className="product-info"><h3>{p.name}</h3><p>{p.color||p.category||"THE 1970"}</p><div className="product-bottom"><span className="product-price">{fmt(p.price)}</span><span className="product-more">{locale==="vi"?"Xem":"View"}</span></div></div></Link>
      </article>)}</div>
    </section>
  }
  return null
}
