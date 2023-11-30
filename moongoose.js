import mongoose from "mongoose"
mongoose.connect("mongodb://127.0.0.1:27017/Info");
// use ` mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
export const connection = mongoose.connection;
const user_schema = new mongoose.Schema({
    name :{
        type : String,
        required : true
    },
    email :{
        type : String,
        required : true,
        unique : true
    },
    password :{
        type : String,
        required : true
    }
})

const itemSchema=new mongoose.Schema({
    serial_no : String,
    val : String,
    email : String
 })
 
// itemSchema.index({ serial_no: 1, email: 1 }, { unique: true })
export const user = mongoose.model("user",user_schema);
export const item = mongoose.model("item",itemSchema);