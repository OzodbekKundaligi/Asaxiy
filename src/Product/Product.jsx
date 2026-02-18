import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Product.css';
import { FaHeart, FaBalanceScale, FaShoppingCart, FaStar } from 'react-icons/fa';
import Navbar from '../Navbar/Navbar';
import BuyInOneClickModal from './BuyInOneClickModal';
import Footer from '../Footer/Footer'
function Product() {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    axios.get('https://696dff37d7bacd2dd7155277.mockapi.io/Mahsulot')
      .then(res => setProducts(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleBuyClick = (product) => {
    setSelectedProduct({...product});
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedProduct(null);
  };

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredProducts = products.filter((product) => {
    if (!normalizedQuery) {
      return true;
    }

    const searchableText = [
      product.name,
      product.badge,
      product.installment
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return searchableText.includes(normalizedQuery);
  });

  return (
    <>
      <Navbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <div className="product">
        {filteredProducts.map(p => (
          <div className='cards' key={p.id}>
            {p.badge && (
              <span className='badge' style={{
                background: p.badge === 'АКЦИЯ' ? '#ff6b6b' : '#00bfa5'
              }}>
                {p.badge}
              </span>
            )}
            
            <div className='like'>
              <FaHeart />
              <FaBalanceScale />
            </div>
            
            <img src={p.image} alt={p.name} />
            
            <h3>{p.name}</h3>
            
            <div className='stars'>
              {[...Array(5)].map((_, i) => (
                <FaStar 
                  key={i} 
                  color={i < Math.floor(p.rating) ? '#ffc107' : '#ddd'}
                />
              ))}
              <span>({p.reviews})</span>
            </div>
            
            {p.oldPrice && (
              <p className='old-price'>{p.oldPrice.toLocaleString()} сум</p>
            )}
            
            <p className='price'>{p.price.toLocaleString()} сум</p>
            
            {p.installment && (
              <div className='installment'>{p.installment}</div>
            )}
            
            <div className='buttons'>
              <button className='cart-btn'>
                <FaShoppingCart /> В корзину
              </button>
              <button 
                className='buy-btn'
                onClick={() => handleBuyClick(p)}
              >
                Купить в один клик
              </button>
            </div>
          </div>
        ))}
      </div>

      {!filteredProducts.length && (
        <p className="empty-search">Mahsulot topilmadi.</p>
      )}

      {modalOpen && selectedProduct && (
        <BuyInOneClickModal 
          open={modalOpen}
          handleClose={handleCloseModal}
          product={selectedProduct}
        />
      )}
          <Footer/>
  
    </>
  );
}

export default Product;
