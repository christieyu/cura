// server.js based off https://auth0.com/blog/create-a-simple-and-stylish-node-express-app/

// Required External Modules
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const cura = require("./public/cura");
const { nextTick } = require("process");

// App Variables
const app = express();
const port = process.env.PORT || "8000"; 

// App Configuration
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/css', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css')))
app.use('/js', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js')))
app.use('/js', express.static(path.join(__dirname, 'node_modules/jquery/dist')))
app.use('/js', express.static(path.join(__dirname, 'node_modules/masonry-layout/dist/masonry.pkgd.min.js')))

// Routes Definitions
app.get("/", (req, res) => {
	// get date header info
	let date = new Date()
	let key = null; let val = null;
	// make gallery based on information
	let params = null;
	if(req.query.flag == 1) {
		console.log("query:", req.query)
		key = decodeURIComponent(req.query.key);
		val = decodeURIComponent(req.query.val);
		if (key == "btn btn-outline-primary btn-sm tags") {
			key = "tags";
		}
		params = [key, val];
	}
	cura.getRandomTaggedObject(key, val).then( response => {
		cura.galleryCurator(response, params).then( response => {
			gallery = cura.getGallery();
			console.log(gallery["galleryMetaData"])
			res.render("index", { 
				title: "Home",
				date_month: date.toLocaleString('default', { month: 'long' }).toUpperCase(), 
				date_day: date.getDate(),
				gallery: gallery["gallery"],
				gallery_title: gallery["galleryMetaData"],
			});
		})
	});
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