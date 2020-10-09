const cookieParser = require("cookie-parser");
const csrf = require("csurf");
const bodyParser = require("body-parser");
const express = require("express");
const admin = require("firebase-admin");
const expressLayouts = require('express-ejs-layouts');

const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://test-73b01.firebaseio.com",
});

const csrfMiddleware = csrf({ cookie: true });

const PORT = process.env.PORT || 3000;
const app = express();

const db = admin.firestore()

app.engine("html", require("ejs").renderFile);
app.use(express.static("static"));

app.use(expressLayouts);
app.use(bodyParser.json());
app.use(cookieParser());
app.use(csrfMiddleware);

app.all("*", (req, res, next) => {
  res.cookie("XSRF-TOKEN", req.csrfToken());
  next();
});

app.get("/login", function (req, res) {
  res.render("login.ejs", {
    data: "this is data"
  });
});

app.get("/signup", function (req, res) {
  res.render("signup", {layout: 'Layout/layout.ejs'});
});

app.get("/profile", function (req, res) {
  const sessionCookie = req.cookies.session || "";
  
  admin
    .auth()
    .verifySessionCookie(sessionCookie, true /** checkRevoked */)
    .then(() => {
      res.render("profile.html");
    })
    .catch((error) => {
      res.redirect("/login");
    });
});

app.get("/", function (req, res) {
  res.render("index.html", { layout: 'Layout/layout.ejs'});
});

app.get("/test", function (req, res) {
  let testArray = [];
  let testObject = {
 
  };
  db.collection("test").get().then(function (querySnapshot) {

    querySnapshot.forEach(function (doc) {
    
      testObject[`${doc.data}`] = doc.data();
    });

    testArray.push(testObject);

  });


  res.render("test.ejs", {

  })
});

app.get("/test2", function (req, res) {
  admin.auth().getUserByEmail("test@gmail.com")
  .then(function(userRecord) {
    // See the UserRecord reference doc for the contents of userRecord.
    console.log('Successfully fetched user data:', userRecord.toJSON());
  })
  .catch(function(error) {
    console.log('Error fetching user data:', error);
  });
});


app.post("/sessionLogin", (req, res) => {
  console.log(62, "Session login");


  db.collection("test").add({ name: "Billy" })

  const idToken = req.body.idToken.toString();

  const expiresIn = 60 * 60 * 24 * 5 * 1000;

  admin
    .auth()
    .createSessionCookie(idToken, { expiresIn })
    .then(
      (sessionCookie) => {
        const options = { maxAge: expiresIn, httpOnly: true };
        res.cookie("session", sessionCookie, options);
        res.end(JSON.stringify({ status: "success" }));
      },
      (error) => {
        res.status(401).send("UNAUTHORIZED REQUEST!");
      }
    );
});

app.get("/sessionLogout", (req, res) => {
  res.clearCookie("session");
  res.redirect("/login");
});

app.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
});
