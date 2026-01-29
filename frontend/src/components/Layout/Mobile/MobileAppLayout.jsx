import { Outlet, useLocation } from "react-router-dom";
import MobileLayout from "./MobileLayout";
import { useMemo } from "react";
import { getTheme } from "../../../utils/themes";
import { useCategoryStore } from "../../../store/categoryStore";

const MobileAppLayout = () => {
    const location = useLocation();
    const categories = useCategoryStore((state) => state.categories);

    // Determine current category for background synchronisation
    const getCurrentCategoryId = () => {
        const match = location.pathname.match(/\/(?:app\/)?category\/([a-zA-Z0-9]+)/);
        return match ? match[1] : null;
    };

    const currentCategoryId = getCurrentCategoryId();

    // Unified theme background logic for the entire mobile app
    const appBackground = useMemo(() => {
        if (currentCategoryId) {
            const category = categories.find(c => (c.id === currentCategoryId || c._id === currentCategoryId));
            const catName = category?.name;

            // Basic theme mapping logic
            const themeMap = {
                '1': 'fashion',
                '2': 'footwear',
                '3': 'leather',
                '4': 'jewelry',
                '5': 'winter',
                '6': 'sports',
            };

            let themeTab = themeMap[currentCategoryId] || 'all';

            if (themeTab === 'all' && catName) {
                const name = catName.toLowerCase();
                if (name.includes('cloth') || name.includes('fashion')) themeTab = 'fashion';
                else if (name.includes('shoe') || name.includes('footwear')) themeTab = 'footwear';
                else if (name.includes('bag') || name.includes('leather')) themeTab = 'leather';
                else if (name.includes('jewel')) themeTab = 'jewelry';
                else if (name.includes('winter')) themeTab = 'winter';
                else if (name.includes('sport')) themeTab = 'sports';
                else if (name.includes('beauty')) themeTab = 'beauty';
                else if (name.includes('electron')) themeTab = 'electronics';
                else if (name.includes('grocer')) themeTab = 'grocery';
            }

            const categoryTheme = getTheme(themeTab);
            return `linear-gradient(to bottom, ${categoryTheme.primary[0]} 0%, ${categoryTheme.primary[1]} 100%)`;
        }

        if (location.pathname === '/' || location.pathname === '/app' || location.pathname === '/app/') {
            // Default home gradient
            return `linear-gradient(to bottom, rgb(91, 33, 182) 0px, rgb(109, 40, 217) 350px, #f8fafc 600px, #f8fafc 100%)`;
        }

        return 'transparent';
    }, [currentCategoryId, location.pathname, categories]);

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
