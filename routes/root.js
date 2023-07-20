const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const router = express.Router();
const validator = require('validator');

const {generatePassword} = require('../utils/passwordGenerator')
const { poolPromise , sql } = require('../config_mssql');
const { validateRoot, validateAdmin ,validateToken } = require('../middlewares/jwt');

const nodemailer = require('nodemailer');
const { mailConfig } = require("../config_mail")

function sendMail(mailTransport, mailOptions){
    return mailTransport.sendMail(mailOptions);
}

/**
 * @swagger
 * tags:
 *   name: Root
 *   description: Endpoints relacionados con la vista root
 */

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
            if (!validator.isEmail(req.body.email)){
                return res.sendStatus(400);
            }
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

            try{
                await sendMail(mailTransport,mailOptions);
            }
            catch{
                return res.sendStatus(500);
            }
           

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
        return res.sendStatus(500)
    }
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
            .query(`DELETE FROM usuario.usuario WHERE correo = @email`);
        return res.sendStatus(200);
    }
    catch (error){
        console.log(error)
        return res.sendStatus(400)
    }
})

/**
 * @swagger
 * /root/getPermissions:
 *   post:
 *     tags: [Root]
 *     summary: Obtener permisos de un usuario.
 *     description: Permite a un root obtener los permisos de un usuario sobre todos los rajos.
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
 *                 description: Email del usuario del que se quiere obtener permisos.
 *             example:
 *               email: username@domain.com
 *     responses:
 *       200:
 *         description: OK.
 *       400:
 *         description: Faltan datos o solicitud invalida. 
 */
router.post("/getPermissions", validateRoot , async (req, res) => {
    try {
        if (!req.body.email){
            return res.sendStatus(400);
        }
        if (req.body.email == process.env.ROOT_USER){
            return res.sendStatus(400);
        }
        const pool = await poolPromise;
        const result = await pool.request()
            .input('email', sql.VarChar, req.body.email)
            .query(`EXECUTE USUARIO.GET_PERMISSIONS @email`);

        let rajos = []
        result.recordset.forEach(rajo => {
            rajoJson = {
                Rajo: rajo.NOMBRE,
                Permiso: rajo.Permiso,
            }
            rajos.push(rajoJson);
        });

        return res.json(rajos).status(200);
    }
    catch (err){
        console.error(err);
    }
    return res.sendStatus(400)
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
        .query(`EXECUTE USUARIO.SP_INSERT_PERMISO_FULL @email,@rajo`);
        return res.sendStatus(200);
    }
    catch (error){
        console.log(error)
        return res.sendStatus(400);
    }
})

/**
 * @swagger
 * /root//deleteAllPermissions:
 *   post:
 *     tags: [Root]
 *     summary: Elimina todos los permisos de un usuario.
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
 *                 description: Email del usuario.
 *             example:
 *               email: diego.gonzalez07@alumnos.ucn.cl
 *     responses:
 *       200:
 *         description: Eliminacion correcta.
 *       400:
 *         description: Solicitud invalida, faltan datos o error de sintaxis.
 */
router.post("/deleteAllPermissions", validateRoot, async (req, res) => {
    try{
        if (!req.body.email){
            return res.sendStatus(400);
        }
        if (req.body.email == process.env.ROOT_USER){
            return res.sendStatus(200); // El usuario root ya tiene permiso sobre todos los rajos.
        }

        const pool = await poolPromise;
        const deletePermissions = await pool.request()
        .input('email', sql.VarChar, req.body.email)
        .input('rajo', sql.VarChar, req.body.rajo)
        .query(`EXECUTE USUARIO.DELETE_PERMISOS @email`);
        return res.sendStatus(200);
    }
    catch (error){
        console.log(error)
        return res.sendStatus(400);
    }
})

/**
 * @swagger
 * /root/changeUserType:
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