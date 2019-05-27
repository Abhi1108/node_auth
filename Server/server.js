const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");

const app = express();

mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost:27017/auth", { useNewUrlParser: true });

const { User } = require("./Models/user");
const { auth } = require(".//middleware/auth");

app.use(bodyParser.json());
app.use(cookieParser());

app.post("/api/user", (req, res) => {
  const user = new User({
    email: req.body.email,
    password: req.body.password
  });

  user.save((err, doc) => {
    if (err) res.status(400).send(err);

    res.status(200).send(doc);
  });
});

app.post("/api/user/login", (req, res) => {
  User.findOne({ email: req.body.email }, (err, user) => {
    if (!user) res.json({ message: "Auth Failed, user not Found..." });

    user.comparePassword(req.body.password, (err, isMatch) => {
      if (err) throw err;
      if (!isMatch)
        return res.status(400).json({
          message: "Wrong Password"
        });

      user.generateToken((err, user) => {
        if (err) return res.status(400).send(err);
        res.cookie("auth", user.token.toString()).send("ok");
      });
    });
  });
});

app.get("/user/profile", auth, (req, res) => {
  res.status(200).send(req.token);
});

const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log(`Port started on ${port}`);
});
