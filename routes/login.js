//System
const express = require('express');
const router = express.Router();
const dotenv = require('dotenv').config();
const { poolPromise , sql } = require('../config_mssql');

// Login
const bcrypt = require('bcrypt');
const { generateAccessToken, generatePasswordResetToken } = require('../utils/jwt');
const { validateToken, validateAdmin, validateRoot } = require('../middlewares/jwt');

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
 *             example:
 *               email: mail@domain.com
 *               password: pass1234
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
        console.log("Login from:", req.body.email);
        if (req.body.email != null && req.body.password != null){
            if (req.body.email == process.env.ROOT_USER && req.body.password == process.env.ROOT_PASSWORD){
                const token = generateAccessToken('root', req.body.email);
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
            if (bcrypt.compareSync(req.body.password, userData.CONTRASENIA)){
                if (userData.ADMIN == 1){
                    const token = generateAccessToken('admin', req.body.email);
                    return res.status(200).json({
                        user_type: 'admin',
                        token: token,
                    })
                }
                else{
                    const token = generateAccessToken('guest', req.body.email);
                    return res.status(200).json({
                        user_type: 'guest',
                        token: token,
                    })
                }
            }
            else{ // Invalid password
                return res.sendStatus(403);
            }
        }
        else{ //Faltan datos
            return res.sendStatus(400);
        }    
    }
    catch{ //Error ?
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
 *               actual:
 *                 type: string
 *                 description: Contraseña actual.
 *               new:
 *                 type: string
 *                 description: Contraseña nueva.
 *             example:
 *               actual: myactualpassword
 *               new: mynewpassword
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
        if (!req.body.password_old && !req.body.password_new){
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
                .query("SELECT contrasenia FROM usuario.usuario WHERE correo = @correo");

        if (fetchPassword.recordset.length == 0){
            return res.sendStatus(403);  
        }
        const userData = fetchPassword.recordset[0];
        if (bcrypt.compareSync(req.body.password, userData.CONTRASENIA)){
            const hashedPassword = await bcrypt.hash(req.body.new_password,12);
            const changePassword = await pool.request()
                    .input("password", sql.VarChar, hashedPassword)
                    .input("correo", sql.VarChar, email)
                    .query("UPDATE USUARIO.USUARIO SET contrasenia = @password WHERE correo = @correo"); 
            return res.sendStatus(200);
        }
        return res.sendStatus(403);   
    }
    catch{ //Error ?
        return res.sendStatus(400);
    }

})

/**
 * @swagger
 * /login/generatePassworkToken:
 *   post:
 *     tags: [Autenticación]
 *     summary: Genera un token que permite cambiar la contraseña.
 *     description: Genera un token que es enviado al correo del usuario y con el puede cambiar la contraseña.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mail:
 *                 type: string
 *                 description: Correo del usuario
 *             example:
 *               mail: "rodaxx30@outlook.com"
 *     responses:
 *       200:
 *         description: Token enviado con exito.
 *       400:
 *         description: No se ha podido enviar el correo.
 *        
 */
router.post("/generatePasswordToken", async (req, res) => {
    try{
        if (!req.body.mail){
            return res.sendStatus(403);
        }
        const pool = await poolPromise;
        const searchMail = await pool.request()
                .input("correo", sql.VarChar, req.body.mail)
                .query("SELECT correo FROM usuario.usuario WHERE correo = @correo");
        
        
        if (searchMail.recordset.length == 0){
            return res.sendStatus(403);
        }
        
        const token = generatePasswordResetToken(req.body.mail);
        let mailTransport = nodemailer.createTransport(mailConfig);
        const mailOptions = {
            from: process.env.MAIL_USER,
            to: req.body.mail,
            subject: 'Restablecimiento de contraseña',
            text: `Token para restablecer contraseña (5m): ` + token
        };
        mailTransport.sendMail(mailOptions, function (error, info){
            if (error) {
                return res.sendStatus(400);
            } else {
                return res.sendStatus(200);
            }
        })
    }
    catch (error){ //Error ?
        console.log(error);
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



