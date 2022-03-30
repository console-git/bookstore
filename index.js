const express = require('express')
const app = express()
const mongoose = require('mongoose')
const Book = require('./models/book')
const User = require('./models/user')
const Rent = require('./models/rent')

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
    const userQuery = await User.find({})
    const handleUsr = await User.find({ email: payload.email })
    payload.userId = userQuery[userQuery.length - 1].userId + 1
    payload.role = "user"
    const user = new User(payload)

    if (res.status(200)) {
        if (handleUsr.length == 0) {
            await user.save()
            res.send({ "message": "register", "success": true });
        } else {
            res.send({ "message": "invalid email", "success": true });
        }
    } else {
        res.send({ "message": "errors", "success": false })
    }
    return res.end()
})


app.get('/books', async (req, res) => {
    const books = await Book.find({})
    // console.log(books[books.length - 1].id);
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
    const rentDay = new Date();
    const returnDay = new Date();
    const payload = req.body
    const books = await Book.find({ id: payload.bookId })
    const handleRent = await Rent.find({})
    payload.rentId = handleRent[handleRent.length - 1].rentId + 1
    payload.rentDate = rentDay
    payload.rentDateExpire = returnDay.setDate(rentDay.getDate() + 3)
    payload.price = books[0].price
    payload.hasReturn = false

    const rent = new Rent(payload)
    console.log(rent);
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
    var timeDifference = Math.abs(rentHistory[0].rentDateExpire.getTime() - rentHistory[0].rentDate.getTime());
    let differentDays = Math.ceil(timeDifference / (1000 * 3600 * 24));
    console.log(differentDays);
    res.json(rentHistory)
})


app.post('/books/return-book', async (req, res) => {
    const payload = req.body
    const rentHistory = await Rent.find({ rentId: payload.rentId ,hasReturn:false})
    const today = new Date();



    console.log(rentHistory);
    if (rentHistory.length > 0) {
        var price = rentHistory[0].price

        if (res.status(200)) {
            var timeDifference = Math.abs(today.getTime() - rentHistory[0].rentDateExpire.getTime());
            let differentDays = Math.ceil(timeDifference / (1000 * 3600 * 24));
            if (differentDays > 3) {
                price = rentHistory[0].price + ((differentDays - 3) * 20)
            }
            rentHistory.forEach(async (rent) => {

                var books = await Book.find({ id: rent.bookId })
                await Book.findOneAndUpdate({ id: rent.bookId }, { $set: { amount: books[0].amount + 1 } }, { new: false })
                await Rent.findOneAndUpdate({ rentId: payload.rentId }, { $set: { hasReturn: true, price: price } }, { new: false })
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

