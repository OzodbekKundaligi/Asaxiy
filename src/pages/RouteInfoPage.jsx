import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import './RouteInfoPage.css';

const getStoredCount = (storageKey) => {
  if (!storageKey || typeof window === 'undefined') {
    return 0;
  }

  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) {
      return 0;
    }

    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.length;
    }

    if (parsed && typeof parsed === 'object') {
      return Object.values(parsed).reduce((sum, value) => sum + (Number(value) || 0), 0);
    }
  } catch (error) {
    console.error(`Storage parse error for ${storageKey}:`, error);
  }

  return 0;
};

function RouteInfoPage({ title, description, hint, storageKey }) {
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const [savedCount, setSavedCount] = useState(() => getStoredCount(storageKey));

  React.useEffect(() => {
    setSavedCount(getStoredCount(storageKey));
  }, [storageKey, location.pathname]);

  return (
    <>
      <Navbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <main className="route-info-page">
        <section className="route-info-card">
          <h1>{title}</h1>
          <p>{description}</p>
          {storageKey && <strong className="route-info-count">Saqlangan mahsulotlar soni: {savedCount}</strong>}
          <span>{hint}</span>
        </section>
      </main>
      <Footer />
    </>
  );
}

export default RouteInfoPage;
