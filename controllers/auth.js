const User = require('../models/user');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const nodemailer = require('nodemailer');

const { validationResult } = require('express-validator');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'kumarlalit9411@gmail.com',
        pass: 'xjhbetgwxcxdkrts'
    }
})

const sendMail = (toEmail, subject, html) => {
    const mailOptions = {
        form: 'kumarlalit9411@gmail.com',
        to: toEmail,
        subject: subject,
        html: html
    }

    transporter.sendMail(mailOptions, (err, info) => {
        if (err) console.log('Error Sending Mail :' + err)
        else console.log(info);
    })
}

exports.getLogin = (req, res, next) => {
    let a = req.flash('error');
    if (a.length > 0) {
        a = a[0];
    }
    else {
        a = null;
    }
    res.render('auth/login', {
        pageTitle: 'Login',
        path: '/login',
        errorMessage: a,
        oldInput: {
            email: '',
            password: ''
        }
    })
}

exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    const error = validationResult(req);
    if (!error.isEmpty()) {
        return res.status(422).render('auth/login', {
            path: '/login',
            pageTitle: 'Login',
            errorMessage: error.array()[0].msg,
            oldInput: {
                email: email,
                password: password
            }
        })
    }

    User.findOne({ email: email })
        .then((user) => {
            bcrypt.compare(password, user.password)
                .then((isMatch) => {
                    if (!isMatch) {
                        return res.render('auth/login', {
                            pageTitle: 'Login',
                            path: '/login',
                            errorMessage: 'Enter Valid Username and Password',
                            oldInput: {
                                email: email,
                                password: password
                            }
                        })
                    }
                    req.session.isLoggedin = true;
                    req.session.user = user._id;
                    req.session.save((err) => {
                        if (err) console.log(err);
                        return res.redirect('/')
                    });
                })
        })
        .catch(err => {
            if (err) console.log(err);
        })
}

exports.postLogout = (req, res, next) => {
    req.session.destroy((err) => {
        if (err) console.log(err);
        res.redirect('/');
    })
}

exports.getSignup = (req, res, next) => {
    let a = req.flash('error');
    if (a.length > 0) {
        a = a[0];
    }
    else {
        a = null;
    }
    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        errorMessage: a,
        oldInput: {
            email: '',
            password: '',
            confirmPassword: ''
        }
    });
}

exports.postSignup = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    const error = validationResult(req);
    if (!error.isEmpty()) {
        return res.status(422).render('auth/signup', {
            path: '/signup',
            pageTitle: 'Signup',
            errorMessage: error.array()[0].msg,
            oldInput: {
                email: email,
                password: password,
                confirmPassword: req.body.confirmPassword
            }
        })
    }

    User.findOne({ email: email })
        .then((user) => {
            if (user) {
                req.flash('error', 'User Exist...Enter new mail');
                return res.redirect('/signup');
            }
            return bcrypt.hash(password, 10)
                .then((hashedPassword) => {
                    const newUser = new User({
                        email: email,
                        password: hashedPassword,
                        cart: { items: [] }
                    })
                    return newUser.save();
                })
                .then(() => {
                    res.redirect('/login');
                    sendMail(email, 'Welcome to Store', '<h1>Enjoy Exciting Offers...</h1>')
                })
                .catch(err => {
                    if (err) console.log(err);
                })
        })
        .catch(err => {
            if (err) console.log(err);
        })
};


exports.getResetPassword = (req, res, next) => {
    let a = req.flash('error');
    if (a.length > 0) {
        a = a[0];
    }
    else {
        a = null;
    }
    res.render('auth/reset', {
        path: '/reset',
        pageTitle: 'Reset',
        errorMessage: a
    });
}

exports.postReset = (req, res, next) => {
    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
            console.log(err);
            res.redirect('/login');
        }

        const token = buffer.toString('hex');
        User.findOne({ email: req.body.email })
            .then(user => {
                if (!user) {
                    req.flash('error', 'Enter Valid Mail')
                    return res.redirect('/reset')
                }
                user.resetToken = token;
                user.resetTokenExpiration = Date.now() + 3600000
                return user.save()
            })
            .then(() => {
                res.redirect('/');
                const html = `
                <p>Wanted to change the password</p>
                <p>Click on the Link <a href='http://localhost:3000/reset-password/${token}'>Link</a></p>

                `
                sendMail(req.body.email, 'Password Reset', html);
            })
            .catch(err => {
                if (err) console.log(err)
            })
    })
}

exports.getResetPasswordForm = (req, res, form) => {
    const token = req.params.token;
    User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
        .then(user => {
            let a = req.flash('error');
            if (a.length > 0) {
                a = a[0];
            }
            else {
                a = null;
            }
            res.render('auth/reset-password', {
                path: '/reset',
                pageTitle: 'Reset Password',
                errorMessage: a,
                token: token,
                userId: user._id
            });
        })
        .catch(err => {
            if (err) console.log(err);
        })
}

exports.postResetPasswordForm = (req, res, next) => {
    const newPassword = req.body.password;
    const token = req.body.token;
    const userId = req.body.userId;
    let resetUser;
    User.findOne({ _id: userId, resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
        .then((user) => {
            resetUser = user;
            return bcrypt.hash(newPassword, 10);
        })
        .then((hashedPassword) => {
            resetUser.resetToken = undefined;
            resetUser.resetTokenExpiration = undefined;
            resetUser.password = hashedPassword;
            return resetUser.save();
        })
        .then(() => {
            res.redirect('/login');
        })
        .catch(err => {
            if (err) console.log(err)
        })
}
