const express = require("express");

const path = require("path");

const cookieParser = require("cookie-parser");

const { connectToMongoDb } = require("./connect");

const URL = require("./models/url");

const urlRoute = require("./routes/url");

const staticRoute = require("./routes/staticRouter");

const userRoute = require("./routes/user");

const { checkForAuthentication, restrictTo} = require("./middlewares/auth")

const app = express();

const PORT = 8001;

connectToMongoDb("mongodb://127.0.0.1:27017/short-url").then(() =>
  console.log("Connected to MongoDB")
);

app.set("view engine", "ejs");

app.set("views", path.resolve("./views"));

app.use(express.json());

app.use(express.urlencoded({ extended: false }));

app.use(cookieParser());

app.use(checkForAuthentication());

app.get("/test", async (req, res) => {
  const allUrls = await URL.find({});
  return res.render("home", { urls: allUrls });
});

app.use("/url", restrictTo(["NORMAL", "ADMIN"]), urlRoute);

app.use("/user", userRoute);

app.use("/", staticRoute);

app.get("/url/:shortid", async (req, res) => {
  const shortId = req.params.shortid;

  const entry = await URL.findOneAndUpdate(
    {
      shortId: shortId,
    },
    {
      $push: {
        visitHistory: {
          timeStamp: Date.now(),
        },
      },
    }
  );

  res.redirect(entry.redirectUrl );
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
