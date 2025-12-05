import { Schema, model, Document } from 'mongoose';

interface IOrderItem {
  menuItemId: Schema.Types.ObjectId;
  name: string;
  quantity: number;
  customizations: {
    milk?: string;
    sweetness?: number;
    addOns?: string[];
  };
  price: number;
}

export interface IOrder extends Document {
  restaurantId: Schema.Types.ObjectId;
  tableNumber: number;
  items: IOrderItem[];
  selectedVibe?: 'energy' | 'relaxing' | 'cold' | 'hungry';
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'cancelled';
  totalAmount: number;
  customerNotes?: string;
  createdAt: Date;
  updatedAt: Date;
  confirmedAt?: Date;
  servedAt?: Date;
  preparationTime?: number; // Virtual field
  paymentStatus?: 'pending_payment' | 'paid' | 'refunded';
  payment?: {
    method?: 'zarrinpal' | 'counter';
    authority?: string;
    refId?: number;
    cardPan?: string;
    status?: 'pending' | 'verified' | 'failed' | 'cancelled' | 'confirmed';
    verifiedAt?: Date;
    verifiedBy?: Schema.Types.ObjectId;
  };
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    menuItemId: {
      type: Schema.Types.ObjectId,
      ref: 'MenuItem',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
    },
    customizations: {
      milk: String,
      sweetness: {
        type: Number,
        min: 0,
        max: 100,
      },
      addOns: [String],
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrder>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
      index: true,
    },
    tableNumber: {
      type: Number,
      required: [true, 'Table number is required'],
      min: [1, 'Table number must be at least 1'],
      index: true,
    },
    items: {
      type: [orderItemSchema],
      required: [true, 'Order must contain at least one item'],
      validate: {
        validator: function (v: IOrderItem[]) {
          return v && v.length > 0;
        },
        message: 'Order must contain at least one item',
      },
    },
    selectedVibe: {
      type: String,
      enum: ['energy', 'relaxing', 'cold', 'hungry'],
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'confirmed', 'preparing', 'ready', 'served', 'cancelled'],
        message: '{VALUE} is not a valid status',
      },
      default: 'pending',
      index: true,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: [0, 'Total amount cannot be negative'],
    },
    customerNotes: {
      type: String,
      maxlength: [500, 'Customer notes cannot exceed 500 characters'],
    },
    confirmedAt: Date,
    servedAt: Date,
    paymentStatus: {
      type: String,
      enum: ['pending_payment', 'paid', 'refunded'],
      default: 'pending_payment',
    },
    payment: {
      method: { type: String, enum: ['zarrinpal', 'counter'] },
      authority: String,
      refId: Number,
      cardPan: String,
      status: { type: String, enum: ['pending', 'verified', 'failed', 'cancelled', 'confirmed'] },
      verifiedAt: Date,
      verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for efficient queries
orderSchema.index({ restaurantId: 1, status: 1 });
orderSchema.index({ restaurantId: 1, tableNumber: 1, createdAt: -1 });
orderSchema.index({ createdAt: -1 });

// Virtual for preparation time (in minutes)
orderSchema.virtual('preparationTime').get(function () {
  if (this.confirmedAt && this.servedAt) {
    return Math.round((this.servedAt.getTime() - this.confirmedAt.getTime()) / 60000);
  }
  return undefined;
});

// Middleware to set confirmed/served timestamps
orderSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    if (this.status === 'confirmed' && !this.confirmedAt) {
      this.confirmedAt = new Date();
    }
    if (this.status === 'served' && !this.servedAt) {
      this.servedAt = new Date();
    }
  }
  next();
});

export const Order = model<IOrder>('Order', orderSchema);
