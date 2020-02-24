var mongoose = require("mongoose");
var express = require("express");
var cheerio = require("cheerio");
var axios = require("axios");
var exphbs = require("express-handlebars");

var db = require("./models");

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/sraperdb";
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useCreateIndex: true });

var app = express();
var PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");
app.get("/scrape", function (req, res) {

  axios.get("https://www.npr.org/sections/news/").then(function (response) {
    var $ = cheerio.load(response.data);

    $("article.item.has-image").each(function (i, element) {
      var title = $(element).find("div.item-info").find("h2.title").find("a").text();
      var summary = $(element).find("div.item-info").find("p.teaser").find("a").text();
      var link = $(element).find("div.item-info").find("h2.title").find("a").attr("href");
      var imageSrc = $(element).find("div.item-image").find("div.imagewrap").find("a").find("img").attr("src");
      var category = $(element).find("div.item-info").find("div.slug-wrap").find("h3").text();

      var newArticle = {
        title: title,
        summary: summary,
        link: link,
        imageSrc: imageSrc,
        category: category
      }
      db.Article.create(newArticle)
        .then(function (result) {
          console.log(result);
        })
        .catch(function (err) {
          console.log(err);
        });
    });
    res.send("Scrape Complete");
  });
});
app.get("/", function (req, res) {
  db.Article.find({}).then(function (result) {
    res.render("index", result);
  })
    .catch(function (err) {
      res.json(err);
    });
});

app.get("/favorites", function (req, res) {
  db.Article.find({}).then(function (result) {
    res.render("index", result);
  })
    .catch(function (err) {
      res.json(err);
    });
});


app.get("/articles", function (req, res) {
  db.Article.find({}).then(function (result) {
    res.json(result);
  })
    .catch(function (err) {
      res.json(err);
    });
})

app.get("/articles/:id", function (req, res) {
  db.Article.findOne({ _id: req.params.id })
    .populate("comment")
    .then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function (err) {
      res.json(err)
    });
});

app.post("/articles/:id", function (req, res) {
  db.Comment.create(req.body)
    .then(function (result) {
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { comment: result._id }, { new: true });
    })
    .then(function (result) {

      res.json(result);
    })
    .catch(function (err) {

      res.json(err);
    });
});

app.put("/articles/favorites/:id", function (req, res) {
  db.Article.findOne({ _id: req.params.id }).then(function (result) {
    if (result.isFavorite) {
      db.Article.findOneAndUpdate({ _id: req.params.id }, { $set: { isFavorite: false } })
        .then(function (result) {
          res.json(result);
        })
        .catch(function (err) {
          res.json(err)
        });
    } else {
      db.Article.findOneAndUpdate({ _id: req.params.id }, { $set: { isFavorite: true } })
        .then(function (result) {
          res.json(result);
        })
        .catch(function (err) {
          res.json(err)
        });
    }
  })
    .catch(function (err) {
      res.json(err);
    });


})

app.delete("/articles/:id", function (req, res) {
  db.Article.update({ "_id": req.params.id }, { $unset: { comment: 1 } })
    .then(function (result) {
      res.json(req.params.id);
    })
    .catch(function (err) {
      res.json(err);
    });
});

app.listen(PORT, function () {
  console.log("App is listening on port", PORT)
})


