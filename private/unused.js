// Random number generator
function getRandInt(min, max) { // https://www.w3schools.com/js/js_random.asp
    return Math.floor(Math.random() * (max - min) ) + min;
}

// List departments using API
async function listDepts() {
    let response = await fetch('https://collectionapi.metmuseum.org/public/collection/v1/departments')
    let depts = await response.json()
    // console.log(depts)
    return depts
}

// Generate 1 random object using API
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

// Generate gallery (21 random objects with images) using API
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