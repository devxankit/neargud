export const themes = {
    all: {
        primary: ['rgb(91, 33, 182)', 'rgb(109, 40, 217)', 'rgb(124, 58, 237)', 'rgb(139, 92, 246)'],
        secondary: ['rgb(139, 92, 246)', 'rgb(124, 58, 237)', 'rgb(109, 40, 217)'],
        textColor: '#5b21b6',
        accentColor: '#6d28d9',
        bannerText: 'HOUSEFULL',
        saleText: 'SALE',
        isDark: true,
    },
    wedding: {
        primary: ['rgb(252, 165, 165)', 'rgb(253, 182, 182)', 'rgb(254, 202, 202)', 'rgb(255, 228, 228)'],
        secondary: ['rgb(255, 228, 228)', 'rgb(254, 202, 202)', 'rgb(253, 182, 182)'],
        textColor: '#7f1d1d',
        accentColor: '#991b1b',
        bannerText: 'WEDDING',
        saleText: 'SALE',
        isDark: false,
    },
    footwear: {
        primary: ['rgb(180, 130, 70)', 'rgb(205, 133, 63)', 'rgb(222, 184, 135)', 'rgb(238, 203, 173)'], // Medium brown to light brown
        secondary: ['rgb(238, 203, 173)', 'rgb(222, 184, 135)', 'rgb(205, 133, 63)'], // Light brown to medium brown
        textColor: '#8b5a3c', // Medium brown
        accentColor: '#a0826d', // Medium brown accent
        bannerText: 'FOOTWEAR',
        saleText: 'SALE',
        isDark: false,
    },
    winter: {
        primary: ['rgb(186, 230, 253)', 'rgb(191, 234, 255)', 'rgb(207, 250, 254)', 'rgb(224, 242, 254)'],
        secondary: ['rgb(224, 242, 254)', 'rgb(207, 250, 254)', 'rgb(191, 234, 255)'],
        textColor: '#0c4a6e',
        accentColor: '#075985',
        bannerText: 'WINTER',
        saleText: 'SALE',
        isDark: false,
    },
    electronics: {
        primary: ['rgb(253, 224, 71)', 'rgb(253, 230, 138)', 'rgb(254, 240, 138)', 'rgb(254, 249, 195)'],
        secondary: ['rgb(254, 249, 195)', 'rgb(254, 240, 138)', 'rgb(253, 230, 138)'],
        textColor: '#713f12',
        accentColor: '#854d0e',
        bannerText: 'ELECTRONICS',
        saleText: 'SALE',
        isDark: false,
    },
    beauty: {
        primary: ['rgb(251, 207, 232)', 'rgb(252, 218, 238)', 'rgb(253, 224, 239)', 'rgb(254, 240, 246)'],
        secondary: ['rgb(254, 240, 246)', 'rgb(253, 224, 239)', 'rgb(252, 218, 238)'],
        textColor: '#831843',
        accentColor: '#9f1239',
        bannerText: 'BEAUTY',
        saleText: 'SALE',
        isDark: false,
    },
    grocery: {
        primary: ['rgb(187, 247, 208)', 'rgb(209, 250, 229)', 'rgb(220, 252, 231)', 'rgb(236, 253, 245)'],
        secondary: ['rgb(236, 253, 245)', 'rgb(220, 252, 231)', 'rgb(209, 250, 229)'],
        textColor: '#14532d',
        accentColor: '#166534',
        bannerText: 'GROCERY',
        saleText: 'SALE',
        isDark: false,
    },
    fashion: {
        primary: ['rgb(196, 181, 253)', 'rgb(205, 192, 255)', 'rgb(221, 214, 254)', 'rgb(237, 233, 254)'],
        secondary: ['rgb(237, 233, 254)', 'rgb(221, 214, 254)', 'rgb(205, 192, 255)'],
        textColor: '#4c1d95',
        accentColor: '#5b21b6',
        bannerText: 'FASHION',
        saleText: 'SALE',
        isDark: false,
    },
    sports: {
        primary: ['rgb(147, 197, 253)', 'rgb(165, 208, 255)', 'rgb(191, 219, 254)', 'rgb(219, 234, 254)'],
        secondary: ['rgb(219, 234, 254)', 'rgb(191, 219, 254)', 'rgb(165, 208, 255)'],
        textColor: '#1e3a8a',
        accentColor: '#1e40af',
        bannerText: 'SPORTS',
        saleText: 'SALE',
        isDark: false,
    },
    leather: {
        primary: ['rgb(180, 130, 70)', 'rgb(210, 180, 140)', 'rgb(222, 184, 135)', 'rgb(245, 222, 179)'], // Tan to light tan (lighter, more tan-focused)
        secondary: ['rgb(245, 222, 179)', 'rgb(222, 184, 135)', 'rgb(210, 180, 140)'], // Beige to tan
        textColor: '#5d4037',
        accentColor: '#8b5a3c', // Tan brown accent
        bannerText: 'BAGS',
        saleText: 'SALE',
        isDark: false,
    },
    jewelry: {
        primary: ['rgb(184, 134, 11)', 'rgb(218, 165, 32)', 'rgb(255, 215, 0)', 'rgb(255, 223, 0)'], // Rich dark gold to bright gold
        secondary: ['rgb(255, 223, 0)', 'rgb(255, 215, 0)', 'rgb(218, 165, 32)'], // Bright gold to rich gold
        textColor: '#8b6914', // Dark rich gold
        accentColor: '#b8860b', // Rich golden accent
        bannerText: 'JEWELRY',
        saleText: 'SALE',
        isDark: false,
    },
};

export const getTheme = (tabId) => {
    return themes[tabId] || themes.all;
};
