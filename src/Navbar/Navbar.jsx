import React, { useEffect, useRef, useState } from "react";
import "./Navbar.css";
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
} from "react-icons/fa";

const USER_STORAGE_KEY = "saxiy_google_user";
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function Navbar({ searchQuery = "", onSearchChange = () => {} }) {
  const tokenClientRef = useRef(null);
  const [googleReady, setGoogleReady] = useState(false);
  const [user, setUser] = useState(() => {
    if (typeof window === "undefined") {
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
      console.error("Saved user parsing failed:", error);
      return null;
    }
  });
  const [authStatus, setAuthStatus] = useState("");

  const createTokenClient = () => {
    const oauth2 = window.google?.accounts?.oauth2;
    if (!oauth2 || !GOOGLE_CLIENT_ID) {
      return null;
    }

    return oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: "openid profile email",
      callback: () => {}
    });
  };

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      return;
    }

    let isUnmounted = false;
    let pollTimer = null;

    const initGoogleClient = () => {
      const client = createTokenClient();
      if (!client) {
        return false;
      }

      tokenClientRef.current = client;
      if (!isUnmounted) {
        setGoogleReady(true);
        setAuthStatus("");
      }
      return true;
    };

    if (initGoogleClient()) {
      return;
    }

    const existingScript = document.querySelector('script[data-google-gsi="true"]');
    const script = existingScript || document.createElement("script");

    if (!existingScript) {
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.dataset.googleGsi = "true";
      document.head.appendChild(script);
    }

    const startInitPolling = () => {
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

    script.addEventListener("load", startInitPolling);
    script.addEventListener("error", handleScriptError);

    if (window.google?.accounts?.oauth2) {
      startInitPolling();
    }

    return () => {
      isUnmounted = true;
      script.removeEventListener("load", startInitPolling);
      script.removeEventListener("error", handleScriptError);
      if (pollTimer) {
        window.clearInterval(pollTimer);
      }
    };
  }, []);

  const fetchGoogleProfile = async (accessToken) => {
    const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
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
      setAuthStatus("Google auth uchun .env ichida VITE_GOOGLE_CLIENT_ID kiriting.");
      return;
    }

    if (!tokenClientRef.current && window.google?.accounts?.oauth2) {
      tokenClientRef.current = createTokenClient();
      if (tokenClientRef.current) {
        setGoogleReady(true);
        setAuthStatus("");
      }
    }

    if (!tokenClientRef.current) {
      setAuthStatus("Google auth hali tayyor emas. Sahifani yangilab qayta urinib ko'ring.");
      return;
    }

    tokenClientRef.current.callback = async (tokenResponse) => {
      if (tokenResponse.error) {
        setAuthStatus("Google orqali autentifikatsiya amalga oshmadi.");
        return;
      }

      try {
        const profile = await fetchGoogleProfile(tokenResponse.access_token);
        const nextUser = {
          name: profile.name || profile.email || "Foydalanuvchi",
          email: profile.email || "",
          picture: profile.picture || ""
        };

        setUser(nextUser);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));

        if (mode === "register") {
          setAuthStatus("Google orqali ro'yxatdan o'tdingiz.");
        } else {
          setAuthStatus("Google orqali tizimga kirdingiz.");
        }
      } catch (error) {
        console.error(error);
        setAuthStatus("Profil ma'lumotini olishda xatolik bo'ldi.");
      }
    };

    tokenClientRef.current.requestAccessToken({
      prompt: mode === "register" ? "consent select_account" : "select_account"
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

  const actionItems = [
    { icon: <FaBalanceScale />, label: "Taqqoslash" },
    { icon: <FaCreditCard />, label: "To'lov qilish" },
    { icon: <FaTruck />, label: "Buyurtma holati" },
    { icon: <FaShoppingCart />, label: "Savat" },
    { icon: <FaHeart />, label: "Sevimlilar" }
  ];

  const navLinks = [
    "Super narx",
    "0-0-6",
    "Havo tozalagichlar",
    "Smartfonlar",
    "Maishiy texnika",
    "Kitoblar",
    "Televizorlar",
    "Noutbuklar"
  ];

  return (
    <header className="navbar">
      <div className="navbar-shell">
        <div className="navbar-top">
          <div className="logo">
            <span className="logo-icon">A</span>
            <span className="logo-text">asaxiy</span>
          </div>

          <form
            className="search-box"
            onSubmit={(event) => {
              event.preventDefault();
            }}
          >
            <button className="category-btn" type="button">
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
              {actionItems.map((item) => (
                <div className="action-item" key={item.label}>
                  {item.icon}
                  <span>{item.label}</span>
                </div>
              ))}

              <div className="action-item">
                <FaGlobe />
                <span>O'zbekcha</span>
              </div>
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
                    disabled={!googleReady}
                    onClick={() => handleGoogleAuth("login")}
                  >
                    <FaGoogle />
                    Login
                  </button>
                  <button
                    className="auth-btn register-btn"
                    type="button"
                    disabled={!googleReady}
                    onClick={() => handleGoogleAuth("register")}
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
          {navLinks.map((link) => (
            <a href="#" key={link}>
              {link}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
