// server.js based off https://auth0.com/blog/create-a-simple-and-stylish-node-express-app/

// Required External Modules
const express = require("express");
const path = require("path");
const cura = require("./scripts/cura");
// const fetch = require("cross-fetch");
// const { response } = require("express");
// const sqlite3 = require('sqlite3').verbose();

// App Variables
const app = express();
const port = process.env.PORT || "8000"; 
// const db = new sqlite3.Database('objects.db');
// module.exports = db;

// App Configuration
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(express.static(path.join(__dirname, "public")));
app.use('/css', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css')))
app.use('/js', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js')))
app.use('/js', express.static(path.join(__dirname, 'node_modules/jquery/dist')))
app.use('/js', express.static(path.join(__dirname, 'node_modules/masonry-layout/dist/masonry.pkgd.min.js')))

// Routes Definitions
app.get("/", (req, res) => {
    // get date header info
    date = new Date()
    // make random gallery
    console.log('----------Part 1----------')
    let testGallery = [288224, 289206, 289219, 289220, 289221, 289263, 291383, 291385, 291386, 291387, 291388, 291390, 291391, 265786, 269047, 289170, 289169, 382942, 289183, 341796, 421658]
    cura.getGalleryData(testGallery).then( response => {
        console.log(response);
        console.log('----------Part 2----------')
        cura.getRandomTaggedObject().then( response => {
            cura.galleryCurator(response);
        })
        res.render("index", { 
            title: "Home", 
            date_month: date.toLocaleString('default', { month: 'long' }).toUpperCase(), 
            date_day: date.getDate(),
            gallery: response
        });
    })
});

app.get("/collections", (req, res) => {
    date = new Date()
    res.render("collections", { 
        title: "Collections",
    });
});

app.get("/collection", (req, res) => {
    date = new Date()
    res.render("collection", { 
        title: "Collection",
    });
});

app.get("/recent", (req, res) => {
    date = new Date()
    res.render("recent", { 
        title: "Recently Viewed",
    });
});

app.get("/test", (req, res) => {
    randomObj()
    .then( response => {
        console.log(response)
        res.render("test", { 
            test: response,
        });
    })
    .catch( error => {
        res.render("test", { 
            test: "The site has encountered an error:" + error,
        });
    })
});

// Server Activation
app.listen(port, () => {
    console.log(`Listening to requests on http://localhost:${port}`);
});