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
 *   name: Root
 *   description: Endpoints relacionados con la vista root
 */

/// TODO: ELIMINAR PERMISOS


/**
 * @swagger
 * /root/getUsers:
 *   post:
 *     tags: [Root]
 *     summary: Obtener usuarios.
 *     description: Permite a un root obtener la informacion de todos los usuarios del sistema.
 *     security:
 *        - Authorization: []
 *     responses:
 *       200:
 *         description: OK.
 */
router.post("/getUsers", validateRoot , async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .query("SELECT id, correo, admin FROM usuario.usuario");

        let users = [];
        result.recordset.forEach(user => {
            let type;
            if (user.admin){
                type = 'Administrador';
            }
            else{
                type = 'Visita'
            }

            userJson = {
                id: user.id,
                correo: user.correo,
                tipo: type
            }
            users.push(userJson);
        });

        return res.json(users).status(200);
    }
    catch (err){
        console.error(err);
    }
    return res.sendStatus(400)
})

/**
 * @swagger
 * /root/createUser:
 *   post:
 *     tags: [Root]
 *     summary: Crear usuarios.
 *     description: Permite a un usuario root crear usuarios.
 *                  Se genera una contraseña de 12 caracteres que es enviada al correo del nuevo usuario.
 *                  Si no se especifica el tipo de usuario, se crea un usuario invitado.
 *     security:
 *        - Authorization: []
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
 *               type:
 *                 type: string
 *                 description: Contraseña del usuario.
 *              
 *             example:
 *               email: username@domain.com
 *               type: admin
 *     responses:
 *       200:
 *         description: Creacion de usuario exitosa.
 *       400:
 *         description: Solicitud invalida, faltan datos o error de sintaxis.
 *       403:
 *         description: Usuario ya existe.
 */
router.post("/createUser", validateRoot , async (req, res) => {
    try {
        if (req.body.email){
            const pool = await poolPromise;
            const user = await pool.request()
                .input("email",sql.VarChar, req.body.email)
                .query("SELECT * FROM usuario.usuario WHERE correo = @email");
            if (user.recordset.length == 1){
                return res.sendStatus(403);
            }

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

            let type = 0;
            if (req.body.type == 'admin'){
                type = 1;
            }

            const hashedPassword = await bcrypt.hash(password,12);
            const result = await pool.request()
                .input("admin",sql.Bit, type)
                .input("correo",sql.VarChar, req.body.email)
                .input("contraseña", sql.VarChar, hashedPassword)
                .query("INSERT INTO usuario.usuario (admin, correo, contraseña) VALUES (@admin, @correo, @contraseña)");
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

/**
 * @swagger
 * /root/deleteUser:
 *   post:
 *     tags: [Root]
 *     summary: Elimina a un usuario.
 *     description: Elimina a un usuario del sistema.
 *     security:
 *        - Authorization: [] 
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: Email del usuario a eliminar.
 *             example:
 *               email: username@domain.com
 *     responses:
 *       200:
 *         description: Eliminacion de usuario correcta.
 *       400:
 *         description: Solicitud invalida, faltan datos o error de sintaxis.
 */
router.post("/deleteUser", validateRoot, async (req, res) => {
    try{
        if (!req.body.email){
            return res.sendStatus(400);
        }
        if (req.body.email == process.env.ROOT_USER){
            return res.sendStatus(400); // El usuario root ya tiene permiso sobre todos los rajos.
        }

        const pool = await poolPromise;
        const deleteUser = await pool.request()
            .input('email', sql.VarChar, req.body.email)
            .query(`DELETE FROM usuario.usuario WHERE email = @email`);
        return res.sendStatus(200);
    }
    catch (error){
        console.log(error)
        return res.sendStatus(400)
    }
})

/**
 * @swagger
 * /root/addPermission:
 *   post:
 *     tags: [Root]
 *     summary: Añade permisos sobre un rajo a un usuario.
 *     description: Permite a un usuario ROOT darle permisos a un usuario sobre un rajo.
 *     security:
 *        - Authorization: [] 
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: Email del usuario al que se le quiere dar un nuevo permiso.
 *               rajo:
 *                 type: string
 *                 description: Rajo al cual se le quiere dar permiso
 *             example:
 *               email: rodrigo.vega@alumnos.ucn.cl
 *               rajo: Tesoro
 *     responses:
 *       200:
 *         description: Adicion de permiso exitosa o el permiso ya existia.
 *       400:
 *         description: Solicitud invalida, faltan datos o error de sintaxis.
 *       401:
 *         description: No proporciono metodo de autenticacion.
 *       403:
 *         description: No se tienen permisos para realizar la solicitud.
 */
router.post("/addPermission", validateRoot, async (req, res) => {
    try{
        if (!req.body.email && !req.body.rajo){
            return res.sendStatus(400);
        }
        if (req.body.email == process.env.ROOT_USER){
            return res.sendStatus(200); // El usuario root ya tiene permiso sobre todos los rajos.
        }

        const pool = await poolPromise;
        const addPermission = await pool.request()
        .input('email', sql.VarChar, req.body.email)
        .input('rajo', sql.VarChar, req.body.rajo)
        .query(`INSERT INTO COMBINACION.USUARIO_RAJO (id_rajo, id_usuario)
                SELECT rajo.ID_RAJO, usuario.ID_USUARIO
                FROM RAJO.RAJO as rajo
                JOIN USUARIO.USUARIO as usuario ON rajo.NOMBRE = @rajo AND usuario.CORREO = @username
                WHERE NOT EXISTS (
                    SELECT 1
                    FROM COMBINACION.USUARIO_RAJO as ur
                    WHERE ur.id_rajo = rajo.ID_RAJO AND ur.id_usuario = usuario.ID_USUARIO
                );`);
        return res.sendStatus(200);
    }
    catch (error){
        console.log(error)
    }
})

/**
 * @swagger
 * /root/deletePermission:
 *   post:
 *     tags: [Root]
 *     summary: Elimina permisos sobre un rajo a un usuario.
 *     description: Permite a un usuario ROOT eliminar permisos a un usuario sobre un rajo.
 *     security:
 *        - Authorization: [] 
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: Email del usuario al que se le eliminar un permiso.
 *               rajo:
 *                 type: string
 *                 description: Rajo al cual se le eliminar el permiso
 *             example:
 *               email: rodrigo.vega@alumnos.ucn.cl
 *               rajo: Tesoro
 *     responses:
 *       200:
 *         description: Eliminacion de permiso exitosa o el permiso no existia.
 *       400:
 *         description: Solicitud invalida, faltan datos o error de sintaxis.
 *       401:
 *         description: No proporciono metodo de autenticacion.
 *       403:
 *         description: No se tienen permisos para realizar la solicitud.
 */
router.post("/deletePermission", validateRoot, async (req, res) => {
    try{
        if (!req.body.email && !req.body.rajo){
            return res.sendStatus(400);
        }
        if (req.body.email == process.env.ROOT_USER){
            return res.sendStatus(200); // El usuario root ya tiene permiso sobre todos los rajos.
        }

        const pool = await poolPromise;
        const addPermission = await pool.request()
        .input('email', sql.VarChar, req.body.email)
        .input('rajo', sql.VarChar, req.body.rajo)
        .query(`DELETE FROM usuario.permiso (id_rajo, id_usuario)
                SELECT rajo.ID_RAJO, usuario.ID_USUARIO
                FROM RAJO.RAJO as rajo
                JOIN USUARIO.USUARIO as usuario ON rajo.NOMBRE = @rajo AND usuario.CORREO = @username
                WHERE NOT EXISTS (
                    SELECT 1
                    FROM COMBINACION.USUARIO_RAJO as ur
                    WHERE ur.id_rajo = rajo.ID_RAJO AND ur.id_usuario = usuario.ID_USUARIO
                );`);
        return res.sendStatus(200);
    }
    catch (error){
        console.log(error)
    }
})

/**
 * @swagger
 * /users/changeUserType:
 *   post:
 *     tags: [Root]
 *     summary: Permite cambiar el tipo de usuario (Administrador y visita).
 *     description: Permite a un usuario ROOT cambiar el tipo de un usuario entre administrador y visita. <br> (args= [ 'admin' , 'guest' ])
 *     security:
 *        - Authorization: [] 
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: Email del usuario a modificar.
 *               type:
 *                 type: string
 *                 description: Tipo de usuario.
 *             example:
 *               email: rodrigo.vega@alumnos.ucn.cl
 *               type: "admin"
 *     responses:
 *       200:
 *         description: Cambio de tipo exitoso.
 *       400:
 *         description: Solicitud invalida, faltan datos o error de sintaxis.
 */
router.post("/changeUserType", validateRoot, async (req, res) => {
    try{
        if (!req.body.email && !req.body.type){
            return res.sendStatus(400);
        }
        if (req.body.email == process.env.ROOT_USER){
            return res.sendStatus(400);
        }

        let type = 0;
        if (req.body.type == 'admin'){
            type = 1;
        }
        else if (req.body.type == 'guest'){
            type = 0;
        }
        else{
            return res.sendStatus(400); //Tipo invalido
        }

        const pool = await poolPromise;
        const changeType = await pool.request()
            .input('email', sql.VarChar, req.body.email)
            .input('type', sql.Bit, type)
            .query(`UPDATE usuario.usuario SET admin = @type WHERE correo = @email`);
        return res.sendStatus(200);
    }
    catch (error){
        console.log(error)
    }
})


module.exports = router