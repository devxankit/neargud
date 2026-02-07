import { useEffect } from 'react';
import { useSettingsStore } from '../store/settingsStore';

const BrandManager = () => {
    const { settings, initialize } = useSettingsStore();

    useEffect(() => {
        initialize();
    }, []);

    useEffect(() => {
        const storeName = settings?.general?.storeName || 'Neargud';

        // Prevent "Appzeto" from ever appearing in the title if it somehow leaks through
        const finalTitle = storeName.includes('Appzeto') ? 'Neargud' : storeName;

        document.title = `${finalTitle} - Multi Vendor E-commerce`;

        // Update Favicon
        if (settings?.general?.favicon) {
            let link = document.querySelector("link[rel~='icon']");
            if (!link) {
                link = document.createElement('link');
                link.rel = 'icon';
                document.getElementsByTagName('head')[0].appendChild(link);
            }
            link.href = settings.general.favicon;
        }
    }, [settings]);

    return null;
};

export default BrandManager;
