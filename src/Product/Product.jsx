import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import './Product.css';
import { FaHeart, FaBalanceScale, FaShoppingCart, FaStar } from 'react-icons/fa';
import Navbar from '../Navbar/Navbar';
import BuyInOneClickModal from './Buyinoneclickmodal';
import Footer from '../Footer/Footer';
import { CATEGORY_LINKS, DEFAULT_CATEGORY } from '../config/navigation';
import { CART_STORAGE_KEY, COMPARE_STORAGE_KEY, FAVORITES_STORAGE_KEY } from '../config/storage';

const CATEGORY_SLUGS = CATEGORY_LINKS.map((item) => item.slug);

const CATEGORY_KEYWORDS = {
  'super-narx': ['aksiya', 'skidka', 'chegirma', 'discount', 'sale'],
  '0-0-6': ['0-0-6', 'muddatli', 'x 12', 'oyiga', 'installment'],
  'havo-tozalagichlar': ['havo', 'air purifier', 'purifier', 'tozalagich'],
  smartfonlar: ['smartfon', 'smartphone', 'iphone', 'xiaomi', 'redmi', 'samsung', 'phone'],
  'maishiy-texnika': ['maishiy', 'texnika', 'kir', 'muzlat', 'sovutgich', 'changyutgich', 'blender'],
  kitoblar: ['kitob', 'book', 'roman', 'adabiyot'],
  televizorlar: ['televizor', 'televisor', 'tv', 'smart tv'],
  noutbuklar: ['noutbuk', 'laptop', 'notebook', 'macbook']
};

const normalizeText = (value) => String(value || '').toLowerCase();

const getSearchableProductText = (product) =>
  [product.name, product.badge, product.installment, product.description].filter(Boolean).join(' ').toLowerCase();

const getBucketSlug = (productId) => {
  const idNumber = Number(productId);
  if (!Number.isFinite(idNumber)) {
    return CATEGORY_SLUGS[0];
  }

  return CATEGORY_SLUGS[Math.abs(idNumber) % CATEGORY_SLUGS.length];
};

const readJsonFromStorage = (key, fallbackValue) => {
  if (typeof window === 'undefined') {
    return fallbackValue;
  }

  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return fallbackValue;
    }

    return JSON.parse(raw);
  } catch (error) {
    console.error(`Storage parse error for ${key}:`, error);
    return fallbackValue;
  }
};

const isProductInCategory = (product, categorySlug) => {
  const text = getSearchableProductText(product);
  const keywords = CATEGORY_KEYWORDS[categorySlug] || [];
  const hasKeywordMatch = keywords.some((keyword) => text.includes(keyword));
  const oldPrice = Number(product.oldPrice) || 0;
  const price = Number(product.price) || 0;

  if (categorySlug === 'super-narx') {
    return hasKeywordMatch || oldPrice > price;
  }

  if (categorySlug === '0-0-6') {
    return hasKeywordMatch || Boolean(product.installment);
  }

  if (hasKeywordMatch) {
    return true;
  }

  return getBucketSlug(product.id) === categorySlug;
};

function Product({ category = DEFAULT_CATEGORY }) {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState(
    () => new Set(readJsonFromStorage(FAVORITES_STORAGE_KEY, []))
  );
  const [compareIds, setCompareIds] = useState(
    () => new Set(readJsonFromStorage(COMPARE_STORAGE_KEY, []))
  );
  const [cartItems, setCartItems] = useState(
    () => readJsonFromStorage(CART_STORAGE_KEY, {})
  );
  const [actionStatus, setActionStatus] = useState('');

  useEffect(() => {
    axios
      .get('https://696dff37d7bacd2dd7155277.mockapi.io/Mahsulot')
      .then((res) => setProducts(res.data))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (!actionStatus) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setActionStatus('');
    }, 2200);

    return () => window.clearTimeout(timer);
  }, [actionStatus]);

  useEffect(() => {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify([...favoriteIds]));
  }, [favoriteIds]);

  useEffect(() => {
    localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify([...compareIds]));
  }, [compareIds]);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  const handleBuyClick = (product) => {
    setSelectedProduct({ ...product });
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedProduct(null);
  };

  const handleToggleFavorite = (product) => {
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      const exists = next.has(product.id);

      if (exists) {
        next.delete(product.id);
        setActionStatus("Mahsulot sevimlilardan olib tashlandi.");
      } else {
        next.add(product.id);
        setActionStatus("Mahsulot sevimlilarga qo'shildi.");
      }

      return next;
    });
  };

  const handleToggleCompare = (product) => {
    setCompareIds((prev) => {
      const next = new Set(prev);
      const exists = next.has(product.id);

      if (exists) {
        next.delete(product.id);
        setActionStatus("Mahsulot taqqoslashdan olib tashlandi.");
      } else {
        next.add(product.id);
        setActionStatus("Mahsulot taqqoslashga qo'shildi.");
      }

      return next;
    });
  };

  const handleAddToCart = (product) => {
    setCartItems((prev) => {
      const currentQty = prev[product.id] || 0;
      const next = {
        ...prev,
        [product.id]: currentQty + 1
      };

      setActionStatus("Mahsulot savatga qo'shildi.");
      return next;
    });
  };

  const formatPrice = (value) => {
    const numberValue = Number(value) || 0;
    return numberValue.toLocaleString('uz-UZ');
  };

  const normalizedQuery = normalizeText(searchQuery.trim());

  const productsByCategory = useMemo(
    () => products.filter((product) => isProductInCategory(product, category.slug)),
    [products, category.slug]
  );

  const filteredProducts = useMemo(() => {
    if (!normalizedQuery) {
      return productsByCategory;
    }

    return productsByCategory.filter((product) => getSearchableProductText(product).includes(normalizedQuery));
  }, [productsByCategory, normalizedQuery]);

  const cartCount = Object.values(cartItems).reduce((sum, qty) => sum + qty, 0);
  const resultLabel = normalizedQuery
    ? `"${searchQuery}" bo'yicha ${filteredProducts.length} ta natija`
    : `${filteredProducts.length} ta mahsulot topildi`;

  return (
    <>
      <Navbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <main className="store-page">
        <div className="content-shell">
          <section className="catalog-head">
            <div>
              <h1>{category.label}</h1>
              <p>Tanlangan bo'lim bo'yicha mahsulotlar ro'yxati va tezkor qidiruv.</p>
            </div>
            <div className="catalog-right">
              <span className="catalog-count">{resultLabel}</span>
              <span className="catalog-meta">Savat: {cartCount}</span>
            </div>
          </section>

          {actionStatus && <p className="catalog-status">{actionStatus}</p>}

          <section className="product">
            {filteredProducts.map((p) => {
              const rating = Number(p.rating) || 0;
              const oldPrice = Number(p.oldPrice) || 0;
              const cartQty = cartItems[p.id] || 0;
              const isFavorite = favoriteIds.has(p.id);
              const isCompared = compareIds.has(p.id);

              return (
                <article className="cards" key={p.id}>
                  {p.badge && (
                    <span
                      className="badge"
                      style={{
                        background: normalizeText(p.badge).includes('aksiya') ? '#ff6b6b' : '#00bfa5'
                      }}
                    >
                      {p.badge}
                    </span>
                  )}

                  <div className="like">
                    <button
                      type="button"
                      aria-label="Sevimlilar"
                      className={isFavorite ? 'tool-btn active' : 'tool-btn'}
                      onClick={() => handleToggleFavorite(p)}
                    >
                      <FaHeart />
                    </button>
                    <button
                      type="button"
                      aria-label="Taqqoslash"
                      className={isCompared ? 'tool-btn active' : 'tool-btn'}
                      onClick={() => handleToggleCompare(p)}
                    >
                      <FaBalanceScale />
                    </button>
                  </div>

                  <img className="product-image" src={p.image} alt={p.name} />

                  <h3>{p.name}</h3>

                  <div className="stars">
                    {[...Array(5)].map((_, i) => (
                      <FaStar key={i} color={i < Math.floor(rating) ? '#ffc107' : '#d9e1ee'} />
                    ))}
                    <span>({p.reviews || 0})</span>
                  </div>

                  {oldPrice > 0 && <p className="old-price">{formatPrice(oldPrice)} som</p>}

                  <p className="price">{formatPrice(p.price)} som</p>

                  {p.installment && <div className="installment">{p.installment}</div>}

                  <div className="buttons">
                    <button className="cart-btn" type="button" onClick={() => handleAddToCart(p)}>
                      <FaShoppingCart /> {cartQty > 0 ? `Savatda (${cartQty})` : 'Savatga'}
                    </button>
                    <button className="buy-btn" type="button" onClick={() => handleBuyClick(p)}>
                      Bir klikda xarid
                    </button>
                  </div>
                </article>
              );
            })}
          </section>

          {!filteredProducts.length && (
            <p className="empty-search">Bu bo'limda qidiruv bo'yicha mahsulot topilmadi. Boshqa bo'limni tanlab ko'ring.</p>
          )}
        </div>
      </main>

      {modalOpen && selectedProduct && (
        <BuyInOneClickModal open={modalOpen} handleClose={handleCloseModal} product={selectedProduct} />
      )}

      <Footer />
    </>
  );
}

export default Product;
