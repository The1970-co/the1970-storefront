"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import type { HomepageConfig, HomepageItem } from "@/lib/homepage-api";
import type { PublicWebsiteSettings } from "@/lib/website-settings";

export type HomeProduct = {
  id:string;slug:string;name:string;description?:string|null;imageUrl?:string|null;
  category?:string|null;price:number;color?:string;inStock:boolean;
};

function money(v:number){return new Intl.NumberFormat("vi-VN").format(v)+"đ";}

export default function StorefrontHomeClient({
  products, homepage, settings,
}:{
  products:HomeProduct[];
  homepage:HomepageConfig|null;
  settings:PublicWebsiteSettings;
}) {
  const [cartOpen,setCartOpen]=useState(false);
  const blocks=(homepage?.blocks||[]).filter(b=>b.enabled);

  return <>
    <SiteHeader settings={settings} onCart={()=>setCartOpen(true)} />
    <main>
      {blocks.map(block=>{
        if(block.type==="HERO_SPLIT"){
          const [hero,intro,...cards]=block.items;
          return <section className="the1970-editorial" key={block.id}>
            <div className="the1970-editorial-grid">
              {hero?<Hero item={hero}/>:null}
              <div className="editorial-side">
                {intro?<Intro item={intro}/>:null}
                <div className="editorial-mini-grid">
                  {cards.slice(0,4).map(item=><MiniCard key={item.id} item={item}/>)}
                </div>
              </div>
            </div>
          </section>
        }
        if(block.type==="CARD_ROW"){
          return <section className="the1970-featured-row fade-up" key={block.id}>
            <div className="the1970-featured-grid">
              {block.items.map(item=><Featured key={item.id} item={item}/>)}
            </div>
          </section>
        }
        if(block.type==="STORY_WIDE"){
          return <section className="the1970-story-block fade-up" key={block.id}>
            {block.items[0]?<Story item={block.items[0]} split={false}/>:null}
          </section>
        }
        if(block.type==="STORY_SPLIT"){
          return <section className="the1970-story-split fade-up" key={block.id}>
            {block.items.map(item=><Story key={item.id} item={item} split/>)}
          </section>
        }
        if(block.type==="PRODUCT_GRID"){
          const limit=Math.max(1,Number(block.settings?.limit||8));
          const rows=block.settings?.onlyFeatured ? products.slice(0,limit) : products.slice(0,limit);
          return <section className="the1970-products-section fade-up" key={block.id}>
            <div className="the1970-products-head">
              <div className="the1970-products-title"><span/><h2>{block.titleVi||"Sản phẩm nổi bật"}</h2><span/></div>
              <Link href="/collections/all" className="the1970-products-viewall">Xem tất cả</Link>
            </div>
            <div className="the1970-products-grid">
              {rows.map(p=><ProductCard key={p.id} p={p}/>)}
            </div>
          </section>
        }
        return null;
      })}
    </main>

    {settings.cartEnabled ? (
      <div className={`mini-cart${cartOpen?" open":""}`}>
        <button className="mini-cart-backdrop" type="button" onClick={()=>setCartOpen(false)}/>
        <aside className="mini-cart-panel">
          <div className="mini-cart-head"><h3>Giỏ hàng</h3><button onClick={()=>setCartOpen(false)}>×</button></div>
          <div className="mini-cart-body">
            <p style={{fontSize:13}}>Chọn màu/size ở trang chi tiết sản phẩm để thêm vào giỏ.</p>
          </div>
          <div className="mini-cart-foot">
            <div className="mini-cart-actions">
              <button className="mini-cart-view" onClick={()=>setCartOpen(false)}>Tiếp tục xem</button>
              <Link href="/cart" className="mini-cart-checkout">Xem giỏ hàng</Link>
            </div>
          </div>
        </aside>
      </div>
    ):null}
  </>
}

function SlideMedia({item,className}:{item:HomepageItem;className:string}) {
  const images=item.images||[];
  const [index,setIndex]=useState(0);
  const slider=item.mediaMode==="slider" && images.length>1;
  useEffect(()=>{
    if(!slider)return;
    const t=setInterval(()=>setIndex(i=>(i+1)%images.length),Math.max(1500,Number(item.autoplayMs||5000)));
    return()=>clearInterval(t);
  },[slider,images.length,item.autoplayMs]);
  if(!images.length)return <div className={className}/>;
  return <div className={`${className} cms-media-slider`}>
    {images.map((img,i)=><img key={img.id||img.url} src={img.url} alt={img.altVi||item.titleVi||""}
      className={i===index?"is-active":""}/>)}
    {slider?<div className="cms-slider-dots">
      {images.map((_,i)=><button key={i} onClick={()=>setIndex(i)} className={i===index?"is-active":""}/>)}
    </div>:null}
  </div>
}

function Hero({item}:{item:HomepageItem}) {
  return <div className="editorial-hero">
    <SlideMedia item={item} className="editorial-hero-image"/>
    <div className="editorial-hero-overlay"/>
    <div className="editorial-hero-content">
      <div className="editorial-kicker">{item.subtitleVi}</div>
      <h2>{item.titleVi}</h2><p>{item.bodyVi}</p>
      {item.ctaVi?<div className="editorial-hero-actions"><Link href={item.link||"/collections/all"} className="btn-light">{item.ctaVi}</Link></div>:null}
    </div>
  </div>
}
function Intro({item}:{item:HomepageItem}) {
  return <div className="editorial-intro has-bg">
    <SlideMedia item={item} className="editorial-intro-bg"/>
    <div className="editorial-intro-overlay"/>
    <div className="editorial-intro-inner">
      <div className="editorial-side-kicker">{item.subtitleVi}</div>
      <h3>{item.titleVi}</h3><p>{item.bodyVi}</p>
    </div>
  </div>
}
function MiniCard({item}:{item:HomepageItem}) {
  return <Link href={item.link||"/collections/all"} className="editorial-mini-card">
    <SlideMedia item={item} className="editorial-mini-thumb"/>
    <div className="editorial-mini-content"><h4>{item.titleVi}</h4><span>{item.subtitleVi}</span></div>
  </Link>
}
function Featured({item}:{item:HomepageItem}) {
  return <Link href={item.link||"/collections/all"} className="the1970-featured-card">
    <div className="the1970-featured-head"><span/><h3>{item.titleVi}</h3></div>
    <SlideMedia item={item} className="the1970-featured-image"/>
  </Link>
}
function Story({item,split}:{item:HomepageItem;split:boolean}) {
  return <Link href={item.link||"/collections/all"} className={`the1970-story-media${split?" split":""}`}>
    <SlideMedia item={item} className="the1970-story-cms-media"/>
    <div className="the1970-story-overlay"/>
    <div className="the1970-story-content">
      <div className="the1970-story-kicker">{item.subtitleVi}</div>
      <h2>{item.titleVi}</h2><p>{item.bodyVi}</p>
      {item.ctaVi?<span className="the1970-story-btn">{item.ctaVi}</span>:null}
    </div>
  </Link>
}
function ProductCard({p}:{p:HomeProduct}) {
  return <article className={`product-card${p.inStock?"":" the1970-home-product-disabled"}`}>
    <Link href={`/products/${p.slug}`} className="the1970-home-product-link">
      <div className="product-thumb">
        <img className="img-main" src={p.imageUrl||"/placeholder.svg"} alt={p.name}/>
        <img className="img-hover" src={p.imageUrl||"/placeholder.svg"} alt=""/>
        <div className="product-badge">{p.inStock?"New":"Sold Out"}</div>
      </div>
      <div className="product-info">
        <h3>{p.name}</h3><p>{p.color||p.category||"THE 1970"}</p>
        <div className="product-bottom"><span className="product-price">{money(p.price)}</span><span className="product-more">View</span></div>
      </div>
    </Link>
  </article>
}
