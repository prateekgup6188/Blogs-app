var express = require("express");
var app = express();
var sanitizer = require("express-sanitizer");
var methodOverride= require("method-override");
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(sanitizer());
app.use(methodOverride("_method"));
var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/RestApp",{
useUnifiedTopology:true,
useNewUrlParser:true,
useCreateIndex:true
}).then(() =>console.log("DB Connected!"))
.catch(err =>{
    console.log("DB Connection Error : $(err.message)");
});
app.set("view engine","ejs");
app.use(express.static("public"));
app.set("port",process.env.PORT||8080);
console.log("Server is listening");
var blogSchema = new mongoose.Schema({
title:String,
image:String,
body:String,
created:{type:Date,default:Date.now}
});

var Blog = mongoose.model("Blog",blogSchema);

// Blog.create({
//     title:"Test Blog",
//     image:"https://i.ytimg.com/vi/c7oV1T2j5mc/maxresdefault.jpg",
//     body:"What a View!"
// });

// Restful Routes

app.get("/",function(req,res){
    res.redirect("/blogs");
});

// Index route
app.get("/blogs",function(req,res){
    // display all blogs
    Blog.find({},function(err,blogs){   
    if(err){
        console.log(err);
    }
    else{
        res.render("index",{blogs:blogs});
    }
    });
});

// New route
app.get("/blogs/new",function(req,res){
    res.render("new");
});

// Create route
app.post("/blogs",function(req,res){
    //create blog
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.create(req.body.blog,function(err,newBlog){
        if(err){
            res.render("new");
        }
            // redirect to index
        else{
            res.redirect("/blogs");
        }
    });
});

// Show route
app.get("/blogs/:id",function(req,res){
    Blog.findById(req.params.id,function(err,foundBlog){
        if(err){
            res.redirect("/blogs");
        }
        else{
            res.render("show",{blog:foundBlog});
        }
    });
});

// Edit Route
app.get("/blogs/:id/edit",function(req,res)
{
    Blog.findById(req.params.id,function(err,editBlog){
        if(err){
            res.redirect("/blogs");
        }
        else{
            res.render("edit",{blog:editBlog});
        }
    });
});

// Update route
app.put("/blogs/:id",function(req,res){
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.findByIdAndUpdate(req.params.id,req.body.blog,function(err,updatedBlog){
        if(err){
            res.redirect("/blogs");
        }
        else{
            res.redirect("/blogs/"+req.params.id);
        }
    });
});

// Destroy Route
app.delete("/blogs/:id",function(req,res){
Blog.findByIdAndRemove(req.params.id,function(err){
    if(err){
        res.redirect("/blogs");
    }
    else{
        res.redirect("/blogs");
    }
});
});
app.listen(app.get("port"));