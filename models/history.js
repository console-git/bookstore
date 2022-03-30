const mongoose = require('mongoose')
const Schema = mongoose.Schema

const bookHistorySchema = new Schema({
    userId: Number,
    rentId: Number, //unique
    bookId: Number,
    rentDate: Date,
    rentDateExpire: Date,
    totalPrice: Number
})

const bookHistoryModel = mongoose.model('histories', bookHistorySchema)

module.exports = bookHistoryModel
