const fetch = require("cross-fetch");
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database("public/objects.db");
module.exports.db = db;

// Random number generator
let getRandInt = function (min, max) { // https://www.w3schools.com/js/js_random.asp
    return Math.floor(Math.random() * (max - min) ) + min;
}

let getObjectData = async function (objectID) {
    let response = await fetch('https://collectionapi.metmuseum.org/public/collection/v1/objects/' + objectID);
    return response.json();
}

let getGalleryData = async function (galleryObjects) {
    let galleryData = [];
    for (galleryObject of galleryObjects) {
        let response = await getObjectData(galleryObject)
        galleryData.push(response);
    }
    return galleryData;
}

let getRandomTaggedObject = async function () {
    let query = 'SELECT * FROM OBJECTS WHERE TAGS IS NOT NULL AND TAGS !="" ORDER BY RANDOM() LIMIT 1;'; // https://www.computerhope.com/issues/ch002076.htm
    let result = await new Promise((resolve, reject) => db.get(query, (err, results) => {
        if (err) {
          reject(err)
        } else {
          resolve(results);
        }
    }));
    console.log("RANDOM TAGGED QUERY RESULT:", result.ID)
    return result.ID;
}

let currentGallery = []

let galleryCurator = async function (objectID) {
    // first query by tag
    let query1 = 'SELECT TAGS FROM OBJECTS WHERE ID =' + objectID;
    let result = await new Promise((resolve, reject) => db.get(query1, (err, results) => {
        if (err) {
          reject(err)
        } else {
          resolve(results);
        }
    }));
    console.log("TAGS QUERY RESULT:", result.TAGS)
    let tags = result.TAGS.toString().split('|');
    console.log("TAGS SPLIT:", tags)
    let index = getRandInt(0, tags.length - 1)
    console.log("TAG CHOSEN:", index, tags[index])
    let query2 = "SELECT * FROM OBJECTS WHERE TAGS LIKE '%" + tags[index] + "%' ORDER BY RANDOM() LIMIT 5";
    let results = await new Promise((resolve, reject) => db.all(query2, (err, results) => {
        if (err) {
          reject(err)
        } else {
          resolve(results);
        }
    }));
    results.forEach(function(row) {
        console.log("RESULT!!!")
        console.log(row)
    });
}

module.exports.getObjectData = getObjectData;
module.exports.getGalleryData = getGalleryData;
module.exports.getRandomTaggedObject = getRandomTaggedObject;
module.exports.galleryCurator = galleryCurator;