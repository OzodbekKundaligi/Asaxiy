import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Product.css';
import { FaHeart, FaBalanceScale, FaShoppingCart, FaStar } from 'react-icons/fa';
import Navbar from '../Navbar/Navbar';
import BuyInOneClickModal from './Buyinoneclickmodal';
import Footer from '../Footer/Footer';

function Product() {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    axios
      .get('https://696dff37d7bacd2dd7155277.mockapi.io/Mahsulot')
      .then((res) => setProducts(res.data))
      .catch((err) => console.error(err));
  }, []);

  const handleBuyClick = (product) => {
    setSelectedProduct({ ...product });
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedProduct(null);
  };

  const formatPrice = (value) => {
    const numberValue = Number(value) || 0;
    return numberValue.toLocaleString('uz-UZ');
  };

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredProducts = products.filter((product) => {
    if (!normalizedQuery) {
      return true;
    }

    const searchableText = [product.name, product.badge, product.installment]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return searchableText.includes(normalizedQuery);
  });

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
              <h1>Top Mahsulotlar</h1>
              <p>Eng yaxshi narxlar va tezkor yetkazib berish bilan xarid qiling.</p>
            </div>
            <span className="catalog-count">{resultLabel}</span>
          </section>

          <section className="product">
            {filteredProducts.map((p) => {
              const rating = Number(p.rating) || 0;
              const oldPrice = Number(p.oldPrice) || 0;

              return (
                <article className="cards" key={p.id}>
                  {p.badge && (
                    <span
                      className="badge"
                      style={{
                        background: p.badge.toLowerCase() === 'aksiya' ? '#ff6b6b' : '#00bfa5'
                      }}
                    >
                      {p.badge}
                    </span>
                  )}

                  <div className="like">
                    <button type="button" aria-label="Sevimlilar">
                      <FaHeart />
                    </button>
                    <button type="button" aria-label="Taqqoslash">
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
                    <button className="cart-btn" type="button">
                      <FaShoppingCart /> Savatga
                    </button>
                    <button className="buy-btn" type="button" onClick={() => handleBuyClick(p)}>
                      Bir klikda xarid
                    </button>
                  </div>
                </article>
              );
            })}
          </section>

          {!filteredProducts.length && <p className="empty-search">Bu qidiruv bo'yicha mahsulot topilmadi.</p>}
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
