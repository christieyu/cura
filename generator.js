function generateImage(image, param) {

    if (!image) {
        console.log(listDepts())
        // console.log(generateDepts())
    }

    // let response = await fetch('https://api.harvardartmuseums.org/gallery?apikey=16b163d0-d3e0-11e9-a98b-17c2205dae62');
    // let gallery = await response.json();
    // let pages = gallery.info.pages;
    // let galleriesUnfiltered = [];
    // let html = '';
    // // console.log(pages);
    
    // html += "<body>";
    // html += "<form action='/viewgallery'  method='post' name='galleryform'>";
    // html += '<select id="gallerySelect" name="gallerySelect">';

    // // this loop iterates through each page of the gallery API
    // for (let i = 1; i <= pages; i++) {
    // let response = await fetch('https://api.harvardartmuseums.org/gallery?page=' + i + '&apikey=16b163d0-d3e0-11e9-a98b-17c2205dae62');
    // let nextgallery = await response.json();
    // // console.log(nextgallery);

    // let records = nextgallery.records.length;
    // // console.log(nextgallery.records.length);

    // // this loop iterates through each gallery on a single page to append its name to the array galleries
    // for (let j = 0; j < records; j++){

    //     let galleryname = nextgallery["records"][j]["name"];
    //     let galleryid = nextgallery["records"][j]["id"];
    //     galleriesUnfiltered.push(new Gallery(galleryname, galleryid));

    // }
    // // sorts galleries and removes duplicates
    // let galleries = Array.from(new Set(galleriesUnfiltered.sort()));        // https://www.w3schools.com/jsref/jsref_sort.asp
    // // console.log(galleriesUnfiltered);             // https://gomakethings.com/removing-duplicates-from-an-array-with-vanilla-javascript/
    // // console.log(galleries);

    // // inputs gallery array into dropdown menu in html file
    // for (gallery in galleries) {            // https://www.dyn-web.com/tutorials/forms/select/option/
    //     html += '<option value=' + galleries[gallery].id + ">" + galleries[gallery].name + ", ID: " + galleries[gallery].id + "</option> ";
    // }
    // }
    // html += '</select>'
    // html += "<input type='submit' value='submit'>";
    // html += "</form>";
    // html += "</body>";
    // res.send(html);
}

function listDepts() {
    let departments = fetch('https://collectionapi.metmuseum.org/public/collection/v1/departments')
    return departments
}

function generateDepts() {}


generateImage();