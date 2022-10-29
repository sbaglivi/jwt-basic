const jwt = require("jsonwebtoken");
require("dotenv").config();

export function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_SECRET_TOKEN, {expiresIn: "15m"});
}

export function generateRefreshToken(user, currentTokens) {
    const refreshToken =  jwt.sign(user, process.env.REFRESH_SECRET_TOKEN, {expiresIn: "20m"});
    currentTokens.push(refreshToken);
    return refreshToken;
}