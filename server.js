// server.js based off https://auth0.com/blog/create-a-simple-and-stylish-node-express-app/

// Required External Modules
const express = require("express");
const path = require("path");
const fetch = require("cross-fetch");
const { response } = require("express");

// App Variables
const app = express();
const port = process.env.PORT || "8000"; 

// App Configuration
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(express.static(path.join(__dirname, "public")));
app.use('/css', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css')))
app.use('/js', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js')))
app.use('/js', express.static(path.join(__dirname, 'node_modules/jquery/dist')))
app.use('/js', express.static(path.join(__dirname, 'node_modules/masonry-layout/dist/masonry.pkgd.min.js')))

// API object access functions
async function listDepts() {
    let response = await fetch('https://collectionapi.metmuseum.org/public/collection/v1/departments')
    let depts = await response.json()
    // console.log(depts)
    return depts
}

function getRandInt(min, max) { // https://www.w3schools.com/js/js_random.asp
    return Math.floor(Math.random() * (max - min) ) + min;
}

async function randomObj() {
    // get all objects
    let response = await fetch("https://collectionapi.metmuseum.org/public/collection/v1/objects?departmentIds=3|5|6|10|11|13|14|17|21")
    let all_objects = await response.json()
    // get random index
    index = getRandInt(0, all_objects['total'])
    // console.log(index)
    // get object
    let response2 = await fetch('https://collectionapi.metmuseum.org/public/collection/v1/objects/' + all_objects['objectIDs'][index])
    let object = await response2.json()
    // console.log(object)
    return object
}

async function makeGallery(objs) {
    console.log('Start2')
    let gallery = [];
    let i = 0;
    while (i < objs) {
        let obj = await randomObj();
        console.log(obj)
        if (obj['primaryImage']) {
            gallery.push(obj);
            i++;
        }
    }
    console.log('End')
    return gallery;
    
}

// Routes Definitions
app.get("/", (req, res) => {
    // get date header info
    date = new Date()
    // make random gallery
    console.log('Start1')
    makeGallery(21).then( response => {
        console.log(response)
        res.render("index", { 
            title: "Home", 
            date_month: date.toLocaleString('default', { month: 'long' }).toUpperCase(), 
            date_day: date.getDate(),
            gallery: response
        });
    })
    // async function makeGallery() {
    //     console.log('Start2')
    //     let gallery = [];
    //     for (let i = 0; i < 21; i++) {
    //         let obj = await randomObj();
    //         gallery.push(obj);
    //     }
    //     console.log('End')
    //     res.render("index", { 
    //         title: "Home", 
    //         date_month: date.toLocaleString('default', { month: 'long' }).toUpperCase(), 
    //         date_day: date.getDate(),
    //         gallery: gallery
    //     });
    // }
    // makeGallery();

    // let gallery = []
    // for (i = 0; i < 21; i++) {
    //     randomObj().then(response => {
    //         console.log(response)
    //         gallery.push(response)
    //     })
    //     // console.log(gallery)
    // }
    // console.log(gallery)
    // res.render("index", { 
    //     title: "Home", 
    //     date_month: date.toLocaleString('default', { month: 'long' }).toUpperCase(), 
    //     date_day: date.getDate(),
    //     gallery: gallery
    // });
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