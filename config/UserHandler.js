const { Octokit } = require('octokit');
const User = require('./user');
require('dotenv').config();

const octokit = new Octokit({ auth: process.env.GIT_TOKEN });

let resp, profile;

async function addUser(data) {

    resp = { status: 200, id: 5, title: "❌Error", message: "Try contacting team." };

    await fetchProfile(data);

    if (resp.status == 404)
        return resp;

    const userGit = await User.findOne({ userid: profile.data.id });
    const userLib = await User.findOne({ libid: data.libid.trim() });

    if (userGit || userLib) {
        console.log("User exists");
        resp = {
            status: 409,
            id: 2,
            title: "✔User already exists!",
            message: "Try contacting team if you think this is a mistake."
        }
    }
    else {
        await enterUser(data);
    }

    // console.log(user);

    console.log("Response", resp);


    return resp;
}

async function fetchProfile(data) {
    try {
        profile = await octokit.request('GET /users/{username}', { username: data.git });
        console.log(profile);
    } catch (e) {
        console.log(e);
        resp = {
            status: 404,
            id: 4,
            title: "❌Github ID not found!",
            message: "Please check your github username."
        }
    }
    console.log("Profile Fetched")
}