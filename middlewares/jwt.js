const jwt = require('jsonwebtoken');
require('dotenv').config();

const dotenv = require('dotenv').config();
const express = require('express');
const router = express.Router();
  
const validateRoot = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ message: 'No se proporcionó un token' });
    }
    try {
        const decoded = jwt.verify(token.split(" ")[1], process.env.TOKEN_SECRET);
        if (decoded.user_type == "root"){
            next();
        }
        else{
            return res.status(401).json({ message: 'No tiene permisos root.' });
        }
    } catch (error) {
        return res.status(401).json({ message: 'Token inválido' });
    }
};

const validateAdmin = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ message: 'No se proporcionó un token' });
    }
    try {
        const decoded = jwt.verify(token.split(" ")[1], process.env.TOKEN_SECRET);
        if (decoded.user_type == "admin"){
            next();
        }
        else{
            return res.status(401).json({ message: 'No tiene permisos de administrador.' });
        }
    } catch (error) {
        return res.status(401).json({ message: 'Token inválido' });
    }
};

const validateToken = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ message: 'No se proporcionó un token' });
    }
    try {
        const decoded = jwt.verify(token.split(" ")[1], process.env.TOKEN_SECRET);
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token inválido' });
    }
};


module.exports = {
    validateRoot,
    validateAdmin,
    validateToken
};


    