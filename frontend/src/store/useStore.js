import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { getProductById } from '../data/products';
import toast from 'react-hot-toast';

// Cart Store
export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        // If the item itself has the necessary product details (stock info), use it
        // This is crucial for dynamic products from backend that aren't in the static data
        const productData = item.stockQuantity !== undefined ? item : getProductById(item.id);

        if (!productData && !item.name) {
          toast.error('Product details missing');
          return;
        }

        const isOutOfStock = productData ? (productData.stock === 'out_of_stock' || productData.stockQuantity <= 0) : false;

        if (isOutOfStock) {
          toast.error('Product is out of stock');
          return;
        }

        const existingItem = get().items.find((i) => i.id === (item._id || item.id));
        const quantityToAdd = item.quantity || 1;
        const newQuantity = existingItem
          ? existingItem.quantity + quantityToAdd
          : quantityToAdd;

        // Check stock limit if possible
        if (productData && productData.stockQuantity !== undefined && newQuantity > productData.stockQuantity) {
          toast.error(`Only ${productData.stockQuantity} items available in stock`);
          return;
        }

        if (newQuantity <= 0) {
          return;
        }

        // Ensure ID is consistent and include vendor info
        const itemWithConsistentId = {
          ...item,
          id: item._id || item.id,
          vendorId: item.vendorId || (productData?.vendorId) || 1,
          vendorName: item.name || (productData?.vendorName) || productData?.name,
        };

        set((state) => {
          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.id === (item._id || item.id)
                  ? { ...i, ...itemWithConsistentId, quantity: newQuantity }
                  : i
              ),
            };
          }
          return {
            items: [...state.items, { ...itemWithConsistentId, quantity: quantityToAdd }],
          };
        });

        if (productData && productData.stock === 'low_stock' && newQuantity >= (productData.stockQuantity || 0) * 0.8) {
          toast.warning(`Only ${productData.stockQuantity} left in stock!`);
        }

        // Trigger cart animation
        const { triggerCartAnimation } = useUIStore.getState();
        triggerCartAnimation();
      },
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),
      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }

        const product = getProductById(id);
        if (product && quantity > product.stockQuantity) {
          toast.error(`Only ${product.stockQuantity} items available in stock`);
          quantity = product.stockQuantity;
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity } : item
          ),
        }));
      },
      clearCart: () => set({ items: [] }),
      getTotal: () => {
        const state = useCartStore.getState();
        return state.items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },
      getItemCount: () => {
        const state = useCartStore.getState();
        return state.items.reduce((count, item) => count + item.quantity, 0);
      },
      // Group items by vendor
      getItemsByVendor: () => {
        const state = useCartStore.getState();
        const vendorGroups = {};

        state.items.forEach((item) => {
          const vendorId = item.vendorId || item.id || item._id;
          const vendorName = item.vendorName || item.name;

          if (!vendorGroups[vendorId]) {
            vendorGroups[vendorId] = {
              vendorId,
              vendorName,
              items: [],
              subtotal: 0,
            };
          }

          const itemSubtotal = item.price * item.quantity;
          vendorGroups[vendorId].items.push(item);
          vendorGroups[vendorId].subtotal += itemSubtotal;
        });

        return Object.values(vendorGroups);
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// UI Store (for modals, loading states, etc.)
export const useUIStore = create((set) => ({
  isMenuOpen: false,
  isCartOpen: false,
  isLoading: false,
  cartAnimationTrigger: 0,
  headerHeight: 190,
  toggleMenu: () => set((state) => ({ isMenuOpen: !state.isMenuOpen })),
  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
  setLoading: (loading) => set({ isLoading: loading }),
  triggerCartAnimation: () => set((state) => ({ cartAnimationTrigger: state.cartAnimationTrigger + 1 })),
  setHeaderHeight: (height) => set({ headerHeight: height }),
}));

