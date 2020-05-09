const mongoose = require('mongoose');

const StockSchema = new mongoose.Schema({
    ticker: {
        type: String,
        required: true,
    },
    size: {
        type: Number,
        required: true,
    },
    risk: {
        type: Number,
        required: true,
    },
    dividends: {
        type: Number,
        required: true,
    },
    efficiency: {
        type: Number,
        required: true,
    },
    profitability: {
        type: Number,
        required: true,
    },
    growth: {
        type: Number,
        required: true,
    },
    value: {
        type: Number,
        required: true,
    }
});

const Stock = mongoose.model('stock', StockSchema);
module.exports = Stock;