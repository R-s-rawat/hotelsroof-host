const express = require("express");
const Blog = require("../model/blog.model");
const Comment = require("../model/comment.model");
const verifyToken = require("../middleware/verifyToken");
const isAdmin = require("../middleware/isAdmin");
const router = express.Router();

// create a blog post
router.post("/create-post", verifyToken,isAdmin, async (req, res) => {
  try {
    // console.log(req.body)
    const newPost = new Blog({...req.body, author:req.userId}); // todo: user , author:req.userId // when you have tokenVerify
    await newPost.save();
    res.status(201).send({
      message: "Post created successfully",
      post: newPost,
    });
  } catch (error) {
    console.log("Error creating post", error);
    res.status(500).send({ message: "Error Creating Post" });
  }
});

// get all blogs
router.get("/", async (req, res) => {
  // res.send("Blog routes is here")
  // below is try statement
  try {
    let query ={}
    const {search,category,location} = req.query
    // above the req.query is special object in Express.js, also another object req.body is used to access data sent in the request body
    // console.log(search)
  // if URL param is category
    if(category){
      query={
        ...query,
        category: category
      }
    }
 // if URL param is location
    if(location){
      query={
        ...query,
        location: location
      }
    }
 // if URL param is search keyword regex over any word in title or content
    if(search){
      query={
        ...query,
        $or: [
          {title:{$regex:search,$options:"i"}},
          {content:{$regex:search,$options:"i"}},
        ]
      }
    }

    // const post = await Blog.find(query).populate('author', 'email').sort({createdAt: -1})
    // res.status(200).send({
    //   message:"All posts retrieved successfully",
    //   posts:post
    // })
    const posts = await Blog.find(query).populate('author', 'email').sort({createdAt: -1})
    res.status(200).send(posts)
    //below is catch statement
  } catch (error) {
    console.error("Error retrieving post: ", error);
    res.status(500).send({ message: "Error retrieving post" });
  }
});

// get single blog by id (search feature)
router.get("/:id", async(req,res)=>{
  // below is try statement
try {
  const postId = req.params.id
  const post = await Blog.findById(postId)
// for the post found & not found

if(!post){ 
  return res.status(404).send({message:"post not found"})
}
// Todo: with also fetch comment related to post
const comments = await Comment.find({postId:postId}).populate('user',"username email")
res.status(200).send({
  post, comments
})
} catch (error) {
  console.error("Error fetching single post: ", error);
  res.status(500).send({ message: "Error retrieving post" });
}
})

// update a blog post 
router.patch("/update-post/:id", verifyToken, isAdmin, async(req,res)=>{
try {
  const postId= req.params.id
  // find by id and update
  const updatedPost = await Blog.findByIdAndUpdate(postId, {
    ...req.body
  },{new: true}
  )
  //if not happened, updation
  if(!updatedPost){
    return res.status(404).send({message:"Post not found"})
  }
  // if found then give updated post
  res.status(200).send({
    message:"Post update succesfully",
    post: updatedPost
  })
} catch (error) {
  console.error("Error updating post: ", error);
  res.status(500).send({ message: "Error updating post" });
}
})

//delete a blog
router.delete("/:id",verifyToken, isAdmin, async(req, res)=>{
  try {
    const postId = req.params.id;
    const post = await Blog.findByIdAndDelete(postId);
    if(!post){
      return res.status(404).send({ message: "Post not found" })
    }
   
    // delete related comments
   await Comment.deleteMany({postId: postId})

    res.status(200).send({
      message: "Post deleted successfully",
      post: post
    })
  } catch (error) {
    console.error("Error deleting post: ", error);
    res.status(500).send({ message: "Error deleting post" });
  }
})

// related blogs
router.get("/related/:id", async(req,res)=>{
  try{
    const {id} = req.params;

    if(!id){
      return res.status(400).send({message:"Post id is required"})
    }

    const blog = await Blog.findById(id)

    if(!blog){
      return res.status(400).send({message:"Post id is required"})
    }
    //  BELOW is REGEX LOGIC
    const titleRegex = new RegExp(blog.title.split(' ').join('|'),'i');
    const relatedQuery = {
      _id: {$ne:id}, // exclude the current blog by id
      title: {$regex: titleRegex},
    }

    const relatedPost = await Blog.find(relatedQuery)
    res.status(200).send(relatedPost)

  }catch(error){
    console.error("Error fetching related post:", error)
    res.status(500).send({message:"Error fetching related post"})
  }
})

module.exports = router;