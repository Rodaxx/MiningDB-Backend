const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const router = express.Router();

const {generatePassword} = require('../utils/passwordGenerator')
const { poolPromise , sql } = require('../config_mssql');
const { validateRoot, validateAdmin ,validateToken } = require('../middlewares/jwt');

const nodemailer = require('nodemailer');
const { mailConfig } = require("../config_mail")

/**
 * @swagger
 * tags:
 *   name: Usuarios
 *   description: Endpoints relacionados con la gestion de usuarios
 */

/** ADMIN */

/**
 * @swagger
 * /users/createGuest:
 *   post:
 *     tags: [Usuarios]
 *     summary: Crear usuario con permisos de invitado (Se requiere acceso de administrador).
 *     description: Permite a un usuario administrador crear invitados.
 *     security:
 *        - Authorization: [] 
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: Nombre de usuario.
 *               password:
 *                 type: string
 *                 description: Contraseña del usuario.
 *             example:
 *               username: username
 *               password: password
 *     responses:
 *       200:
 *         description: Creacion de usuario exitosa.
 *       400:
 *         description: Solicitud invalida, faltan datos o error de sintaxis.
 */
router.post("/createGuest", validateAdmin , async (req, res) => {
    try {
        if (req.body.username && req.body.password){

            const password = generatePassword(12);
            let mailTransport = nodemailer.createTransport(mailConfig);
            const mailOptions = {
                from: process.env.MAIL_USER,
                to: req.body.email,
                subject: 'Tu contraseña para MiningDB',
                text: `Tu contraseña para MiningDB es: ` + password
            };
            mailTransport.sendMail(mailOptions, function (error, info){
                if (error) {
                    console.log("Error al enviar correo de contraseña de nuevo usuario: ", req.body.email)
                    return res.sendStatus(400);
                }
            })

            const hashedPassword = await bcrypt.hash(req.body.password,12);
            const pool = await poolPromise;
            const result = await pool.request()
                .input("admin",sql.Bit, 0)
                .input("correo",sql.VarChar, req.body.username)
                .input("contraseña", sql.VarChar, hashedPassword)
                .query("INSERT INTO usuario.usuario (admin, correo, contrasenia) VALUES (@admin, @correo, @contraseña)");
            return res.sendStatus(200);
        }
        else{
            return res.status(400).json({
                message: "Datos insuficientes",
            })
        }
    }
    catch (err){
        console.error(err);
    }
    return res.sendStatus(400)
})

/** ADMIN Y GUEST */

/**
 * @swagger
 * /users/getPermissions/{username}:
 *   get:
 *     tags: [Usuarios]
 *     summary: Retorna los permisos de un usuario.
 *     description: 
 *                  Retorna los permisos del usuario que solicito la request. <br>
 *                  En caso de necesitar obtener permisos de otro usuario, este se puede pasar como parametro. <br>
 *                  (Solo para admins y root)
 *     security:
 *        - Authorization: []
 *     parameters:
 *       - in: path
 *         name: username
 *         schema:
 *           type: string
 *         required: false
 *         allowEmptyValue: true
 *         description: Nombre de usuario (opcional, si no se proporciona, se devolverá los permisos del usuario que hizo la solicitud)    
 * 
 *     responses:
 *       200:
 *         description: OK
 *       400:
 *         description: Solicitud o sintaxis invalida.
 *       403:
 *         description: No tienes permisos para ver los permisos del usuario.
 *       404:
 *         description: Usuario solicitado no encontrado
 */
router.get("/getPermissions/:username?", validateToken, async (req, res) => {
    try {
        const token = req.headers.authorization;
        const decoded = jwt.verify(token.split(" ")[1], process.env.TOKEN_SECRET);
        const pool = await poolPromise;

        let username;
        let user_type;
        console.log(req.params.username);
        if (req.params.username){ // Revisar si se esta preguntando por un usuario distinto a uno mismo
            if (decoded.user_type == 'admin' || decoded.user_type == 'root'){ // Solo root y admin pueden ver los permisos de otros usuarios
                username = req.params.username;
                if (username == process.env.ROOT_USER){ // Enviar tipo de usuario root
                    user_type = 'root';
                }
                else{  //Buscar si el usuario solicitado es admin
                    const getUserType = await pool.request()
                        .input('username', sql.VarChar, username)
                        .query('SELECT ADMIN from USUARIO.USUARIO WHERE CORREO = @username');
                
                    if (getUserType.recordset.length == 0){
                        return res.sendStatus(404);
                    }
                    if (getUserType.recordset[0].ADMIN == true){
                        user_type = 'admin';
                    }
                    else{
                        user_type = 'guest';
                    }
                }
            }
            else{
                return res.sendStatus(403);
            }
        }
        else{ // Devolver los permisos del usuario que hizo la solicitud
            username = decoded.username;
            user_type = decoded.user_type;
        }

        let getPermissions;
        if (user_type == 'root'){
            getPermissions = await pool.request()
            .input('username', sql.VarChar, username)
            .query(`SELECT ID_RAJO , NOMBRE FROM RAJO.RAJO`);
        }
        else{
            getPermissions = await pool.request()
            .input('username', sql.VarChar, username)
            .query(`SELECT rajos.ID_RAJO , rajos.NOMBRE  FROM USUARIO.USUARIO users 
            INNER JOIN COMBINACION.USUARIO_RAJO permissions 
            ON users.ID_USUARIO = permissions.ID_USUARIO 
            INNER JOIN RAJO.RAJO rajos ON permissions.ID_RAJO = rajos.ID_RAJO 
            WHERE users.CORREO = @username`);
        }
       
        let res_json = {
            user_type: user_type,
            rajos: [],
        };

        for (const element of getPermissions.recordset) {
            const rajo = {
                id: element.ID_RAJO,
                nombre: element.NOMBRE,
            };
            res_json.rajos.push(rajo);
        };
        return res.status(200).json(res_json);              
    }
    catch (err){
        console.error(err);
    }
    return res.sendStatus(400)
})


module.exports = router;



