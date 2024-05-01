const express = require("express");

const path = require("path");

const { connectToMongoDb } = require("./connect");

const urlRoute = require("./routes/url");

const URL = require("./models/url");

const staticRoute = require("./routes/staticRouter");

const app = express();

const PORT = 8001;

connectToMongoDb("mongodb://127.0.0.1:27017/short-url").then(() =>
  console.log("Connected to MongoDB")
);

app.set("view engine", "ejs");

app.set("views", path.resolve("./views"));

app.use(express.json());

app.use(express.urlencoded({ extended: false }));

app.get("/test", async (req, res) => {
  const allUrls = await URL.find({});
  return res.render("home", { urls: allUrls });
});

app.use("/url", urlRoute);

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
