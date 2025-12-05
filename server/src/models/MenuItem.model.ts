import { Schema, model, Document } from 'mongoose';

export interface IAddOn {
  name: string;
  price: number;
  emoji: string;
  category: 'milk' | 'flavor' | 'topping' | 'syrup';
}

export interface IMenuItem extends Document {
  restaurantId: Schema.Types.ObjectId;
  name: string;
  description: string;
  price: number;
  category: 'coffee' | 'tea' | 'pastry' | 'cold' | 'dessert' | 'food';
  vibes: string[];
  image: string;
  available: boolean;
  pairing?: string; // legacy label text
  pairings?: Schema.Types.ObjectId[]; // suggested item ids
  addOns?: IAddOn[]; // item-specific add-ons
  createdAt: Date;
  updatedAt: Date;
}

const menuItemSchema = new Schema<IMenuItem>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Menu item name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: ['coffee', 'tea', 'pastry', 'cold', 'dessert', 'food'],
        message: '{VALUE} is not a valid category',
      },
      index: true,
    },
    vibes: {
      type: [String],
      default: [],
      validate: {
        validator: function (v: string[]) {
          const validVibes = ['energy', 'relaxing', 'cold', 'hungry'];
          return v.every(vibe => validVibes.includes(vibe));
        },
        message: 'Invalid vibe value',
      },
    },
    image: {
      type: String,
      required: [true, 'Image URL is required'],
    },
    available: {
      type: Boolean,
      default: true,
      index: true,
    },
    pairing: {
      type: String,
      maxlength: [100, 'Pairing text cannot exceed 100 characters'],
    },
    pairings: [{ type: Schema.Types.ObjectId, ref: 'MenuItem' }],
    addOns: [
      {
        name: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
        emoji: {
          type: String,
          required: true,
        },
        category: {
          type: String,
          enum: ['milk', 'flavor', 'topping', 'syrup'],
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Compound index for restaurant + availability queries
menuItemSchema.index({ restaurantId: 1, available: 1 });
menuItemSchema.index({ restaurantId: 1, category: 1 });

export const MenuItem = model<IMenuItem>('MenuItem', menuItemSchema);
