const express = require("express");
const app = express();
const userModel = require("./models/user.js");
const postModel = require("./models/post.js");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const post = require("./models/post.js");

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.render("index.ejs");
});

//! LOGIN PAGE
app.get("/login", (req, res) => {
  res.render("login.ejs");
});

//! PROFILE PAGE
app.get("/profile", isLoggedIn, async (req, res) => {
  // console.log(req.user);
  const user = await userModel
    .findOne({ email: req.user.email })
    .populate("posts");
  // console.log(user);
  res.render("profile.ejs", { user });
});

//! LIKE
app.get("/like/:id", isLoggedIn, async (req, res) => {
  let post = await postModel.findOne({ _id: req.params.id }).populate("user");
  // console.log(req.user.userid);

  if (post.likes.indexOf(req.user.userid) === -1) {
    post.likes.push(req.user.userid);
  } else {
    post.likes.splice(post.likes.indexOf(req.user.userid), 1);
  }

  await post.save();
  console.log(post);
  res.redirect("/profile");
});

//! EDIT
app.get("/update/:id", isLoggedIn, async (req, res) => {
  let post = await postModel.findOne({ _id: req.params.id }).populate("user");
  // console.log(req.user.userid);
  res.render("edit.ejs", { post });
});



//! EDIT POST METHOD
app.post("/update/:id", isLoggedIn, async (req, res) => {
  let post = await postModel.findOneAndUpdate(
    { _id: req.params.id },
    { content: req.body.content }
  );
  // console.log(req.user.userid);
  res.redirect("/profile");
});


//! DELETE POST
app.post("/delete/:id", isLoggedIn, async (req, res) => {
  console.log(req.params.id);
  let post = await postModel.findOneAndDelete({ _id: req.params.id });
  res.redirect("/profile")
})


//! USER POSTS
app.post("/post", isLoggedIn, async (req, res) => {
  // console.log(req.user);
  const user = await userModel.findOne({ email: req.user.email });
  let { content } = req.body;

  let post = await postModel.create({
    user: user._id,
    content: content,
  });

  user.posts.push(post._id);
  await user.save();
  res.redirect("/profile");
});

//! REGISTRATION
app.post("/register", async (req, res) => {
  const { name, username, password, email, age } = req.body;
  let user = await userModel.findOne({ email });
  if (user) return res.status(500).send("User already register");

  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, async (err, hash) => {
      console.log(hash);
      let user = await userModel.create({
        username,
        email,
        age,
        name,
        password: hash,
      });

      let token = jwt.sign({ email: email, userid: user._id }, "shshsh");
      res.cookie("token", token);
      res.redirect("/profile")
    });
  });
});

//! LOGIN POST
app.post("/login", async (req, res) => {
  let { email, password } = req.body;

  let user = await userModel.findOne({ email });
  if (!user) return res.status(500).send("Something went wrong");

  bcrypt.compare(password, user.password, (err, result) => {
    console.log(result);
    if (result) {
      let token = jwt.sign({ email: email, userid: user._id }, "shshsh");
      res.cookie("token", token);
      res.status(200).redirect("/profile");
    } else {
      res.redirect("/login");
    }
  });
});

//! LOGOUT
app.get("/logout", (req, res) => {
  res.cookie("token", "");
  res.redirect("/login");
});

function isLoggedIn(req, res, next) {
  if (req.cookies.token === "") res.send("You must be logged in");
  else {
    let data = jwt.verify(req.cookies.token, "shshsh");
    req.user = data;
    next();
  }
}

app.listen(3000);
