import { Response } from 'express';
import Sweet from '../models/Sweet';
import { AuthRequest } from '../middleware/auth';


export const createSweet = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { name, category, price, quantity } = req.body;

        if (!name || !category || price === undefined) {
            res.status(400).json({
                success: false,
                message: 'Please provide name, category, and price'
            });
            return;
        }

        const sweet = await Sweet.create({
            name,
            category,
            price,
            quantity: quantity || 0
        });

        res.status(201).json({
            success: true,
            data: {
                sweet
            }
        });
    } catch (error: any) {
        if (error.name === 'ValidationError') {
            res.status(400).json({
                success: false,
                message: error.message
            });
            return;
        }

        res.status(500).json({
            success: false,
            message: 'Server error while creating sweet'
        });
    }
};

export const getAllSweets = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const sweets = await Sweet.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: {
                sweets,
                count: sweets.length
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while fetching sweets'
        });
    }
};

export const searchSweets = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { name, category, minPrice, maxPrice } = req.query;

        const query: any = {};

        if (name && typeof name === 'string') {
            const searchTerm = name.trim().replace(/\s+/g, '');

            const regexPattern = searchTerm.split('').map((char, index) => {
                const escapedChar = char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                return index < searchTerm.length - 1 ? escapedChar + '\\s*' : escapedChar;
            }).join('');

            query.name = { $regex: regexPattern, $options: 'i' };
        }

        if (category && typeof category === 'string') {
            const searchTerm = category.trim().replace(/\s+/g, '');
            const regexPattern = searchTerm.split('').map((char, index) => {
                const escapedChar = char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                return index < searchTerm.length - 1 ? escapedChar + '\\s*' : escapedChar;
            }).join('');

            query.category = { $regex: regexPattern, $options: 'i' };
        }

        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        if (Object.keys(query).length === 0) {
            res.status(200).json({
                success: true,
                data: {
                    sweets: [],
                    count: 0
                },
                message: 'Please provide search parameters (name, category, minPrice, or maxPrice)'
            });
            return;
        }

        const sweets = await Sweet.find(query).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: {
                sweets,
                count: sweets.length
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while searching sweets'
        });
    }
};


export const updateSweet = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { name, category, price, quantity } = req.body;

        // Find sweet
        const sweet = await Sweet.findById(id);
        if (!sweet) {
            res.status(404).json({
                success: false,
                message: 'Sweet not found'
            });
            return;
        }

        if (name !== undefined) sweet.name = name;
        if (category !== undefined) sweet.category = category;
        if (price !== undefined) sweet.price = price;
        if (quantity !== undefined) sweet.quantity = quantity;

        await sweet.save();

        res.status(200).json({
            success: true,
            data: {
                sweet
            }
        });
    } catch (error: any) {
        if (error.name === 'ValidationError') {
            res.status(400).json({
                success: false,
                message: error.message
            });
            return;
        }

        res.status(500).json({
            success: false,
            message: 'Server error while updating sweet'
        });
    }
};

export const deleteSweet = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const sweet = await Sweet.findById(id);
        if (!sweet) {
            res.status(404).json({
                success: false,
                message: 'Sweet not found'
            });
            return;
        }

        await Sweet.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Sweet deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while deleting sweet'
        });
    }
};

export const purchaseSweet = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const sweet = await Sweet.findById(id);
        if (!sweet) {
            res.status(404).json({
                success: false,
                message: 'Sweet not found'
            });
            return;
        }

        if (sweet.quantity <= 0) {
            res.status(400).json({
                success: false,
                message: 'Sweet is out of stock'
            });
            return;
        }

        sweet.quantity -= 1;
        await sweet.save();

        res.status(200).json({
            success: true,
            message: 'Sweet purchased successfully',
            data: {
                sweet
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while purchasing sweet'
        });
    }
};

export const restockSweet = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { amount } = req.body;

        if (!amount || amount <= 0) {
            res.status(400).json({
                success: false,
                message: 'Please provide a valid amount to restock'
            });
            return;
        }

        const sweet = await Sweet.findById(id);
        if (!sweet) {
            res.status(404).json({
                success: false,
                message: 'Sweet not found'
            });
            return;
        }

        sweet.quantity += Number(amount);
        await sweet.save();

        res.status(200).json({
            success: true,
            message: `Sweet restocked successfully with ${amount} units`,
            data: {
                sweet
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while restocking sweet'
        });
    }
};
