import { useMemo } from "react";
import { Outlet, useLocation } from "react-router-dom";
import MobileLayout from "./MobileLayout";
import { getTheme } from "../../../utils/themes";
import { useCategoryStore } from "../../../store/categoryStore";
import { useTheme } from "../../../context/ThemeContext";

const MobileAppLayout = () => {
    const location = useLocation();
    const categories = useCategoryStore((state) => state.categories);

    // Determine current category for background synchronisation
    const getCurrentCategoryId = () => {
        const match = location.pathname.match(/\/(?:app\/)?category\/([a-zA-Z0-9]+)/);
        return match ? match[1] : null;
    };

    const currentCategoryId = getCurrentCategoryId();

    const { theme: contextTheme } = useTheme();

    // Sync app background with category-specific themes to prevent mismatching "pull" reveals
    const appBackground = useMemo(() => {
        const path = location.pathname;
        const isHome = path === '/' || path === '/app' || path === '/app/';

        if (currentCategoryId) {
            // Replicate theme mapping logic
            const themeMap = {
                '1': 'fashion', '2': 'footwear', '3': 'leather',
                '4': 'jewelry', '5': 'winter', '6': 'sports'
            };

            let tab = themeMap[currentCategoryId] || 'all';
            if (tab === 'all') {
                const category = categories.find(c => c.id === currentCategoryId || c._id === currentCategoryId);
                if (category?.name) {
                    const name = category.name.toLowerCase();
                    if (name.includes('cloth') || name.includes('fashion')) tab = 'fashion';
                    else if (name.includes('shoe') || name.includes('footwear')) tab = 'footwear';
                    else if (name.includes('bag') || name.includes('leather')) tab = 'leather';
                    else if (name.includes('jewel')) tab = 'jewelry';
                    else if (name.includes('winter')) tab = 'winter';
                    else if (name.includes('sport')) tab = 'sports';
                    else if (name.includes('beauty')) tab = 'beauty';
                    else if (name.includes('electron')) tab = 'electronics';
                    else if (name.includes('grocer')) tab = 'grocery';
                }
            }
            const catTheme = getTheme(tab);
            return catTheme.primary[1];
        }

        return isHome ? contextTheme.primary[1] : 'transparent';
    }, [currentCategoryId, location.pathname, contextTheme, categories]);

    return (
        <MobileLayout style={{ background: appBackground }}>
            {/* 
          We wrap the Outlet with a key based on the pathname (excluding sub-routes if needed)
          to ensure page content remounts and triggers its own transitions/data fetching,
          while the MobileLayout (and thus MobileHeader) stays persistent.
      */}
            <div key={location.pathname} className="w-full h-full">
                <Outlet />
            </div>
        </MobileLayout>
    );
};

export default MobileAppLayout;
