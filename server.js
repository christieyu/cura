// server.js based off https://auth0.com/blog/create-a-simple-and-stylish-node-express-app/

// Required External Modules
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
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
app.use(bodyParser.urlencoded({ extended: true }));
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
	cura.getRandomTaggedObject().then( response => {
		cura.galleryCurator(response).then( response => {
			gallery = cura.getGallery();
			console.log(gallery["galleryMetaData"])
			res.render("index", { 
				title: "Home",
				date_month: date.toLocaleString('default', { month: 'long' }).toUpperCase(), 
				date_day: date.getDate(),
				gallery: gallery["gallery"],
				gallery_title: gallery["galleryMetaData"].label
			});
		})
	});
});

app.post("/", (req, res) => {
	console.log('Got body:', req.body);
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
	cura.getRandomTaggedObject().then( response => {
		cura.galleryCurator(56703).then( following => {
			gallery = cura.getGallery();
			console.log(gallery)
			res.render("test", { 
				gallery: gallery["gallery"], 
				gallery_title: gallery["galleryMetaData"].label
			});
		});
	});
});

// Server Activation
app.listen(port, () => {
	console.log(`Listening to requests on http://localhost:${port}`);
});