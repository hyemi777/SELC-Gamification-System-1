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
app.use(express.static(__dirname + "/public"));

app.use(expressLayouts);
app.use(bodyParser.json());
app.use(cookieParser());
app.use(csrfMiddleware);

app.all("*", (req, res, next) => {
  res.cookie("XSRF-TOKEN", req.csrfToken());
  next();
});

function convertToArray(dataArray, doc) {

  return dataArray.push(doc.data());
}

app.get("/login", function (req, res) {
  res.render("login.ejs", { 
    layout: 'Layout/layout.ejs', 
    pagename: "login"
  }
  );
});

app.get("/signup", function (req, res) {
  res.render("signup.ejs", { 
    layout: 'Layout/layout.ejs',
    pagename: "signup" 
  });
});

app.get("/profile", function (req, res) {
  const sessionCookie = req.cookies.session || "";

  admin
    .auth()
    .verifySessionCookie(sessionCookie, true /** checkRevoked */)
    .then(() => {
      res.render("profile.ejs", {
        layout: 'Layout/layout.ejs',
        pagename: "profile"
      });
    })
    .catch((error) => {
      res.redirect("/login");
    });
});

app.get("/", function (req, res) {
  res.render("index.ejs", { 
    layout: 'Layout/layout.ejs', 
    pagename: "home"
  });
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
    pagename: "test"
  })
});

app.get("/test2", function (req, res) {





  // admin.auth().getUserByEmail("test@gmail.com")
  //   .then(function (userRecord) {
  //     // See the UserRecord reference doc for the contents of userRecord.
  //     console.log('Successfully fetched user data:', userRecord.toJSON());
  //   })
  //   .catch(function (error) {
  //     console.log('Error fetching user data:', error);
  //   });
});

app.get("/pointsForm", function (req, res) {

 
  db.collection("test").get().then(function (querySnapshot) {
    let dataArray = [];

    querySnapshot.forEach(function (doc) {

      convertToArray(dataArray, doc);
      //console.log(109, dataArray);
    });

    //console.log(112, dataArray);
    res.render("pointsForm.ejs", {
      layout: 'Layout/layout.ejs',
      dataArray,
      pagename: "pointsForm"
    });
  });

});

app.post("/modifyPoints", function (req, res) {
  const sessionCookie = req.cookies.session || "";

  admin
    .auth()
    .verifySessionCookie(sessionCookie, true /** checkRevoked */)
    .then(() => {
      console.log(130, req.body.currentUser);
      console.log(131, req.body.points);
    })
    .catch((error) => {
      res.redirect("/login");
    });

});




app.post("/sessionLogin", (req, res) => {
  console.log(162, "Session login");
  console.log(163, "uid is");
  console.log(164, req.body);

  db.collection("test").doc(req.body.uid).set({
    email: req.body.email,
  });

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
