app.get("/profile", isLoggedIn, async(req, res) => {
  // console.log(req.user);
  const user = await userModel.findOne({ email: req.user.email });
  console.log(user);
  res.render("profile.ejs", {user});
});
