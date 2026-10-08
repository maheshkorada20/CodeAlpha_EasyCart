import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState({ products: [] });
  const [loading, setLoading] = useState(true);
  const { user, api } = useAuth();

  useEffect(() => {
    if (user) {
      fetchWishlist();
    } else {
      setWishlist({ products: [] });
      setLoading(false);
    }
  }, [user]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/wishlist');
      setWishlist(data);
    } catch (err) {
      console.error('Failed to fetch wishlist');
    } finally {
      setLoading(false);
    }
  };

  const toggleWishlist = async (productId) => {
    try {
      const isWishlisted = (wishlist?.products || []).find(p => (p?._id || p) === productId);
      
      if (isWishlisted) {
        const { data } = await api.delete(`/wishlist/${productId}`);
        setWishlist(data);
        return { action: 'removed' };
      } else {
        const { data } = await api.post(`/wishlist/${productId}`);
        setWishlist(data);
        return { action: 'added' };
      }
    } catch (err) {
      console.error('Wishlist toggle failed');
      return { error: true };
    }
  };

  const isInWishlist = (productId) => {
    return (wishlist?.products || []).some(p => (p?._id || p) === productId);
  };

  return (
    <WishlistContext.Provider value={{ wishlist, loading, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};
