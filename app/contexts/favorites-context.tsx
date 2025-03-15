'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/app/components/ui/use-toast';

interface FavoritesContextProps {
  favorites: string[];
  toggleFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  loading: boolean;
}

const FavoritesContext = createContext<FavoritesContextProps>({
  favorites: [],
  toggleFavorite: () => {},
  isFavorite: () => false,
  loading: false
});

interface FavoritesProviderProps {
  children: ReactNode;
}

export function FavoritesProvider({ children }: FavoritesProviderProps) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isLocalStorageLoaded, setIsLocalStorageLoaded] = useState<boolean>(false);
  const { toast } = useToast();

  // Load favorites from localStorage on mount
  useEffect(() => {
    const loadFavorites = async () => {
      setLoading(true);

      try {
        // Check if we're in a browser environment (client-side)
        if (typeof window !== 'undefined') {
          // Load from localStorage
          const storedFavorites = localStorage.getItem('favorites');
          if (storedFavorites) {
            setFavorites(JSON.parse(storedFavorites));
          }

          // Try to fetch from API if available
          try {
            const response = await fetch('/api/favorites');
            if (response.ok) {
              const data = await response.json();
              // Only update if we got a valid response with favorites
              if (data.favorites && Array.isArray(data.favorites)) {
                setFavorites(data.favorites);
              }
            }
          } catch (apiError) {
            // API error is not critical since we already loaded from localStorage
            console.error('Error fetching favorites from API (using localStorage):', apiError);
          }
        }
      } catch (error) {
        console.error('Error loading favorites:', error);
        toast({
          title: "Eroare",
          description: "Nu s-au putut încărca produsele favorite",
          variant: "destructive"
        });
      } finally {
        setIsLocalStorageLoaded(true);
        setLoading(false);
      }
    };

    loadFavorites();
  }, [toast]);

  // Save favorites to localStorage when they change
  useEffect(() => {
    if (isLocalStorageLoaded && typeof window !== 'undefined') {
      localStorage.setItem('favorites', JSON.stringify(favorites));
    }
  }, [favorites, isLocalStorageLoaded]);

  // Toggle a product in favorites
  const toggleFavorite = async (productId: string) => {
    // Optimistic UI update
    const isFavorited = favorites.includes(productId);

    // Update local state immediately
    setFavorites((prevFavorites) => {
      if (isFavorited) {
        return prevFavorites.filter(id => id !== productId);
      } else {
        return [...prevFavorites, productId];
      }
    });

    // Try to update the server
    try {
      if (isFavorited) {
        // Remove from favorites on the server
        const response = await fetch(`/api/favorites?productId=${productId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          // If 401, user is not authenticated, which is fine - we keep the local update
          if (response.status !== 401) {
            throw new Error('Failed to remove from favorites');
          }
        }
      } else {
        // Add to favorites on the server
        const response = await fetch('/api/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ productId }),
        });

        if (!response.ok) {
          // If 401, user is not authenticated, which is fine - we keep the local update
          if (response.status !== 401) {
            throw new Error('Failed to add to favorites');
          }
        }
      }
    } catch (error) {
      console.error('Error updating favorites:', error);

      // Only revert the optimistic update if it's a true error (not an auth issue)
      if (!(error instanceof Response && error.status === 401)) {
        // Revert the optimistic update if the server request failed
        setFavorites((prevFavorites) => {
          if (isFavorited) {
            return [...prevFavorites, productId];
          } else {
            return prevFavorites.filter(id => id !== productId);
          }
        });

        toast({
          title: "Eroare",
          description: isFavorited
            ? "Nu s-a putut elimina produsul din favorite"
            : "Nu s-a putut adăuga produsul la favorite",
          variant: "destructive"
        });
      }
    }
  };

  // Check if a product is in favorites
  const isFavorite = (productId: string) => {
    return favorites.includes(productId);
  };

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite, loading }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export const useFavorites = () => useContext(FavoritesContext);
