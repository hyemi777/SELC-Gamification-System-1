
const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");



const db = admin.firestore()

function convertToArray(dataArray, doc) {

  return dataArray.push(doc.data());
}

router.get("/", function (req, res) {


  db.collection("users").orderBy("points").get().then(function (querySnapshot) {
    let dataArray = [];
    querySnapshot.forEach(function (doc) {

      convertToArray(dataArray, doc);
    });
    res.render("dashboard.ejs", {
      layout: 'Layout/layout.ejs',
      pagename: "dashboard",
      dataArray,
    });
  });


});

router.get("/leaderboard", function (req, res) {


  db.collection("users").orderBy("points").get().then(function (querySnapshot) {
    let dataArray = [];
    querySnapshot.forEach(function (doc) {

      convertToArray(dataArray, doc);
    });
    res.render("leaderboard.ejs", {
      layout: 'Layout/layout.ejs',
      pagename: "leaderboard",
      dataArray,
    });
  });


});


router.get("/test", function (req, res) {
  let testArray = [];
  let testObject = {

  };
  db.collection("users").get().then(function (querySnapshot) {

    querySnapshot.forEach(function (doc) {

      testObject[`${doc.data}`] = doc.data();
    });

    testArray.push(testObject);

  });


  res.render("test.ejs", {
    layout: "Layout/layout.ejs",
    pagename: "test"
  })
});

router.get("/test2", function (req, res) {





  // admin.auth().getUserByEmail("test@gmail.com")
  //   .then(function (userRecord) {
  //     // See the UserRecord reference doc for the contents of userRecord.
  //     console.log('Successfully fetched user data:', userRecord.toJSON());
  //   })
  //   .catch(function (error) {
  //     console.log('Error fetching user data:', error);
  //   });
});

router.get("/pointsForm", function (req, res) {

  const sessionCookie = req.cookies.session || "";
  
  admin
      .auth()
      .verifySessionCookie(sessionCookie, true /** checkRevoked */)
      .then(() => {

        db.collection("users").get().then(function (querySnapshot) {
          let dataArray = [];
          querySnapshot.forEach(function (doc) {
            convertToArray(dataArray, doc);
          });
          //console.log(125, dataArray);
          res.render("pointsForm.ejs", {
            layout: 'Layout/layout.ejs',
            dataArray,
            pagename: "pointsForm"
          });
        });
      


      })
      .catch((error) => {
        console.log(100, error);
          res.redirect("/");
      });


});

router.post("/modifyPoints", function (req, res) {


  let currentUser = req.body.currentUser;
  let currentUserIndex = currentUser[0];


  db.collection("users").get().then(function (querySnapshot) {
    let dataArray = [];
    querySnapshot.forEach(function (doc) {

      convertToArray(dataArray, doc);
    });

    let currentUserUID = dataArray[currentUserIndex].uid;

    const currentDB = db.collection("users").doc(currentUserUID);
    currentDB.update({
      points: req.body.points,
    })

  });

  res.redirect(301, "/");


});


module.exports = router;
