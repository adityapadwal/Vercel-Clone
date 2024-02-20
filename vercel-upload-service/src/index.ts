// importing all the modules/libraries
import express from "express";
import cors from "cors";
import path from "path";
import simpleGit from "simple-git";
import {generate} from "./utils";
import {getAllFiles} from "./file";
import {uploadFile} from "./aws";
import { createClient } from "redis";
const publisher = createClient();
publisher.connect();
const subscriber = createClient();
subscriber.connect();

// creating an instance of the express application
const app = express();

// midlewares
app.use(cors()); // enabling cors
app.use(express.json()); // parsing incoming json data from requests

// POSTMAN
app.post("/deploy", async(req, res) => {
    const repoUrl = req.body.repoUrl; // github url
    const id = generate(); // generate random id
    await simpleGit().clone(repoUrl, path.join(__dirname, `output/${id}`)); // clone the project

    // get all the files in the cloned repo
    const files = getAllFiles(path.join(__dirname, `output/${id}`));
    console.log(files); // debugging...

    // put all of these files into S3
    files.forEach(async file => {
        // A:\\Web Development\\Full Stack Projects\\Vercel Clone\\vercel\\dist\\output\\rkwl8\\src\\App.jsx
        // output\\rkwl8\\src\\App.jsx
        await uploadFile(id, file.slice(__dirname.length + 1), file);
    });

    await new Promise((resolve) => setTimeout(resolve, 5000));

    // pushing the id into the Redis queue for further processing
    publisher.lPush("build-queue", id);

    // store the current video id’s status as uploaded
    publisher.hSet("status", id, "uploaded");

    // return the id to the client
    res.json({
        id: id
    });
});

app.get("/status", async (req, res) => {
    const id = req.query.id;
    const response = await subscriber.hGet("status", id as string);
    res.json({
        status: response
    })
})

// running the express application
app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
