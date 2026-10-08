import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, api } = useAuth();

  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setCart(null);
      setLoading(false);
    }
  }, [user]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/cart');
      setCart(data);
    } catch (err) {
      console.error('Failed to fetch cart');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, variantId, quantity = 1) => {
    try {
      const { data } = await api.post('/cart/items', { productId, variantId, quantity });
      setCart(data);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Error adding to cart' };
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      const { data } = await api.put(`/cart/items/${itemId}`, { quantity });
      setCart(data);
    } catch (err) {
      console.error('Update failed');
      throw err;
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      const { data } = await api.delete(`/cart/items/${itemId}`);
      setCart(data);
    } catch (err) {
      console.error('Remove failed');
    }
  };

  const clearCart = async () => {
    try {
      await api.delete('/cart');
      setCart(prev => ({ ...prev, items: [] }));
    } catch (err) {
      console.error('Clear cart failed');
    }
  };

  const saveForLater = async (itemId) => {
    try {
      const { data } = await api.post('/cart/save-for-later', { itemId });
      setCart(data);
    } catch (err) {
      console.error('Save for later failed');
    }
  };

  const moveToCart = async (itemId) => {
    try {
      const { data } = await api.post('/cart/move-to-cart', { itemId });
      setCart(data);
    } catch (err) {
      console.error('Move to cart failed');
    }
  };

  return (
    <CartContext.Provider value={{ cart, loading, addToCart, updateQuantity, removeFromCart, clearCart, saveForLater, moveToCart }}>
      {children}
    </CartContext.Provider>
  );
};
