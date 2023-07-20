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
 *   description: Endpoints relacionados con todos los usuarios
 */

/**
 * @swagger
 * /users/getReport:
 *   post:
 *     tags: [Usuarios]
 *     summary: Obtener reporte mas nuevo.
 *     security:
 *        - Authorization: []
 *     responses:
 *       200:
 *         description: Creacion de usuario exitosa.
 *       400:
 *         description: Solicitud invalida, faltan datos o error de sintaxis.
 */
router.post("/getReport", validateToken, async (req, res) => {
    try {  
        let reporte = [];
        
        const token = req.headers.authorization;
        const decoded = jwt.verify(token.split(" ")[1], process.env.TOKEN_SECRET);
        const admin_email = decoded.email;

        const pool = await poolPromise;

        const getRajos = await pool.request()
            .input('email', sql.VarChar, admin_email)
            .query(`SELECT R.NOMBRE
            FROM USUARIO.PERMISO PER
            INNER JOIN USUARIO.USUARIO U
            ON U.ID=PER.ID_USUARIO 
            INNER JOIN RAJO.RAJO R
            ON R.ID_RAJO=PER.ID_RAJO
            WHERE U.CORREO LIKE @email`);
        const rajos = getRajos.recordset;

        for (let i = 0; i < rajos.length; i++){
            let reporte_rajo = {
                rajo: rajos[i].NOMBRE,
                DiarioReal: 0,
                DiarioPlan: 0,
                KPI: 0,
                SemanalISOReal: 0,
                SemanalISOPlan: 0,
                KPI2: 0,
                SemanalReal: 0,
                SemanalPlan: 0,
                KPI3: 0,
                MensualReal: 0,
                MensualPlan: 0,
                KPI4: 0,
                AnualReal: 0,
                AnualPlan: 0,
                KPI5: 0,
                fases: []
            }

            const getFasesByRajo = await pool.request()
            .input("rajo", sql.VarChar, rajos[i].NOMBRE)
            .query(`SELECT Z.ZONA 'Zona',R.NOMBRE
                    FROM COMBINACION.ZONA_RAJO ZR
                    INNER JOIN ZONA.ZONA Z
                    ON Z.ID_ZONA=ZR.ID_ZONA 
                    INNER JOIN RAJO.RAJO  R
                    ON R.ID_RAJO=ZR.ID_RAJO
                    WHERE (Z.ZONA LIKE '%FASE%' OR Z.ZONA LIKE '%F0%') AND (R.NOMBRE LIKE @rajo)`);
            const fases = getFasesByRajo.recordset;
            for (let j = 0; j < fases.length; j++){
                let reporte_fase = {
                        fase: fases[j].Zona,
                        DiarioReal: 0,
                        DiarioPlan: 0,
                        KPI: 0,
                        SemanalISOReal: 0,
                        SemanalISOPlan: 0,
                        KPI2: 0,
                        SemanalReal: 0,
                        SemanalPlan: 0,
                        KPI3: 0,
                        MensualReal: 0,
                        MensualPlan: 0,
                        KPI4: 0,
                        AnualReal: 0,
                        AnualPlan: 0,
                        KPI5: 0,
                        flotas: []
                }
                reporte_rajo.fases.push(reporte_fase);
            }
            reporte.push(reporte_rajo);
        }
        
        const maxDate = await pool.request()
            .query(`SELECT MAX(FECHA) 'MAXIMO'
            FROM CICLO.CICLO`);
        const date = maxDate.recordset[0].MAXIMO;

        
        const dailyReport = await pool.request()
            .input("email",sql.VarChar, admin_email)
            .input('fecha', sql.Date, date)
            .query(`EXECUTE [PLAN].GET_REPORTE_DIARIO_FASE @fecha, @email`);
        for (let i = 0; i<dailyReport.recordset.length; i++){
            let rajo = dailyReport.recordset[i].NOMBRE;
            let fase = dailyReport.recordset[i].ZONA;
            let extraccion = dailyReport.recordset[i].Extracción / 1000;
            extraccion = parseFloat(extraccion.toFixed(3));
            for (let j = 0; j<reporte.length; j++){
                if (reporte[j].rajo == rajo){
                    reporte[j].DiarioReal += extraccion;
                    for (let k = 0; k<reporte[j].fases.length; k++){
                        if (reporte[j].fases[k].fase == fase){
                            reporte[j].fases[k].DiarioReal = extraccion;
                            break
                        }
                    }
                }
                
            }
        }

        const semIsoReport = await pool.request()
            .input("email",sql.VarChar, admin_email)
            .input('fecha', sql.Date, date)
            .query(`EXECUTE [PLAN].GET_REPORTE_SEMANAL_ISO_FASE @fecha, @email`);
        for (let i = 0; i<semIsoReport.recordset.length; i++){
            let rajo = semIsoReport.recordset[i].NOMBRE;
            let fase = semIsoReport.recordset[i].ZONA;
            let extraccion = semIsoReport.recordset[i].Extracción / 1000;
            extraccion = parseFloat(extraccion.toFixed(3));
            for (let j = 0; j<reporte.length; j++){
                if (reporte[j].rajo == rajo){
                    reporte[j].SemanalISOReal += extraccion;
                    for (let k = 0; k<reporte[j].fases.length; k++){
                        if (reporte[j].fases[k].fase == fase){
                            reporte[j].fases[k].SemanalISOReal = extraccion;
                            break
                        }
                    }
                }
            }
        }

        const semMovilReport = await pool.request()
            .input("email",sql.VarChar, admin_email)
            .input('fecha', sql.Date, date)
            .query(`EXECUTE [PLAN].GET_REPORTE_SEMANAL_MOVIL_FASE @fecha, @email`);
        for (let i = 0; i<semMovilReport.recordset.length; i++){
            let rajo = semMovilReport.recordset[i].Rajo;
            let fase = semMovilReport.recordset[i].ZONA;
            let extraccion = semMovilReport.recordset[i].Extracción / 1000;
            extraccion = parseFloat(extraccion.toFixed(3));
            for (let j = 0; j<reporte.length; j++){
                if (reporte[j].rajo == rajo){
                    reporte[j].SemanalReal += extraccion;
                    for (let k = 0; k<reporte[j].fases.length; k++){
                        if (reporte[j].fases[k].fase == fase){
                            reporte[j].fases[k].SemanalReal = extraccion;
                            break
                        }
                    }
                }
            }
        }

        const monthlyReport = await pool.request()
            .input("email",sql.VarChar, admin_email)
            .input('fecha', sql.Date, date)
            .query(`EXECUTE [PLAN].GET_REPORTE_MENSUAL_FASE @fecha, @email`);
        for (let i = 0; i<monthlyReport.recordset.length; i++){
            let rajo = monthlyReport.recordset[i].Rajo;
            let fase = monthlyReport.recordset[i].ZONA;
            let extraccion = monthlyReport.recordset[i].Extracción / 1000;
            extraccion = parseFloat(extraccion.toFixed(3));
            for (let j = 0; j<reporte.length; j++){
                if (reporte[j].rajo == rajo){
                    reporte[j].MensualReal += extraccion;
                    for (let k = 0; k<reporte[j].fases.length; k++){
                        if (reporte[j].fases[k].fase == fase){
                            reporte[j].fases[k].MensualReal = extraccion;
                            break
                        }
                    }
                }
            }
        }

        const anualReport = await pool.request()
            .input("email",sql.VarChar, admin_email)
            .input('fecha', sql.Date, date)
            .query(`EXECUTE [PLAN].GET_REPORTE_ANUAL_FASE @fecha, @email`);
        for (let i = 0; i<anualReport.recordset.length; i++){
            let rajo = anualReport.recordset[i].Rajo;
            let fase = anualReport.recordset[i].ZONA;
            let extraccion = anualReport.recordset[i].Extracción / 1000;
            extraccion = parseFloat(extraccion.toFixed(3));
            for (let j = 0; j<reporte.length; j++){
                if (reporte[j].rajo == rajo){
                    reporte[j].AnualReal += extraccion;
                    for (let k = 0; k<reporte[j].fases.length; k++){
                        if (reporte[j].fases[k].fase == fase){
                            reporte[j].fases[k].AnualReal = extraccion;
                            break
                        }
                    }
                }
            }
        }
        return res.json(reporte).status(200);
    }
    catch (err){
        console.log(err);
    }
    return res.sendStatus(400)
})

module.exports = router;



