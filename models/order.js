const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const orderSchema = Schema({
    products: [
        {
            product: { type: Object, required: true },
            quantity: { type: Number, required: true }
        }
    ],
    user: {
        email: { type: String, required: true },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }
    }
})

module.exports = mongoose.model('Order', orderSchema);