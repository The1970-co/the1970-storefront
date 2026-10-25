"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export type StorefrontLocale = "vi" | "en";
type DropdownKey = "tshirts" | "shirts" | "bottoms";

const copy = {
  vi: {
    tshirts: "Áo phông",
    shirts: "Sơ mi",
    bottoms: "Quần",
    arrivals: "Hàng mới",
    collection: "Bộ sưu tập",
    search: "Tìm kiếm",
    cart: "Giỏ hàng",
    lang: "ENG",
    allTshirts: "Tất cả áo phông",
    plainTees: "Áo phông trơn",
    heritageTees: "Áo phông Heritage",
    athleisureTees: "Áo phông Athleisure",
    colorStory: "Theo màu",
    allShirts: "Tất cả sơ mi",
    checkedShirts: "Sơ mi kẻ",
    solidShirts: "Sơ mi trơn",
    flannelShirts: "Sơ mi Flannel",
    highlights: "Nổi bật",
    bestSeller: "Bán chạy",
    seasonal: "Theo mùa",
    allBottoms: "Tất cả quần",
    chinos: "Quần kaki",
    denim: "Quần jean",
    shorts: "Quần short",
    shopByEdit: "Gợi ý",
    shopTshirts: "Xem áo phông",
    exploreShirts: "Xem sơ mi",
    shopBottoms: "Xem quần",
  },
  en: {
    tshirts: "T-Shirts",
    shirts: "Shirts",
    bottoms: "Bottoms",
    arrivals: "New Arrivals",
    collection: "Collection",
    search: "Search",
    cart: "Cart",
    lang: "VI",
    allTshirts: "All T-Shirts",
    plainTees: "Plain Tees",
    heritageTees: "Heritage Tees",
    athleisureTees: "Athleisure Tees",
    colorStory: "Color Story",
    allShirts: "All Shirts",
    checkedShirts: "Checked Shirts",
    solidShirts: "Solid Shirts",
    flannelShirts: "Flannel Shirts",
    highlights: "Highlights",
    bestSeller: "Best Seller",
    seasonal: "Seasonal Collection",
    allBottoms: "All Bottoms",
    chinos: "Chinos",
    denim: "Denim",
    shorts: "Shorts",
    shopByEdit: "Shop By Edit",
    shopTshirts: "Shop T-Shirts",
    exploreShirts: "Explore Shirts",
    shopBottoms: "Shop Bottoms",
  },
} as const;

export default function SiteHeader({
  locale,
  onLocaleChange,
  onCart,
}: {
  locale: StorefrontLocale;
  onLocaleChange: (locale: StorefrontLocale) => void;
  onCart?: () => void;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<DropdownKey | null>(null);
  const t = copy[locale];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileOpen(false);
        setOpenDropdown(null);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  function mobileDropdownClick(
    e: React.MouseEvent<HTMLAnchorElement>,
    key: DropdownKey,
  ) {
    if (window.matchMedia("(max-width: 900px)").matches && openDropdown !== key) {
      e.preventDefault();
      setOpenDropdown(key);
    }
  }

  function switchLanguage() {
    onLocaleChange(locale === "vi" ? "en" : "vi");
  }

  return (
    <header className={`the1970-topbar${mobileOpen ? " is-mobile-open" : ""}`}>
      <div className="the1970-topbar-inner">
        <button
          className="the1970-menu-toggle"
          type="button"
          aria-label={mobileOpen ? "Đóng menu" : "Mở menu"}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? "×" : "☰"}
        </button>

        <Link className="the1970-brand" href="/">
          THE 1970
        </Link>

        <nav className="the1970-mainnav" aria-label="Danh mục sản phẩm">
          <div className={`nav-item has-dropdown${openDropdown === "tshirts" ? " is-open" : ""}`}>
            <Link href="/collections/t-shirts" onClick={(e) => mobileDropdownClick(e, "tshirts")}>
              {t.tshirts}
            </Link>
            <div className="mega-menu">
              <div className="mega-menu-grid">
                <div className="mega-menu-links">
                  <h4>{t.tshirts}</h4>
                  <Link href="/collections/t-shirts">{t.allTshirts}</Link>
                  <Link href="/collections/t-shirts">{t.plainTees}</Link>
                  <Link href="/collections/t-shirts">{t.heritageTees}</Link>
                  <Link href="/collections/t-shirts">{t.athleisureTees}</Link>
                </div>
                <div className="mega-menu-links">
                  <h4>{t.colorStory}</h4>
                  <Link href="/collections/all">Olive Ash</Link>
                  <Link href="/collections/all">Heritage Sage</Link>
                  <Link href="/collections/all">Tobacco</Link>
                  <Link href="/collections/all">Vintage Navy</Link>
                </div>
                <Link href="/collections/t-shirts" className="mega-menu-image">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="https://cdn0199.cdn4s.com/media/3e12438546111e95cdfb901fd723bd8b.jpg" alt={t.tshirts} />
                  <span>{t.shopTshirts}</span>
                </Link>
              </div>
            </div>
          </div>

          <div className={`nav-item has-dropdown${openDropdown === "shirts" ? " is-open" : ""}`}>
            <Link href="/collections/shirts" onClick={(e) => mobileDropdownClick(e, "shirts")}>
              {t.shirts}
            </Link>
            <div className="mega-menu">
              <div className="mega-menu-grid">
                <div className="mega-menu-links">
                  <h4>{t.shirts}</h4>
                  <Link href="/collections/shirts">{t.allShirts}</Link>
                  <Link href="/collections/shirts">{t.checkedShirts}</Link>
                  <Link href="/collections/shirts">{t.solidShirts}</Link>
                  <Link href="/collections/shirts">{t.flannelShirts}</Link>
                </div>
                <div className="mega-menu-links">
                  <h4>{t.highlights}</h4>
                  <Link href="/collections/all">{t.arrivals}</Link>
                  <Link href="/collections/all">{t.bestSeller}</Link>
                  <Link href="/collections/all">{t.seasonal}</Link>
                </div>
                <Link href="/collections/shirts" className="mega-menu-image">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="https://cdn0199.cdn4s.com/media/861%20v%C3%A0ng%208.jpg" alt={t.shirts} />
                  <span>{t.exploreShirts}</span>
                </Link>
              </div>
            </div>
          </div>

          <div className={`nav-item has-dropdown${openDropdown === "bottoms" ? " is-open" : ""}`}>
            <Link href="/collections/pants" onClick={(e) => mobileDropdownClick(e, "bottoms")}>
              {t.bottoms}
            </Link>
            <div className="mega-menu">
              <div className="mega-menu-grid">
                <div className="mega-menu-links">
                  <h4>{t.bottoms}</h4>
                  <Link href="/collections/pants">{t.allBottoms}</Link>
                  <Link href="/collections/pants">{t.chinos}</Link>
                  <Link href="/collections/pants">{t.denim}</Link>
                  <Link href="/collections/pants">{t.shorts}</Link>
                </div>
                <div className="mega-menu-links">
                  <h4>{t.shopByEdit}</h4>
                  <Link href="/collections/all">{t.bestSeller}</Link>
                  <Link href="/collections/all">{t.arrivals}</Link>
                  <Link href="/collections/all">{t.seasonal}</Link>
                </div>
                <Link href="/collections/pants" className="mega-menu-image">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="https://cdn0199.cdn4s.com/media/861%20%C4%91en%203.jpg" alt={t.bottoms} />
                  <span>{t.shopBottoms}</span>
                </Link>
              </div>
            </div>
          </div>

          <Link href="/collections/all">{t.arrivals}</Link>
          <Link href="/collections/all">{t.collection}</Link>
        </nav>

        <div className="the1970-top-actions">
          <Link className="the1970-search-action" href="/collections/all">
            {t.search}
          </Link>

          <button
            type="button"
            className="the1970-lang-switch"
            onClick={switchLanguage}
            aria-label={locale === "vi" ? "Switch to English" : "Chuyển sang tiếng Việt"}
          >
            {t.lang}
          </button>

          <button type="button" className="the1970-cart-button" onClick={onCart}>
            {t.cart}
          </button>
        </div>
      </div>
    </header>
  );
}
