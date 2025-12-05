import { Schema, model, Document } from 'mongoose';

export interface ITable extends Document {
  restaurantId: Schema.Types.ObjectId;
  tableNumber: number;
  status: 'empty' | 'browsing' | 'ordered' | 'alert';
  guests?: number;
  capacity?: number;
  position?: { x: number; y: number };
  qrCode?: string;
  currentOrderId?: Schema.Types.ObjectId;
  lastActivity?: Date;
  alertType?: 'waiter' | 'water' | 'bill';
  createdAt: Date;
  updatedAt: Date;
}

const tableSchema = new Schema<ITable>(
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
    },
    status: {
      type: String,
      enum: {
        values: ['empty', 'browsing', 'ordered', 'alert'],
        message: '{VALUE} is not a valid status',
      },
      default: 'empty',
      index: true,
    },
    guests: {
      type: Number,
      min: [0, 'Number of guests cannot be negative'],
      max: [20, 'Number of guests cannot exceed 20'],
    },
    capacity: {
      type: Number,
      min: [1, 'Capacity must be at least 1'],
      max: [100, 'Capacity cannot exceed 100'],
    },
    position: {
      x: Number,
      y: Number,
    },
    qrCode: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple null values
    },
    currentOrderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
    },
    lastActivity: {
      type: Date,
      default: Date.now,
    },
    alertType: {
      type: String,
      enum: ['waiter', 'water', 'bill'],
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index: one table number per restaurant
tableSchema.index({ restaurantId: 1, tableNumber: 1 }, { unique: true });

// Index for status queries
tableSchema.index({ restaurantId: 1, status: 1 });

// Middleware to update lastActivity
tableSchema.pre('save', function (next) {
  if (this.isModified('status') || this.isModified('currentOrderId')) {
    this.lastActivity = new Date();
  }
  next();
});

export const Table = model<ITable>('Table', tableSchema);
