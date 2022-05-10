// cura.js provides functions for the gallery curation algorithm of this project

const fetch = require("cross-fetch");
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database("public/objects.db");
module.exports.db = db;

// creates empty gallery metadata object
let galleryMetaData = [];

// creates empty gallery object
let gallery = [];

// random number generator between min and max
let getRandInt = function (min, max) { // https://www.w3schools.com/js/js_random.asp
	return Math.floor(Math.random() * (max - min) ) + min;
}

// from ID, gets full metadata from the Met API as json object
let getObjectData = async function (objectID) {
	let response = await fetch('https://collectionapi.metmuseum.org/public/collection/v1/objects/' + objectID);
	return response.json();
}

// from database, retrieves a random object that already has tags (unless specific param also specified)
let getRandomTaggedObject = async function (param = "", input = "") {
	let query = 'SELECT * FROM OBJECTS WHERE TAGS IS NOT NULL AND TAGS !="" ';
	switch(param) {
		case "objDept":		// department specified
			query += 'AND DEPT = "' + input + '"'
			break;
		case "objDate":
			query += 'AND BEGIN >= ' + input + ' AND END <= ' + (parseInt(input) + 10);
			break;
		case "artistName":
			query += 'AND ARTIST LIKE "%' + input + '%"';
			break;
		case "artistBio":
			query += 'AND NATIONALITY LIKE "%' + input + '%"';
			break;
		case "culture":
			query += 'AND CULTURE LIKE "%' + input + '%"';
			break;
		case "period":
			query += 'AND PERIOD LIKE "%' + input + '%"';
			break;
		case "dynasty":
			query += 'AND DYNASTY LIKE "%' + input + '%"';
			break;
		case "reign":
			query += 'AND REIGN LIKE "%' + input + '%"';
			break;
		case "tags":
			query == 'SELECT * FROM OBJECTS WHERE TAGS LIKE "%' + input + '%"';
			break;
		default:
			// no params specified
	}
	query += " ORDER BY RANDOM() LIMIT 1;'";
	console.log("query: ", query)
	// https://www.computerhope.com/issues/ch002076.htm
	let result = await new Promise((resolve, reject) => db.get(query, (err, results) => {
		if (err) { reject(err) } else { resolve(results); }
	}));
	// console.log("result: ", result)
	if (result != null) {
		return result["ID"];
	}
	else {
		query = query.slice(0, 27) + query.slice(62, 1000)
		console.log("query (spliced): ", query)
		let result = await new Promise((resolve, reject) => db.get(query, (err, results) => {
			if (err) { reject(err) } else { resolve(results); }
		}));
		console.log("result: ", result)
		return result["ID"];
	}
}

// gets all objects of the same tag
let tagCurator = async function (objectID, tag=null) {
	tagChosen = "";
	if (tag == null) {
		// finds tags by object ID
		let query1 = 'SELECT TAGS FROM OBJECTS WHERE ID =' + objectID;
		let result = await new Promise((resolve, reject) => db.get(query1, (err, results) => {
			if (err) { reject(err) } else { resolve(results); }
		}));
		// cleans tag result and picks random tag from list
		let tags = result.TAGS.toString().split('|');
		let index = getRandInt(0, tags.length)
		tagChosen = tags[index];
	}
	else {
		tagChosen = tag;
	}
	// queries for all objects of the same tag
	let query2 = 'SELECT * FROM OBJECTS WHERE TAGS COLLATE Latin1_General_BIN LIKE "%' + tagChosen + '%" ORDER BY RANDOM()';
	let results = await new Promise((resolve, reject) => db.all(query2, (err, results) => {
		if (err) { reject(err) } else { resolve(results); }
	}));
	// push objects to gallery
	results.forEach(function (row) {
		pushGallery([row["ID"], row["IMAGE"]]);
	});
	// record tag metadata
	galleryMetaData.push({
		"label": tagChosen.toLowerCase(),
		"key": "tags",
		"value": tagChosen
	})
}

// gets at most 5 random objects of the same year
let yearCurator = async function (objectID, year=null) {
	let result = []
	if (year == null) {
		// finds year by object ID
		let query1 = 'SELECT BEGIN, END FROM OBJECTS WHERE ID =' + objectID;
		result = await new Promise((resolve, reject) => db.get(query1, (err, results) => {
			if (err) { reject(err) } else { resolve(results); }
		}));
		if (result["BEGIN"] == "" || result["END"] == "") {
			return;
		}
	}
	else {
		result["BEGIN"] = year;
		result["END"] = parseInt(year) + 30
	}
	// queries for at most 5 random objects of the same year
	let query2 = 'SELECT * FROM OBJECTS WHERE BEGIN >=' + result["BEGIN"] + ' AND END <=' + result["END"] + ' ORDER BY RANDOM() LIMIT 5';
	let results = await new Promise((resolve, reject) => db.all(query2, (err, results) => {
		if (err) { reject(err) } else { resolve(results); }
	}));
	// push objects to gallery
	results.forEach(function (row) {
		pushGallery([row["ID"], row["IMAGE"]]);
	});
	// record year metadata, considering bce vs ce
	let label = "";
	if (result["BEGIN"] < 0) {
		label = result["BEGIN"].toString() + "bce"
	} else {
		label = result["BEGIN"].toString()
	}
	galleryMetaData.push({
		"label": label,
		"key": "objDate",
		"value": result["BEGIN"]
	})
}

// gets at most 10 random objects of the same artist
let artistCurator = async function (objectID, artist=null) {
	// finds artists by object ID
	let artistChosen = "";
	let query1 = 'SELECT ARTIST FROM OBJECTS WHERE ID =' + objectID;
	let result = await new Promise((resolve, reject) => db.get(query1, (err, results) => {
		if (err) { reject(err) } else { resolve(results); }
	}));
	if (result["ARTIST"] == "") {
		return;
	}
	let artists = result.ARTIST.toString().split('|');
	let index = 0;
	if (artist == null) {
		let index = getRandInt(0, artists.length)
		artistChosen = artists[index]
	}
	else {
		for (i in artists) {
			if (artists[i] == artist) {
				artistChosen = artists[i];
				index = i;
			}
		}
	}
	// queries for at most 10 random objects of the same artist
	let query2 = 'SELECT * FROM OBJECTS WHERE ARTIST = "' + artistChosen + '" ORDER BY RANDOM() LIMIT 10';
	let results = await new Promise((resolve, reject) => db.all(query2, (err, results) => {
		if (err) { reject(err) } else { resolve(results); }
	}));
	// push objects to gallery
	results.forEach(function (row) {
		pushGallery([row["ID"], row["IMAGE"]]);
	});
	// record artist metadata
	galleryMetaData.push({
		"label": artistChosen.toLowerCase(),
		"key": "artistName",
		"value": artistChosen,
		"index": index
	})
	
}	

// gets at most 10 random objects of the same movement (culture, period, dynasty, reign)
let movementCurator = async function (objectID, movementKey=null, movementVal=null) {
	let movement = [];
	if (movementKey == null || movementVal == null) {
		// finds movement by object ID
		let query1 = 'SELECT CULTURE, PERIOD, DYNASTY, REIGN FROM OBJECTS WHERE ID =' + objectID;
		let result = await new Promise((resolve, reject) => db.get(query1, (err, results) => {
			if (err) { reject(err) } else { resolve(results); }
		}));
		// reign takes precedence over dynasty > period > culture
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
	}
	else {
		movement[0] = movementKey;
		movement[1] = movementVal;
	}
	// queries for at most 10 random objects of the same movement
	let query2 = 'SELECT * FROM OBJECTS WHERE ' + movement[0] + ' = "' + movement[1] + '" ORDER BY RANDOM() LIMIT 10';
	let results = await new Promise((resolve, reject) => db.all(query2, (err, results) => {
		if (err) { reject(err) } else { resolve(results); }
	}));
	// push objects to gallery
	results.forEach(function (row) {
		pushGallery([row["ID"], row["IMAGE"]]);
	});
	// record movement metadata
	galleryMetaData.push({
		"label": movement[1].toLowerCase(),
		"key": movement[0].toLowerCase(),
		"value": movement[1]
	})
}

// gets at most 5 random objects of the same country
let countryCurator = async function (objectID, nationality=null) {
	let nationalityChosen = null;
	if (nationality == null) {
		// finds nationality by object ID
		let query1 = 'SELECT NATIONALITY FROM OBJECTS WHERE ID =' + objectID;
		let result = await new Promise((resolve, reject) => db.get(query1, (err, results) => {
			if (err) { reject(err) } else { resolve(results); }
		}));
		if (result["NATIONALITY"] == "") {
			return;
		}
		// cleans nationality result and maps to selected artist's nationality
		let countries = result["NATIONALITY"].toString().split('|');
		let index = null;
		for (data of galleryMetaData) {
			if (data.key == "artistName") {
				index = data.index;
				if (countries[index] == " ") {
					return;
				}
				nationalityChosen = countries[index];
			}
			else {
				return;
			}
		}
	}
	else {
		nationalityChosen = nationality;
	}
	// queries for at most 5 random objects of the same country
	let query2 = 'SELECT * FROM OBJECTS WHERE NATIONALITY = "' + nationalityChosen + '" ORDER BY RANDOM() LIMIT 5';
	let results = await new Promise((resolve, reject) => db.all(query2, (err, results) => {
		if (err) { reject(err) } else { resolve(results); }
	}));
	// push objects to gallery
	results.forEach(function (row) {
		pushGallery([row["ID"], row["IMAGE"]]);
	});
	// record country metadata
	galleryMetaData.push({
		"label": nationalityChosen.toLowerCase(),
		"key": "artistBio",
		"value": nationalityChosen
	})
}

/* gallery controller: gets all objects of the same tag, at most 5 objects of the same year,
at most 10 objects of the same artist, at most 10 objects of the same movement (culture, period, dynasty, reign)
at most 5 objects of the same country, and then makes gallery display-ready */
let galleryCurator = async function (objectID, params=null) {
	// first reset global variables
	console.log(objectID, params)
	galleryMetaData = [];
	let paramList = {tags: null, objDate: null, artistName: null, artistBio: null, movementKey: null, movementVal: null}
	if (params != null)
	{
		if (params[0] == "tags" || params[0] == "objDate" || params[0] == "artistName" || params[0] == "artistBio") {
			paramList[params[0]] = params[1];
		}
		else {
			paramList["movementKey"] = params[0];
			paramList["movementVal"] = params[1];
		}
	}
	gallery = []
	// now curate gallery
	await tagCurator(objectID, paramList["tags"]);
	await yearCurator(objectID, paramList["objDate"]);
	await artistCurator(objectID, paramList["artistName"]);
	await movementCurator(objectID, paramList["movementKey"], paramList["movementVal"]);
	await countryCurator(objectID, paramList["artistBio"]);
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
	// // create gallery title using metadata elements
	// let label = []
	// if (galleryMetaData.artist) {
	// 	galleryMetaData = [galleryMetaData.tag, galleryMetaData.year, galleryMetaData.movement, galleryMetaData.artist[0], galleryMetaData.country].filter(x => !!x);
	// }
	// galleryMetaData.label = label;
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