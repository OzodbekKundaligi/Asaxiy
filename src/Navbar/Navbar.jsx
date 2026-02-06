import React from "react";
import "./Navbar.css";
import {
  FaBars,
  FaBalanceScale,
  FaCreditCard,
  FaTruck,
  FaShoppingCart,
  FaHeart,
  FaGlobe,
  FaUser
} from "react-icons/fa";

function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-top">
       
        <div className="logo">
          <span className="logo-icon">A</span>
          <span className="logo-text">asaxiy</span>
        </div>

     
        <div className="search-box">
          <button className="category-btn">
            <FaBars /> Kategorii
          </button>
          <input type="text" placeholder="Поиск..." />
          <button className="search-btn">Искать</button>
        </div>

 
        <div className="actions">
          <div className="action-item">
            <FaBalanceScale />
            <span>Сравнение</span>
          </div>
          <div className="action-item">
            <FaCreditCard />
            <span>Оплатить</span>
          </div>
          <div className="action-item">
            <FaTruck />
            <span>Отследить</span>
          </div>
          <div className="action-item">
            <FaShoppingCart />
            <span>Корзина</span>
           
          </div>
          <div className="action-item">
            <FaHeart />
            <span>Избранное</span>
           
          </div>
          <div className="action-item">
            <FaGlobe />
            <span>O‘zbekcha</span>
          </div>
          <div className="action-item">
            <FaUser />
            <span>Войти</span>
          </div>
        </div>
      </div>

     
      <nav className="navbar-bottom">
        <a href="#">Супер цена</a>
        <a href="#">0-0-6</a>
        <a href="#">Воздухоочистители</a>
        <a href="#">Смартфоны</a>
        <a href="#">Бытовая техника</a>
        <a href="#">Книги</a>
        <a href="#">Телевизоры</a>
        <a href="#">Ноутбуки</a>
      </nav>
    </header>
  );
}

export default Navbar;
