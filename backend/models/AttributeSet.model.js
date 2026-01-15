import mongoose from 'mongoose';

const attributeSetSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Attribute set name is required'],
      trim: true,
      maxlength: [100, 'Attribute set name cannot exceed 100 characters'],
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      // required: [true, 'Vendor ID is required'],
    },
    isGlobal: {
      type: Boolean,
      default: false,
    },
    attributes: {
      type: [String],
      default: [],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'Attribute set must have at least one attribute',
      },
    },
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
attributeSetSchema.index({ name: 1, vendorId: 1 }, { unique: true, partialFilterExpression: { vendorId: { $exists: true } } });
attributeSetSchema.index({ name: 1 }, { unique: true, partialFilterExpression: { isGlobal: true } });
attributeSetSchema.index({ vendorId: 1 });
attributeSetSchema.index({ status: 1 });

const AttributeSet = mongoose.model('AttributeSet', attributeSetSchema);

export default AttributeSet;

