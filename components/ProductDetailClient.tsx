"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Variant = {
  id: string;
  sku: string;
  color: string;
  size: string;
  price: number;
  compareAtPrice: number;
  stock: number;
};

type Product = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  imageUrl: string;
  images: Array<{ url: string; alt: string }>;
  category: string;
  featured?: boolean;
  variants: Variant[];
};

type CartItem = {
  productId: string;
  variantId: string;
  slug: string;
  name: string;
  color: string;
  size: string;
  price: number;
  image: string;
  qty: number;
};

const CART_KEY = "the1970_cart";

function money(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function colorHex(name: string) {
  const key = name.toLowerCase();

  if (key.includes("black") || key.includes("đen")) return "#202020";
  if (key.includes("navy") || key.includes("xanh than")) return "#27313d";
  if (key.includes("blue") || key.includes("xanh")) return "#5f7180";
  if (key.includes("olive") || key.includes("rêu")) return "#6d7157";
  if (key.includes("sage")) return "#8a8d79";
  if (key.includes("tobacco") || key.includes("nâu")) return "#8b5d3b";
  if (key.includes("cognac")) return "#9b5d32";
  if (key.includes("sand") || key.includes("be")) return "#b9a98d";
  if (key.includes("grey") || key.includes("gray") || key.includes("xám")) return "#7b7b76";
  if (key.includes("white") || key.includes("trắng")) return "#eeeeea";
  if (key.includes("burgundy") || key.includes("wine") || key.includes("đỏ")) return "#714245";

  return "#8d887d";
}

function readCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export default function ProductDetailClient({
  product,
  related,
}: {
  product: Product;
  related: Product[];
}) {
  const colors = useMemo(
    () => unique(product.variants.map((v) => v.color)),
    [product.variants],
  );

  const firstAvailableColor =
    colors.find((color) =>
      product.variants.some((v) => v.color === color && v.stock > 0),
    ) ||
    colors[0] ||
    "";

  const [selectedColor, setSelectedColor] = useState(firstAvailableColor);
  const [selectedSize, setSelectedSize] = useState("");
  const [qty, setQty] = useState(1);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [message, setMessage] = useState("");
  const [openAccordion, setOpenAccordion] = useState<string | null>("fit");

  const colorVariants = useMemo(() => {
    return selectedColor
      ? product.variants.filter((v) => v.color === selectedColor)
      : product.variants;
  }, [product.variants, selectedColor]);

  const sizes = useMemo(
    () => unique(colorVariants.map((v) => v.size)),
    [colorVariants],
  );

  const selectedVariant =
    colorVariants.find((v) => v.size === selectedSize) || null;

  const productHasStock = product.variants.some((v) => v.stock > 0);

  const prices = product.variants
    .filter((v) => v.price > 0)
    .map((v) => v.price);

  const displayPrice =
    selectedVariant?.price ||
    (prices.length ? Math.min(...prices) : 0);

  const comparePrice =
    selectedVariant?.compareAtPrice ||
    Math.max(
      0,
      ...product.variants.map((v) => v.compareAtPrice || 0),
    );

  const currentImage =
    product.images[0]?.url || product.imageUrl || "";

  const descriptionText =
    stripHtml(product.shortDescription || product.description || "") ||
    "Thiết kế theo tinh thần vintage American, hoàn thiện gọn gàng và dễ mặc hằng ngày.";

  useEffect(() => {
    if (!sizeGuideOpen && !cartOpen) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSizeGuideOpen(false);
        setCartOpen(false);
      }
    };

    document.addEventListener("keydown", key);

    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", key);
    };
  }, [sizeGuideOpen, cartOpen]);

  function isSizeAvailable(size: string) {
    return colorVariants.some((v) => v.size === size && v.stock > 0);
  }

  function chooseColor(color: string) {
    setSelectedColor(color);
    setSelectedSize("");
    setMessage("");
  }

  function addToCart() {
    if (!productHasStock) {
      setMessage("Sản phẩm hiện đã hết hàng.");
      return;
    }

    if (!selectedVariant || selectedVariant.stock <= 0) {
      setMessage("Chọn size còn hàng trước khi thêm vào giỏ.");
      return;
    }

    const next = readCart();
    const found = next.findIndex(
      (item) => item.variantId === selectedVariant.id,
    );

    if (found >= 0) {
      next[found] = {
        ...next[found],
        qty: next[found].qty + qty,
      };
    } else {
      next.push({
        productId: product.id,
        variantId: selectedVariant.id,
        slug: product.slug,
        name: product.name,
        color: selectedVariant.color,
        size: selectedVariant.size,
        price: selectedVariant.price,
        image: currentImage,
        qty,
      });
    }

    localStorage.setItem(CART_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event("the1970-cart-updated"));
    setCart(next);
    setMessage("");
    setCartOpen(true);
  }

  function openCart() {
    setCart(readCart());
    setCartOpen(true);
  }

  function removeCartItem(index: number) {
    const next = [...cart];
    next.splice(index, 1);
    localStorage.setItem(CART_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event("the1970-cart-updated"));
    setCart(next);
  }

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.price * item.qty,
    0,
  );

  return (
    <>
      <main className="ts-pdp">
        <div className="ts-pdp-shell">
          <section className="ts-pdp-gallery" aria-label="Ảnh sản phẩm">
            {(product.images.length
              ? product.images
              : currentImage
                ? [{ url: currentImage, alt: product.name }]
                : []
            ).map((image, index) => (
              <figure
                className={`ts-pdp-image ts-pdp-image-${(index % 4) + 1}`}
                key={`${image.url}-${index}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.url}
                  alt={image.alt || `${product.name} ${index + 1}`}
                />
              </figure>
            ))}

            {!product.images.length && !currentImage ? (
              <div className="ts-pdp-image-empty">Chưa có ảnh website</div>
            ) : null}
          </section>

          <aside className="ts-pdp-info">
            <div className="ts-pdp-sticky">
              <nav className="ts-pdp-breadcrumb" aria-label="Breadcrumb">
                <Link href="/">Trang chủ</Link>
                <span>/</span>
                <Link href="/collections/all">
                  {product.category || "Sản phẩm"}
                </Link>
              </nav>

              <div className="ts-pdp-rating">
                <span className="ts-pdp-stars">★★★★★</span>
                <span>THE 1970</span>
              </div>

              <div className="ts-pdp-title-row">
                <div>
                  <h1>{product.name}</h1>
                  {selectedColor ? (
                    <div className="ts-pdp-subtitle">{selectedColor}</div>
                  ) : null}
                </div>

                <div className="ts-pdp-price-wrap">
                  <strong>
                    {displayPrice > 0 ? money(displayPrice) : "Liên hệ"}
                  </strong>
                  {comparePrice > displayPrice && displayPrice > 0 ? (
                    <del>{money(comparePrice)}</del>
                  ) : null}
                </div>
              </div>

              <p className="ts-pdp-desc">{descriptionText}</p>

              {colors.length ? (
                <section className="ts-pdp-option">
                  <div className="ts-pdp-option-head">
                    <span>
                      Màu: <strong>{selectedColor}</strong>
                    </span>
                  </div>

                  <div className="ts-pdp-colors">
                    {colors.map((color) => {
                      const available = product.variants.some(
                        (v) => v.color === color && v.stock > 0,
                      );

                      return (
                        <button
                          key={color}
                          type="button"
                          aria-label={color}
                          title={`${color}${available ? "" : " — Hết hàng"}`}
                          className={`ts-pdp-color ${
                            selectedColor === color ? "is-active" : ""
                          } ${!available ? "is-disabled" : ""}`}
                          onClick={() => chooseColor(color)}
                        >
                          <span style={{ background: colorHex(color) }} />
                        </button>
                      );
                    })}
                  </div>
                </section>
              ) : null}

              {sizes.length ? (
                <section className="ts-pdp-option ts-pdp-size-section">
                  <div className="ts-pdp-option-head">
                    <span>
                      Size
                      {selectedSize ? (
                        <>
                          : <strong>{selectedSize}</strong>
                        </>
                      ) : null}
                    </span>

                    <button
                      type="button"
                      className="ts-pdp-guide-link"
                      onClick={() => setSizeGuideOpen(true)}
                    >
                      Size &amp; Fit Guide
                    </button>
                  </div>

                  <div className="ts-pdp-sizes">
                    {sizes.map((size) => {
                      const available = isSizeAvailable(size);

                      return (
                        <button
                          key={size}
                          type="button"
                          disabled={!available}
                          className={
                            selectedSize === size ? "is-active" : ""
                          }
                          onClick={() => {
                            setSelectedSize(size);
                            setMessage("");
                          }}
                        >
                          <span>{size}</span>
                          {!available ? <i /> : null}
                        </button>
                      );
                    })}
                  </div>
                </section>
              ) : null}

              {message ? (
                <div className="ts-pdp-message">{message}</div>
              ) : null}

              <div className="ts-pdp-buy-row">
                <div className="ts-pdp-qty">
                  <button
                    type="button"
                    aria-label="Giảm số lượng"
                    onClick={() => setQty((value) => Math.max(1, value - 1))}
                  >
                    −
                  </button>
                  <span>{qty}</span>
                  <button
                    type="button"
                    aria-label="Tăng số lượng"
                    onClick={() => setQty((value) => value + 1)}
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  className="ts-pdp-add"
                  disabled={!productHasStock}
                  onClick={addToCart}
                >
                  {productHasStock ? "THÊM VÀO GIỎ" : "HẾT HÀNG"}
                </button>
              </div>

              <div className="ts-pdp-benefits">
                <div>
                  <span>✓</span>
                  <p>Hỗ trợ đổi size theo chính sách The 1970</p>
                </div>
                <div>
                  <span>✓</span>
                  <p>Giao hàng toàn quốc</p>
                </div>
                <div>
                  <span>✓</span>
                  <p>Tư vấn size trước khi đặt hàng</p>
                </div>
              </div>

              <div className="ts-pdp-accordions">
                <Accordion
                  title="Fit"
                  open={openAccordion === "fit"}
                  onClick={() =>
                    setOpenAccordion(
                      openAccordion === "fit" ? null : "fit",
                    )
                  }
                >
                  Phom được lấy trực tiếp từ sản phẩm master. Chọn size đang
                  mặc thông thường nếu muốn cảm giác gọn; nếu thích thoải mái
                  hơn có thể tăng một size tùy từng mẫu.
                </Accordion>

                <Accordion
                  title="Material"
                  open={openAccordion === "material"}
                  onClick={() =>
                    setOpenAccordion(
                      openAccordion === "material" ? null : "material",
                    )
                  }
                >
                  {product.description ||
                    product.shortDescription ||
                    "Thông tin chất liệu đang được cập nhật."}
                </Accordion>

                <Accordion
                  title="Specifications"
                  open={openAccordion === "specifications"}
                  onClick={() =>
                    setOpenAccordion(
                      openAccordion === "specifications"
                        ? null
                        : "specifications",
                    )
                  }
                >
                  <dl className="ts-pdp-spec-list">
                    {selectedVariant?.sku ? (
                      <>
                        <dt>SKU</dt>
                        <dd>{selectedVariant.sku}</dd>
                      </>
                    ) : null}
                    {product.category ? (
                      <>
                        <dt>Danh mục</dt>
                        <dd>{product.category}</dd>
                      </>
                    ) : null}
                    {selectedColor ? (
                      <>
                        <dt>Màu</dt>
                        <dd>{selectedColor}</dd>
                      </>
                    ) : null}
                  </dl>
                </Accordion>

                <Accordion
                  title="Shipping & Returns"
                  open={openAccordion === "shipping"}
                  onClick={() =>
                    setOpenAccordion(
                      openAccordion === "shipping" ? null : "shipping",
                    )
                  }
                >
                  Giao hàng toàn quốc. Điều kiện đổi hàng áp dụng theo chính
                  sách hiện hành của The 1970.
                </Accordion>
              </div>

              <button
                type="button"
                className="ts-pdp-cart-link"
                onClick={openCart}
              >
                Xem giỏ hàng
              </button>
            </div>
          </aside>
        </div>

        {product.description ? (
          <section className="ts-pdp-story">
            <div className="ts-pdp-story-label">THE 1970 / PRODUCT NOTES</div>
            <div className="ts-pdp-story-grid">
              <h2>{product.name}</h2>
              <div className="ts-pdp-story-copy">
                {product.description}
              </div>
            </div>
          </section>
        ) : null}

        {related.length ? (
          <section className="ts-pdp-related">
            <div className="ts-pdp-related-head">
              <h2>Có thể bạn cũng thích</h2>
              <Link href="/collections/all">Xem tất cả</Link>
            </div>

            <div className="ts-pdp-related-grid">
              {related.map((item) => {
                const relatedPrices = item.variants
                  .filter((v) => v.price > 0)
                  .map((v) => v.price);
                const price = relatedPrices.length
                  ? Math.min(...relatedPrices)
                  : 0;
                const available = item.variants.some((v) => v.stock > 0);

                return (
                  <Link
                    href={`/products/${item.slug}`}
                    className="ts-pdp-related-card"
                    key={item.id}
                  >
                    <div className="ts-pdp-related-image">
                      {item.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.imageUrl} alt={item.name} />
                      ) : null}
                      {!available ? (
                        <span className="ts-pdp-related-badge">
                          Hết hàng
                        </span>
                      ) : null}
                    </div>

                    <div className="ts-pdp-related-info">
                      <div>
                        <h3>{item.name}</h3>
                        <p>{item.variants.find((v) => v.color)?.color || item.category}</p>
                      </div>
                      <strong>{price ? money(price) : "Liên hệ"}</strong>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        ) : null}
      </main>

      <SizeGuideDrawer
        open={sizeGuideOpen}
        sizes={sizes}
        onClose={() => setSizeGuideOpen(false)}
      />

      <div className={`ts-cart ${cartOpen ? "is-open" : ""}`}>
        <button
          className="ts-cart-backdrop"
          type="button"
          aria-label="Đóng giỏ hàng"
          onClick={() => setCartOpen(false)}
        />
        <aside className="ts-cart-panel">
          <header>
            <h2>Giỏ hàng</h2>
            <button type="button" onClick={() => setCartOpen(false)}>
              ×
            </button>
          </header>

          <div className="ts-cart-body">
            {!cart.length ? (
              <div className="ts-cart-empty">Chưa có sản phẩm nào.</div>
            ) : (
              cart.map((item, index) => (
                <article
                  className="ts-cart-item"
                  key={`${item.variantId}-${index}`}
                >
                  <div className="ts-cart-item-image">
                    {item.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.image} alt={item.name} />
                    ) : null}
                  </div>
                  <div className="ts-cart-item-info">
                    <Link href={`/products/${item.slug}`}>
                      {item.name}
                    </Link>
                    <p>
                      {item.color}
                      {item.size ? ` / ${item.size}` : ""}
                    </p>
                    <div>
                      <span>SL {item.qty}</span>
                      <strong>{money(item.price * item.qty)}</strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeCartItem(index)}
                    >
                      Xóa
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>

          <footer>
            <div>
              <span>Tạm tính</span>
              <strong>{money(cartTotal)}</strong>
            </div>
            <button
              type="button"
              onClick={() => {
                setCartOpen(false);
                window.location.href = "/cart";
              }}
            >
              THANH TOÁN
            </button>
          </footer>
        </aside>
      </div>
    </>
  );
}

function Accordion({
  title,
  open,
  onClick,
  children,
}: {
  title: string;
  open: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className={`ts-pdp-accordion ${open ? "is-open" : ""}`}>
      <button type="button" onClick={onClick}>
        <span>{title}</span>
        <i>{open ? "−" : "+"}</i>
      </button>
      {open ? <div className="ts-pdp-accordion-body">{children}</div> : null}
    </section>
  );
}

function SizeGuideDrawer({
  open,
  sizes,
  onClose,
}: {
  open: boolean;
  sizes: string[];
  onClose: () => void;
}) {
  return (
    <div className={`ts-guide ${open ? "is-open" : ""}`}>
      <button
        type="button"
        className="ts-guide-backdrop"
        aria-label="Đóng size guide"
        onClick={onClose}
      />
      <aside className="ts-guide-panel">
        <header className="ts-guide-head">
          <h2>Size Guide</h2>
          <button type="button" onClick={onClose}>
            ×
          </button>
        </header>

        <div className="ts-guide-tabs">
          <button className="is-active" type="button">
            GARMENT SIZE
          </button>
          <button type="button">BODY SIZE</button>
          <button type="button">FIT FINDER</button>
        </div>

        <div className="ts-guide-content">
          <h3>Garment Size Chart</h3>
          <p className="ts-guide-intro">
            Bảng dưới hiển thị các size hiện có của sản phẩm. Số đo chi tiết
            sẽ được bổ sung từ dữ liệu sản phẩm sau; nếu cần, liên hệ The 1970
            để được tư vấn chính xác trước khi đặt.
          </p>

          <div className="ts-guide-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>SIZE</th>
                  <th>TRẠNG THÁI</th>
                  <th>GỢI Ý</th>
                </tr>
              </thead>
              <tbody>
                {(sizes.length ? sizes : ["S", "M", "L", "XL"]).map((size) => (
                  <tr key={size}>
                    <td>{size}</td>
                    <td>Có trong hệ thống</td>
                    <td>Chọn theo size thường mặc</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <section className="ts-guide-how">
            <h3>How to Measure</h3>

            <div className="ts-guide-measure-grid">
              <Measure
                number="1"
                title="CHEST"
                body="Trải áo phẳng, đo ngang phần ngực ở vị trí rộng nhất và nhân đôi nếu đối chiếu chu vi."
              />
              <Measure
                number="2"
                title="SHOULDER"
                body="Đo thẳng từ đường may vai bên này sang đường may vai bên kia."
              />
              <Measure
                number="3"
                title="SLEEVE"
                body="Đo từ điểm đầu vai tới cuối tay áo."
              />
              <Measure
                number="4"
                title="LENGTH"
                body="Đo từ điểm cao nhất của vai xuống hết gấu áo."
              />
            </div>

            <div className="ts-guide-shirt-diagram">
              <svg viewBox="0 0 240 300" aria-hidden="true">
                <path
                  d="M78 38 102 20h36l24 18 42 24-22 50-22-16v172H80V96l-22 16-22-50 42-24Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path d="M102 20c2 22 34 22 36 0M120 42v226" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="120" cy="76" r="2" />
                <circle cx="120" cy="103" r="2" />
                <circle cx="120" cy="130" r="2" />
                <circle cx="120" cy="157" r="2" />
                <circle cx="120" cy="184" r="2" />
                <path d="M80 72h80M86 124h68M76 250h88" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
              </svg>
            </div>
          </section>
        </div>
      </aside>
    </div>
  );
}

function Measure({
  number,
  title,
  body,
}: {
  number: string;
  title: string;
  body: string;
}) {
  return (
    <div className="ts-guide-measure">
      <span>{number}</span>
      <div>
        <strong>{title}</strong>
        <p>{body}</p>
      </div>
    </div>
  );
}
