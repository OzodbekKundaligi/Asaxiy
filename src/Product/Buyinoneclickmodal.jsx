import React, { useState } from 'react';
import './BuyModal.css';

function BuyInOneClickModal({ open, handleClose, product }) {
  const [quantity, setQuantity] = useState(1);
  const [phoneNumber, setPhoneNumber] = useState('+998');
  const [fullName, setFullName] = useState('');

  if (!open || !product) {
    return null;
  }

  const handleBuy = () => {
    alert("Buyurtma qabul qilindi. Tez orada siz bilan bog'lanamiz.");
    handleClose();
    setQuantity(1);
    setPhoneNumber('+998');
    setFullName('');
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <h2>Bir klikda xarid</h2>
          <button className="modal-close-btn" type="button" onClick={handleClose}>
            &times;
          </button>
        </div>

        <div className="modal-body">
          <div className="modal-product-info">
            <img src={product.image} alt={product.name} className="modal-product-img" />
            <div className="modal-product-details">
              <h3>{product.name}</h3>
              <p className="modal-product-price">{product.price.toLocaleString()} som</p>

              <div className="modal-quantity-selector">
                <button
                  className="modal-qty-btn"
                  type="button"
                  onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span className="modal-qty-value">{quantity}</span>
                <button className="modal-qty-btn" type="button" onClick={() => setQuantity((current) => current + 1)}>
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="modal-form">
            <div className="modal-form-group">
              <label htmlFor="phone-number">Telefon raqami</label>
              <input
                id="phone-number"
                className="modal-input"
                type="text"
                placeholder="99 123 45 67"
                value={phoneNumber}
                onChange={(event) => setPhoneNumber(event.target.value)}
              />
            </div>

            <div className="modal-form-group">
              <label htmlFor="full-name">Ism va familiya</label>
              <input
                id="full-name"
                className="modal-input"
                type="text"
                placeholder="Ismingizni kiriting"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button className="modal-buy-btn" type="button" onClick={handleBuy}>
              Xarid qilish
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BuyInOneClickModal;
