import mongoose, { Document, Schema } from 'mongoose';

export interface ISweet extends Document {
    name: string;
    category: string;
    price: number;
    quantity: number;
    createdAt: Date;
    updatedAt: Date;
}

const sweetSchema = new Schema<ISweet>(
    {
        name: {
            type: String,
            required: [true, 'Sweet name is required'],
            trim: true
        },
        category: {
            type: String,
            required: [true, 'Category is required'],
            trim: true
        },
        price: {
            type: Number,
            required: [true, 'Price is required'],
            min: [0, 'Price cannot be negative']
        },
        quantity: {
            type: Number,
            required: [true, 'Quantity is required'],
            min: [0, 'Quantity cannot be negative'],
            default: 0
        }
    },
    {
        timestamps: true
    }
);

sweetSchema.index({ name: 'text', category: 'text' });
sweetSchema.index({ price: 1 });
sweetSchema.index({ category: 1 });

const Sweet = mongoose.model<ISweet>('Sweet', sweetSchema);

export default Sweet;
