import { Router } from 'express';
import {
    createSweet,
    getAllSweets,
    searchSweets,
    updateSweet,
    deleteSweet,
    purchaseSweet,
    restockSweet
} from '../controllers/sweetsController';
import { verifyToken, isAdmin } from '../middleware/auth';

const router = Router();

router.get('/search', verifyToken, searchSweets);

router.post('/:id/purchase', verifyToken, purchaseSweet);

router.post('/:id/restock', verifyToken, isAdmin, restockSweet);

router.post('/', verifyToken, createSweet);

router.get('/', verifyToken, getAllSweets);

router.put('/:id', verifyToken, updateSweet);

router.delete('/:id', verifyToken, isAdmin, deleteSweet);

export default router;
