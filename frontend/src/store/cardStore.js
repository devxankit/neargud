import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useCardStore = create(
    persist(
        (set, get) => ({
            cards: [
                { id: 1, type: 'Visa', number: '•••• •••• •••• 4242', holder: 'John Doe', expiry: '12/24', color: 'from-blue-600 to-blue-800' },
                { id: 2, type: 'Mastercard', number: '•••• •••• •••• 8888', holder: 'John Doe', expiry: '09/25', color: 'from-purple-600 to-purple-800' }
            ],
            isLoading: false,

            addCard: (card) => {
                const newCard = {
                    ...card,
                    id: Date.now(),
                    color: get().getRandomColor(),
                };
                set((state) => ({
                    cards: [...state.cards, newCard]
                }));
                return newCard;
            },

            deleteCard: (id) => {
                set((state) => ({
                    cards: state.cards.filter((c) => c.id !== id)
                }));
            },

            getRandomColor: () => {
                const colors = [
                    'from-blue-600 to-blue-800',
                    'from-purple-600 to-purple-800',
                    'from-emerald-600 to-emerald-800',
                    'from-rose-600 to-rose-800',
                    'from-amber-600 to-amber-800',
                    'from-indigo-600 to-indigo-800',
                ];
                return colors[Math.floor(Math.random() * colors.length)];
            }
        }),
        {
            name: 'card-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
