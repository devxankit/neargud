import { getSettings, updateCategorySettings } from '../../services/settings.service.js';
import { uploadBase64ToCloudinary, isBase64DataUrl } from '../../utils/cloudinary.util.js';

/**
 * Get settings
 * GET /api/admin/settings
 */
export const getSettingsController = async (req, res, next) => {
  try {
    const settings = await getSettings();

    res.status(200).json({
      success: true,
      message: 'Settings retrieved successfully',
      data: { settings },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get public settings
 * GET /api/public/settings
 */
export const getPublicSettingsController = async (req, res, next) => {
  try {
    const settings = await getSettings();

    // Filter settings for public view
    const publicSettings = {
      general: {
        storeName: settings.general?.storeName,
        storeLogo: settings.general?.storeLogo,
        favicon: settings.general?.favicon,
        storeDescription: settings.general?.storeDescription,
        contactEmail: settings.general?.contactEmail,
        contactPhone: settings.general?.contactPhone,
        address: settings.general?.address,
        socialMedia: settings.general?.socialMedia,
        businessHours: settings.general?.businessHours,
        timezone: settings.general?.timezone,
        currency: settings.general?.currency,
        language: settings.general?.language,
      },
      theme: settings.theme,
      products: {
        itemsPerPage: settings.products?.itemsPerPage,
        gridColumns: settings.products?.gridColumns,
        defaultSort: settings.products?.defaultSort,
        outOfStockBehavior: settings.products?.outOfStockBehavior,
      },
      tax: settings.tax,
    };

    res.status(200).json({
      success: true,
      message: 'Public settings retrieved successfully',
      data: { settings: publicSettings },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update settings category
 * PUT /api/admin/settings/:category
 */
export const updateSettingsController = async (req, res, next) => {
  try {
    const { category } = req.params;
    let categoryData = req.body;

    // Validate category
    const validCategories = ['general', 'products', 'tax', 'banners', 'payment', 'shipping', 'theme', 'delivery'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category. Valid categories are: general, products, tax, banners, payment, shipping, theme, delivery',
      });
    }

    // Handle image uploads for general category
    if (category === 'general') {
      try {
        if (categoryData.storeLogo && isBase64DataUrl(categoryData.storeLogo)) {
          const uploadResult = await uploadBase64ToCloudinary(categoryData.storeLogo, 'settings/logos');
          categoryData.storeLogo = uploadResult.secure_url;
        }
        if (categoryData.favicon && isBase64DataUrl(categoryData.favicon)) {
          const uploadResult = await uploadBase64ToCloudinary(categoryData.favicon, 'settings/favicons');
          categoryData.favicon = uploadResult.secure_url;
        }
      } catch (uploadError) {
        return res.status(400).json({
          success: false,
          message: `Image upload failed: ${uploadError.message}`,
        });
      }
    }

    const settings = await updateCategorySettings(category, categoryData);

    res.status(200).json({
      success: true,
      message: `${category} settings updated successfully`,
      data: { settings },
    });
  } catch (error) {
    next(error);
  }
};

