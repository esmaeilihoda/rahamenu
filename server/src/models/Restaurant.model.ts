import { Schema, model, Document } from 'mongoose';

export interface IRestaurant extends Document {
  name: string;
  slug: string;
  logo?: string;
  address: {
    street: string;
    city: string;
    country: string;
    postalCode: string;
  };
  contact: {
    phone: string;
    email: string;
  };
  settings: {
    currency: string;
    timezone: string;
    language: 'en' | 'fa';
    taxRate: number;
    serviceChargeRate?: number;
  };
  subscription: {
    plan: 'free' | 'basic' | 'premium';
    status: 'active' | 'suspended' | 'cancelled';
    expiresAt?: Date;
  };
  branding: {
    primaryColor: string;
    logo: string;
    customCSS?: string;
  };
  ownerId: Schema.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const restaurantSchema = new Schema<IRestaurant>(
  {
    name: {
      type: String,
      required: [true, 'Restaurant name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    logo: String,
    address: {
      street: String,
      city: String,
      country: String,
      postalCode: String,
    },
    contact: {
      phone: String,
      email: {
        type: String,
        lowercase: true,
        trim: true,
      },
    },
    settings: {
      currency: { type: String, default: 'USD' },
      timezone: { type: String, default: 'UTC' },
      language: { type: String, enum: ['en', 'fa'], default: 'en' },
      taxRate: { type: Number, default: 0 },
      serviceChargeRate: { type: Number },
    },
    subscription: {
      plan: { type: String, enum: ['free', 'basic', 'premium'], default: 'free' },
      status: { type: String, enum: ['active', 'suspended', 'cancelled'], default: 'active' },
      expiresAt: Date,
    },
    branding: {
      primaryColor: { type: String, default: '#22c55e' },
      logo: { type: String, default: '' },
      customCSS: String,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Restaurant = model<IRestaurant>('Restaurant', restaurantSchema);
