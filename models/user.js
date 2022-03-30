
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const userSchema = new Schema(
    {
        userId: String,
        email: String,
        name: String,
        address:String,
        tel:String,
        role:String,
        password: String
    },
    {
        timestamps: {
            createdAt: "createdAt",
            updatedAt: "updatedAt",
        },
    }
);
const User = mongoose.model("User", userSchema);
module.exports = User;