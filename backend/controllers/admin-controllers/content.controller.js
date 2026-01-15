import Content from '../../models/Content.model.js';

/**
 * Get content by key
 * GET /api/admin/content/:key
 */
export const getContentByKey = async (req, res) => {
    const { key } = req.params;

    const content = await Content.findOne({ key });

    if (!content) {
        return res.status(404).json({
            success: false,
            message: `Content not found for key: ${key}`,
        });
    }

    res.status(200).json({
        success: true,
        data: content,
    });
};

/**
 * Create or Update content
 * PUT /api/admin/content/:key
 */
export const upsertContent = async (req, res) => {
    const { key } = req.params;
    const { data } = req.body;

    if (!data) {
        return res.status(400).json({
            success: false,
            message: 'Content data is required',
        });
    }

    const content = await Content.findOneAndUpdate(
        { key },
        {
            key,
            data,
            updatedBy: req.user._id,
        },
        { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
        success: true,
        message: 'Content saved successfully',
        data: content,
    });
};
