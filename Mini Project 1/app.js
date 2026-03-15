const express=require('express')
const cookieParser=require("cookie-parser")
const app=express()
const userModel=require("./models/user")
const postModel=require('./models/post')  
const bcrypt=require('bcrypt')
const jwt=require('jsonwebtoken')
// const { use } = require('react')

app.set("view engine","ejs")
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())
       

app.get('/',(req,res)=>{
    res.render('index')   
})  


app.get('/login',(req,res)=>{
    res.render('login')
})

app.get('/profile',isLoggedIn,async(req,res)=>{
    let user=await userModel.findOne({email:req.user.email})
   await user.populate("posts")
    
    res.render('profile',{user}) 
}) 

app.post('/post',isLoggedIn,async(req,res)=>{
    let user=await userModel.findOne({email:req.user.email})
    let {content}=req.body
   let post=await postModel.create({
        user:user._id,
        content:content
    })
    user.posts.push(post._id)
   await user.save()
   res.redirect("/profile")

})

app.get('/logout',(req,res)=>{
    res.cookie("token","")
    res.redirect("/login")
})


app.post('/register',async(req,res)=>{
    let{email,password,name,age,username}=req.body
    let user=await userModel.findOne({email})  
    if(user) return res.status(300).send("User already exists")

    bcrypt.genSalt(10,(err,salt)=>{
        bcrypt.hash(password,salt,async(err,hash)=>{
           let user = await userModel.create({
             username,
             name,
             age,
             email,
             password:hash
           })
            
          let token = jwt.sign({email:email,userid:user._id},"secretkey")
          res.cookie("token",token)
          console.log(req.cookies)
          res.send("user registered successfully")
           
        })
    })    
    
})  
app.post('/login',async(req,res)=>{
    let{email,password}=req.body
    let user=await userModel.findOne({email})  
    if(!user) return res.status(500).send("Something went wrong")
    
    bcrypt.compare(password,user.password,(err,result)=>{
        if(result) {
            let token = jwt.sign({email:email,userid:user._id},"secretkey")
            res.cookie("token",token)
            res.status(300).redirect('/profile')      
        }
             
            else res.render('/login')
    })     
     
})  
 
function isLoggedIn(req,res,next){ 
    if(req.cookies.token==="") res.redirect("/login")
        else{
            let data=jwt.verify(req.cookies.token,"secretkey")
            req.user=data
            next();
    }
    
}

app.listen(3000)     