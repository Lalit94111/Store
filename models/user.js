const mongoose = require('mongoose')
const { Schema } = require('mongoose');

const UserSchema = Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    resetToken: String,
    resetTokenExpiration: Date,
    cart: {
        items: [
            {
                productId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Product',
                    required: true
                },
                quantity: {
                    type: Number,
                    required: true
                }
            }
        ]
    }
})

UserSchema.methods.removeProductFromCart = function (prodId) {
    const cart = this.cart;
    cart.items = cart.items.filter((product) => {
        return product.productId.toString() !== prodId.toString()
    })

    this.cart = cart;
    return this.save();
}

UserSchema.methods.addToCart = function (prodId) {
    const updatedCart = this.cart;
    const productIdx = updatedCart.items.findIndex((product) => {
        return product.productId.toString() === prodId.toString();
    })

    if (productIdx === -1) {
        updatedCart.items.push({ productId: prodId, quantity: 1 })
    }
    else {
        updatedCart.items[productIdx].quantity += 1;
    }

    this.cart = updatedCart
    return this.save();
}

UserSchema.methods.removeCart = function () {
    this.cart = { items: [] };
    return this.save();
}

module.exports = mongoose.model('User', UserSchema)
