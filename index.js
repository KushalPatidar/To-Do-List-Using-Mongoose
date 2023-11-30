import express, { Router } from "express"
import bcrypt from "bcryptjs"
import bodyParser from "body-parser"
import {dirname} from "path";
import { fileURLToPath } from "url";
import {connection,user,item} from "./moongoose.js"
import session from "express-session"
import connectMongo from 'connect-mongo';   //npm i connect-mongo@3
const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));

const MongoStore = connectMongo(session)
const sessionStore = new MongoStore({
    mongooseConnection : connection,
    collection : 'sessions'
})
app.use(bodyParser.urlencoded({extended:true}));
app.use(session({
    secret : "My Secret",
    resave : false,
    saveUninitialized : true,
    store : sessionStore,
    cookie : {
        maxAge : 1000*60*60*24   // 1 day in milisecond
    }
}))



app.get('/',(req,res)=>{
    res.sendFile(__dirname+'/registration.html')
})
app.get("/l",(req,res)=>{
    res.sendFile(__dirname+'/login.html')   
})
app.post("/registration",async (req,res)=>{
    try{
        let salt = await bcrypt.genSalt(10);
        let hashed_Password = await bcrypt.hash(req.body["password"],salt);
        if(req.body["password"]===req.body["ConfirmPassword"]){
            let a = new user({
                name : req.body["name"],
                email :req.body["email"],
                password : hashed_Password
            })
            a.save();
            res.sendFile(__dirname+'/login.html')        
        }
        else{
            res.redirect("/");
        }
    }
    catch(err){
        console.log(err.message)
        res.redirect("/");
    }
})
app.post("/login",async (req,res)=>{
    try{
        let arr = await user.findOne({email : req.body["email"]});
        if(arr){
            let ismatch = await bcrypt.compare(req.body["password"],arr.password);
            if(ismatch){
                req.session.mail =  req.body["email"] ;
                res.redirect("/todolist");
            }
            else{
                res.sendFile(__dirname+'/login.html')
            }
        }
        else{
            res.sendFile(__dirname+'/login.html')
        }
    }
    catch(err){
        console.log(err.message);
        res.sendFile(__dirname+'/login.html')
    }
})
app.get("/todolist",async (req,res)=>{
    if(req.session.mail){
        try{
            let List = await item.find({email:req.session.mail});
            res.render("index.ejs",{arr:List}); 
        }
        catch(err){
            console.log(err.message);
        }
    }
    else{
        console.log("www");
        res.redirect("/l");
    }
})
app.post("/add",async (req,res)=>{
    try{
        let x = await item.find({email:req.session.mail});
        let z = (x.length + 1).toString() ;
        let y = req.body["name"];
        let a = new item({serial_no:z ,val:y,email:req.session.mail});
        a.save();
        let info = await item.find({email:req.session.mail});
        res.redirect("/todolist")
    }
    catch(err){
        console.log(err.message);
    }
})
app.post("/del", async (req,res)=>{
    let x = req.body["name"];
    let z = await item.find({email:req.session.mail});
    let l = z.length;
    await item.deleteOne({serial_no : x,email:req.session.mail});
    let start = parseInt(x)+1; 
    for(let a=start;a<=l;a++){
        let w = a.toString();
        let v = (a-1).toString();
        await item.updateOne(
            {
                serial_no : w,
                email : req.session.mail
            },
            {
                $set : {
                    serial_no : v
                }
            }
        )
    }
    res.redirect("/todolist");
})
app.post("/logout",(req,res)=>{
    req.session.mail = undefined;
    res.redirect("/l");
})
app.listen(3000,()=>{
    console.log("Listening");
})