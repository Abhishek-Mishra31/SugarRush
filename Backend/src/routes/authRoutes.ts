import { Router, Response } from 'express';
import { register, login, registerAdmin, loginAdmin } from '../controllers/authController';
import { verifyToken, isAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

router.post('/register', register);

router.post('/register/admin', registerAdmin);

router.post('/login', login);

router.post('/login/admin', loginAdmin);

router.get('/protected', verifyToken, (req: AuthRequest, res: Response) => {
    res.status(200).json({
        success: true,
        message: 'Access granted to protected route',
        user: req.user
    });
});

router.get('/admin', verifyToken, isAdmin, (req: AuthRequest, res: Response) => {
    res.status(200).json({
        success: true,
        message: 'Access granted to admin route',
        user: req.user
    });
});

export default router;
