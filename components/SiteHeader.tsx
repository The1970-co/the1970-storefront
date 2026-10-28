"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  type CSSProperties,
  type FocusEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type NavLink = {
  id: string;
  labelVi: string;
  labelEn?: string;
  link: string;
  enabled: boolean;
};

type NavColumn = {
  id: string;
  titleVi: string;
  titleEn?: string;
  links: NavLink[];
};

type NavPromo = {
  id: string;
  enabled: boolean;
  imageUrl: string;
  titleVi: string;
  titleEn?: string;
  link: string;
};

type NavigationSettings = {
  menuFontFamily: "SERIF" | "SANS";
  menuFontSize: number;
  menuGap: number;
  megaMenuHeightVh: number;
  megaOverlayOpacity: number;
  headerSticky: boolean;
  announcementEnabled: boolean;
  announcementTextVi: string;
  announcementLink: string;
  headerLogoUrl?: string;
  headerLogoWidth?: number;
  headerLogoAlign?: "LEFT" | "CENTER" | "RIGHT";
};

type NavItem = {
  id: string;
  enabled: boolean;
  type: "LINK" | "MEGA";
  labelVi: string;
  labelEn?: string;
  link: string;
  columns: NavColumn[];
  promos: NavPromo[];
};

type NavigationConfig = {
  version: number;
  settings: NavigationSettings;
  items: NavItem[];
};

type PublicWebsiteSettings = {
  cartEnabled: boolean;
};

const DEFAULT_NAV_SETTINGS: NavigationSettings = {
  menuFontFamily: "SERIF",
  menuFontSize: 12,
  menuGap: 28,
  megaMenuHeightVh: 48,
  megaOverlayOpacity: 0.28,
  headerSticky: true,
  announcementEnabled: true,
  announcementTextVi: "THE 1970 — EST. 2015",
  announcementLink: "",
  headerLogoUrl: "",
  headerLogoWidth: 118,
  headerLogoAlign: "LEFT",
};

const FALLBACK_NAVIGATION: NavigationConfig = {
  version: 2,
  settings: DEFAULT_NAV_SETTINGS,
  items: [
    {
      id: "shirts",
      enabled: true,
      type: "MEGA",
      labelVi: "Sơ mi",
      labelEn: "Shirts",
      link: "/collections/shirts",
      columns: [
        {
          id: "shirts-category",
          titleVi: "Sơ mi",
          titleEn: "Shirts",
          links: [
            {
              id: "shirts-all",
              labelVi: "Tất cả sơ mi",
              labelEn: "All Shirts",
              link: "/collections/shirts",
              enabled: true,
            },
            {
              id: "shirts-oxford",
              labelVi: "Oxford",
              labelEn: "Oxfords",
              link: "/collections/shirts",
              enabled: true,
            },
            {
              id: "shirts-flannel",
              labelVi: "Flannel",
              labelEn: "Flannels",
              link: "/collections/shirts",
              enabled: true,
            },
          ],
        },
        {
          id: "shirts-edit",
          titleVi: "Khám phá",
          titleEn: "Explore",
          links: [
            {
              id: "shirts-new",
              labelVi: "Hàng mới",
              labelEn: "New Arrivals",
              link: "/collections/all",
              enabled: true,
            },
            {
              id: "shirts-best",
              labelVi: "Bán chạy",
              labelEn: "Best Sellers",
              link: "/collections/all",
              enabled: true,
            },
          ],
        },
      ],
      promos: [
        {
          id: "shirts-promo-1",
          enabled: true,
          imageUrl:
            "https://cdn0199.cdn4s.com/media/861%20v%C3%A0ng%208.jpg",
          titleVi: "Sơ mi The 1970",
          titleEn: "The 1970 Shirts",
          link: "/collections/shirts",
        },
        {
          id: "shirts-promo-2",
          enabled: true,
          imageUrl:
            "https://cdn0199.cdn4s.com/media/3e12438546111e95cdfb901fd723bd8b.jpg",
          titleVi: "Hàng mới",
          titleEn: "New Arrivals",
          link: "/collections/all",
        },
      ],
    },
    {
      id: "tshirts",
      enabled: true,
      type: "LINK",
      labelVi: "Áo phông",
      labelEn: "T-Shirts",
      link: "/collections/t-shirts",
      columns: [],
      promos: [],
    },
    {
      id: "pants",
      enabled: true,
      type: "LINK",
      labelVi: "Quần",
      labelEn: "Bottoms",
      link: "/collections/pants",
      columns: [],
      promos: [],
    },
    {
      id: "new",
      enabled: true,
      type: "LINK",
      labelVi: "Hàng mới",
      labelEn: "New Arrivals",
      link: "/collections/all",
      columns: [],
      promos: [],
    },
    {
      id: "collections",
      enabled: true,
      type: "LINK",
      labelVi: "Bộ sưu tập",
      labelEn: "Collections",
      link: "/collections/all",
      columns: [],
      promos: [],
    },
    {
      id: "accessories",
      enabled: true,
      type: "LINK",
      labelVi: "Phụ kiện",
      labelEn: "Accessories",
      link: "/collections/accessories",
      columns: [],
      promos: [],
    },
  ],
};

const CART_KEY = "the1970_cart";

function coreBase() {
  return (
    process.env.NEXT_PUBLIC_CORE_API_URL || "http://localhost:3001"
  ).replace(/\/$/, "");
}

function clampNumber(value: unknown, min: number, max: number, fallback: number) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, number));
}

function normalizeNavigation(raw: any): NavigationConfig {
  const rawSettings = raw?.settings || {};

  const settings: NavigationSettings = {
    menuFontFamily:
      rawSettings.menuFontFamily === "SANS" ? "SANS" : "SERIF",
    menuFontSize: clampNumber(
      rawSettings.menuFontSize,
      10,
      18,
      DEFAULT_NAV_SETTINGS.menuFontSize,
    ),
    menuGap: clampNumber(
      rawSettings.menuGap,
      12,
      60,
      DEFAULT_NAV_SETTINGS.menuGap,
    ),
    megaMenuHeightVh: clampNumber(
      rawSettings.megaMenuHeightVh,
      35,
      65,
      DEFAULT_NAV_SETTINGS.megaMenuHeightVh,
    ),
    megaOverlayOpacity: clampNumber(
      rawSettings.megaOverlayOpacity,
      0,
      0.7,
      DEFAULT_NAV_SETTINGS.megaOverlayOpacity,
    ),
    headerSticky:
      typeof rawSettings.headerSticky === "boolean"
        ? rawSettings.headerSticky
        : DEFAULT_NAV_SETTINGS.headerSticky,
    announcementEnabled:
      typeof rawSettings.announcementEnabled === "boolean"
        ? rawSettings.announcementEnabled
        : DEFAULT_NAV_SETTINGS.announcementEnabled,
    announcementTextVi:
      String(
        rawSettings.announcementTextVi ??
          DEFAULT_NAV_SETTINGS.announcementTextVi,
      ).trim() || DEFAULT_NAV_SETTINGS.announcementTextVi,
    announcementLink: String(rawSettings.announcementLink || "").trim(),
    headerLogoUrl: String(
      rawSettings.headerLogoUrl ??
        DEFAULT_NAV_SETTINGS.headerLogoUrl ??
        "",
    ).trim(),
    headerLogoWidth: clampNumber(
      rawSettings.headerLogoWidth,
      40,
      260,
      DEFAULT_NAV_SETTINGS.headerLogoWidth || 118,
    ),
    headerLogoAlign:
      rawSettings.headerLogoAlign === "CENTER"
        ? "CENTER"
        : rawSettings.headerLogoAlign === "RIGHT"
          ? "RIGHT"
          : "LEFT",
  };

  const items = Array.isArray(raw?.items)
    ? raw.items.map((item: any, index: number) => {
        const legacyPromo = item?.promo;
        const rawPromos = Array.isArray(item?.promos)
          ? item.promos
          : legacyPromo
            ? [legacyPromo]
            : [];

        return {
          id: String(item?.id || `menu-${index}`),
          enabled: item?.enabled !== false,
          type: item?.type === "MEGA" ? "MEGA" : "LINK",
          labelVi: String(item?.labelVi || item?.labelEn || "Menu"),
          labelEn: String(item?.labelEn || ""),
          link: String(item?.link || "/"),
          columns: Array.isArray(item?.columns)
            ? item.columns.map((column: any, columnIndex: number) => ({
                id: String(column?.id || `column-${index}-${columnIndex}`),
                titleVi: String(column?.titleVi || column?.titleEn || ""),
                titleEn: String(column?.titleEn || ""),
                links: Array.isArray(column?.links)
                  ? column.links.map((link: any, linkIndex: number) => ({
                      id: String(
                        link?.id ||
                          `link-${index}-${columnIndex}-${linkIndex}`,
                      ),
                      labelVi: String(link?.labelVi || link?.labelEn || ""),
                      labelEn: String(link?.labelEn || ""),
                      link: String(link?.link || "/"),
                      enabled: link?.enabled !== false,
                    }))
                  : [],
              }))
            : [],
          promos: rawPromos
            .slice(0, 2)
            .map((promo: any, promoIndex: number) => ({
              id: String(promo?.id || `promo-${index}-${promoIndex}`),
              enabled: promo?.enabled !== false,
              imageUrl: String(promo?.imageUrl || ""),
              titleVi: String(
                promo?.titleVi || promo?.titleEn || item?.labelVi || "",
              ),
              titleEn: String(promo?.titleEn || ""),
              link: String(promo?.link || item?.link || "/"),
            })),
        } satisfies NavItem;
      })
    : [];

  return {
    version: Number(raw?.version || 2),
    settings,
    items: items.length ? items : FALLBACK_NAVIGATION.items,
  };
}

function readCartCount() {
  try {
    const parsed = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    if (!Array.isArray(parsed)) return 0;
    return parsed.reduce(
      (sum, item) => sum + Math.max(0, Number(item?.qty || 0)),
      0,
    );
  } catch {
    return 0;
  }
}

function isCurrentPath(pathname: string, href: string) {
  if (!href || href === "/") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function SiteHeader() {
  const pathname = usePathname();
  const rootRef = useRef<HTMLElement | null>(null);
  const closeTimerRef = useRef<number | null>(null);

  const [navigation, setNavigation] =
    useState<NavigationConfig>(FALLBACK_NAVIGATION);
  const [websiteSettings, setWebsiteSettings] =
    useState<PublicWebsiteSettings>({ cartEnabled: false });
  const [openId, setOpenId] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    let alive = true;

    Promise.all([
      fetch(`${coreBase()}/storefront/navigation?market=VN`, {
        cache: "no-store",
      }).then(async (response) => {
        if (!response.ok) throw new Error(`Navigation ${response.status}`);
        return response.json();
      }),
      fetch(`${coreBase()}/storefront/settings?market=VN`, {
        cache: "no-store",
      }).then(async (response) => {
        if (!response.ok) throw new Error(`Settings ${response.status}`);
        return response.json();
      }),
    ])
      .then(([navigationData, settingsData]) => {
        if (!alive) return;
        setNavigation(normalizeNavigation(navigationData));
        setWebsiteSettings({
          cartEnabled: Boolean(settingsData?.cartEnabled),
        });
      })
      .catch(() => {
        if (!alive) return;
        setNavigation(FALLBACK_NAVIGATION);
      });

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    setCartCount(readCartCount());

    const refresh = () => setCartCount(readCartCount());

    window.addEventListener("storage", refresh);
    window.addEventListener("the1970-cart-updated", refresh);

    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("the1970-cart-updated", refresh);
    };
  }, []);

  useEffect(() => {
    setOpenId("");
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpenId("");
      setMobileOpen(false);
    };

    const onPointerDown = (event: PointerEvent) => {
      const node = rootRef.current;
      if (node && !node.contains(event.target as Node)) {
        setOpenId("");
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, []);

  const items = useMemo(
    () => navigation.items.filter((item) => item.enabled !== false),
    [navigation.items],
  );

  const headerStyle = {
    "--menu-font-family":
      navigation.settings.menuFontFamily === "SANS"
        ? "Arial, Helvetica, sans-serif"
        : 'Georgia, "Times New Roman", serif',
    "--menu-font-size": `${navigation.settings.menuFontSize}px`,
    "--menu-gap": `${navigation.settings.menuGap}px`,
    "--mega-menu-height": `${navigation.settings.megaMenuHeightVh}vh`,
    "--mega-overlay-opacity": String(navigation.settings.megaOverlayOpacity),
  } as CSSProperties;

  function clearCloseTimer() {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }

  function scheduleClose() {
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => {
      setOpenId("");
    }, 110);
  }

  function openMega(id: string) {
    clearCloseTimer();
    setOpenId(id);
  }

  function toggleMega(id: string) {
    setOpenId((current) => (current === id ? "" : id));
  }

  function onNavBlur(event: FocusEvent<HTMLElement>) {
    const next = event.relatedTarget as Node | null;
    if (next && event.currentTarget.contains(next)) return;
    scheduleClose();
  }

  return (
    <>
      <header
        ref={rootRef}
        className={`site-shell-header${
          navigation.settings.headerSticky ? " is-sticky" : ""
        }`}
        style={headerStyle}
      >
        {navigation.settings.announcementEnabled ? (
          <div className="site-announcement">
            {navigation.settings.announcementLink ? (
              <Link href={navigation.settings.announcementLink}>
                {navigation.settings.announcementTextVi}
              </Link>
            ) : (
              <span>{navigation.settings.announcementTextVi}</span>
            )}
          </div>
        ) : null}

        <div className="site-header-row">
          <button
            className="site-mobile-toggle"
            type="button"
            aria-label={mobileOpen ? "Đóng menu" : "Mở menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((current) => !current)}
          >
            <span />
            <span />
          </button>

          <Link
            className="site-brand"
            href="/"
            aria-label="The 1970"
            style={{
              justifySelf:
                navigation.settings.headerLogoAlign === "RIGHT"
                  ? "end"
                  : navigation.settings.headerLogoAlign === "CENTER"
                    ? "center"
                    : "start",
            }}
          >
            {navigation.settings.headerLogoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                className="site-brand-image"
                src={navigation.settings.headerLogoUrl}
                alt="The 1970"
                style={{
                  width: `${Math.max(
                    40,
                    Math.min(
                      260,
                      Number(navigation.settings.headerLogoWidth || 118),
                    ),
                  )}px`,
                }}
              />
            ) : (
              "THE 1970"
            )}
          </Link>

          <nav
            className={`site-mainnav${mobileOpen ? " is-mobile-open" : ""}`}
            aria-label="Danh mục sản phẩm"
            onBlur={onNavBlur}
          >
            {items.map((item) => {
              const active =
                isCurrentPath(pathname, item.link) ||
                item.columns.some((column) =>
                  column.links.some((link) =>
                    isCurrentPath(pathname, link.link),
                  ),
                );

              if (item.type !== "MEGA") {
                return (
                  <Link
                    className={`site-nav-link${active ? " is-active" : ""}`}
                    href={item.link || "/"}
                    key={item.id}
                  >
                    {item.labelVi || item.labelEn}
                  </Link>
                );
              }

              const open = openId === item.id;
              const promoItems = item.promos
                .filter((promo) => promo.enabled && promo.imageUrl)
                .slice(0, 2);

              return (
                <div
                  className={`site-nav-item has-mega${
                    open ? " is-open" : ""
                  }${active ? " is-active" : ""}`}
                  key={item.id}
                  onMouseEnter={() => openMega(item.id)}
                  onMouseLeave={scheduleClose}
                >
                  <button
                    className="site-nav-link site-nav-button"
                    type="button"
                    aria-expanded={open}
                    aria-controls={`mega-${item.id}`}
                    onClick={() => toggleMega(item.id)}
                    onFocus={() => openMega(item.id)}
                  >
                    <span>{item.labelVi || item.labelEn}</span>
                    <span className="site-nav-caret" aria-hidden="true" />
                  </button>

                  <section
                    id={`mega-${item.id}`}
                    className="site-mega"
                    aria-hidden={!open}
                    onMouseEnter={clearCloseTimer}
                    onMouseLeave={scheduleClose}
                  >
                    <div className="site-mega-inner">
                      <div className="site-mega-copy">
                        <div className="site-mega-heading">
                          <div>
                            <h2>{item.labelVi || item.labelEn}</h2>
                            <Link
                              href={item.link || "/"}
                              onClick={() => setOpenId("")}
                            >
                              Xem tất cả {item.labelVi || item.labelEn}
                            </Link>
                          </div>
                        </div>

                        <div className="site-mega-columns">
                          {item.columns.map((column) => (
                            <div
                              className="site-mega-column"
                              key={column.id}
                            >
                              <h3>{column.titleVi || column.titleEn}</h3>
                              {column.links
                                .filter((link) => link.enabled !== false)
                                .map((link) => (
                                  <Link
                                    href={link.link || "/"}
                                    key={link.id}
                                    onClick={() => setOpenId("")}
                                  >
                                    {link.labelVi || link.labelEn}
                                  </Link>
                                ))}
                            </div>
                          ))}
                        </div>
                      </div>

                      {promoItems.length ? (
                        <div
                          className={`site-mega-promos count-${promoItems.length}`}
                        >
                          {promoItems.map((promo) => (
                            <Link
                              className="site-mega-promo"
                              href={promo.link || item.link || "/"}
                              key={promo.id}
                              onClick={() => setOpenId("")}
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={promo.imageUrl}
                                alt={promo.titleVi || item.labelVi}
                              />
                              <span>
                                {promo.titleVi ||
                                  promo.titleEn ||
                                  item.labelVi}
                              </span>
                            </Link>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </section>
                </div>
              );
            })}
          </nav>

          <div className="site-header-actions">
            <Link href="/collections/all">TÌM KIẾM</Link>
            <span className="site-lang">ENG</span>
            {websiteSettings.cartEnabled ? (
              <Link className="site-bag" href="/cart">
                GIỎ HÀNG
                {cartCount > 0 ? <span>{cartCount}</span> : null}
              </Link>
            ) : null}
          </div>
        </div>
      </header>

      <button
        className={`site-mega-overlay${openId ? " is-visible" : ""}`}
        type="button"
        tabIndex={openId ? 0 : -1}
        aria-label="Đóng menu"
        onClick={() => setOpenId("")}
      />
    </>
  );
}
