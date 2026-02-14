// Lec-34 :- How to serve This index.html file in NodeJS & How to run this index.html file in our server (http://localhost:3000) 
// Lec-35 :- How to store all URL's & its shortCode in "data -> links.json" in NodeJS
// Lec-36 :- How to get all URL's from backend & display in frontend , also when we hit the shortCode in URL then it should redirect to original URL


import {createServer} from 'http';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import crypto from 'crypto'; // we will use crypto module to generate a random shortcode for the URL

const PORT = 3000; // we will run our server on port 3000

const loadLinks = async () => { // this function will read the links.json file and return the data in JSON format. This function will be used to load all the existing links from the links.json file.
    try {
        const data = await readFile(path.join("data", 'links.json'), 'utf-8'); // we will read the links.json file from the data folder and we will specify the encoding as 'utf-8' to get the data in string format
        return JSON.parse(data); // we will parse the data which is in string format to JSON format and we will return it
    }
    catch(err) {
        if(err.code === 'ENOENT') { // if "Error No Entry" occurs, which means that the links.json file does not exist, then we will return an empty array as there are no links to load.
            await writeFile(path.join("data", 'links.json'), JSON.stringify({})); // we will create a new links.json file in the data folder and we will write an empty Object in it as there are no links to load.
            return {}; // and we will return an empty Object as there are no links to load.
        }
        throw err; // if any other error occurs then we will throw the error to be handled by the caller function.
    }
};

const saveLinks = async (links) => { // this function will save the updated links object back to the links.json file. This function will be used to save the new link to the links.json file.
    await writeFile(path.join("data", 'links.json'), JSON.stringify(links)); // we will write the updated links object to the links.json file in the data folder by converting JSON formate.
}

// we will create a server using the createServer method of the http module and we will pass a callback function to it which will be executed every time a request is made to the server. The callback function takes two parameters, req (request) and res (response). The req parameter contains information about the incoming request and the res parameter is used to send a response back to the client.
const server = createServer(async (req, res) => {

    // console.log(req.url); // we will log the request method and the request URL in the console for debugging purposes

    if(req.method === 'GET') { // if request is hitted by GET method
        // ✅ Serve HTML file in NodeJS
        if(req.url === '/') { // if the user is hits the root URL (Homepage)
            try{ // jo data male to... 
                const data = await readFile(path.join("public", 'index.html'), 'utf-8'); // we will read the index.html file from the public folder and we will specify the encoding as 'utf-8' to get the data in string format
                res.writeHead(200, {'Content-Type': 'text/html'}); // if the file is read successfully then we will send 200 status code with content type as text/html
                res.end(data); // and we will end the response by sending the data of index.html file which we have read from the public folder
            }
            catch(err) {
                res.writeHead(404, {'Content-Type': 'text/html'}); // if any error occurs then we will send 404 status code with content type as text/html
                res.end('<h1>404 Page Not Found</h1>'); // and we will end the response by sending a simple HTML message saying "404 Page Not Found"
            }
        }
        // ✅ Serve CSS file in NodeJS
        else if(req.url === '/style.css') { // for style.css file we will check if the user is hits the /style.css URL
            try{ // jo data male to... 
                const data = await readFile(path.join("public", 'style.css'), 'utf-8'); 
                res.writeHead(200, {'Content-Type': 'text/css'}); 
                res.end(data); 
            }
            catch(err) {
                res.writeHead(404, {'Content-Type': 'text/html'}); // if any error occurs then we will send 404 status code with content type as text/html
                res.end('<h1>404 Page Not Found</h1>'); // and we will end the response by sending a simple HTML message saying "404 Page Not Found"
            }
        }

        // ✅ before requesting from fronted, we have to create a backend API in app.js file which will return all the shortened URLs stored in "data -> links.json" file, and then we will fetch that API in frontend and display the data in frontend.
        else if(req.url === '/links') { // for fetching all the shortened URLs stored in "data -> links.json" file, we will check if the user is hits the /links URL
            const links = await loadLinks(); // we will load all the existing links from the links.json file by calling the loadLinks function. This function will read the links.json file and return the data in JSON format.
            res.writeHead(200, {'Content-Type': 'application/json'}); // we will send 200 status code with content type as application/json
            return res.end(JSON.stringify(links)); // and we will end the response by sending the data of links which we have loaded from the links.json file in JSON format
        }

        // ✅ when we hit the shortCode in URL then it should redirect to original URL
        else {
            const links = await loadLinks(); // we will load all the existing links from the links.json file by calling the loadLinks function. This function will read the links.json file and return the data in JSON format.
            const shortCode = req.url.substring(1); // we will get the shortCode from the URL by removing the leading '/' character using the substring method. For example, if the URL is http://localhost:3000/abc123 then we will get 'abc123' as the shortCode.
            console.log(shortCode); // debugging purposes
            if(links[shortCode]) { // we will check if the shortCode exists in the links object which we have loaded from the links.json file. If it exists then we will redirect to the original URL.
                res.writeHead(302, { 'Location': links[shortCode] }); // if the shortCode exists in the links object then we will send 302 status code with Location header set to the original URL which is stored in the links object for that shortCode. This will redirect the user to the original URL when they hit the shortCode in the URL.
                return res.end(); // and we will end the response without sending any data as the redirection will take care of it.
            }
            else { // if the shortCode does not exist in the links object then we will send a 404 response with a simple HTML message saying "ShortCode Not Found"
                res.writeHead(404, {'Content-Type': 'text/html'});  
                return res.end('<h1>ShortCode Not Found</h1>'); // and we will end the response by sending a simple HTML message saying "ShortCode Not Found"
            }
        }
    }

    // Lec-35 :- How to store all URL's & its shortCode in "data -> links.json" in NodeJS
    else if(req.method === 'POST') { // if request is hitted by POST method
        if(req.url === '/shorten') { // if the user is hits the /shorten URL, then we will get all the data till server sends the data.

            const links = await loadLinks(); // we will load all the existing links from the links.json file by calling the loadLinks function. This function will read the links.json file and return the data in JSON format.

            let body = ''; // Store all data into this variable 

            req.on('data', chunk => (body = body + chunk) ); // This "data" event triggers till server sends the data in chunks.

            req.on('end', async () => { // Now, there is no more data left to receive, so the "end" event will be triggered. 
                console.log(body); // debugging purposes
                const { url,shortCode } = JSON.parse(body); // we will parse the body data which is in string format to JSON format and we will destructure it to get the url and shortcode values
                if(!url){
                    res.writeHead(400, {'Content-Type': 'text/plain'}); // if url is not provided then we will send 400 status code with content type as text/plain
                    return res.end('URL is required'); // if URL is not written, then server will return the response by sending a plain text message -> "URL is required"
                }

                // first, check in "data -> links.json", if the same URL is already present (Duplicate data), then we will return the existing shortcode for that URL instead of creating a new shortcode for it.
                const finalShortcode = shortCode || crypto.randomBytes(4).toString('hex'); // if the user has provided a shortcode then we will use that shortcode, otherwise we will generate a random shortcode using crypto module by generating 4 random bytes and converting it to hexadecimal string format
                // Now, we already read the existing data from the links.json file --> "links" and we will check if the same URL is already present in the file or not. If it is present then we will return the existing shortcode for that URL, otherwise we will add a new entry for that URL with the generated shortcode in the links.json file.
                if(links[finalShortcode]) { // if the same shortcode is already present in the links.json file, then we will return the existing shortcode for that URL
                    res.writeHead(200, {'Content-Type': 'text/plain'}); // if the same shortcode is already present in the links.json file, then we will send 200 status code with content type as text/plain
                    return res.end("ShortCode already exists. Please choose another shortcode."); // if the same shortcode is already present in the links.json file, then meg should be sent to the clients.
                }

                links[finalShortcode] = url; // we will add a new entry (Object) for that URL with the generated shortcode in the links.json file.
                await saveLinks(links); // we will save the updated links object back to the links.json file by calling the saveLinks function.

                res.writeHead(200, {'Content-Type': 'application/json'}); // if the URL is successfully added to the links.json file, then we will send 200 status code with content type as application/json
                res.end(JSON.stringify({ success : true , shortcode: finalShortcode })); // and we will end the response by sending a JSON response with the shortcode value

            });
        }
    }
});

// we will start the server by calling the listen method on the server object and we will pass the port number and a callback function to it which will be executed when the server is successfully started.
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`); // when the server is successfully started then we will log a message in the console saying "Server is running on http://localhost:3000"
});