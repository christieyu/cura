# cura
 CPSC 490, senior project proposing a semi-generous interface for the recreational digital browsing of museums.
 
## Abstract
In 2015, digital designer and professor Mitchell Whitelaw coined the phrase “generous interface” to describe a new kind of digital interface: one that offers information at large and up front, rather than in reaction to a specific query from the user. Unlike the searchbox (which, according to Whitelaw, is like going to a museum’s front desk, handing the attendant a note with a prompt, and getting back a selection of ten paintings), the generous interface overwhelms the user with more data than they could even imagine, from which the user can then take the time to make their own connections, and maybe even end up somewhere they never thought they would, unearthing new discoveries and fascinations along the way. While the generous interface is indeed magnanimous as portrayed like this, my project investigates the suitability of its application on recreational museum-browsing — whether such “generosity” really replicates the feeling of stepping into a museum, or whether there are other factors one must consider in digitizing (and recreationalizing) the museum experience holistically. After looking into the different factors of the recreational museum-goer’s ideal experience, especially in consideration of the changes brought about by pandemic digitization, I propose what I call the “semi-generous interface” as a more suitable touchpoint for exploring museum content, and present the prototypes (Figma) and web app demo (node.js, Express, sqlite3) of my concept. Through this project, I attempt to strip down the museum-browsing experience to its recreational roots, while simultaneously considering the consequences and artifacts that come with digitization in deep detail.

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
