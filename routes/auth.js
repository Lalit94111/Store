const express = require('express');

const User = require('../models/user');

const authController = require('../controllers/auth')
const { body } = require('express-validator');
const router = express.Router();

router.get('/login', authController.getLogin)

router.post('/login',
    [body('email', 'Please Enter a Valid Email').isEmail().custom((value, { req }) => {
        return User.findOne({ email: value })
            .then(user => {
                if (!user) return Promise.reject('No User Exist...Try Again!!')
            })
    }),
    body('password', 'Please Enter a Valid Password with only numbers and text and atleast 5 characters').isAlphanumeric().isLength({ min: 5 })
    ]
    , authController.postLogin);

router.post('/logout', authController.postLogout);

router.get('/signup', authController.getSignup);

router.post('/signup',
    [body('email', 'Please Enter a Valid Email...').isEmail()
        , body('password', 'Please Enter a Password with only numbers and text and atleast 5 characters')
            .isAlphanumeric().isLength({ min: 5 }),
    body('confirmPassword').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Enter correct  Password');
        }
        return true;
    })], authController.postSignup);

router.get('/reset', authController.getResetPassword);

router.post('/reset', authController.postReset);

router.get('/reset-password/:token', authController.getResetPasswordForm);

router.post('/reset-password', authController.postResetPasswordForm);

module.exports = router;