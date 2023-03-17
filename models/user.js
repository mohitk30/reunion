const mongoose=require('mongoose')
const {postsConnection} = require('../dbConnection/dbconnect');

 

const userSchema= new mongoose.Schema({
    
    userAddedOn:{ type: Number ,default: () => new Date(+new Date() )},
    email:{type:String,required:true },
    userName:{type:String,required:true },
    password:{type:String,required:true },
    followers:{type:Number,default:0},
    following:{type:Number,default:0},

},{collection:'users'});

const model=postsConnection.model('UserModel',userSchema);

module.exports=model


 