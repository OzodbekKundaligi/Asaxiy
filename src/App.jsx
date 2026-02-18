import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Product from './Product/Product';
import RouteInfoPage from './pages/RouteInfoPage';
import { ACTION_LINKS, CATEGORY_LINKS, DEFAULT_CATEGORY } from './config/navigation';
import { CART_STORAGE_KEY, COMPARE_STORAGE_KEY, FAVORITES_STORAGE_KEY } from './config/storage';

const actionPageMeta = {
  '/taqqoslash': {
    title: 'Taqqoslash',
    description: "Bu bo'limda siz mahsulotlarni bir-biri bilan taqqoslashingiz mumkin.",
    hint: "Mahsulot kartasidagi 'Taqqoslash' tugmasi bilan ro'yxatga qo'shing.",
    storageKey: COMPARE_STORAGE_KEY
  },
  '/tolov-qilish': {
    title: "To'lov qilish",
    description: "Buyurtmalar uchun to'lovni tez va xavfsiz tarzda amalga oshiring.",
    hint: "Savatdan keyin to'lov jarayoni shu bo'lim orqali davom etadi."
  },
  '/buyurtma-holati': {
    title: 'Buyurtma holati',
    description: 'Berilgan buyurtmalarning statusini va yetkazib berish bosqichini kuzating.',
    hint: "Yaqinda bu bo'limga buyurtma tracking raqami bilan tekshiruv qo'shiladi."
  },
  '/savat': {
    title: 'Savat',
    description: "Savatga qo'shilgan mahsulotlar ro'yxati shu bo'limda jamlanadi.",
    hint: "Mahsulot kartasidagi 'Savatga' tugmasi shu bo'lim bilan bog'langan.",
    storageKey: CART_STORAGE_KEY
  },
  '/sevimlilar': {
    title: 'Sevimlilar',
    description: "Sizga yoqqan mahsulotlarni keyinroq ko'rish uchun saqlash bo'limi.",
    hint: "Yurak ikonkasini bosib sevimlilarga qo'shishingiz mumkin.",
    storageKey: FAVORITES_STORAGE_KEY
  }
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to={DEFAULT_CATEGORY.path} replace />} />

      {CATEGORY_LINKS.map((category) => (
        <Route key={category.path} path={category.path} element={<Product category={category} />} />
      ))}

      {ACTION_LINKS.map((action) => (
        <Route
          key={action.path}
          path={action.path}
          element={
            <RouteInfoPage
              title={actionPageMeta[action.path]?.title || action.label}
              description={actionPageMeta[action.path]?.description || "Bo'lim tayyorlanmoqda."}
              hint={actionPageMeta[action.path]?.hint || "Yaqinda to'liq funksiyalar qo'shiladi."}
              storageKey={actionPageMeta[action.path]?.storageKey}
            />
          }
        />
      ))}

      <Route path="*" element={<Navigate to={DEFAULT_CATEGORY.path} replace />} />
    </Routes>
  );
}

export default App;
