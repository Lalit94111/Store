const Product = require('../models/product');

const { validationResult } = require('express-validator');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
    isAuthenticated: req.session.isLoggedin,
    hasError: false,
    errorMessage: null
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;

  const newProduct = new Product({ title: title, imageURL: imageUrl, description: description, price: price, userId: req.session.user });

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false,
      isAuthenticated: req.session.isLoggedin,
      product: {
        title: title,
        imageURL: imageUrl,
        price: price,
        description: description,
      },
      hasError: true,
      errorMessage: errors.array()[0].msg
    });
  }

  newProduct.save()
    .then(data => {
      console.log(data)
      res.redirect('/admin/products')
    })
    .catch(err => {
      if (err) console.log(err)
    })
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: editMode,
        product: product,
        isAuthenticated: req.session.isLoggedin,
        hasError: false,
        errorMessage: null
      });
    })
    .catch(err => {
      if (err) console.log(err);
    })
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedImageUrl = req.body.imageUrl;
  const updatedDesc = req.body.description;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/add-product',
      editing: true,
      isAuthenticated: req.session.isLoggedin,
      product: {
        title: updatedTitle,
        imageURL: updatedImageUrl,
        price: updatedPrice,
        description: updatedDesc,
        _id: prodId
      },
      hasError: true,
      errorMessage: errors.array()[0].msg
    });
  }


  Product.findById(prodId)
    .then(product => {
      if (product.userId.toString() !== req.session.user.toString()) {
        return res.redirect('/');
      }
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.description = updatedDesc;
      product.imageURL = updatedImageUrl;
      return product.save().then(() => {
        res.redirect('/admin/products')
      });
    })
    .catch(err => {
      if (err) console.log(err)
    })
};

exports.getProducts = (req, res, next) => {
  Product.find({ userId: req.session.user })
    .then((data) => {
      res.render('admin/products', {
        prods: data,
        pageTitle: 'Admin Products',
        path: '/admin/products',
        isAuthenticated: req.session.isLoggedin
      });
    })
    .catch(err => {
      if (err) console.log(err)
    })
};

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.deleteOne({ _id: prodId, userId: req.session.user })
    .then(result => {
      console.log(result)
      res.redirect('/admin/products')
    })
    .catch(err => {
      if (err) console.log(err)
    })
};
