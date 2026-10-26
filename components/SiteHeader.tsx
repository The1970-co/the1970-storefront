"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { PublicWebsiteSettings } from "@/lib/website-settings";

type NavLink = { id:string;labelVi:string;labelEn?:string;link:string;enabled:boolean };
type NavColumn = { id:string;titleVi:string;titleEn?:string;links:NavLink[] };
type NavItem = {
  id:string;enabled:boolean;type:"LINK"|"MEGA";labelVi:string;labelEn?:string;
  link:string;columns:NavColumn[];
  promo?:{enabled:boolean;imageUrl:string;titleVi:string;titleEn?:string;link:string};
};
type NavConfig={version:number;items:NavItem[]};

function base() {
  return (
    process.env.NEXT_PUBLIC_CORE_API_URL ||
    "http://localhost:3001"
  ).replace(/\/$/, "");
}

export default function SiteHeader({
  onCart,
  settings,
}: {
  onCart?: () => void;
  settings?: PublicWebsiteSettings;
}) {
  const [mobileOpen,setMobileOpen]=useState(false);
  const [openId,setOpenId]=useState("");
  const [nav,setNav]=useState<NavConfig>({version:1,items:[]});

  useEffect(()=>{
    void fetch(`${base()}/storefront/navigation?market=VN`,{cache:"no-store"})
      .then(r=>r.ok?r.json():null)
      .then(x=>{if(x?.items)setNav(x)})
      .catch(()=>{});
  },[]);

  useEffect(()=>{
    const key=(e:KeyboardEvent)=>{if(e.key==="Escape"){setOpenId("");setMobileOpen(false)}};
    document.addEventListener("keydown",key);
    return()=>document.removeEventListener("keydown",key);
  },[]);

  const items=nav.items.filter(x=>x.enabled);

  return (
    <header className={`the1970-topbar${mobileOpen?" is-mobile-open":""}`}>
      <div className="the1970-topbar-inner">
        <button className="the1970-menu-toggle" type="button"
          onClick={()=>setMobileOpen(v=>!v)}>{mobileOpen?"×":"☰"}</button>

        <Link className="the1970-brand" href="/">THE 1970</Link>

        <nav className="the1970-mainnav">
          {items.map(item=>(
            <div
              key={item.id}
              className={`nav-item${item.type==="MEGA"?" has-dropdown":""}${openId===item.id?" is-open":""}`}
              onMouseEnter={()=>item.type==="MEGA"&&setOpenId(item.id)}
              onMouseLeave={()=>item.type==="MEGA"&&setOpenId("")}
            >
              <Link
                href={item.link||"/"}
                onClick={(e)=>{
                  if(window.matchMedia("(max-width:900px)").matches && item.type==="MEGA" && openId!==item.id){
                    e.preventDefault();setOpenId(item.id);
                  }
                }}
              >
                {item.labelVi}
              </Link>

              {item.type==="MEGA"?(
                <div className="mega-menu mega-menu-full">
                  <div className="mega-menu-full-inner">
                    <div className="mega-menu-columns">
                      {item.columns.map(col=>(
                        <div className="mega-menu-links" key={col.id}>
                          <h4>{col.titleVi}</h4>
                          {col.links.filter(x=>x.enabled).map(link=>(
                            <Link key={link.id} href={link.link||"/"}>{link.labelVi}</Link>
                          ))}
                        </div>
                      ))}
                    </div>

                    {item.promo?.enabled && item.promo.imageUrl?(
                      <Link href={item.promo.link||item.link||"/"} className="mega-menu-wide-promo">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.promo.imageUrl} alt={item.promo.titleVi||item.labelVi}/>
                        <span>{item.promo.titleVi||item.labelVi}</span>
                      </Link>
                    ):null}
                  </div>
                </div>
              ):null}
            </div>
          ))}
        </nav>

        <div className="the1970-top-actions">
          <Link className="the1970-search-action" href="/collections/all">TÌM KIẾM</Link>
          <span className="the1970-language">ENG</span>
          {settings?.cartEnabled ? (
            <button type="button" className="the1970-cart-action" onClick={onCart}>GIỎ HÀNG</button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
