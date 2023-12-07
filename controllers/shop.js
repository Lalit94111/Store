const Product = require('../models/product');
const User = require('../models/user');
const Order = require('../models/order');
const { ObjectId } = require('mongodb')

exports.getProducts = (req, res, next) => {
  Product.find({})
    .then((data) => {
      console.log(data)
      res.render('shop/product-list', {
        prods: data,
        pageTitle: 'All Products',
        path: '/products'
      });
    })
    .catch((err) => {
      if (err) console.log(err)
    })
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId).then((data) => {
    res.render('shop/product-detail', {
      product: data,
      pageTitle: data.title,
      path: '/products'
    });
  }).catch((err) => {
    if (err) console.log(err)
  })
};

exports.getIndex = (req, res, next) => {
  Product.find({})
    .then((data) => {
      res.render('shop/index', {
        prods: data,
        pageTitle: 'Shop',
        path: '/'
      });
    })
    .catch((err) => {
      if (err) console.log(err)
    })
};

exports.getCart = (req, res, next) => {
  User.findById({ _id: req.session.user })
    .then(user => {
      return user.populate('cart.items.productId');
    })
    .then((user) => {
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: user.cart.items
      })
    })
    .catch((err) => {
      if (err) console.log(err)
    })

};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  User.findById({ _id: req.session.user })
    .then((user) => {
      return user.addToCart(prodId)
    })
    .then(result => {
      res.redirect('/cart')
    })
    .catch(err => {
      if (err) console.log(err)
    })
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  User.findById({ _id: req.session.user })
    .then((user) => {
      return user.removeProductFromCart(prodId)
    })
    .then(result => {
      res.redirect('/cart')
    })
    .catch(err => {
      console.log(err)
    })
};

exports.createOrder = (req, res, next) => {
  User.findById({ _id: req.session.user })
    .then((user) => {
      return user.populate('cart.items.productId');
    })
    .then((user) => {
      const products = user.cart.items.map((i) => {
        return { quantity: i.quantity, product: { ...i.productId._doc } }
      })
      const order = new Order({
        user: {
          email: user.email,
          userId: req.session.user
        },
        products: products
      })
      return order.save();
    })
    .then(() => {
      return User.findById({ _id: req.session.user })
    })
    .then((user) => {
      return user.removeCart();
    })
    .then(() => {
      res.redirect('/orders')
    })
    .catch(err => {
      if (err) console.log(err)
    })
};


exports.getOrders = (req, res, next) => {
  Order.find({ 'user.userId': req.session.user })
    .then(orders => {
      res.render('shop/orders', {
        orders: orders,
        path: '/orders',
        pageTitle: 'Your Orders'
      });
    })
    .catch((err) => {
      if (err) console.log(err)
    })
};

exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    path: '/checkout',
    pageTitle: 'Checkout'
  });
};
