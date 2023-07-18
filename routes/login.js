//System
const express = require('express');
const router = express.Router();
const dotenv = require('dotenv').config();
const jwt = require('jsonwebtoken');
const { poolPromise , sql } = require('../config_mssql');

// Login
const bcrypt = require('bcrypt');
const { generateAccessToken, generatePasswordResetToken } = require('../utils/jwt');
const { validateToken, validateAdmin, validateRoot } = require('../middlewares/jwt');
const {generatePassword} = require('../utils/passwordGenerator')

// Emails
const nodemailer = require('nodemailer');
const { mailConfig } = require("../config_mail")

/**
 * @swagger
 * tags:
 *   name: Autenticación
 *   description: Endpoints relacionados con la autenticación de usuarios
 */


/**
 * @swagger
 * /login:
 *   post:
 *     tags: [Autenticación]
 *     summary: Iniciar sesión
 *     description: Permite a un usuario iniciar sesión utilizando un nombre de usuario y contraseña válidos. Retorna un JSON WEB Token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: Email.
 *               password:
 *                 type: string
 *                 description: Contraseña.
 *               remember: 
 *                 type: bool
 *                 description: Si es verdadero generara un token de mayor duracion.
 *             example:
 *               email: mail@domain.com
 *               password: pass1234
 *               remember: false
 *     responses:
 *       200:
 *         description: Autenticación exitosa. Devuelve el tipo de usuario y el token de acceso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user_type:
 *                   type: string
 *                   description: Tipo de usuario (root, admin, guest).
 *                 token:
 *                   type: string
 *                   description: Token de acceso válido.
 *       400:
 *         description: Solicitud inválida o error en la solicitud.
 *       403:
 *         description: Usuario no autorizado o contraseña inválida.
 */
router.post("/", async (req, res) => {
    try{
        let remember = false
        if (req.body.remember == true){
            remember = true
        }
        if (req.body.email != null && req.body.password != null){
            if (req.body.email == process.env.ROOT_USER && req.body.password == process.env.ROOT_PASSWORD){
                const token = generateAccessToken('root', req.body.email, remember);
                console.log("Login from:", req.body.email);
                return res.status(200).json({
                    user_type: 'root',
                    token: token,
                })
            }
            const pool = await poolPromise;
            const result = await pool.request()
            .input("correo", sql.VarChar, req.body.email)
            .query("SELECT * FROM usuario.usuario WHERE correo = @correo");
            
            // Validate email
            if (result.recordset.length == 0){
                return res.sendStatus(403);  
            }
            const userData = result.recordset[0];
            // Validate password
            if (bcrypt.compareSync(req.body.password, userData.CONTRASEÑA)){
                console.log("Login from:", req.body.email);
                if (userData.ADMIN == 1){
                    const token = generateAccessToken('admin', req.body.email, remember);
                    return res.status(200).json({
                        user_type: 'admin',
                        token: token,
                    })
                }
                else{
                    const token = generateAccessToken('guest', req.body.email, remember);
                    return res.status(200).json({
                        user_type: 'guest',
                        token: token,
                    })
                }
            }
            else{ // Invalid password
                return res.sendStatus(401);
            }
        }
        else{ //Faltan datos
            return res.sendStatus(400);
        }    
    }
    catch (err){ //Error ?
        console.log(err)
        return res.sendStatus(400);
    }

})

/**
 * @swagger
 * /login/changePassword:
 *   post:
 *     tags: [Autenticación]
 *     summary: Cambiar contraseña
 *     description: Permite a un usuario cambiar su contraseña.
 *     security:
 *        - Authorization: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 description: Contraseña actual.
 *               newPassword:
 *                 type: string
 *                 description: Contraseña nueva.
 *             example:
 *               oldPassword: myactualpassword
 *               newPassword: mynewpassword
 *     responses:
 *       200:
 *         description: Cambio de contraseña exitoso.
 *       400:
 *         description: Solicitud inválida o error en la solicitud.
 *       403:
 *         description: Contraseña incorrecta.
 */
router.post("/changePassword", validateToken ,async (req, res) => {
    try{
        if (!req.body.oldPassword && !req.body.newPassword){
            return res.sendStatus(400);
        }

        const token = req.headers.authorization;
        const decoded = jwt.verify(token.split(" ")[1], process.env.TOKEN_SECRET);

        if (decoded.user_type == 'root'){
            return res.sendStatus(400);
        }

        const email = decoded.email;

        const pool = await poolPromise;
        const fetchPassword = await pool.request()
                .input("correo", sql.VarChar, email)
                .query("SELECT contraseña FROM usuario.usuario WHERE correo = @correo");

        if (fetchPassword.recordset.length == 0){
            return res.sendStatus(403);  
        }
        const dbPassword = fetchPassword.recordset[0].contraseña;

        if (bcrypt.compareSync(req.body.oldPassword, dbPassword)){
            const hashedPassword = await bcrypt.hash(req.body.newPassword,12);
            const changePassword = await pool.request()
                    .input("password", sql.VarChar, hashedPassword)
                    .input("correo", sql.VarChar, email)
                    .query("UPDATE USUARIO.USUARIO SET contraseña = @password WHERE correo = @correo"); 
            return res.sendStatus(200);
        }
        return res.sendStatus(403);   
    }
    catch (err) { //Error ?
        return res.sendStatus(400);
    }

})

/**
 * @swagger
 * /login/generatePassword:
 *   post:
 *     tags: [Autenticación]
 *     summary: Genera una nueva contraseña
 *     description: Genera una nueva contraseña que es enviada al correo del usuario.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: Correo del usuario
 *             example:
 *               email: "username@domain.com"
 *     responses:
 *       200:
 *         description: Contraseña generada con exito y enviada al correo.
 *       400:
 *         description: No se ha podido enviar el correo.
 *        
 */
router.post("/generatePassword", async (req, res) => {
    try{
        if (!req.body.email){
            return res.sendStatus(403);
        }
        const pool = await poolPromise;
        const searchMail = await pool.request()
                .input("correo", sql.VarChar, req.body.email)
                .query("SELECT correo FROM usuario.usuario WHERE correo = @correo");

        
        if (searchMail.recordset.length == 0){
            return res.sendStatus(403);
        }
        
        const newPassword = generatePassword(16);
        
        let mailTransport = nodemailer.createTransport(mailConfig);
        const mailOptions = {
            from: process.env.MAIL_USER,
            to: req.body.email,
            subject: 'Restablecimiento de contraseña',
            text: `Nueva contraseña: ` + newPassword
        };
        mailTransport.sendMail(mailOptions, function (error, info){
            if (error) {
                console.log("Error al enviar correo de cambio de contraseña:", req.body.email)
                console.log(error)
                return res.sendStatus(400);
            }
            console.log("Correo de restablecimiento de contraseña enviado con exito: ", req.body.email);
        })
        
        const hashedPassword = await bcrypt.hash(newPassword,12);

        const updatePassword = await pool.request()
            .input('password', sql.VarChar, hashedPassword)
            .input('correo', sql.VarChar, req.body.email)
            .query("UPDATE USUARIO.USUARIO SET contraseña = @password WHERE correo = @correo");
        return res.sendStatus(200);
    }
    catch (error){ //Error ?
        console.log(error)
        return res.sendStatus(400);
    }

})

router.post("/validateGuest", validateToken ,async (req, res) => {
    return res.sendStatus(200);  
})
router.post("/validateAdmin", validateAdmin ,async (req, res) => {
    return res.sendStatus(200);  
})
router.post("/validateRoot", validateRoot ,async (req, res) => {
    return res.sendStatus(200);  
})

module.exports = router;



