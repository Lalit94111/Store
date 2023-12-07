const path = require('path');

const express = require('express');

const adminController = require('../controllers/admin');

const isAuth = require('../middleware/isAuth');

const { body } = require('express-validator');

const router = express.Router();

router.get('/add-product', isAuth, adminController.getAddProduct);

router.get('/products', isAuth, adminController.getProducts);

router.post('/add-product', isAuth, [
    body('title', 'Enter Valid Title').isLength({ min: 3 }).isString(),
    body('imageUrl', 'Enter Valid URL').isURL(),
    body('price', 'Please Enter Valid Price').isFloat(),
    body('description', 'Please Enter Valid Description').isLength({ min: 5 })
], adminController.postAddProduct);

router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);

router.post('/edit-product', isAuth, [
    [
        body('title', 'Enter Valid Title').isLength({ min: 3 }).isString(),
        body('imageUrl', 'Enter Valid URL').isURL(),
        body('price', 'Please Enter Valid Price').isFloat(),
        body('description', 'Please Enter Valid Description').isLength({ min: 5 })
    ]
], adminController.postEditProduct);

router.post('/delete-product', isAuth, adminController.postDeleteProduct);

module.exports = router;
