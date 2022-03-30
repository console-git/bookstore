const express = require('express')
const app = express()
const mongoose = require('mongoose')
const Book = require('./models/book')
const User = require('./models/user')
const Rent = require('./models/history')

app.use(express.json())

mongoose.connect('mongodb://localhost:27017/bookstore', { useNewUrlParser: true })

mongoose.connection.on('error', err => {
    console.error('MongoDB error', err)
})


app.get('/', (req, res) => {
    res.json({ message: 'Ahoy!' })
})

app.post('/login', async (req, res) => {
    const payload = req.body
    const user = await User.find({ email: payload.email, password: payload.password })
    if (res.status(200)) {
        if (user.length > 1) {
            res.send({ "message": "login", "success": true });
        } else {
            res.send({ "message": "invalid username or password", "success": false });
        }
    } else {
        res.send({ "message": "errors", "success": false })
    }
    return res.end()
})

app.post('/register', async (req, res) => {
    const payload = req.body
    const user = new User(payload)
    await user.save()

    if (res.status(200)) {
        res.send({ "message": "register", "success": true });
    } else {
        res.send({ "message": "errors", "success": false })
    }
    return res.end()
})


app.get('/books', async (req, res) => {
    const books = await Book.find({})
    res.json(books)
})

app.post('/books', async (req, res) => {
    const payload = req.body
    const book = new Book(payload)
    await book.save()

    if (res.status(200)) {
        res.send({ "message": "Add new book(s) success.", "success": true });
    } else {
        res.send({ "message": "errors", "success": false })
    }

    return res.end()
})


app.post('/books/rent', async (req, res) => {
    const payload = req.body
    const rent = new Rent(payload)
    const books = await Book.find({ id: payload.bookId })


    if (res.status(200)) {
        books.forEach(async (book) => {
            var amount = book.amount;
            if (book.amount < 2) {
                res.send({ "message": "don't have book to rent.", "success": false });
                return res.end()
            } else {
                res.send({ "message": "rent succes.", "success": true });
                await Book.findOneAndUpdate({ id: payload.bookId }, { $set: { amount: amount - 1 } }, { new: false })
                await rent.save()
            }
        })

    } else {
        res.send({ "message": "errors", "success": false })
    }
    return res.end()
})


app.get('/books/history/:id', async (req, res) => {
    const { id } = req.params
    const rentHistory = await Rent.find({ rentId: id })
    res.json(rentHistory)
})


app.post('/books/return-book', async (req, res) => {
    const payload = req.body
    const rentHistory = await Rent.find({ rentId: payload.rentId })

    console.log(rentHistory);
    if (rentHistory.length > 0) {
        if (res.status(200)) {
            rentHistory.forEach(async (rent) => {
                var books = await Book.find({ id: rent.bookId })
                await Book.findOneAndUpdate({ id: rent.bookId }, { $set: { amount: books[0].amount + 1 } }, { new: false })
                await Rent.findOneAndDelete({ rentId: payload.rentId })
            })
            res.send({ "message": "return book(s) success.", "success": true });

        } else {
            res.send({ "message": "errors", "success": false })
        }
        
    } else {
        res.send({ "message": "not found book(s) to return.", "success": false });
    }
    return res.end()
})

app.listen(9000, () => {
    console.log('Application is running on port 9000')
})

