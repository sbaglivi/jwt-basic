const express = require("express");
const path = require("path");
const app = express();
const bodyParser = require("body-parser");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const cors = require('cors');
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Most of this example comes from https://medium.com/@prashantramnyc/authenticate-rest-apis-in-node-js-using-jwt-json-web-tokens-f0e97669aad3

app.use(cors());

let users = [];
let refreshTokens = [];

function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_SECRET_TOKEN, {expiresIn: "15m"});
}

function generateRefreshToken(user, currentTokens) {
    const refreshToken =  jwt.sign(user, process.env.REFRESH_SECRET_TOKEN, {expiresIn: "20m"});
    currentTokens.push(refreshToken);
    return refreshToken;
}

function validateToken(req,res,next) {
    const authHeader = req.get("authorization");
    if (authHeader === undefined){
        console.log("No auth header on request")
        res.status(400).send("No auth headers");
        return;
    }
    const token = authHeader.split(' ')[1];

    if (token == null){
       console.log("Token was null");
       res.status(400).send("Token not present"); 
       return;
    }
    jwt.verify(token, process.env.ACCESS_SECRET_TOKEN, (err, user) => {
        if (err){
            console.log("Error while trying to verify token");
            res.status(403).send("Token invalid");
            return;
        }
        console.log(user);
        req.user = user;
        next()
    })
}

app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/', (req,res) => {
    res.sendFile(path.join(__dirname, "register.html"));
})

app.post('/register', async (req,res) => {
    console.log(req.body);
    let {username, password} = req.body;
    let sameUsername = users.find(user => user.username === username);
    if (sameUsername !== undefined){
        console.log("User with the same username already exists. If it's you go to the login page otherwise choose a different one.");
    } else {
        let hash = await bcrypt.hash(password, 10);
        users.push({username, password: hash})
    }
    res.redirect('/');
})

app.get('/login', (req,res) => {
    res.sendFile(path.join(__dirname, "login.html"));
})

app.get("/temp", validateToken, (req,res) => {
    console.log("Everything went fine!");
    res.send('hi');
})

app.post('/login', async (req,res) => {
    let {username, password} = req.body;
    let user = users.find(user => user.username === username);
    if (user === undefined){
        console.log("No user found with given username");
        res.redirect('/');
    }
    if (!(await bcrypt.compare(password, user.password))){
        console.log("Password for given username does not match");
        res.redirect('/login');
    }
    let accessToken = generateAccessToken(user);
    let refreshToken = generateRefreshToken(user, refreshTokens);
    res.json({accessToken, refreshToken});

})



app.listen(3000, () => {
    console.log("Listening for requests on port 3000");
})