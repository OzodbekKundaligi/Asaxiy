import React, { useState } from 'react';
import './BuyModal.css';

function BuyInOneClickModal({ open, handleClose, product }) {
  const [quantity, setQuantity] = useState(1);
  const [phoneNumber, setPhoneNumber] = useState('+998');
  const [fullName, setFullName] = useState('');

  if (!open || !product) return null;

  const handleBuy = () => {
    alert("Buyurtma qabul qilindi! Tez orada habar beramiz.");
    handleClose();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Купить в один клик</h2>
          <button className="modal-close-btn" onClick={handleClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="modal-product-info">
            <img 
              src={product.image} 
              alt={product.name}
              className="modal-product-img"
            />
            <div className="modal-product-details">
              <h3>{product.name}</h3>
              <p className="modal-product-price">
                {product.price.toLocaleString()} сум
              </p>
              
              <div className="modal-quantity-selector">
                <button 
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                >
                  −
                </button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)}>
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="modal-form">
            <div className="modal-form-group">
              <label>Номер телефона</label>
              <input
                type="text"
                placeholder="99 123 45 67"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>

            <div className="modal-form-group">
              <label>Имя и фамилия</label>
              <input
                type="text"
                placeholder="Введите имя и фамилию"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button onClick={handleBuy}>Купить</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BuyInOneClickModal;