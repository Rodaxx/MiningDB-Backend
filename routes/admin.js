const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const router = express.Router();
const validator = require('validator');
const moment = require('moment');



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
 *   name: Admin
 *   description: Endpoints relacionados con la vista administrador
 */

/**
 * @swagger
 * /admin/insertFactor:
 *   post:
 *     tags: [Admin]
 *     summary: Inserta un nuevo factor de carga.
 *     description: Inserta un nuevo factor de carga.
 *     security:
 *        - Authorization: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               flota:
 *                 type: string
 *                 description: Flota.
 *               origen:
 *                 type: string
 *                 description: Origen.
 *               factor:
 *                 type: string
 *                 description: Factor.
 *               fecha_inicio:
 *                 type: string
 *                 description: Fecha de inicio
 *               fecha_fin:
 *                 type: string
 *                 description: Fecha de fin
 *             example:
 *               flota: 
 *               origen:
 *               factor:
 *               fecha_inicio:
 *               fecha_fin:
 *     responses:
 *       200:
 *         description: OK.
 */
router.post("/insertFactor", validateAdmin , async (req, res) => {
    try {
        if (req.body.flota && req.body.origen && req.body.factor && req.body.fecha_inicio && req.body.fecha_fin){
            const pool = await poolPromise;
            const factor = await pool.request()
                .input("flota",sql.VarChar, req.body.flota)
                .input("origen",sql.VarChar, req.body.origen)
                .input("factor",sql.Real, req.body.factor)
                .input("fecha_inicio",sql.Date, req.body.fecha_inicio)
                .input("fecha_fin",sql.Date, req.body.fecha_fin)
                .query("EXECUTE FACTOR_CARGA.SP_INSERT_FACTOR_CARGA_FULL @flota, @origen, @factor, @fecha_inicio, @fecha_fin");
            return res.sendStatus(200);
        }
        return res.sendStatus(400);
    }
    catch (err){
        console.error(err);
    }
    return res.sendStatus(400)
})

/**
 * @swagger
 * /admin/getFlotas:
 *   post:
 *     tags: [Admin]
 *     summary: Obtener las flotas.
 *     description: Obtener las flotas.
 *     security:
 *        - Authorization: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               origen:
 *                 type: string
 *                 description: Origen.
 *             example:
 *               origen: ESP/F07/2120/705
 *     responses:
 *       200:
 *         description: OK.
 */
router.post("/getFlotas", validateAdmin , async (req, res) => {
    try {
        if (!req.body.origen){
            return res.sendStatus(400);
        }
        const pool = await poolPromise;
        const flotas = await pool.request()
            .input('origen', sql.VarChar, req.body.origen)
            .query(`SELECT CF.CODIGO
            FROM CICLO.CICLO CI
            INNER JOIN RECORRIDO.RECORRIDO RE
            ON CI.ID_RECORRIDO=RE.ID_RECORRIDO
            INNER JOIN COMBINACION.PALA_CAMION PC
            ON PC.ID_PC=RE.ID_PC 
            INNER JOIN PALA.PALA P
            ON P.ID_PALA=PC.ID_PALA
            INNER JOIN CAMION.CAMION CA
            ON CA.ID_CAMION=PC.ID_CAMION
            INNER JOIN CAMION.FLOTA CF
            ON CF.ID_FLOTA=CA.ID_FLOTA
            INNER JOIN COMBINACION.ORI_DEST_ZON_RAJ_MAT  ODZRM
            ON ODZRM.ID_ODZRM=RE.ID_ODZRM
            INNER JOIN COMBINACION.ORI_DEST_ZON_RAJ ODZR
            ON ODZR.ID_ODZR=ODZRM.ID_ODZR
            INNER JOIN COMBINACION.ORIGEN_DESTINO OD
            ON OD.ID_OD =ODZR.ID_OD 
            INNER JOIN SECTOR.SECTOR S
            ON S.ID_SECTOR=OD.ID_ORIGEN 
            WHERE S.NOMBRE LIKE @origen
            GROUP BY CF.CODIGO`);
        let flotas_array = [];
        flotas.recordset.forEach(element => {
            flotas_array.push(element.CODIGO);
        }); 
        return res.json({
            flotas: flotas_array,
        }).status(200);
    }
    catch (err){
        console.error(err);
    }
    return res.sendStatus(400)
})

/**
 * @swagger
 * /admin/getOrigenes:
 *   post:
 *     tags: [Admin]
 *     summary: Obtener los origenes.
 *     description: Obtener los origenes.
 *     security:
 *        - Authorization: []
 *     responses:
 *       200:
 *         description: OK.
 */
router.post("/getOrigenes", validateAdmin , async (req, res) => {
    try {
        const pool = await poolPromise;
        const sectores = await pool.request()
            .query("SELECT nombre FROM SECTOR.SECTOR");
        let sectores_array = [];
        sectores.recordset.forEach(element => {
            sectores_array.push(element.nombre);
        }); 
        return res.json({
            nombres: sectores_array,
        }).status(200);
    }
    catch (err){
        console.error(err);
    }
    return res.sendStatus(400)
})

/**
 * @swagger
 * /admin/createGuest:
 *   post:
 *     tags: [Admin]
 *     summary: Crea a un invitado.
 *     description: Crea un invitado y copia los permisos del administrador a este.
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
 *             example:
 *               email: rodrigo.vega@alumnos.ucn.cl
 *     responses:
 *       200:
 *         description: Adicion de invitado exitosa o el usuario ya existia.
 *       400:
 *         description: Solicitud invalida, faltan datos o error de sintaxis.
 */
router.post("/createGuest", validateAdmin , async (req, res) => {
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

            const hashedPassword = await bcrypt.hash(password,12);
            const token = req.headers.authorization;
            const decoded = jwt.verify(token.split(" ")[1], process.env.TOKEN_SECRET);
            const admin_email = decoded.email;

            const transferPermissions = await pool.request()
                .input("admin", sql.VarChar, admin_email)
                .input("guest", sql.VarChar, req.body.email)
                .input('password', sql.VarChar, hashedPassword)
                .query('EXECUTE USUARIO.TRANSFER_PERMISSION @admin,@guest,@password');

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


module.exports = router