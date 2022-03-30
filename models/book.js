const mongoose = require('mongoose')
const Schema = mongoose.Schema

const bookSchema = new Schema({
    bookId: Number, //unique
    name: String,
    category: String,
    price: Number,
    amount: Number
})

const BookModel = mongoose.model('Books', bookSchema)

module.exports = BookModel
