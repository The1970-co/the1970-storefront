"use client";

import "./cart.css";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type CartItem={
  productId:string;variantId:string;slug?:string;name:string;color:string;size:string;
  price:number;image:string;qty:number;
};
type Settings={
  cartEnabled:boolean;checkoutEnabled:boolean;newCustomerDiscountEnabled:boolean;
  newCustomerDiscountPercent:number;messengerEnabled:boolean;messengerUrl?:string|null;
  zaloEnabled:boolean;zaloUrl?:string|null;
};

const CART_KEY="the1970_cart";
const base=()=> (process.env.NEXT_PUBLIC_CORE_API_URL||"http://localhost:3001").replace(/\/$/,"");
const money=(v:number)=>new Intl.NumberFormat("vi-VN").format(v)+"đ";

export default function CartPage(){
  const [items,setItems]=useState<CartItem[]>([]);
  const [settings,setSettings]=useState<Settings|null>(null);
  const [form,setForm]=useState({fullName:"",phone:"",email:"",addressLine1:"",addressLine2:"",ward:"",district:"",province:"",note:""});
  const [quote,setQuote]=useState<any>(null);
  const [order,setOrder]=useState<any>(null);
  const [error,setError]=useState("");
  const [busy,setBusy]=useState(false);

  useEffect(()=>{
    try{const x=JSON.parse(localStorage.getItem(CART_KEY)||"[]");setItems(Array.isArray(x)?x:[])}catch{}
    void fetch(`${base()}/storefront/settings?market=VN`).then(r=>r.json()).then(setSettings).catch(()=>{});
  },[]);

  useEffect(()=>{localStorage.setItem(CART_KEY,JSON.stringify(items));window.dispatchEvent(new Event("the1970-cart-updated"))},[items]);

  const subtotal=useMemo(()=>items.reduce((s,x)=>s+Number(x.price||0)*Number(x.qty||0),0),[items]);

  async function getQuote(){
    if(!form.phone)return setError("Nhập số điện thoại trước.");
    try{
      setBusy(true);setError("");
      const r=await fetch(`${base()}/storefront/commerce/quote`,{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({market:"VN",phone:form.phone,items:items.map(x=>({variantId:x.variantId,qty:x.qty}))})
      });
      const j=await r.json().catch(()=>null);if(!r.ok)throw new Error(j?.message||"Không tính được ưu đãi.");
      setQuote(j);
    }catch(e){setError(e instanceof Error?e.message:"Lỗi quote.")}finally{setBusy(false)}
  }

  async function checkout(){
    try{
      setBusy(true);setError("");
      const r=await fetch(`${base()}/storefront/commerce/orders`,{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({...form,market:"VN",items:items.map(x=>({variantId:x.variantId,qty:x.qty}))})
      });
      const j=await r.json().catch(()=>null);if(!r.ok)throw new Error(j?.message||"Không tạo được đơn.");
      setOrder(j);localStorage.removeItem(CART_KEY);window.dispatchEvent(new Event("the1970-cart-updated"));setItems([]);
    }catch(e){setError(e instanceof Error?e.message:"Không tạo được đơn.")}finally{setBusy(false)}
  }

  if(settings && !settings.cartEnabled){
    return <main className="web-cart-shell"><h1>Giỏ hàng đang tắt</h1><Link href="/">Quay lại trang chủ</Link></main>
  }

  if(order){
    return <main className="web-cart-shell">
      <div className="web-order-success">
        <div className="web-cart-kicker">THE 1970</div>
        <h1>Đã tạo đơn {order.orderCode}</h1>
        <p>Tổng thanh toán: <strong>{money(order.finalAmount)}</strong></p>
        <h2>Nhắn tin cho shop</h2>
        <div className="web-message-buttons">
          {order.messengerUrl?<a href={order.messengerUrl} target="_blank" rel="noreferrer">Messenger</a>:null}
          {order.zaloUrl?<a href={order.zaloUrl} target="_blank" rel="noreferrer">Zalo</a>:null}
        </div>
        <p className="web-cart-note">Thiết bị của khách cần đăng nhập Messenger/Zalo để tiếp tục cuộc trò chuyện.</p>
      </div>
    </main>
  }

  return <main className="web-cart-shell">
    <div className="web-cart-head"><div className="web-cart-kicker">THE 1970</div><h1>Giỏ hàng</h1></div>
    <div className="web-cart-grid">
      <section>
        {items.length?items.map((x,i)=><article className="web-cart-item" key={`${x.variantId}-${i}`}>
          <img src={x.image||"/placeholder.svg"} alt={x.name}/>
          <div><Link href={x.slug?`/products/${x.slug}`:"#"}>{x.name}</Link><p>{x.color} / {x.size}</p>
          <div className="web-cart-qty"><button onClick={()=>setItems(v=>v.map((a,j)=>j===i?{...a,qty:Math.max(1,a.qty-1)}:a))}>−</button><span>{x.qty}</span><button onClick={()=>setItems(v=>v.map((a,j)=>j===i?{...a,qty:a.qty+1}:a))}>+</button></div>
          <button className="web-remove" onClick={()=>setItems(v=>v.filter((_,j)=>j!==i))}>Xóa</button></div>
          <strong>{money(x.price*x.qty)}</strong>
        </article>):<p>Chưa có sản phẩm trong giỏ.</p>}
      </section>

      <aside className="web-checkout">
        <h2>Thông tin nhận hàng</h2>
        {["fullName","phone","email","addressLine1","addressLine2","ward","district","province","note"].map(k=>
          <input key={k} value={(form as any)[k]} onChange={e=>setForm(v=>({...v,[k]:e.target.value}))}
            placeholder={({fullName:"Họ tên",phone:"Số điện thoại",email:"Email",addressLine1:"Địa chỉ",addressLine2:"Địa chỉ bổ sung",ward:"Phường/Xã",district:"Quận/Huyện",province:"Tỉnh/Thành",note:"Ghi chú"} as any)[k]}
          />)}
        <button className="web-quote-btn" disabled={busy||!items.length} onClick={()=>void getQuote()}>Kiểm tra ưu đãi theo SĐT</button>
        <div className="web-summary"><span>Tạm tính</span><strong>{money(subtotal)}</strong></div>
        {quote?<><div className="web-summary"><span>Ưu đãi {quote.discountPercent}% {quote.isNewCustomer?"(khách mới)":""}</span><strong>-{money(quote.discountAmount)}</strong></div>
        <div className="web-summary total"><span>Thanh toán</span><strong>{money(quote.finalAmount)}</strong></div></>:null}
        {error?<div className="web-cart-error">{error}</div>:null}
        {settings?.checkoutEnabled?<button className="web-checkout-btn" disabled={busy||!items.length} onClick={()=>void checkout()}>{busy?"Đang xử lý...":"Tạo đơn hàng"}</button>:<p className="web-cart-note">Checkout hiện đang tắt trong Cài đặt website.</p>}
      </aside>
    </div>
  </main>
}
