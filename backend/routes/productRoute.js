import express from 'express'
import { listProducts, addProduct, removeProduct, singleProduct, updateProduct } from '../controllers/productController.js'
import upload from '../middleware/multer.js';
import { authUser, admin } from '../middleware/auth.js'

const productRouter = express.Router();

productRouter.post('/add', authUser, admin, upload.fields([{ name: 'image1', maxCount: 1 }, { name: 'image2', maxCount: 1 }, { name: 'image3', maxCount: 1 }, { name: 'image4', maxCount: 1 }]), addProduct);
productRouter.post('/remove', authUser, admin, removeProduct);
productRouter.post('/single', singleProduct);
productRouter.get('/list', listProducts)
productRouter.put(
    '/update/:id',
    authUser, admin,
    upload.fields([
        { name: 'image1', maxCount: 1 },
        { name: 'image2', maxCount: 1 },
        { name: 'image3', maxCount: 1 },
        { name: 'image4', maxCount: 1 }
    ]),
    updateProduct
);

export default productRouter