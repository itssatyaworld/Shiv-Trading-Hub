import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { ReactNode, createContext, useContext, useEffect, useMemo, useState } from 'react';

export type Language = 'en' | 'hi';
export type OrderStatus = 'NEW' | 'CONTACTED' | 'QUOTED' | 'CONFIRMED' | 'PROCESSING' | 'DISPATCHED' | 'COMPLETED' | 'CANCELLED';

export interface Product {
  id: string;
  brand: string;
  name: string;
  category: string;
  grade?: string;
  packSize?: string;
  application?: string;
  imageUrl?: string;
  availability?: string;
  imageStatus?: 'verified' | 'placeholder';
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface CustomerProfile {
  name: string;
  business: string;
  phone: string;
  whatsapp: string;
  city: string;
  address: string;
}

export interface Order {
  id: string;
  createdAt: string;
  status: OrderStatus;
  items: CartItem[];
  message?: string;
}

export const brands = ['BLAZOL', 'BELLZOIL', 'EMPOWER'];
export const categories = ['Engine Oils', 'Gear Oils', 'Greases', 'Hydraulic Oils', 'Transmission Oils', 'Coolants', 'Brake Fluids', 'Differential Oils', 'Industrial Lubricants', 'Other Lubricants'];

export const products: Product[] = [
  { id: 'bellzoil-gear-power-75w90', brand: 'BELLZOIL', name: 'Gear Power 75W90 Gear Oil', category: 'Gear Oils', imageStatus: 'placeholder' },
  { id: 'bellzoil-gear-power-80w90', brand: 'BELLZOIL', name: 'Gear Power 80W90 Gear Oil', category: 'Gear Oils', imageStatus: 'placeholder' },
  { id: 'bellzoil-gear-power-85w140', brand: 'BELLZOIL', name: 'Gear Power 85W140', category: 'Gear Oils', imageStatus: 'placeholder' },
  { id: 'bellzoil-gear-lube-ep90', brand: 'BELLZOIL', name: 'Gear Lube EP 90 Gear Oil', category: 'Gear Oils', imageStatus: 'placeholder' },
  { id: 'bellzoil-gear-lube-ep140', brand: 'BELLZOIL', name: 'Gear Lube EP140 Gear Oil', category: 'Gear Oils', imageStatus: 'placeholder' },
  { id: 'bellzoil-long-run-grease', brand: 'BELLZOIL', name: 'Long Run Grease', category: 'Greases', imageStatus: 'placeholder' },
  { id: 'bellzoil-turbo-tc', brand: 'BELLZOIL', name: 'Turbo TC 15W40 CF4 Engine Oil', category: 'Engine Oils', imageStatus: 'placeholder' },
  { id: 'bellzoil-super-nxg', brand: 'BELLZOIL', name: 'Super NXG Engine Oil', category: 'Engine Oils', imageStatus: 'placeholder' },
  { id: 'empower-chassis-grease', brand: 'EMPOWER', name: 'Empower Chassis Grease', category: 'Greases', imageStatus: 'placeholder' },
  { id: 'empower-blue-gel-grease', brand: 'EMPOWER', name: 'Blue Gel Grease XHP', category: 'Greases', imageStatus: 'placeholder' },
  { id: 'empower-engine-oils', brand: 'EMPOWER', name: 'Empower Engine Oils', category: 'Engine Oils', imageStatus: 'placeholder' },
  { id: 'empower-coolant', brand: 'EMPOWER', name: 'Empower Coolant Products', category: 'Coolants', imageStatus: 'placeholder' },
  { id: 'empower-heavy-duty-gear', brand: 'EMPOWER', name: 'Heavy Duty Gear Oils', category: 'Gear Oils', imageStatus: 'placeholder' },
  { id: 'blazol-engine-oils', brand: 'BLAZOL', name: 'Blazol Engine Oils', category: 'Engine Oils', imageStatus: 'placeholder' },
  { id: 'blazol-greases', brand: 'BLAZOL', name: 'Blazol Greases', category: 'Greases', imageStatus: 'placeholder' },
];

const defaultProfile: CustomerProfile = { name: '', business: '', phone: '', whatsapp: '', city: 'Patna', address: '' };

const hi: Record<string, string> = {
  home: 'होम', products: 'उत्पाद', enquiry: 'पूछताछ', orders: 'ऑर्डर', profile: 'प्रोफ़ाइल',
  browseProducts: 'उत्पाद देखें', requestPrice: 'थोक मूल्य पूछें', whatsapp: 'व्हाट्सऐप करें', callNow: 'अभी कॉल करें',
  categories: 'श्रेणियां', brands: 'ब्रांड', featured: 'लोकप्रिय उत्पाद', viewAll: 'सभी देखें', exploreProducts: 'उत्पाद देखें',
  howItWorks: 'थोक ऑर्डर कैसे काम करता है', name: 'नाम', business: 'दुकान / व्यवसाय', phone: 'फोन नंबर', city: 'शहर',
  address: 'पता', message: 'संदेश', submit: 'थोक पूछताछ भेजें', reorder: 'फिर से ऑर्डर करें', save: 'प्रोफ़ाइल सहेजें',
};
const en: Record<string, string> = {
  home: 'Home', products: 'Products', enquiry: 'Enquiry', orders: 'Orders', profile: 'Profile',
  browseProducts: 'Browse products', requestPrice: 'Request wholesale price', whatsapp: 'WhatsApp us', callNow: 'Call now',
  categories: 'Categories', brands: 'Brands', featured: 'Popular products', viewAll: 'View all', exploreProducts: 'Explore products',
  howItWorks: 'How wholesale ordering works', name: 'Name', business: 'Business / shop', phone: 'Phone number', city: 'City',
  address: 'Address', message: 'Message', submit: 'Submit wholesale enquiry', reorder: 'Reorder', save: 'Save profile',
};

interface AppContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  labels: Record<string, string>;
  cart: CartItem[];
  orders: Order[];
  profile: CustomerProfile;
  addToCart: (productId: string) => void;
  removeFromCart: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  submitOrder: (message?: string) => void;
  reorder: (order: Order) => void;
  saveProfile: (profile: CustomerProfile) => void;
}

const AppContext = createContext<AppContextValue | null>(null);
const keys = { cart: '@shiv/cart', orders: '@shiv/orders', profile: '@shiv/profile', language: '@shiv/language' };

export function AppProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [profile, setProfile] = useState<CustomerProfile>(defaultProfile);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(keys.cart),
      AsyncStorage.getItem(keys.orders),
      AsyncStorage.getItem(keys.profile),
      AsyncStorage.getItem(keys.language),
    ]).then(([cartValue, ordersValue, profileValue, languageValue]) => {
      if (cartValue) setCart(JSON.parse(cartValue) as CartItem[]);
      if (ordersValue) setOrders(JSON.parse(ordersValue) as Order[]);
      if (profileValue) setProfile({ ...defaultProfile, ...(JSON.parse(profileValue) as CustomerProfile) });
      if (languageValue === 'en' || languageValue === 'hi') setLanguageState(languageValue);
    });
  }, []);

  const persist = (key: string, value: unknown) => AsyncStorage.setItem(key, JSON.stringify(value)).catch(() => undefined);
  const setLanguage = (value: Language) => { setLanguageState(value); persist(keys.language, value); };
  const addToCart = (productId: string) => setCart((previous) => {
    const exists = previous.find((item) => item.productId === productId);
    const next = exists ? previous.map((item) => item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item) : [...previous, { productId, quantity: 1 }];
    persist(keys.cart, next);
    return next;
  });
  const removeFromCart = (productId: string) => setCart((previous) => {
    const next = previous.filter((item) => item.productId !== productId);
    persist(keys.cart, next);
    return next;
  });
  const setQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return removeFromCart(productId);
    setCart((previous) => {
      const next = previous.map((item) => item.productId === productId ? { ...item, quantity } : item);
      persist(keys.cart, next);
      return next;
    });
  };
  const submitOrder = (message?: string) => {
    if (!cart.length) return;
    const nextOrder: Order = { id: `STA-${Date.now().toString().slice(-6)}`, createdAt: new Date().toISOString(), status: 'NEW', items: cart, message };
    setOrders((previous) => { const next = [nextOrder, ...previous]; persist(keys.orders, next); return next; });
    setCart([]);
    persist(keys.cart, []);
  };
  const reorder = (order: Order) => setCart(order.items.map((item) => ({ ...item })));
  const saveProfile = (value: CustomerProfile) => { setProfile(value); persist(keys.profile, value); };

  const value = useMemo(() => ({
    language, setLanguage, labels: language === 'hi' ? hi : en, cart, orders, profile,
    addToCart, removeFromCart, setQuantity, submitOrder, reorder, saveProfile,
  }), [language, cart, orders, profile]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}

export function getProduct(id: string) {
  return products.find((product) => product.id === id);
}