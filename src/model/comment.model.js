const mongoose = require("mongoose");

// TODO: Modify this after user created
const CommentSchema = new mongoose.Schema({
  comment: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  // user: String,
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Blog",
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});
exports.CommentSchema = CommentSchema;

const Comment = mongoose.model("Comment", CommentSchema)

module.exports = Comment;