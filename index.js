// index.js based off https://auth0.com/blog/create-a-simple-and-stylish-node-express-app/

// Required External Modules
const express = require("express");
const path = require("path");

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

// Routes Definitions
app.get("/", (req, res) => {
    date = new Date()
    res.render("index", { 
        title: "Home", 
        date_month: date.toLocaleString('default', { month: 'long' }).toUpperCase(), 
        date_day: date.getDate() 
    });
});

app.get("/collections", (req, res) => {
    date = new Date()
    res.render("collections", { 
        title: "Collections",
    });
});

app.get("/recent", (req, res) => {
    date = new Date()
    res.render("recent", { 
        title: "Recently Viewed",
    });
});

// Server Activation
app.listen(port, () => {
    console.log(`Listening to requests on http://localhost:${port}`);
});