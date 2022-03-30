const mongoose = require('mongoose')
const Schema = mongoose.Schema

const bookHistorySchema = new Schema({
    userId: Number,
    rentId: Number, //unique
    bookId: Number,
    rentDate: Date,
    rentDateExpire: Date,
    price: Number,
    hasReturn:Boolean
})

const bookHistoryModel = mongoose.model('rent', bookHistorySchema)

module.exports = bookHistoryModel
