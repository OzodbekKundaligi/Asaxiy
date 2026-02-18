import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import './Navbar.css';
import {
  FaBars,
  FaBalanceScale,
  FaCreditCard,
  FaTruck,
  FaShoppingCart,
  FaHeart,
  FaGlobe,
  FaGoogle,
  FaSignOutAlt
} from 'react-icons/fa';
import { ACTION_LINKS, CATEGORY_LINKS, DEFAULT_CATEGORY } from '../config/navigation';

const USER_STORAGE_KEY = 'saxiy_google_user';
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const GOOGLE_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';
const MISSING_CLIENT_ID_MESSAGE = "Google login uchun VITE_GOOGLE_CLIENT_ID ni .env va Netlify Environment Variables ga qo'shing.";

const ACTION_ICON_MAP = {
  "Taqqoslash": <FaBalanceScale />,
  "To'lov qilish": <FaCreditCard />,
  'Buyurtma holati': <FaTruck />,
  Savat: <FaShoppingCart />,
  Sevimlilar: <FaHeart />
};

function Navbar({ searchQuery = '', onSearchChange = () => {} }) {
  const tokenClientRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [googleReady, setGoogleReady] = useState(false);
  const [language, setLanguage] = useState('uz');
  const [user, setUser] = useState(() => {
    if (typeof window === 'undefined') {
      return null;
    }

    const savedUser = localStorage.getItem(USER_STORAGE_KEY);
    if (!savedUser) {
      return null;
    }

    try {
      return JSON.parse(savedUser);
    } catch (error) {
      localStorage.removeItem(USER_STORAGE_KEY);
      console.error('Saved user parsing failed:', error);
      return null;
    }
  });
  const [authStatus, setAuthStatus] = useState(() => (GOOGLE_CLIENT_ID ? '' : MISSING_CLIENT_ID_MESSAGE));

  const createTokenClient = () => {
    const oauth2 = window.google?.accounts?.oauth2;
    if (!oauth2 || !GOOGLE_CLIENT_ID) {
      return null;
    }

    return oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: 'openid profile email',
      callback: () => {}
    });
  };

  useEffect(() => {
    let isUnmounted = false;
    let pollTimer = null;

    const initGoogleClient = () => {
      if (!GOOGLE_CLIENT_ID) {
        return false;
      }

      const client = createTokenClient();
      if (!client) {
        return false;
      }

      tokenClientRef.current = client;
      if (!isUnmounted) {
        setGoogleReady(true);
        setAuthStatus('');
      }
      return true;
    };

    if (initGoogleClient()) {
      return undefined;
    }

    const existingScript = document.querySelector('script[data-google-gsi="true"]');
    const script = existingScript || document.createElement('script');

    if (!existingScript) {
      script.src = GOOGLE_SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      script.dataset.googleGsi = 'true';
      document.head.appendChild(script);
    }

    const startInitPolling = () => {
      if (!GOOGLE_CLIENT_ID) {
        return;
      }

      if (initGoogleClient()) {
        return;
      }

      let attempts = 0;
      const maxAttempts = 30;

      pollTimer = window.setInterval(() => {
        attempts += 1;

        if (initGoogleClient()) {
          window.clearInterval(pollTimer);
          pollTimer = null;
          return;
        }

        if (attempts >= maxAttempts) {
          window.clearInterval(pollTimer);
          pollTimer = null;
          if (!isUnmounted) {
            setAuthStatus("Google auth yuklanmadi. Internet yoki adblockni tekshiring.");
          }
        }
      }, 200);
    };

    const handleScriptError = () => {
      if (isUnmounted) {
        return;
      }

      setGoogleReady(false);
      setAuthStatus("Google skript yuklanmadi. Internet yoki brauzer bloklovchisini tekshiring.");
    };

    script.addEventListener('load', startInitPolling);
    script.addEventListener('error', handleScriptError);

    if (window.google?.accounts?.oauth2) {
      startInitPolling();
    }

    return () => {
      isUnmounted = true;
      script.removeEventListener('load', startInitPolling);
      script.removeEventListener('error', handleScriptError);
      if (pollTimer) {
        window.clearInterval(pollTimer);
      }
    };
  }, []);

  const fetchGoogleProfile = async (accessToken) => {
    const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error("Google profile so'rovida xatolik bo'ldi.");
    }

    return response.json();
  };

  const handleGoogleAuth = (mode) => {
    if (!GOOGLE_CLIENT_ID) {
      setAuthStatus(MISSING_CLIENT_ID_MESSAGE);
      return;
    }

    if (!tokenClientRef.current && window.google?.accounts?.oauth2) {
      tokenClientRef.current = createTokenClient();
      if (tokenClientRef.current) {
        setGoogleReady(true);
        setAuthStatus('');
      }
    }

    if (!tokenClientRef.current) {
      setAuthStatus("Google auth hali tayyor emas. Sahifani yangilab qayta urinib ko'ring.");
      return;
    }

    tokenClientRef.current.callback = async (tokenResponse) => {
      if (tokenResponse.error) {
        setAuthStatus('Google orqali autentifikatsiya amalga oshmadi.');
        return;
      }

      try {
        const profile = await fetchGoogleProfile(tokenResponse.access_token);
        const nextUser = {
          name: profile.name || profile.email || 'Foydalanuvchi',
          email: profile.email || '',
          picture: profile.picture || ''
        };

        setUser(nextUser);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
        setAuthStatus(mode === 'register' ? "Google orqali ro'yxatdan o'tdingiz." : 'Google orqali tizimga kirdingiz.');
      } catch (error) {
        console.error(error);
        setAuthStatus("Profil ma'lumotini olishda xatolik bo'ldi.");
      }
    };

    tokenClientRef.current.requestAccessToken({
      prompt: mode === 'register' ? 'consent select_account' : 'select_account'
    });
  };

  const handleLogout = () => {
    if (window.google?.accounts?.oauth2 && user?.email) {
      window.google.accounts.oauth2.revoke(user.email, () => {});
    }

    setUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
    setAuthStatus("Hisobdan chiqdingiz.");
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();

    const isCategoryRoute = CATEGORY_LINKS.some((category) => category.path === location.pathname);
    if (!isCategoryRoute) {
      navigate(DEFAULT_CATEGORY.path);
    }
  };

  const authDisabled = Boolean(GOOGLE_CLIENT_ID) && !googleReady;

  return (
    <header className="navbar">
      <div className="navbar-shell">
        <div className="navbar-top">
          <button className="logo logo-btn" type="button" onClick={() => navigate(DEFAULT_CATEGORY.path)}>
            <span className="logo-icon">A</span>
            <span className="logo-text">asaxiy</span>
          </button>

          <form className="search-box" onSubmit={handleSearchSubmit}>
            <button className="category-btn" type="button" onClick={() => navigate(DEFAULT_CATEGORY.path)}>
              <FaBars /> Kategoriyalar
            </button>
            <input
              type="text"
              placeholder="Mahsulot qidirish..."
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
            />
            <button className="search-btn" type="submit">
              Izlash
            </button>
          </form>

          <div className="actions">
            <div className="action-links">
              {ACTION_LINKS.map((item) => (
                <NavLink key={item.path} to={item.path} className={({ isActive }) => `action-item${isActive ? ' active' : ''}`}>
                  {ACTION_ICON_MAP[item.label]}
                  <span>{item.label}</span>
                </NavLink>
              ))}

              <button
                className="action-item action-lang"
                type="button"
                onClick={() => setLanguage((current) => (current === 'uz' ? 'ru' : 'uz'))}
              >
                <FaGlobe />
                <span>{language === 'uz' ? "O'zbekcha" : 'Ruscha'}</span>
              </button>
            </div>

            <div className="auth-panel">
              {user ? (
                <div className="user-box">
                  {user.picture ? (
                    <img className="user-avatar" src={user.picture} alt={user.name} />
                  ) : (
                    <span className="user-fallback">{user.name.charAt(0).toUpperCase()}</span>
                  )}
                  <span className="user-name">{user.name}</span>
                  <button className="logout-btn" type="button" onClick={handleLogout}>
                    <FaSignOutAlt />
                    Chiqish
                  </button>
                </div>
              ) : (
                <div className="auth-buttons">
                  <button
                    className="auth-btn login-btn"
                    type="button"
                    disabled={authDisabled}
                    onClick={() => handleGoogleAuth('login')}
                  >
                    <FaGoogle />
                    Login
                  </button>
                  <button
                    className="auth-btn register-btn"
                    type="button"
                    disabled={authDisabled}
                    onClick={() => handleGoogleAuth('register')}
                  >
                    <FaGoogle />
                    Register
                  </button>
                </div>
              )}

              {authStatus && <p className="auth-status">{authStatus}</p>}
              {GOOGLE_CLIENT_ID && !googleReady && !authStatus && <p className="auth-status">Google auth yuklanmoqda...</p>}
            </div>
          </div>
        </div>

        <nav className="navbar-bottom">
          {CATEGORY_LINKS.map((category) => (
            <NavLink key={category.path} to={category.path}>
              {category.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
