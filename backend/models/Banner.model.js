import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['hero', 'promotional'],
      required: true,
    },
    title: {
      type: String,
      trim: true,
      default: '',
    },
    subtitle: {
      type: String,
      trim: true,
      default: '',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    image: {
      type: String,
      trim: true,
      default: '',
    },
    link: {
      type: String,
      trim: true,
      default: '/',
    },
    order: {
      type: Number,
      default: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    startDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date,
      default: null,
    },
    city: {
      type: String,
      trim: true,
      default: '',
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
bannerSchema.index({ type: 1, isActive: 1 });
bannerSchema.index({ city: 1 });
bannerSchema.index({ order: 1 });

const Banner = mongoose.model('Banner', bannerSchema);

export default Banner;
