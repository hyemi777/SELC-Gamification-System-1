
const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");


const db = admin.firestore()


router.get("/login", function (req, res) {
    res.render("login.ejs", {
        layout: 'Layout/layout.ejs',
        pagename: "login"
    }
    );
});

router.get("/signup", function (req, res) {
    res.render("signup.ejs", {
        layout: 'Layout/layout.ejs',
        pagename: "signup"
    });
});

router.get("/profile", function (req, res) {
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
            res.redirect("/");
        });
});





router.post("/sessionLogin", (req, res) => {


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

router.post("/sessionSignup", (req, res) => {



    db.collection("users").doc(req.body.uid).set({
        uid: req.body.uid,
        email: req.body.email,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        created:admin.firestore.Timestamp.now(),
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



router.get("/sessionLogout", (req, res) => {
    res.clearCookie("session");
    res.redirect("/login");
});


module.exports = router;
