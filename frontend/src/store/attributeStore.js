import { create } from 'zustand';
import attributeApi from '../services/attributeApi';
import toast from 'react-hot-toast';

const useAttributeStore = create((set, get) => ({
    // --- State ---
    attributes: [],
    attributeSets: [],
    attributeValues: [],

    loadingAttributes: false,
    loadingSets: false,
    loadingValues: false,

    error: null,

    // Pagination/Metadata if needed (backend currently returns all, but good to have)
    // For now simple arrays since backend returns { data: { attributes: [] } }

    // --- Actions: Attributes ---
    fetchAttributes: async (params = {}) => {
        set({ loadingAttributes: true, error: null });
        try {
            const response = await attributeApi.getAllAttributes(params);
            if (response.success) {
                set({ attributes: response.data.attributes, loadingAttributes: false });
            }
        } catch (error) {
            console.error('Error fetching attributes:', error);
            set({ loadingAttributes: false, error: error.message });
            // toast.error('Failed to fetch attributes'); // Optional to spam toast on load
        }
    },

    createAttribute: async (data) => {
        set({ loadingAttributes: true });
        try {
            const response = await attributeApi.createAttribute(data);
            if (response.success) {
                // Optimistic update or refetch
                // set((state) => ({ attributes: [...state.attributes, response.data.attribute] }));
                await get().fetchAttributes(); // Refetch to ensure sort order etc
                toast.success(response.message || 'Attribute created');
                set({ loadingAttributes: false });
                return true;
            }
        } catch (error) {
            console.error('Error creating attribute:', error);
            toast.error(error.response?.data?.message || 'Failed to create attribute');
            set({ loadingAttributes: false });
            return false;
        }
    },

    updateAttribute: async (id, data) => {
        set({ loadingAttributes: true });
        try {
            const response = await attributeApi.updateAttribute(id, data);
            if (response.success) {
                await get().fetchAttributes();
                toast.success(response.message || 'Attribute updated');
                set({ loadingAttributes: false });
                return true;
            }
        } catch (error) {
            console.error('Error updating attribute:', error);
            toast.error(error.response?.data?.message || 'Failed to update attribute');
            set({ loadingAttributes: false });
            return false;
        }
    },

    deleteAttribute: async (id) => {
        // Optimistic?
        set({ loadingAttributes: true });
        try {
            const response = await attributeApi.deleteAttribute(id);
            if (response.success) {
                set((state) => ({ attributes: state.attributes.filter((a) => a._id !== id) }));
                toast.success(response.message || 'Attribute deleted');
                set({ loadingAttributes: false });
                return true;
            }
        } catch (error) {
            console.error('Error deleting attribute:', error);
            toast.error(error.response?.data?.message || 'Failed to delete attribute');
            set({ loadingAttributes: false });
            return false;
        }
    },

    // --- Actions: Attribute Sets ---
    fetchAttributeSets: async (params = {}) => {
        set({ loadingSets: true, error: null });
        try {
            const response = await attributeApi.getAllAttributeSets(params);
            if (response.success) {
                set({ attributeSets: response.data.attributeSets, loadingSets: false });
            }
        } catch (error) {
            console.error('Error fetching attribute sets:', error);
            set({ loadingSets: false, error: error.message });
        }
    },

    createAttributeSet: async (data) => {
        set({ loadingSets: true });
        try {
            const response = await attributeApi.createAttributeSet(data);
            if (response.success) {
                await get().fetchAttributeSets();
                toast.success(response.message || 'Attribute set created');
                set({ loadingSets: false });
                return true;
            }
        } catch (error) {
            console.error('Error creating attribute set:', error);
            toast.error(error.response?.data?.message || 'Failed to create attribute set');
            set({ loadingSets: false });
            return false;
        }
    },

    updateAttributeSet: async (id, data) => {
        set({ loadingSets: true });
        try {
            const response = await attributeApi.updateAttributeSet(id, data);
            if (response.success) {
                await get().fetchAttributeSets();
                toast.success(response.message || 'Attribute set updated');
                set({ loadingSets: false });
                return true;
            }
        } catch (error) {
            console.error('Error updating attribute set:', error);
            toast.error(error.response?.data?.message || 'Failed to update attribute set');
            set({ loadingSets: false });
            return false;
        }
    },

    deleteAttributeSet: async (id) => {
        set({ loadingSets: true });
        try {
            const response = await attributeApi.deleteAttributeSet(id);
            if (response.success) {
                set((state) => ({ attributeSets: state.attributeSets.filter((s) => s._id !== id) }));
                toast.success(response.message || 'Attribute set deleted');
                set({ loadingSets: false });
                return true;
            }
        } catch (error) {
            console.error('Error deleting attribute set:', error);
            toast.error(error.response?.data?.message || 'Failed to delete attribute set');
            set({ loadingSets: false });
            return false;
        }
    },

    // --- Actions: Attribute Values ---
    fetchAttributeValues: async (params = {}) => {
        set({ loadingValues: true, error: null });
        try {
            const response = await attributeApi.getAllAttributeValues(params);
            if (response.success) {
                set({ attributeValues: response.data.attributeValues, loadingValues: false });
            }
        } catch (error) {
            console.error('Error fetching attribute values:', error);
            set({ loadingValues: false, error: error.message });
        }
    },

    createAttributeValue: async (data) => {
        set({ loadingValues: true });
        try {
            const response = await attributeApi.createAttributeValue(data);
            await get().fetchAttributeValues();
            toast.success(response.message || 'Attribute value added');
            set({ loadingValues: false });
            return true;
        } catch (error) {
            console.error('Error creating attribute value:', error);
            toast.error(error.response?.data?.message || 'Failed to create attribute value');
            set({ loadingValues: false });
            return false;
        }
    },

    updateAttributeValue: async (id, data) => {
        set({ loadingValues: true });
        try {
            const response = await attributeApi.updateAttributeValue(id, data);
            if (response.success) {
                // Update local state directly?
                set((state) => ({
                    attributeValues: state.attributeValues.map(v =>
                        v._id === id ? response.data.attributeValue : v
                    )
                }));
                toast.success(response.message || 'Attribute value updated');
                set({ loadingValues: false });
                return true;
            }
        } catch (error) {
            console.error('Error updating attribute value:', error);
            toast.error(error.response?.data?.message || 'Failed to update attribute value');
            set({ loadingValues: false });
            return false;
        }
    },

    deleteAttributeValue: async (id) => {
        set({ loadingValues: true });
        try {
            const response = await attributeApi.deleteAttributeValue(id);
            if (response.success) {
                set((state) => ({ attributeValues: state.attributeValues.filter((v) => v._id !== id) }));
                toast.success(response.message || 'Attribute value deleted');
                set({ loadingValues: false });
                return true;
            }
        } catch (error) {
            console.error('Error deleting attribute value:', error);
            toast.error(error.response?.data?.message || 'Failed to delete attribute value');
            set({ loadingValues: false });
            return false;
        }
    },
}));

export default useAttributeStore;




