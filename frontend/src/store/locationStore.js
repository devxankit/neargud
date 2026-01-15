import { create } from 'zustand';
import toast from 'react-hot-toast';
import {
    fetchCities,
    createCity,
    updateCity,
    deleteCity,
    fetchZipcodes,
    createZipcode,
    updateZipcode,
    deleteZipcode,
} from '../services/locationApi';

export const useLocationStore = create((set, get) => ({
    cities: [],
    zipcodes: [],
    currentCity: null, // User's selected city
    isLoading: false,

    // Initialize location from localStorage
    initialize: () => {
        const storedCity = localStorage.getItem('selected-city');
        if (storedCity) {
            try {
                set({ currentCity: JSON.parse(storedCity) });
            } catch (error) {
                console.error('Failed to parse stored city:', error);
                localStorage.removeItem('selected-city');
            }
        }
    },

    // Select City
    selectCity: (city) => {
        set({ currentCity: city });
        if (city) {
            localStorage.setItem('selected-city', JSON.stringify(city));
        } else {
            localStorage.removeItem('selected-city');
        }
    },

    // City Actions
    fetchCities: async (params = {}) => {
        set({ isLoading: true });
        try {
            const response = await fetchCities(params);
            const cities = (response || []).map(c => ({ ...c, id: c._id }));
            set({ cities, isLoading: false });
            return cities;
        } catch (error) {
            set({ isLoading: false });
            toast.error('Failed to fetch cities');
        }
    },

    createCity: async (data) => {
        set({ isLoading: true });
        try {
            const response = await createCity(data);
            const newCity = { ...response, id: response._id };
            set((state) => ({
                cities: [...state.cities, newCity],
                isLoading: false
            }));
            toast.success('City created successfully');
            return newCity;
        } catch (error) {
            set({ isLoading: false });
            toast.error(error.response?.data?.message || 'Failed to create city');
            throw error;
        }
    },

    updateCity: async (id, data) => {
        set({ isLoading: true });
        try {
            const response = await updateCity(id, data);
            const updatedCity = { ...response, id: response._id };
            set((state) => ({
                cities: state.cities.map((c) => (c._id === id || c.id === id ? updatedCity : c)),
                isLoading: false,
            }));
            toast.success('City updated successfully');
            return updatedCity;
        } catch (error) {
            set({ isLoading: false });
            toast.error(error.response?.data?.message || 'Failed to update city');
            throw error;
        }
    },

    deleteCity: async (id) => {
        set({ isLoading: true });
        try {
            await deleteCity(id);
            set((state) => ({
                cities: state.cities.filter((c) => c._id !== id && c.id !== id),
                isLoading: false,
            }));
            toast.success('City deleted successfully');
        } catch (error) {
            set({ isLoading: false });
            toast.error(error.response?.data?.message || 'Failed to delete city');
        }
    },

    // Zipcode Actions
    fetchZipcodes: async (params = {}) => {
        set({ isLoading: true });
        try {
            const response = await fetchZipcodes(params);
            const zipcodes = (response || []).map(z => ({ ...z, id: z._id }));
            set({ zipcodes, isLoading: false });
            return zipcodes;
        } catch (error) {
            set({ isLoading: false });
            toast.error('Failed to fetch zipcodes');
        }
    },

    createZipcode: async (data) => {
        set({ isLoading: true });
        try {
            const response = await createZipcode(data);
            const newZip = { ...response, id: response._id };
            set((state) => ({
                zipcodes: [...state.zipcodes, newZip],
                isLoading: false,
            }));
            toast.success('Zipcode created successfully');
            return newZip;
        } catch (error) {
            set({ isLoading: false });
            toast.error(error.response?.data?.message || 'Failed to create zipcode');
            throw error;
        }
    },

    updateZipcode: async (id, data) => {
        set({ isLoading: true });
        try {
            const response = await updateZipcode(id, data);
            const updatedZip = { ...response, id: response._id };
            set((state) => ({
                zipcodes: state.zipcodes.map((z) => (z._id === id || z.id === id ? updatedZip : z)),
                isLoading: false,
            }));
            toast.success('Zipcode updated successfully');
            return updatedZip;
        } catch (error) {
            set({ isLoading: false });
            toast.error(error.response?.data?.message || 'Failed to update zipcode');
            throw error;
        }
    },

    deleteZipcode: async (id) => {
        set({ isLoading: true });
        try {
            await deleteZipcode(id);
            set((state) => ({
                zipcodes: state.zipcodes.filter((z) => z._id !== id && z.id !== id),
                isLoading: false,
            }));
            toast.success('Zipcode deleted successfully');
        } catch (error) {
            set({ isLoading: false });
            toast.error(error.response?.data?.message || 'Failed to delete zipcode');
        }
    },
}));
