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

function firstImage(item: HomepageItem | null | undefined) {
  return item?.images?.find((image) => String(image?.url || "").trim())?.url || "";
}

function secondImage(item: HomepageItem | null | undefined) {
  const images = item?.images?.filter((image) => String(image?.url || "").trim()) || [];
  return images[1]?.url || images[0]?.url || "";
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

  const heroBlock =
    homepage?.blocks?.find(
      (block) => block.enabled && block.type === "HERO_SPLIT",
    ) || null;

  // HERO_SPLIT mapping theo đúng editor:
  // 1 = hero lớn trái
  // 2 = intro phải trên
  // 3–6 = các thẻ nhỏ bên phải
  const heroItem = heroBlock?.items?.[0] || null;
  const introItem = heroBlock?.items?.[1] || null;
  const miniItems = (heroBlock?.items || []).slice(2, 6);

  const cardRowBlock =
    homepage?.blocks?.find(
      (block) => block.enabled && block.type === "CARD_ROW",
    ) || null;

  const cardRowItems = cardRowBlock?.items || [];

  const storyWideBlock =
    homepage?.blocks?.find(
      (block) => block.enabled && block.type === "STORY_WIDE",
    ) || null;

  const storyWideItem = storyWideBlock?.items?.[0] || null;

  const storySplitBlock =
    homepage?.blocks?.find(
      (block) => block.enabled && block.type === "STORY_SPLIT",
    ) || null;

  const storySplitItems = storySplitBlock?.items || [];

  const productGridBlock =
    homepage?.blocks?.find(
      (block) =>
        block.enabled &&
        block.type === "PRODUCT_GRID" &&
        block.settings?.kind !== "MIX_SET_BANNER",
    ) || null;

  const productLimit = Math.max(
    1,
    Math.min(24, Number(productGridBlock?.settings?.limit || 8)),
  );

  return (
    <>
      <main>
        {fullBleedItem ? (
          <FullBleedHero
            item={fullBleedItem}
            settings={fullBleedBlock?.settings || {}}
          />
        ) : null}

        {heroBlock ? (
          <section className="the1970-editorial">
            <div className="the1970-editorial-grid">
              {heroItem ? (
                <div className="editorial-hero">
                  <HeroSlider item={heroItem} fallbackImage="" />
                  <div className="editorial-hero-overlay" />

                  {(heroItem.subtitleVi ||
                    heroItem.titleVi ||
                    heroItem.bodyVi ||
                    heroItem.ctaVi) ? (
                    <div className="editorial-hero-content">
                      {heroItem.subtitleVi ? (
                        <div className="editorial-kicker">
                          {heroItem.subtitleVi}
                        </div>
                      ) : null}

                      {heroItem.titleVi ? <h2>{heroItem.titleVi}</h2> : null}

                      {heroItem.bodyVi ? <p>{heroItem.bodyVi}</p> : null}

                      {heroItem.ctaVi ? (
                        <div className="editorial-hero-actions">
                          <Link
                            href={heroItem.link || "/collections/all"}
                            className="btn-light"
                          >
                            {heroItem.ctaVi}
                          </Link>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              ) : null}

              <div className="editorial-side">
                {introItem ? (
                  <div className="editorial-intro has-bg">
                    {firstImage(introItem) ? (
                      <div className="editorial-intro-bg">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={firstImage(introItem)}
                          alt={introItem.titleVi || introItem.subtitleVi || ""}
                        />
                      </div>
                    ) : null}

                    {firstImage(introItem) ? (
                      <div className="editorial-intro-overlay" />
                    ) : null}

                    {(introItem.subtitleVi ||
                      introItem.titleVi ||
                      introItem.bodyVi ||
                      introItem.ctaVi) ? (
                      <div className="editorial-intro-inner">
                        {introItem.subtitleVi ? (
                          <div className="editorial-side-kicker">
                            {introItem.subtitleVi}
                          </div>
                        ) : null}

                        {introItem.titleVi ? <h3>{introItem.titleVi}</h3> : null}

                        {introItem.bodyVi ? <p>{introItem.bodyVi}</p> : null}

                        {introItem.ctaVi ? (
                          <Link
                            href={introItem.link || "/collections/all"}
                            className="the1970-story-btn"
                          >
                            {introItem.ctaVi}
                          </Link>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                ) : null}

                {miniItems.some(
                  (item) =>
                    firstImage(item) ||
                    item.titleVi ||
                    item.subtitleVi ||
                    item.ctaVi,
                ) ? (
                  <div className="editorial-mini-grid">
                    {miniItems.map((item) => {
                      const image = firstImage(item);
                      if (
                        !image &&
                        !item.titleVi &&
                        !item.subtitleVi &&
                        !item.ctaVi
                      ) {
                        return null;
                      }

                      return (
                        <Link
                          href={item.link || "/collections/all"}
                          className="editorial-mini-card"
                          key={item.id}
                        >
                          {image ? (
                            <div className="editorial-mini-thumb">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={image}
                                alt={item.titleVi || item.subtitleVi || ""}
                              />
                            </div>
                          ) : null}

                          {(item.titleVi || item.subtitleVi) ? (
                            <div className="editorial-mini-content">
                              {item.titleVi ? <h4>{item.titleVi}</h4> : null}
                              {item.subtitleVi ? <span>{item.subtitleVi}</span> : null}
                            </div>
                          ) : null}
                        </Link>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            </div>
          </section>
        ) : null}

        {cardRowItems.some(
          (item) => firstImage(item) || item.titleVi || item.ctaVi,
        ) ? (
          <section className="the1970-featured-row fade-up">
            <div className="the1970-featured-grid">
              {cardRowItems.map((item) => {
                const main = firstImage(item);
                if (!main && !item.titleVi) return null;

                return (
                  <FeaturedCard
                    key={item.id}
                    href={item.link || "/collections/all"}
                    title={item.titleVi}
                    main={main}
                    hover={secondImage(item)}
                  />
                );
              })}
            </div>
          </section>
        ) : null}

        {storyWideItem &&
        (firstImage(storyWideItem) ||
          storyWideItem.subtitleVi ||
          storyWideItem.titleVi ||
          storyWideItem.bodyVi ||
          storyWideItem.ctaVi) ? (
          <section className="the1970-story-block fade-up">
            <Link
              href={storyWideItem.link || "/collections/all"}
              className="the1970-story-media"
            >
              {firstImage(storyWideItem) ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={firstImage(storyWideItem)}
                    alt={storyWideItem.titleVi || storyWideItem.subtitleVi || ""}
                  />
                  <div className="the1970-story-overlay" />
                </>
              ) : null}

              {(storyWideItem.subtitleVi ||
                storyWideItem.titleVi ||
                storyWideItem.bodyVi ||
                storyWideItem.ctaVi) ? (
                <div className="the1970-story-content">
                  {storyWideItem.subtitleVi ? (
                    <div className="the1970-story-kicker">
                      {storyWideItem.subtitleVi}
                    </div>
                  ) : null}

                  {storyWideItem.titleVi ? (
                    <h2>{storyWideItem.titleVi}</h2>
                  ) : null}

                  {storyWideItem.bodyVi ? (
                    <p>{storyWideItem.bodyVi}</p>
                  ) : null}

                  {storyWideItem.ctaVi ? (
                    <span className="the1970-story-btn">
                      {storyWideItem.ctaVi}
                    </span>
                  ) : null}
                </div>
              ) : null}
            </Link>
          </section>
        ) : null}

        {storySplitItems.some(
          (item) =>
            firstImage(item) ||
            item.subtitleVi ||
            item.titleVi ||
            item.ctaVi,
        ) ? (
          <section className="the1970-story-split fade-up">
            {storySplitItems.map((item) => {
              if (
                !firstImage(item) &&
                !item.subtitleVi &&
                !item.titleVi &&
                !item.ctaVi
              ) {
                return null;
              }

              return (
                <StorySplit
                  key={item.id}
                  href={item.link || "/collections/all"}
                  image={firstImage(item)}
                  kicker={item.subtitleVi}
                  title={item.titleVi}
                  button={item.ctaVi}
                />
              );
            })}
          </section>
        ) : null}

        {productGridBlock ? (
          <section className="the1970-products-section fade-up">
            {(productGridBlock.titleVi ||
              productGridBlock.settings?.viewAllLabelVi) ? (
              <div className="the1970-products-head">
                {productGridBlock.titleVi ? (
                  <div className="the1970-products-title">
                    <span />
                    <h2>{productGridBlock.titleVi}</h2>
                    <span />
                  </div>
                ) : <div />}

                {productGridBlock.settings?.viewAllLabelVi ? (
                  <Link
                    href={
                      productGridBlock.settings?.viewAllLink ||
                      "/collections/all"
                    }
                    className="the1970-products-viewall"
                  >
                    {productGridBlock.settings.viewAllLabelVi}
                  </Link>
                ) : null}
              </div>
            ) : null}

            <div className="the1970-products-grid">
              {products.slice(0, productLimit).map((p) => (
                <article
                  className={`product-card${
                    p.inStock ? "" : " the1970-home-product-disabled"
                  }`}
                  key={p.id}
                >
                  <div className="product-thumb">
                    <Link
                      className="the1970-home-product-link"
                      href={`/products/${p.slug}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        className="img-main"
                        src={p.imageUrl || "/placeholder.svg"}
                        alt={p.name}
                      />
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        className="img-hover"
                        src={p.imageUrl || "/placeholder.svg"}
                        alt=""
                      />
                      <div className="product-badge">
                        {p.inStock ? "New" : "Sold Out"}
                      </div>
                    </Link>

                    <div className="product-actions">
                      <button
                        type="button"
                        className="btn-quickview"
                        onClick={() => setQuick(p)}
                      >
                        Quick View
                      </button>

                      {p.inStock ? (
                        <Link
                          className="btn-buy"
                          href={`/products/${p.slug}`}
                        >
                          Chọn size
                        </Link>
                      ) : (
                        <button
                          type="button"
                          className="btn-buy"
                          disabled
                        >
                          Hết hàng
                        </button>
                      )}
                    </div>
                  </div>

                  <Link
                    className="the1970-home-product-link"
                    href={`/products/${p.slug}`}
                  >
                    <div className="product-info">
                      <h3>{p.name}</h3>

                      {p.color || p.category ? (
                        <p>{p.color || p.category}</p>
                      ) : null}

                      <div className="product-bottom">
                        <span className="product-price">
                          {formatPrice(p.price)}
                        </span>
                        <span className="product-more">View</span>
                      </div>

                      <div className="the1970-home-product-stock">
                        {p.inStock ? "Còn hàng" : "Hết hàng"}
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </section>
        ) : null}
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
          alt={image.altVi || item?.titleVi || ""}
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
      {title ? (
        <div className="the1970-featured-head">
          <span />
          <h3>{title}</h3>
        </div>
      ) : null}

      {main ? (
        <div className={`the1970-featured-image${hover && hover !== main ? " swap-hover" : ""}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="img-main" src={main} alt={title || ""} />

          {hover && hover !== main ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="img-hover" src={hover} alt="" />
          ) : null}
        </div>
      ) : null}
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
      {image ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt={title || kicker || ""} />
          <div className="the1970-story-overlay" />
        </>
      ) : null}

      {(kicker || title || button) ? (
        <div className="the1970-story-content">
          {kicker ? (
            <div className="the1970-story-kicker">{kicker}</div>
          ) : null}

          {title ? <h2>{title}</h2> : null}

          {button ? (
            <span className="the1970-story-btn">{button}</span>
          ) : null}
        </div>
      ) : null}
    </Link>
  );
}
