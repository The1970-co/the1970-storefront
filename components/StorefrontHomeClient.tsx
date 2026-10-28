"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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

export default function StorefrontHomeClient({
  products,
  homepage,
}: {
  products: HomeProduct[];
  homepage: HomepageConfig | null;
}) {
  const [quick, setQuick] = useState<HomeProduct | null>(null);

  useEffect(() => {
    const nodes = document.querySelectorAll(".fade-up");
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
    homepage?.blocks?.find(
      (block) => block.enabled && block.type === "FULL_BLEED_HERO",
    ) || null;

  const fullBleedItem = fullBleedBlock?.items?.[0] || null;

  const heroItem =
    homepage?.blocks
      ?.find((block) => block.enabled && block.type === "HERO_SPLIT")
      ?.items?.[0] || null;

  return (
    <>
      <main>
        {fullBleedItem ? (
          <FullBleedHero
            item={fullBleedItem}
            settings={fullBleedBlock?.settings || {}}
          />
        ) : null}

        <section className="the1970-editorial">
          <div className="the1970-editorial-grid">
            <div className="editorial-hero">
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

            <div className="editorial-side">
              <div className="editorial-intro has-bg">
                <div className="editorial-intro-bg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="https://cdn0199.cdn4s.com/media/330ecc7e326b99ef7630ee3d87ffb925.jpg" alt="Brand Point Of View" />
                </div>
                <div className="editorial-intro-overlay" />
                <div className="editorial-intro-inner">
                  <div className="editorial-side-kicker">BRAND POINT OF VIEW</div>
                  <h3>Less rugged costume. More sharp vintage everyday wear.</h3>
                  <p>The 1970 nên có cảm giác sạch hơn raw workwear, ấm hơn minimal basics, và có bản sắc riêng hơn generic streetwear.</p>
                </div>
              </div>

              <div className="editorial-mini-grid">
                {[
                  ["Olive Ash", "https://cdn0199.cdn4s.com/media/3e12438546111e95cdfb901fd723bd8b.jpg"],
                  ["Heritage Sage", "https://cdn0199.cdn4s.com/media/861%20v%C3%A0ng%208.jpg"],
                  ["Tobacco", "https://cdn0199.cdn4s.com/media/861%20xmas%2090.jpg"],
                  ["Vintage Navy", "https://cdn0199.cdn4s.com/media/861%20%C4%91en%203.jpg"],
                ].map(([name, image]) => (
                  <Link href="/collections/all" className="editorial-mini-card" key={name}>
                    <div className="editorial-mini-thumb">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={image} alt={name} />
                    </div>
                    <div className="editorial-mini-content">
                      <h4>{name}</h4>
                      <span>COLOR STORY</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="the1970-featured-row fade-up">
          <div className="the1970-featured-grid">
            <FeaturedCard
              href="/collections/all"
              title="Hàng mới về"
              main="https://cdn0199.cdn4s.com/media/3e12438546111e95cdfb901fd723bd8b.jpg"
              hover="https://cdn0199.cdn4s.com/media/861%20v%C3%A0ng%208.jpg"
            />
            <FeaturedCard
              href="/collections/all"
              title="Best Seller"
              main="https://cdn0199.cdn4s.com/media/861%20xmas%2090.jpg"
              hover="https://cdn0199.cdn4s.com/media/861%20%C4%91en%203.jpg"
            />
            <FeaturedCard
              href="/collections/all"
              title="BST Theo Mùa"
              main="https://cdn0199.cdn4s.com/media/330ecc7e326b99ef7630ee3d87ffb925.jpg"
              hover="https://cdn0199.cdn4s.com/media/861%20xmas%2090.jpg"
            />
          </div>
        </section>

        <section className="the1970-story-block fade-up">
          <Link href="/collections/all" className="the1970-story-media">
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

        <section className="the1970-story-split fade-up">
          <StorySplit
            href="/collections/all"
            image="https://cdn0199.cdn4s.com/media/861%20v%C3%A0ng%208.jpg"
            kicker="NEW ARRIVALS"
            title="Refined essentials, built for everyday wear."
            button="Shop New"
          />
          <StorySplit
            href="/collections/all"
            image="https://cdn0199.cdn4s.com/media/861%20%C4%91en%203.jpg"
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
      className={`cms-fullbleed-hero align-${align.toLowerCase()}`}
      style={{
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
}: {
  href: string;
  title: string;
  main: string;
  hover: string;
}) {
  return (
    <Link href={href} className="the1970-featured-card">
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
}: {
  href: string;
  image: string;
  kicker: string;
  title: string;
  button: string;
}) {
  return (
    <Link href={href} className="the1970-story-media split">
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
