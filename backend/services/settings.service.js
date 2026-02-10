import Settings from '../models/Settings.model.js';

/**
 * Get settings
 * @returns {Promise<Object>} Settings object
 */
export const getSettings = async () => {
  try {
    const settings = await Settings.getSettings();
    return settings;
  } catch (error) {
    throw error;
  }
};

/**
 * Update settings
 * @param {Object} updateData - Settings data to update { general, products }
 * @returns {Promise<Object>} Updated settings object
 */
export const updateSettings = async (updateData) => {
  try {
    // Get existing settings or create new one
    let settings = await Settings.findOne();

    if (!settings) {
      settings = new Settings();
    }

    // Update only provided sections
    if (updateData.general !== undefined) {
      settings.general = {
        ...settings.general,
        ...updateData.general,
      };
    }

    if (updateData.products !== undefined) {
      settings.products = {
        ...settings.products,
        ...updateData.products,
      };
    }


    await settings.save();
    return settings;
  } catch (error) {
    throw error;
  }
};

/**
 * Remove undefined values from an object
 * @param {Object} obj - Object to clean
 * @returns {Object} Cleaned object
 */
const removeUndefined = (obj) => {
  const cleaned = {};
  for (const key in obj) {
    if (obj[key] !== undefined) {
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        cleaned[key] = removeUndefined(obj[key]);
      } else {
        cleaned[key] = obj[key];
      }
    }
  }
  return cleaned;
};

/**
 * Update specific category of settings
 * @param {String} category - Category name (general, products)
 * @param {Object} categoryData - Category data to update
 * @returns {Promise<Object>} Updated settings object
 */
export const updateCategorySettings = async (category, categoryData) => {
  try {
    let settings = await Settings.findOne();

    if (!settings) {
      settings = new Settings();
    }

    // Clean undefined values from categoryData
    const cleanedData = removeUndefined(categoryData);

    // Update the specific category
    if (category === 'general' && settings.general) {
      settings.general = {
        ...settings.general.toObject(),
        ...cleanedData,
      };
    } else if (category === 'products' && settings.products) {
      settings.products = {
        ...settings.products.toObject(),
        ...cleanedData,
      };
    } else if (category === 'theme' && settings.theme) {
      settings.theme = {
        ...settings.theme.toObject(),
        ...cleanedData,
      };
    } else if (category === 'tax' && settings.tax) {
      settings.tax = {
        ...settings.tax.toObject(),
        ...cleanedData,
      };
    } else if (category === 'delivery' && settings.delivery) {
      settings.delivery = {
        ...settings.delivery.toObject(),
        ...cleanedData,
      };
    } else {
      // If category doesn't exist, set it
      settings[category] = cleanedData;
    }

    await settings.save();
    return settings;
  } catch (error) {
    throw error;
  }
};

