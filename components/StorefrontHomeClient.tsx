"use client";

import Link from "next/link";
import { useEffect, useState, type CSSProperties } from "react";
import type { HomepageConfig, HomepageItem } from "@/lib/homepage-api";

export type HomeProduct = {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  category?: string | null;
  price: number;
  color?: string;
  inStock: boolean;
};

function formatPrice(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value) + "đ";
}

type CmsStyle = Record<string, any>;

function clamp(value: unknown, min: number, max: number, fallback = 0) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, number));
}

function shadowValue(value?: string) {
  if (value === "SOFT") return "0 8px 24px rgba(0,0,0,.08)";
  if (value === "MEDIUM") return "0 14px 34px rgba(0,0,0,.14)";
  if (value === "STRONG") return "0 22px 54px rgba(0,0,0,.22)";
  return "none";
}

function animationClass(style?: CmsStyle) {
  const animation = style?.enterAnimation || "NONE";
  const hover = style?.hoverEffect || "NONE";
  return [
    animation !== "NONE" ? "cms-reveal" : "",
    animation === "FADE" ? "cms-anim-fade" : "",
    animation === "FADE_UP" ? "cms-anim-fade-up" : "",
    animation === "ZOOM_IN" ? "cms-anim-zoom-in" : "",
    hover === "LIFT" ? "cms-hover-lift" : "",
    hover === "ZOOM" ? "cms-hover-zoom" : "",
    hover === "BRIGHTEN" ? "cms-hover-brighten" : "",
  ].filter(Boolean).join(" ");
}

function imagePosition(value?: string) {
  if (value === "TOP") return "center top";
  if (value === "BOTTOM") return "center bottom";
  if (value === "LEFT") return "left center";
  if (value === "RIGHT") return "right center";
  return "center";
}

function styledBox(style?: CmsStyle, isBlock = false): CSSProperties {
  const s = style || {};
  const maxWidth = clamp(s.maxWidthPx, 0, 2400, 0);
  const align = s.containerAlign || "CENTER";
  const marginTop = clamp(s.marginTopPx, 0, 240);
  const marginRight = clamp(s.marginRightPx, 0, 240);
  const marginBottom = clamp(s.marginBottomPx, 0, 240);
  const marginLeft = clamp(s.marginLeftPx, 0, 240);

  const result: CSSProperties = {
    boxSizing: "border-box",
    marginTop: `${marginTop}px`,
    marginRight: `${marginRight}px`,
    marginBottom: `${marginBottom}px`,
    marginLeft: `${marginLeft}px`,
    paddingTop: `${clamp(s.paddingTopPx, 0, 240)}px`,
    paddingRight: `${clamp(s.paddingRightPx, 0, 240)}px`,
    paddingBottom: `${clamp(s.paddingBottomPx, 0, 240)}px`,
    paddingLeft: `${clamp(s.paddingLeftPx, 0, 240)}px`,
    borderRadius: `${clamp(s.radiusPct, 0, 50)}%`,
    background: String(s.backgroundColor || "") || undefined,
    borderStyle: clamp(s.borderWidthPx, 0, 12) > 0 ? "solid" : undefined,
    borderWidth: `${clamp(s.borderWidthPx, 0, 12)}px`,
    borderColor: String(s.borderColor || "") || "transparent",
    boxShadow: shadowValue(s.shadow),
    opacity: clamp(s.opacityPct, 0, 100, 100) / 100,
    overflow: s.overflow === "VISIBLE" ? "visible" : "hidden",
  };

  if (isBlock) {
    const availableWidth = `calc(100% - ${marginLeft + marginRight}px)`;

    // Block full-width phải trừ margin ngang khỏi width.
    // Nếu vẫn giữ width:100% thì margin-right sẽ tràn ra ngoài viewport.
    result.width =
      maxWidth > 0
        ? `min(${maxWidth}px, ${availableWidth})`
        : availableWidth;

    if (maxWidth > 0) {
      if (align === "CENTER") {
        // Auto margin được dùng để căn container; vẫn giữ phần margin tối thiểu
        // bằng wrapper width đã trừ left/right ở trên.
        result.marginLeft = "auto";
        result.marginRight = "auto";
      } else if (align === "RIGHT") {
        result.marginLeft = "auto";
        result.marginRight = `${marginRight}px`;
      } else {
        result.marginLeft = `${marginLeft}px`;
        result.marginRight = "auto";
      }
    }
  }

  return result;
}

function itemStyle(item?: HomepageItem | null): CSSProperties {
  const style = ((item as any)?.style || {}) as CmsStyle;
  const box = styledBox(style);

  // Item con trong CSS Grid không dùng overflow từ generic block.
  // Wrapper CSS sẽ xử lý clipping cho radius, để margin/padding không bị parent nuốt.
  delete box.overflow;

  return {
    ...box,
    boxSizing: "border-box",
    ["--cms-image-fit" as any]:
      style.imageFit === "CONTAIN" ? "contain" : "cover",
    ["--cms-image-position" as any]:
      imagePosition(style.imagePosition),
  };
}

export default function StorefrontHomeClient({
  products,
  homepage,
}: {
  products: HomeProduct[];
  homepage: HomepageConfig | null;
}) {
  const [quick, setQuick] = useState<HomeProduct | null>(null);
  const [previewHomepage,setPreviewHomepage]=useState<HomepageConfig|null>(null);
  const [previewMode,setPreviewMode]=useState(false);
  const [previewSelectedBlockId,setPreviewSelectedBlockId]=useState("");
  const [previewSelectedItemId,setPreviewSelectedItemId]=useState("");

  const homepageConfig=previewHomepage||homepage;

  useEffect(()=>{
    const params=new URLSearchParams(window.location.search);
    const enabled=params.get("cmsPreview")==="1";
    setPreviewMode(enabled);
    if(!enabled)return;

    function onMessage(event:MessageEvent){
      const data=event.data;
      if(!data||typeof data!=="object")return;
      if(data.type==="THE1970_HOMEPAGE_PREVIEW_CONFIG"){
        setPreviewHomepage(data.config||null);
        setPreviewSelectedBlockId(String(data.selectedBlockId||""));
        setPreviewSelectedItemId(String(data.selectedItemId||""));
      }
    }

    window.addEventListener("message",onMessage);
    window.parent?.postMessage({type:"THE1970_HOMEPAGE_PREVIEW_READY"},"*");

    return()=>window.removeEventListener("message",onMessage);
  },[]);

  useEffect(()=>{
    document.body.classList.toggle("cms-preview-mode",previewMode);
    return()=>document.body.classList.remove("cms-preview-mode");
  },[previewMode]);

  useEffect(()=>{
    if(!previewMode)return;

    function onClick(event:MouseEvent){
      const target=event.target as HTMLElement|null;
      const editable=target?.closest?.("[data-cms-block-id]") as HTMLElement|null;
      if(!editable)return;

      event.preventDefault();
      event.stopPropagation();

      const blockId=editable.dataset.cmsBlockId||"";
      const itemId=editable.dataset.cmsItemId||"";

      window.parent?.postMessage({
        type:"THE1970_HOMEPAGE_PREVIEW_SELECT",
        blockId,
        itemId,
      },"*");
    }

    document.addEventListener("click",onClick,true);
    return()=>document.removeEventListener("click",onClick,true);
  },[previewMode]);

  useEffect(() => {
    const nodes = document.querySelectorAll(".fade-up, .cms-reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("show");
        });
      },
      { threshold: 0.14 },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);


  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setQuick(null);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const fullBleedBlock =
    homepageConfig?.blocks?.find(
      (block) => block.enabled && block.type === "FULL_BLEED_HERO",
    ) || null;

  const fullBleedItem = fullBleedBlock?.items?.[0] || null;

  const heroBlock =
    homepageConfig?.blocks?.find(
      (block) => block.enabled && block.type === "HERO_SPLIT",
    ) || null;

  const heroItem = heroBlock?.items?.[0] || null;
  const introItem = heroBlock?.items?.[1] || null;

  const miniFallbacks = [
    {
      title: "Olive Ash",
      subtitle: "COLOR STORY",
      image: "https://cdn0199.cdn4s.com/media/3e12438546111e95cdfb901fd723bd8b.jpg",
      link: "/collections/all",
    },
    {
      title: "Heritage Sage",
      subtitle: "COLOR STORY",
      image: "https://cdn0199.cdn4s.com/media/861%20v%C3%A0ng%208.jpg",
      link: "/collections/all",
    },
    {
      title: "Tobacco",
      subtitle: "COLOR STORY",
      image: "https://cdn0199.cdn4s.com/media/861%20xmas%2090.jpg",
      link: "/collections/all",
    },
    {
      title: "Vintage Navy",
      subtitle: "COLOR STORY",
      image: "https://cdn0199.cdn4s.com/media/861%20%C4%91en%203.jpg",
      link: "/collections/all",
    },
  ];

  const miniItems = miniFallbacks.map((fallback, index) => {
    const item = heroBlock?.items?.[index + 2] || null;
    const image =
      item?.images?.find((entry) => String(entry?.url || "").trim())?.url ||
      fallback.image;

    return {
      item,
      title: item?.titleVi || fallback.title,
      subtitle: item?.subtitleVi || fallback.subtitle,
      image,
      link: item?.link || fallback.link,
    };
  });

  const cardRowBlock=
    homepageConfig?.blocks?.find(
      (block)=>block.enabled&&block.type==="CARD_ROW",
    )||null;
  const storyWideBlock=
    homepageConfig?.blocks?.find(
      (block)=>block.enabled&&block.type==="STORY_WIDE",
    )||null;
  const storySplitBlock=
    homepageConfig?.blocks?.find(
      (block)=>block.enabled&&block.type==="STORY_SPLIT",
    )||null;
  const productGridBlock=
    homepageConfig?.blocks?.find(
      (block)=>block.enabled&&block.type==="PRODUCT_GRID",
    )||null;

  return (
    <>
      <main>
        {fullBleedItem ? (
          <div
            data-cms-block-id={fullBleedBlock?.id || ""}
            data-cms-item-id={fullBleedItem.id}
            data-cms-label="Hero tràn viền"
            className={previewSelectedItemId===fullBleedItem.id?"cms-preview-selected":""}
          >
            <FullBleedHero
              item={fullBleedItem}
              settings={fullBleedBlock?.settings || {}}
            />
          </div>
        ) : null}

        <section
          data-cms-block-id={heroBlock?.id || ""}
          data-cms-label="Hero chia 2 cột"
          className={`the1970-editorial ${animationClass(heroBlock?.settings)} ${previewSelectedBlockId===heroBlock?.id&&!previewSelectedItemId?"cms-preview-selected":""}`.trim()}
          style={styledBox(heroBlock?.settings, true)}
        >
          <div
            className="the1970-editorial-grid"
            style={{
              gridTemplateColumns: `${clamp(heroBlock?.settings?.leftColumnPct, 35, 75, 57)}fr ${100 - clamp(heroBlock?.settings?.leftColumnPct, 35, 75, 57)}fr`,
              columnGap: `${clamp(heroBlock?.settings?.columnGapPx, 0, 120)}px`,
            }}
          >
            <div
              data-cms-block-id={heroBlock?.id || ""}
              data-cms-item-id={heroItem?.id || ""}
              data-cms-label="Hero lớn bên trái"
              className={`editorial-hero cms-styled-item ${animationClass((heroItem as any)?.style)} ${previewSelectedItemId===heroItem?.id?"cms-preview-selected":""}`.trim()}
              style={itemStyle(heroItem)}
            >
              <HeroSlider
                item={heroItem}
                fallbackImage="https://cdn0199.cdn4s.com/media/330ecc7e326b99ef7630ee3d87ffb925.jpg"
              />
              <div className="editorial-hero-overlay" />
              <div className="editorial-hero-content">
                <div className="editorial-kicker">{heroItem?.subtitleVi || "THE 1970 — NEW SEASON"}</div>
                <h2>{heroItem?.titleVi || "Vintage American mood, refined for The 1970."}</h2>
                <p>{heroItem?.bodyVi || "Classic aesthetic."}</p>
                <div className="editorial-hero-actions">
                  <Link href={heroItem?.link || "/collections/all"} className="btn-light">{heroItem?.ctaVi || "Shop New Arrivals"}</Link>
                  <Link href="/collections/all" className="btn-outline">View The Lookbook</Link>
                </div>
              </div>
            </div>

            <div
              className="editorial-side"
              style={{
                gridTemplateRows: `${clamp(heroBlock?.settings?.introHeightPct, 10, 55, 22)}% ${100 - clamp(heroBlock?.settings?.introHeightPct, 10, 55, 22)}%`,
                rowGap: `${clamp(heroBlock?.settings?.cardGapPx, 0, 80)}px`,
              }}
            >
              <Link
                data-cms-block-id={heroBlock?.id || ""}
                data-cms-item-id={introItem?.id || ""}
                data-cms-label="Intro bên phải"
                href={introItem?.link || "/collections/all"}
                className={`editorial-intro has-bg cms-styled-item ${animationClass((introItem as any)?.style)} ${previewSelectedItemId===introItem?.id?"cms-preview-selected":""}`.trim()}
                style={itemStyle(introItem)}
              >
                <div className="editorial-intro-bg">
                  <CmsItemMedia
                    item={introItem}
                    fallbackImage="https://cdn0199.cdn4s.com/media/330ecc7e326b99ef7630ee3d87ffb925.jpg"
                    alt={introItem?.titleVi || "Brand Point Of View"}
                  />
                </div>
                <div className="editorial-intro-overlay" />
                <div className="editorial-intro-inner">
                  <div className="editorial-side-kicker">{introItem?.subtitleVi || "BRAND POINT OF VIEW"}</div>
                  <h3>{introItem?.titleVi || "Less rugged costume. More sharp vintage everyday wear."}</h3>
                  <p>{introItem?.bodyVi || "The 1970 nên có cảm giác sạch hơn raw workwear, ấm hơn minimal basics, và có bản sắc riêng hơn generic streetwear."}</p>
                </div>
              </Link>

              <div
                className="editorial-mini-grid"
                style={{ gap: `${clamp(heroBlock?.settings?.cardGapPx, 0, 80)}px` }}
              >
                {miniItems.map(({ item, title, subtitle, image, link }, index) => (
                  <Link
                    data-cms-block-id={heroBlock?.id || ""}
                    data-cms-item-id={item?.id || ""}
                    data-cms-label={`Card phải ${index+1}`}
                    href={link}
                    className={`editorial-mini-card cms-styled-item ${animationClass((item as any)?.style)} ${previewSelectedItemId===item?.id?"cms-preview-selected":""}`.trim()}
                    style={itemStyle(item)}
                    key={item?.id || `${title}-${index}`}
                  >
                    <div className="editorial-mini-thumb">
                      <CmsItemMedia item={item} fallbackImage={image} alt={title} />
                    </div>
                    <div className="editorial-mini-content">
                      <h4>{title}</h4>
                      <span>{subtitle}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section
          data-cms-block-id={cardRowBlock?.id || ""}
          data-cms-label="Hàng thẻ ảnh"
          className={`the1970-featured-row fade-up ${previewSelectedBlockId===cardRowBlock?.id&&!previewSelectedItemId?"cms-preview-selected":""}`.trim()}
        >
          <div className="the1970-featured-grid">
            <FeaturedCard
              cmsBlockId={cardRowBlock?.id || ""}
              cmsItemId={cardRowBlock?.items?.[0]?.id || ""}
              cmsLabel="Thẻ nổi bật 1"
              selected={previewSelectedItemId===cardRowBlock?.items?.[0]?.id}
              href={cardRowBlock?.items?.[0]?.link || "/collections/all"}
              title={cardRowBlock?.items?.[0]?.titleVi || "Hàng mới về"}
              main="https://cdn0199.cdn4s.com/media/3e12438546111e95cdfb901fd723bd8b.jpg"
              hover="https://cdn0199.cdn4s.com/media/861%20v%C3%A0ng%208.jpg"
            />
            <FeaturedCard
              cmsBlockId={cardRowBlock?.id || ""}
              cmsItemId={cardRowBlock?.items?.[1]?.id || ""}
              cmsLabel="Thẻ nổi bật 2"
              selected={previewSelectedItemId===cardRowBlock?.items?.[1]?.id}
              href={cardRowBlock?.items?.[1]?.link || "/collections/all"}
              title={cardRowBlock?.items?.[1]?.titleVi || "Best Seller"}
              main="https://cdn0199.cdn4s.com/media/861%20xmas%2090.jpg"
              hover="https://cdn0199.cdn4s.com/media/861%20%C4%91en%203.jpg"
            />
            <FeaturedCard
              cmsBlockId={cardRowBlock?.id || ""}
              cmsItemId={cardRowBlock?.items?.[2]?.id || ""}
              cmsLabel="Thẻ nổi bật 3"
              selected={previewSelectedItemId===cardRowBlock?.items?.[2]?.id}
              href={cardRowBlock?.items?.[2]?.link || "/collections/all"}
              title={cardRowBlock?.items?.[2]?.titleVi || "BST Theo Mùa"}
              main="https://cdn0199.cdn4s.com/media/330ecc7e326b99ef7630ee3d87ffb925.jpg"
              hover="https://cdn0199.cdn4s.com/media/861%20xmas%2090.jpg"
            />
          </div>
        </section>

        <section
          data-cms-block-id={storyWideBlock?.id || ""}
          data-cms-item-id={storyWideBlock?.items?.[0]?.id || ""}
          data-cms-label="Bài editorial lớn"
          className={`the1970-story-block fade-up ${previewSelectedItemId===storyWideBlock?.items?.[0]?.id?"cms-preview-selected":""}`.trim()}
        >
          <Link href={storyWideBlock?.items?.[0]?.link || "/collections/all"} className="the1970-story-media">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://cdn0199.cdn4s.com/media/330ecc7e326b99ef7630ee3d87ffb925.jpg" alt="The 1970 Story" />
            <div className="the1970-story-overlay" />
            <div className="the1970-story-content">
              <div className="the1970-story-kicker">THE 1970 JOURNAL</div>
              <h2>Seasonal layers, vintage tones, and everyday American mood.</h2>
              <p>Khám phá câu chuyện hình ảnh và những sản phẩm nổi bật của mùa này.</p>
              <span className="the1970-story-btn">Explore Editorial</span>
            </div>
          </Link>
        </section>

        <section
          data-cms-block-id={storySplitBlock?.id || ""}
          data-cms-label="Hai bài editorial"
          className={`the1970-story-split fade-up ${previewSelectedBlockId===storySplitBlock?.id&&!previewSelectedItemId?"cms-preview-selected":""}`.trim()}
        >
          <StorySplit
            cmsBlockId={storySplitBlock?.id || ""}
            cmsItemId={storySplitBlock?.items?.[0]?.id || ""}
            cmsLabel="Editorial trái"
            selected={previewSelectedItemId===storySplitBlock?.items?.[0]?.id}
            href={storySplitBlock?.items?.[0]?.link || "/collections/all"}
            image={storySplitBlock?.items?.[0]?.images?.[0]?.url || "https://cdn0199.cdn4s.com/media/861%20v%C3%A0ng%208.jpg"}
            kicker="NEW ARRIVALS"
            title="Refined essentials, built for everyday wear."
            button="Shop New"
          />
          <StorySplit
            cmsBlockId={storySplitBlock?.id || ""}
            cmsItemId={storySplitBlock?.items?.[1]?.id || ""}
            cmsLabel="Editorial phải"
            selected={previewSelectedItemId===storySplitBlock?.items?.[1]?.id}
            href={storySplitBlock?.items?.[1]?.link || "/collections/all"}
            image={storySplitBlock?.items?.[1]?.images?.[0]?.url || "https://cdn0199.cdn4s.com/media/861%20%C4%91en%203.jpg"}
            kicker="BEST SELLERS"
            title="Timeless pieces that define The 1970."
            button="Explore"
          />
        </section>

        <section className="the1970-products-section fade-up">
          <div className="the1970-products-head">
            <div className="the1970-products-title">
              <span />
              <h2>Sản phẩm nổi bật</h2>
              <span />
            </div>
            <Link href="/collections/all" className="the1970-products-viewall">View All</Link>
          </div>

          <div className="the1970-products-grid">
            {products.slice(0, 8).map((p) => (
              <article className={`product-card${p.inStock ? "" : " the1970-home-product-disabled"}`} key={p.id}>
                <div className="product-thumb">
                  <Link className="the1970-home-product-link" href={`/products/${p.slug}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img className="img-main" src={p.imageUrl || "/placeholder.svg"} alt={p.name} />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img className="img-hover" src={p.imageUrl || "/placeholder.svg"} alt="" />
                    <div className="product-badge">{p.inStock ? "New" : "Sold Out"}</div>
                  </Link>

                  <div className="product-actions">
                    <button type="button" className="btn-quickview" onClick={() => setQuick(p)}>
                      Quick View
                    </button>
                    {p.inStock ? (
                      <Link className="btn-buy" href={`/products/${p.slug}`}>
                        Chọn size
                      </Link>
                    ) : (
                      <button type="button" className="btn-buy" disabled>
                        Hết hàng
                      </button>
                    )}
                  </div>
                </div>

                <Link className="the1970-home-product-link" href={`/products/${p.slug}`}>
                  <div className="product-info">
                    <h3>{p.name}</h3>
                    <p>{p.color || p.category || "THE 1970"}</p>
                    <div className="product-bottom">
                      <span className="product-price">{formatPrice(p.price)}</span>
                      <span className="product-more">View</span>
                    </div>
                    <div className="the1970-home-product-stock">{p.inStock ? "Còn hàng" : "Hết hàng"}</div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </section>
      </main>

      <div className={`quickview-modal${quick ? " open" : ""}`} aria-hidden={!quick}>
        <button className="quickview-backdrop" type="button" aria-label="Đóng" onClick={() => setQuick(null)} />
        {quick ? (
          <div className="quickview-panel">
            <button className="quickview-close" type="button" onClick={() => setQuick(null)}>×</button>
            <div className="quickview-grid">
              <div className="quickview-media">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={quick.imageUrl || "/placeholder.svg"} alt={quick.name} />
              </div>
              <div className="quickview-info">
                <div className="quickview-kicker">THE 1970</div>
                <h2>{quick.name}</h2>
                <div className="quickview-color">{quick.color || quick.category || ""}</div>
                <div className="quickview-price">{formatPrice(quick.price)}</div>
                <p className="quickview-desc">{quick.description || ""}</p>
                <div className="quickview-actions">
                  {quick.inStock ? (
                    <Link className="quickview-addcart" href={`/products/${quick.slug}`}>
                      Chọn màu / size
                    </Link>
                  ) : (
                    <button className="quickview-addcart" type="button" disabled>
                      Hết hàng
                    </button>
                  )}
                  <Link className="quickview-link" href={`/products/${quick.slug}`}>Xem chi tiết</Link>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>

    </>
  );
}



function CmsItemMedia({
  item,
  fallbackImage,
  alt,
}: {
  item: HomepageItem | null;
  fallbackImage: string;
  alt: string;
}) {
  const images =
    item?.images?.filter((image) => String(image?.url || "").trim()) || [];
  const slides = images.length
    ? images
    : [{ id: "fallback", url: fallbackImage, altVi: alt }];

  const [index, setIndex] = useState(0);
  const sliderEnabled = slides.length > 1;

  useEffect(() => {
    setIndex(0);
  }, [item?.id, slides.length]);

  useEffect(() => {
    if (!sliderEnabled) return;
    const delay = Math.max(1500, Number(item?.autoplayMs || 5000));
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, delay);
    return () => window.clearInterval(timer);
  }, [sliderEnabled, slides.length, item?.autoplayMs]);

  return (
    <div className="cms-item-media cms-media-slider">
      {slides.map((image, imageIndex) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={image.id || image.url}
          src={image.url}
          alt={image.altVi || alt}
          className={imageIndex === index ? "is-active" : ""}
        />
      ))}
    </div>
  );
}

function FullBleedHero({
  item,
  settings,
}: {
  item: HomepageItem;
  settings: Record<string, any>;
}) {
  const heightVh = Math.max(45, Math.min(100, Number(settings?.heightVh || 82)));
  const overlayOpacity = Math.max(
    0,
    Math.min(0.7, Number(settings?.overlayOpacity ?? 0.24)),
  );
  const align =
    settings?.contentAlign === "CENTER"
      ? "CENTER"
      : settings?.contentAlign === "RIGHT"
        ? "RIGHT"
        : "LEFT";

  return (
    <section
      className={`cms-fullbleed-hero align-${align.toLowerCase()} ${animationClass(settings)}`.trim()}
      style={{
        ...styledBox(settings, true),
        minHeight: `${heightVh}vh`,
        ["--fullbleed-overlay" as any]: overlayOpacity,
      }}
    >
      <div className="cms-fullbleed-media">
        {item.mediaType === "video" && item.videoUrl ? (
          <video
            src={item.videoUrl}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          />
        ) : (
          <HeroSlider
            item={item}
            fallbackImage=""
            className="cms-fullbleed-slider"
          />
        )}
      </div>

      <div className="cms-fullbleed-overlay" />

      <div className="cms-fullbleed-content">
        {item.subtitleVi ? (
          <div className="cms-fullbleed-kicker">{item.subtitleVi}</div>
        ) : null}

        {item.titleVi ? <h1>{item.titleVi}</h1> : null}
        {item.bodyVi ? <p>{item.bodyVi}</p> : null}

        {item.ctaVi ? (
          <Link
            href={item.link || "/collections/all"}
            className="cms-fullbleed-cta"
          >
            {item.ctaVi}
          </Link>
        ) : null}
      </div>
    </section>
  );
}


function HeroSlider({
  item,
  fallbackImage,
  className = "",
}: {
  item: HomepageItem | null;
  fallbackImage: string;
  className?: string;
}) {
  const images =
    item?.images?.filter((image) => String(image?.url || "").trim()) || [];
  const slides = images.length
    ? images
    : fallbackImage
      ? [{ id: "fallback", url: fallbackImage, altVi: "The 1970 Hero" }]
      : [];

  const sliderEnabled = slides.length > 1;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [item?.id, slides.length]);

  useEffect(() => {
    if (!sliderEnabled) return;
    const delay = Math.max(1500, Number(item?.autoplayMs || 5000));
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, delay);
    return () => window.clearInterval(timer);
  }, [sliderEnabled, slides.length, item?.autoplayMs]);

  return (
    <div className={`editorial-hero-image cms-media-slider ${className}`.trim()}>
      {slides.map((image, imageIndex) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={image.id || image.url}
          src={image.url}
          alt={image.altVi || item?.titleVi || "The 1970 Hero"}
          className={imageIndex === index ? "is-active" : ""}
        />
      ))}

      {sliderEnabled ? (
        <div className="cms-slider-dots" aria-label="Hero slider">
          {slides.map((image, imageIndex) => (
            <button
              key={image.id || image.url}
              type="button"
              className={imageIndex === index ? "is-active" : ""}
              aria-label={`Ảnh ${imageIndex + 1}`}
              onClick={() => setIndex(imageIndex)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function FeaturedCard({
  href,
  title,
  main,
  hover,
  cmsBlockId,
  cmsItemId,
  cmsLabel,
  selected,
}: {
  href: string;
  title: string;
  main: string;
  hover: string;
  cmsBlockId?: string;
  cmsItemId?: string;
  cmsLabel?: string;
  selected?: boolean;
}) {
  return (
    <Link
      data-cms-block-id={cmsBlockId || ""}
      data-cms-item-id={cmsItemId || ""}
      data-cms-label={cmsLabel || "Thẻ ảnh"}
      href={href}
      className={`the1970-featured-card ${selected?"cms-preview-selected":""}`.trim()}
    >
      <div className="the1970-featured-head"><span /><h3>{title}</h3></div>
      <div className="the1970-featured-image swap-hover">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="img-main" src={main} alt={title} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="img-hover" src={hover} alt="" />
      </div>
    </Link>
  );
}

function StorySplit({
  href,
  image,
  kicker,
  title,
  button,
  cmsBlockId,
  cmsItemId,
  cmsLabel,
  selected,
}: {
  href: string;
  image: string;
  kicker: string;
  title: string;
  button: string;
  cmsBlockId?: string;
  cmsItemId?: string;
  cmsLabel?: string;
  selected?: boolean;
}) {
  return (
    <Link
      data-cms-block-id={cmsBlockId || ""}
      data-cms-item-id={cmsItemId || ""}
      data-cms-label={cmsLabel || "Editorial"}
      href={href}
      className={`the1970-story-media split ${selected?"cms-preview-selected":""}`.trim()}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={image} alt={title} />
      <div className="the1970-story-overlay" />
      <div className="the1970-story-content">
        <div className="the1970-story-kicker">{kicker}</div>
        <h2>{title}</h2>
        <span className="the1970-story-btn">{button}</span>
      </div>
    </Link>
  );
}
