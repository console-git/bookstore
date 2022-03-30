# BookStore

A simple rental books project use nodeJs(Express) + mongoDB + mongoose.
This project can register, login rent, return books and calculate rental fee.

  API route 
  - /login => login
  -     method: POST
  -     required email and password.
  - /register => register
  -     method: POST
  -     required email and password. 
  -     optional address and tel.
  - /books => show all books
  -     method: GET
  - /books => add new book
  -     method: POST
  -     required name category price, and amount. 
  - /book/$bookId => edit book
  -     method: POST
  -     optional name category price, and amount. 
  - /book/rent => rent book
  -     method: POST
  -     required name userId and bookId. 
  - /books/history => show all rental history
  -     method: GET
  - /book/history/$userId => show user's rental history
  -     method: GET
  - /book/return-book => return book to store
  -     method: POST
  -     required name rentId. 

---
## Requirements

For development, you will only need Node.js and a node global package, Yarn, installed in your environement.

### Node
- #### Node installation on Windows

  Just go on [official Node.js website](https://nodejs.org/) and download the installer.
Also, be sure to have `git` available in your PATH, `npm` might need it (You can find git [here](https://git-scm.com/)).

- #### Node installation on Ubuntu

  You can install nodejs and npm easily with apt install, just run the following commands.

      $ sudo apt install nodejs
      $ sudo apt install npm

- #### Other Operating Systems
  You can find more information about the installation on the [official Node.js website](https://nodejs.org/) and the [official NPM website](https://npmjs.org/).

If the installation was successful, you should be able to run the following command.

    $ node --version
    v16.13.2

    $ npm --version
    8.1.2

If you need to update `npm`, you can make it using `npm`! Cool right? After running the following command, just open again the command line and be happy.

    $ npm install npm -g

###
### Yarn installation
  After installing node, this project will need yarn too, so just run the following command.

      $ npm install -g yarn

---

## Install

    $ git clone https://github.com/console-git/bookstore
    $ cd bookstore
    $ yarn install

## Running the project

    $ yarn start

## Simple build for production

    $ yarn build
    
    
