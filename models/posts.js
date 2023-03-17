const mongoose=require('mongoose')
const {postsConnection} = require('../dbConnection/dbconnect');
const generateUniqueId = require('generate-unique-id');

 
const postSchema= new mongoose.Schema({
    
    postAddedOn:{ type: Number ,default: () => new Date(+new Date() )},
    postTitle:{type:String,required:true }, 
    postDescription:{type:String,required:true},
    postAddedByUserId:{type:String,required:true},
    postLikes:{type:Number,default:0}, 
    postUnLikes:{type:Number,default:0}, 
    postComments:[{
                    comment   :      {type:String,required:true },
                    addedByUserId:  {type:String,required:true },
                    commentId:      {type:String,required:true } 
                }
       ] 
  
     

},{collection:'posts'});

const model=postsConnection.model('PostModel',postSchema);
 
module.exports=model


 