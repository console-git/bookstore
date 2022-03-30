const express = require('express')
var session = require('express-session')
const app = express()
const mongoose = require('mongoose')
const Book = require('./models/book')
const User = require('./models/user')
const Rent = require('./models/rent')

app.use(express.json())
app.use(session({
    secret: 'unAuth',
    resave: true,
    saveUninitialized: true
}))

var session;

mongoose.connect('mongodb://localhost:27017/bookstore', { useNewUrlParser: true })

mongoose.connection.on('error', err => {
    console.error('MongoDB error', err)
})

//
app.get('/', (req, res) => {
    res.json({ message: 'Ahoy Yahoo!' })
})

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
})

// Login
app.post('/login', async (req, res) => {

    const payload = req.body
    const user = await User.find({ email: payload.email, password: payload.password })

    if (res.status(200)) {
        if (user.length > 0) {
            if (user[0].role == "admin") {
                session = req.session;
                session.role = "admin";
            } else {
                session = req.session;
                session.role = "user";
            }
            res.send({ "message": "login success", "success": true, "status": 200, })
        } else {
            res.send({ "message": "invalid username or password", "success": false, "status": 200, })
        }
    } else {
        responseErrorHandle(res)
    }
    return res.end()
})

//Register
app.post('/register', async (req, res) => {
    const payload = req.body
    const userQuery = await User.find({})
    const handleUsr = await User.find({ email: payload.email })
    if (userQuery.length > 0) {
        payload.userId = userQuery[userQuery.length - 1].userId + 1
    } else {
        payload.userId = 1
    }

    payload.role = "user"
    const user = new User(payload)

    if (typeof payload.email == 'undefined' || payload.email == "") {
        res.send({ "message": "enter email", "success": false, "status": 200 })
        return res.end()

    } else if (typeof payload.password == 'undefined' || payload.password == "") {
        res.send({ "message": "enter password", "success": false, "status": 200 })
        return res.end()
    } else {
        if (res.status(200)) {
            if (handleUsr.length == 0) {
                await user.save()
                res.send({ "message": "register success", "success": true, "status": 200 })
                return res.end()

            } else {
                res.send({ "message": "invalid email", "success": false, "status": 200 })
                return res.end()

            }
        } else {
            responseErrorHandle(res)

        }
    }
    return res.end()
})

//Show books
app.get('/books', async (req, res) => {
    const books = await Book.find({})
    // console.log(books[books.length - 1].id)
    console.log()
    res.json(books)
})

//Add book
app.post('/books', async (req, res) => {
    if (req.session.role != "admin") {
        res.send({ "message": "Permission denied", "success": false, "status": 200 })
        return res.end()
    }
    const payload = req.body
    const bookQuery = await Book.find({})

    if (bookQuery.length > 0) {
        payload.bookId = bookQuery[bookQuery.length - 1].bookId + 1
    } else {
        payload.bookId = 1
    }

    const book = new Book(payload)

    if (typeof payload.name == 'undefined' || payload.name == "" || payload.name == null) {
        res.send({ "message": "Enter book name", "success": false, "status": 200 })
        return res.end()
    } else if (typeof payload.category == 'undefined' || payload.category == "" || payload.category == null) {
        res.send({ "message": "Enter category", "success": false, "status": 200 })
        return res.end()
    } else if (typeof payload.price == 'undefined' || payload.price < 0 || payload.price == null) {
        res.send({ "message": "Enter price", "success": false, "status": 200 })
        return res.end()
    } else if (typeof payload.amount == 'undefined' || payload.amount < 1 || payload.amount == null) {
        res.send({ "message": "Enter amount", "success": false, "status": 200 })
        return res.end()
    } else {
        if (res.status(200)) {
            await book.save()
            res.send({ "message": "Add new book(s) success.", "success": true, "status": 200 })
        } else {
            responseErrorHandle(res)
        }
    }
    return res.end()
})

//Edit book
app.post('/book/:id', async (req, res) => {
    if (req.session.role != "admin") {
        res.send({ "message": "Permission denied", "success": false, "status": 200 })
        return res.end()
    }

    const { id } = req.params
    const payload = req.body

    if (payload.name == "") {
        res.send({ "message": "Enter book name", "success": false, "status": 200 })
        return res.end()
    } else if (payload.category == "") {
        res.send({ "message": "Enter category", "success": false, "status": 200 })
        return res.end()
    } else if (payload.price < 0) {
        res.send({ "message": "Enter price", "success": false, "status": 200 })
        return res.end()
    } else if (payload.amount < 1) {
        res.send({ "message": "Enter amount", "success": false, "status": 200 })
        return res.end()
    } else {
        if (res.status(200)) {
            await Book.findOneAndUpdate({ bookId: id }, { $set: payload }, { new: false })
            res.send({ "message": "Edit book success.", "success": true, "status": 200 })
        } else {
            responseErrorHandle(res)
        }
    }
    return res.end()
})

//Rent books
app.post('/books/rent', async (req, res) => {
    const rentDay = new Date()
    const returnDay = new Date()
    const payload = req.body
    const books = await Book.find({ bookId: payload.bookId })
    const handleRent = await Rent.find({})
    const chkUsr = await User.find({ userId: payload.userId })

    if (chkUsr.length < 1) {
        res.send({ "message": "not found user", "success": false, "status": 200 })
        return res.end()
    }

    if (typeof payload.bookId == 'undefined' || payload.bookId == "" || payload.bookId == null) {
        res.send({ "message": "Enter book id", "success": false, "status": 200 })
        return res.end()
    }

    if (handleRent.length > 0) {
        payload.rentId = handleRent[handleRent.length - 1].rentId + 1
    } else {
        payload.rentId = 1
    }
    payload.rentDate = rentDay
    payload.rentDateExpire = returnDay.setDate(rentDay.getDate() + 3)
    payload.price = books[0].price
    payload.hasReturn = false

    const rent = new Rent(payload)
    console.log(rent)
    if (res.status(200)) {
        books.forEach(async (book) => {
            var amount = book.amount
            if (book.amount < 2) {
                res.send({ "message": "don't have book to rent.", "success": false, "status": 200 })
                return res.end()
            } else {
                res.send({ "message": "rent succes.", "success": true, "status": 200 })
                await Book.findOneAndUpdate({ bookId: payload.bookId }, { $set: { amount: amount - 1 } }, { new: false })
                await rent.save()
            }
        })

    } else {
        res.send({ "message": "errors", "success": false })
    }
    return res.end()
})

//show all book history
app.get('/books/history', async (req, res) => {
    const rentHistory = await Rent.find({})
    res.json(rentHistory)
})

//show user rent book history
app.get('/books/history/:id', async (req, res) => {
    const { id } = req.params
    const rentHistory = await Rent.find({ userId: id })
    res.json(rentHistory)
})

//return book
app.post('/books/return-book', async (req, res) => {
    const payload = req.body
    const rentHistory = await Rent.find({ rentId: payload.rentId, hasReturn: false })
    const today = new Date()

    if (rentHistory.length > 0) {
        var price = rentHistory[0].price
        if (res.status(200)) {
            var timeDifference = Math.abs(today.getTime() - rentHistory[0].rentDateExpire.getTime())
            let differentDays = Math.ceil(timeDifference / (1000 * 3600 * 24))
            if (differentDays > 3) {
                price = rentHistory[0].price + ((differentDays - 3) * 20)
            }
            rentHistory.forEach(async (rent) => {

                var books = await Book.find({ bookId: rent.bookId })
                await Book.findOneAndUpdate({ bookId: rent.bookId }, { $set: { amount: books[0].amount + 1 } }, { new: false })
                await Rent.findOneAndUpdate({ rentId: payload.rentId }, { $set: { hasReturn: true, price: price } }, { new: false })
            })

            res.send({ "message": "return book(s) success.", "success": true, "status": 200 })

        } else {
            responseErrorHandle(res)
        }

    } else {
        res.send({ "message": "not found book(s) to return.", "success": false, "status": 200 })
    }
    return res.end()
})

app.listen(9000, () => {
    console.log('Application is running on port 9000')
})


function responseErrorHandle(res) {
    if (res.status(401)) {
        res.send({ "message": "Unauthorized.", "status": 401, "success": false })
    } else if (res.status(401)) {
        res.send({ "message": "Page not found.", "status": 404, "success": false })
    } else if (res.status(500)) {
        res.send({ "message": "Server errors.", "status": 500, "success": false })
    }
    return res.end()
}