// cura.js provides functions for the gallery curation algorithm of this project

const fetch = require("cross-fetch");
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database("public/objects.db");
module.exports.db = db;

// creates empty gallery metadata object
let galleryMetaData = {
	"tag": null,
	"year": null,
	"movement": null,
	"artist": null,
	"country": null,
}

// creates empty gallery object
let gallery = []

// random number generator between min and max
let getRandInt = function (min, max) { // https://www.w3schools.com/js/js_random.asp
	return Math.floor(Math.random() * (max - min) ) + min;
}

// from ID, gets full metadata from the Met API as json object
let getObjectData = async function (objectID) {
	let response = await fetch('https://collectionapi.metmuseum.org/public/collection/v1/objects/' + objectID);
	return response.json();
}

// from database, retrieves a random object that already has tags
let getRandomTaggedObject = async function () {
	let query = 'SELECT * FROM OBJECTS WHERE TAGS IS NOT NULL AND TAGS !="" ORDER BY RANDOM() LIMIT 1;'; // https://www.computerhope.com/issues/ch002076.htm
	let result = await new Promise((resolve, reject) => db.get(query, (err, results) => {
		if (err) { reject(err) } else { resolve(results); }
	}));
	return result["ID"];
}

// gets all objects of the same tag
let tagCurator = async function (objectID) {
	// finds tags by object ID
	let query1 = 'SELECT TAGS FROM OBJECTS WHERE ID =' + objectID;
	let result = await new Promise((resolve, reject) => db.get(query1, (err, results) => {
		if (err) { reject(err) } else { resolve(results); }
	}));
	// cleans tag result and picks random tag from list
	let tags = result.TAGS.toString().split('|');
	let index = getRandInt(0, tags.length)
	// queries for all objects of the same tag
	let query2 = "SELECT * FROM OBJECTS WHERE TAGS COLLATE Latin1_General_BIN LIKE '%" + tags[index] + "%' ORDER BY RANDOM()";
	let results = await new Promise((resolve, reject) => db.all(query2, (err, results) => {
		if (err) { reject(err) } else { resolve(results); }
	}));
	// push objects to gallery
	results.forEach(function (row) {
		pushGallery([row["ID"], row["IMAGE"]]);
	});
	// record tag metadata
	galleryMetaData.tag = tags[index];
}

// gets at most 5 random objects of the same year
let yearCurator = async function (objectID) {
	// finds year by object ID
	let query1 = 'SELECT BEGIN, END FROM OBJECTS WHERE ID =' + objectID;
	let result = await new Promise((resolve, reject) => db.get(query1, (err, results) => {
		if (err) { reject(err) } else { resolve(results); }
	}));
	if (result["BEGIN"] == "" || result["END"] == "") {
		return;
	}
	// queries for at most 5 random objects of the same year
	let query2 = "SELECT * FROM OBJECTS WHERE BEGIN >=" + result["BEGIN"] + " AND END <=" + result["END"] + " ORDER BY RANDOM() LIMIT 5";
	let results = await new Promise((resolve, reject) => db.all(query2, (err, results) => {
		if (err) { reject(err) } else { resolve(results); }
	}));
	// push objects to gallery
	results.forEach(function (row) {
		pushGallery([row["ID"], row["IMAGE"]]);
	});
	// record year metadata, considering bce vs ce
	if (result["BEGIN"] < 0) {
		galleryMetaData.year = result["BEGIN"].toString() + "bce"
	} else {
		galleryMetaData.year = result["BEGIN"].toString()
	}
}

// gets at most 10 random objects of the same artist
let artistCurator = async function (objectID) {
	// finds artists by object ID
	let query1 = 'SELECT ARTIST FROM OBJECTS WHERE ID =' + objectID;
	let result = await new Promise((resolve, reject) => db.get(query1, (err, results) => {
		if (err) { reject(err) } else { resolve(results); }
	}));
	if (result["ARTIST"] == "") {
		return;
	}
	// cleans artist result and picks random artist from list
	let artists = result.ARTIST.toString().split('|');
	let index = getRandInt(0, artists.length)
	// queries for at most 10 random objects of the same artist
	let query2 = "SELECT * FROM OBJECTS WHERE ARTIST = '" + artists[index] + "' ORDER BY RANDOM() LIMIT 10";
	let results = await new Promise((resolve, reject) => db.all(query2, (err, results) => {
		if (err) { reject(err) } else { resolve(results); }
	}));
	// push objects to gallery
	results.forEach(function (row) {
		pushGallery([row["ID"], row["IMAGE"]]);
	});
	// record artist metadata
	galleryMetaData.artist = [artists[index], index];
}	

// gets at most 10 random objects of the same movement (culture, period, dynasty, reign)
let movementCurator = async function (objectID) {
	// finds movement by object ID
	let query1 = 'SELECT CULTURE, PERIOD, DYNASTY, REIGN FROM OBJECTS WHERE ID =' + objectID;
	let result = await new Promise((resolve, reject) => db.get(query1, (err, results) => {
		if (err) { reject(err) } else { resolve(results); }
	}));
	// reign takes precedence over dynasty > period > culture
	let movement = [];
	if (result["REIGN"] != "") {
		movement.push("REIGN", result["REIGN"])
	} else if (result["DYNASTY"] != "") {
		movement.push("DYNASTY", result["DYNASTY"])
	} else if (result["PERIOD"] != "") {
		movement.push("PERIOD", result["PERIOD"])
	} else if (result["CULTURE"] != "") {
		movement.push("CULTURE", result["CULTURE"])
	} else {
		return
	}
	// queries for at most 10 random objects of the same movement
	let query2 = "SELECT * FROM OBJECTS WHERE " + movement[0] + " = '" + movement[1] + "' ORDER BY RANDOM() LIMIT 10";
	let results = await new Promise((resolve, reject) => db.all(query2, (err, results) => {
		if (err) { reject(err) } else { resolve(results); }
	}));
	// push objects to gallery
	results.forEach(function (row) {
		pushGallery([row["ID"], row["IMAGE"]]);
	});
	// record movement metadata
	galleryMetaData.movement = movement[1];
}

// gets at most 5 random objects of the same country
let countryCurator = async function (objectID) {
	// finds nationality by object ID
	let query1 = 'SELECT NATIONALITY FROM OBJECTS WHERE ID =' + objectID;
	let result = await new Promise((resolve, reject) => db.get(query1, (err, results) => {
		if (err) { reject(err) } else { resolve(results); }
	}));
	if (result["NATIONALITY"] == "") {
		return;
	}
	// cleans nationality result and maps to selected artist's nationality
	let countries = result.NATIONALITY.toString().split('|');
	if (countries[galleryMetaData.artist[1]] == " ") {
		return;
	}
	// queries for at most 5 random objects of the same country
	let query2 = "SELECT * FROM OBJECTS WHERE NATIONALITY = '" + countries[galleryMetaData.artist[1]] + "' ORDER BY RANDOM() LIMIT 5";
	let results = await new Promise((resolve, reject) => db.all(query2, (err, results) => {
		if (err) { reject(err) } else { resolve(results); }
	}));
	// push objects to gallery
	results.forEach(function (row) {
		pushGallery([row["ID"], row["IMAGE"]]);
	});
	// record country metadata
	galleryMetaData.country = countries[galleryMetaData.artist[1]];
}

/* gallery controller: gets all objects of the same tag, at most 5 objects of the same year,
at most 10 objects of the same artist, at most 10 objects of the same movement (culture, period, dynasty, reign)
at most 5 objects of the same country, and then makes gallery display-ready */
let galleryCurator = async function (objectID) {
	await tagCurator(objectID);
	await yearCurator(objectID);
	await artistCurator(objectID);
	await movementCurator(objectID);
	await countryCurator(objectID);
	await polishGallery();
};

// pushes one object to gallery
function pushGallery(object) {
	// only add object if it's not already in the gallery
	if (object in gallery) {
		return false;
	}
	else {
		gallery.push(object);
		return true;
	}
}

// makes gallery & galleryMetaData display-ready
async function polishGallery() {
	// reduce gallery to 21 objects (random subset)
	if (gallery.length > 21) {
		gallery = gallery.map(a => [a,Math.random()])
						.sort((a,b) => {return a[1] < b[1] ? -1 : 1;})
						.slice(0,21)
						.map(a => a[0]);
	}
	// create gallery title using metadata elements
	let label = []
	if (galleryMetaData.artist) {
		label = [galleryMetaData.tag, galleryMetaData.year, galleryMetaData.movement, galleryMetaData.artist[0], galleryMetaData.country].filter(x => !!x);
	} else {
		label = [galleryMetaData.tag, galleryMetaData.year, galleryMetaData.movement, galleryMetaData.country].filter(x => !!x);
	}
	galleryMetaData.label = label.join("/").toLowerCase()
}

// allows other nodes to get gallery & galleryMetaData variables
let getGallery = () => {
	return {
		"gallery": gallery,
		"galleryMetaData": galleryMetaData
	};
};

// export to other nodes
module.exports.getObjectData = getObjectData;
module.exports.getRandomTaggedObject = getRandomTaggedObject;
module.exports.galleryCurator = galleryCurator;
module.exports.getGallery = getGallery;