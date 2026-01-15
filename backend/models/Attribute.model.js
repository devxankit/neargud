import mongoose from 'mongoose';

const attributeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Attribute name is required'],
      trim: true,
      maxlength: [100, 'Attribute name cannot exceed 100 characters'],
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      // required: [true, 'Vendor ID is required'], // Made optional for Global attributes
    },
    isGlobal: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      required: [true, 'Attribute type is required'],
      enum: ['select', 'text', 'number', 'boolean'],
      default: 'select',
    },
    required: {
      type: Boolean,
      default: false,
    },
    categoryIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: [],
    }],
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
// Unique name per vendor OR global unique name?
// Strategy: Global attributes must be unique globally. Vendor attributes unique per vendor.
attributeSchema.index({ name: 1, vendorId: 1 }, { unique: true, partialFilterExpression: { vendorId: { $exists: true } } });
attributeSchema.index({ name: 1 }, { unique: true, partialFilterExpression: { isGlobal: true } });
attributeSchema.index({ vendorId: 1 });
attributeSchema.index({ status: 1 });
attributeSchema.index({ vendorId: 1 });
attributeSchema.index({ status: 1 });

const Attribute = mongoose.model('Attribute', attributeSchema);

export default Attribute;

