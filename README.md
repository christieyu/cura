# cura
 CPSC 490, senior project devising a "semi-generous interface" to recreationalize the curation of cultural collectives.

**This app is currently deployed at [cura-christie.herokuapp.com](https://cura-christie.herokuapp.com/).**

![demo](/demo.png)

## Building this application

### Data processing
This application relies on dataset from the Metropolitan Museum of New York that is too large to download to GitHub. A processed, clean version, with all objects without photos removed, can be found in `/public/objects.db`. The original dataset is [here](https://github.com/metmuseum/openaccess).

My data cleaning script can be reused in `/private/data.py`.

This project also calls live API endpoints, using the Met's methods listed [here](https://metmuseum.github.io/).


### Node.js dependencies & details
Node dependencies for this project include `bootstrap`, `cross-fetch`, `express`, `pug`, and `sqlite3`. Because the Met's API conflicts with the default node.js security settings, the easiest way to run this program is to call:

`npm --node-options=--insecure-http-parser run dev`

This program also has [browser-sync](https://www.npmjs.com/package/browser-sync) functionality implemented, which helps refresh the browser after every development change so that the running project is always updated. To use it, first run:
`npm --node-options=--insecure-http-parser run dev`
as above, and then:
`npm run ui`.