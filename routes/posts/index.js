const express = require("express")
const router = express.Router() 
const PostModel=require('../../models/posts')
const verify= require('../../middlewares/authenticate')
const UserModel=require('../../models/user') 
const jwt= require('jsonwebtoken');
const generateUniqueId = require('generate-unique-id');




// use to authenticate a user 
router.post('/authenticate', async (req, res) => { 
     
    try{
        const userLoginEmail=req.body.email;
        const userLoginPassword=req.body.password;
        const result= await UserModel.findOne({email:userLoginEmail,password:userLoginPassword});
        if(result){
            // create and assign a token 
            const token=jwt.sign(
                {email:userLoginEmail,id:result._id},
                process.env.MY_SECRET, 
                { expiresIn: '5h' }
                )

            res.header('auth-token',token).send({'token':token});
        }else{
            res.send( {status:'401',message:'Unauthorized'} );
        }

       
   }catch (error) { 
        console.log(error)
        res.send({status:'404',message:'Something wrong with user data.'});

   }
})


// used to create a new user 
// this api is created to create a  user
// {
//     "email":"testuser2@gmail.com",
//     "password":"testuser2",
//     "userName":"test2"
// }
router.post('/add', async (req, res) => { 
     
    try{
        const userLoginEmail=req.body.email;
        const userLoginPassword=req.body.password;
        const userLoginUserName=req.body.userName;
        const result= await UserModel.create({
            email:userLoginEmail,
            password:userLoginPassword,
            userName:userLoginUserName
        });
        // console.log(result)
        res.send({status:'200',message:'user added'});
   }catch (error) { 
        console.log(error)
        res.send({status:'404',message:'Something wrong with user data.'});

   }
})
 

// authenticated user will follow a user with given id

router.post('/follow/:id',verify,  async (req, res) => { 
     
    try{
        const userId=req.params.id;
        // console.log(req.user)
        const resultFollow= await UserModel.updateOne({_id:userId},{ $inc: { followers: 1 } })
        const resultFollowing= await UserModel.updateOne({_id:req.user.id},{ $inc: { following: 1 } })

        // console.log(result)
        res.send({status:'200',message:'You started following.'});
   }catch (error) { 
        console.log(error)
        res.send({status:'404',message:'Something wrong with user data.'});

   }
})

// authenticated user will un-follow a user with given id

router.post('/unfollow/:id',verify,  async (req, res) => { 
     
    try{
        const userId=req.params.id;
        const resultUnFollow= await UserModel.updateOne({_id:userId},{ $inc: { followers: -1 } })
        const resultUnFollowing= await UserModel.updateOne({_id:req.user.id},{ $inc: { following: -1 } })

        // console.log(result)
        res.send({status:'200',message:'You started following.'});
   }catch (error) { 
        console.log(error)
        res.send({status:'404',message:'Something wrong with user data.'});

   }
})


// authenticated user will   user  information
router.get('/user',verify,  async (req, res) => { 
     
    try{
        const userId=req.user.id;
        const resultUser= await UserModel.findOne({_id:userId},{  password:0 ,userAddedOn:0,__v:0,_id:0})
  
        // console.log(result)
        res.send({status:'200',user:resultUser});
   }catch (error) { 
        console.log(error)
        res.send({status:'404',message:'Something wrong with user data.'});

   }
})


// authenticated user will create a new post
router.post('/posts',verify,  async (req, res) => { 
     
    try{
        const postData=req.body
        // console.log(postData)
        const resultPost= await PostModel.create({
            postTitle:postData.postTitle, 
            postDescription:postData.postDescription,
            postAddedByUserId:req.user.id,
            postComments:[] 
        })
        

        // console.log(result)
        const timeAdded=new Date(resultPost.postAddedOn);
        res.send({status:'200',post:{
            postTitle:resultPost.postTitle, 
            postDescription:resultPost.postDescription,
            postId:resultPost._id, 
            createdOn:  timeAdded.toUTCString()
            
        }});
   }catch (error) { 
        console.log(error)
        res.send({status:'404',message:'Something wrong with user data.'});

   }
})


// authenticated user will delete a new post
router.delete('/posts/:id',verify,  async (req, res) => { 
     
    try{
        const postId=req.params.id
        // console.log(postData)
        const resultPost= await PostModel.deleteOne({_id:postId})
    
        res.send({status:'200',message:"Post Deleted"});
   }catch (error) { 
        console.log(error)
        res.send({status:'404',message:'Something wrong with user data.'});

   }
})


// authenticated user will unlike a post given id
router.post('/like/:id',verify,  async (req, res) => { 
     
    try{
        const postId=req.params.id;
        // console.log(req.user)
        const resultLikePost= await PostModel.updateOne({_id:postId},{ $inc: { postLikes: 1 } })
        // console.log(result)
        res.send({status:'200',message:'Post Liked.'});
   }catch (error) { 
        console.log(error)
        res.send({status:'404',message:'Something wrong with user data.'});

   }
})


// authenticated user will like a post given id
router.post('/unlike/:id',verify,  async (req, res) => { 
     
    try{
        const postId=req.params.id;
        const resultUnLikePost= await PostModel.updateOne({_id:postId},{ $inc: { postUnLikes: 1 } })
        // console.log(result)
        res.send({status:'200',message:'Post Un-Liked.'});
   }catch (error) { 
        console.log(error)
        res.send({status:'404',message:'Something wrong with user data.'});

   }
})

 
// authenticated user will add a comment to a post
router.post('/comment/:id',verify,  async (req, res) => { 
     
    try{
        const comment=req.body.comment;
         const postId=req.params.id;
         const newId= generateUniqueId({ length: 32, useLetters: true  });
        const resultCommentPost= await PostModel.updateOne(
            {_id:postId},
            { $push: {postComments:{ comment: comment,
                     addedByUserId:req.user.id,
                     commentId:  newId 
                    }}
             })
       
        res.send({status:'200',commentId:newId});
   }catch (error) { 
        console.log(error)
        res.send({status:'404',message:'Something wrong with user data.'});

   }
})


// get a single post
router.get('/posts/:id', async (req, res) => { 
     
    try{
        const postId= req.params.id;
        const postData=await PostModel.findOne({_id:postId},{_id:0, postAddedOn:0,__v:0});
        
        res.send({ post: {
            postTitle:postData.postTitle,
            postDescription:postData.postDescription,
            postComments:postData.postComments,
            noOfComments:postData.postComments.length,
            noOfLikes:postData.postLikes
        },status:'200' });
   }catch (error) { 
        console.log(error)
        res.send({status:'404',message:'Something wrong with blog data.'});

   }
})


// get all posts 
router.get('/all_posts', async (req, res) => { 
     
    try{
        const posts=await PostModel.find({},{_id:0,postAddedOn:0});
        
        res.send({ posts:posts  ,status:'200' });
   }catch (error) { 
        console.log(error)
        res.send({status:'404',message:'Something wrong with blog data.'});

   }
})




  


module.exports = router