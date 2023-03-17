var jwt = require('jsonwebtoken');

module.exports=function(req,res,next){
     const token=req.header('auth-token');
     if(!token) res.send({status:'401',message:'Unauthorized'})

     try{
         const verified=jwt.verify(token,process.env.MY_SECRET);
         req.user=verified;
         next();
     }catch(err){
        return  res.status(400).send('Invalid Token');
     }
}