import { useEffect } from 'react';
import { useSettingsStore } from '../store/settingsStore';

const BrandManager = () => {
    const { settings, initialize } = useSettingsStore();

    useEffect(() => {
        initialize();
    }, []);

    useEffect(() => {
        if (settings?.general) {
            // Update Title
            if (settings.general.storeName) {
                document.title = settings.general.storeName;
            }

            // Update Favicon
            if (settings.general.favicon) {
                let link = document.querySelector("link[rel~='icon']");
                if (!link) {
                    link = document.createElement('link');
                    link.rel = 'icon';
                    document.getElementsByTagName('head')[0].appendChild(link);
                }
                link.href = settings.general.favicon;
            }
        }
    }, [settings]);

    return null;
};

export default BrandManager;
