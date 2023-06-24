const { generateAccessToken } = require('../utils/jwt');
const { poolPromise , sql } = require('../config_mssql');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

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
 *     description: Permite a un usuario iniciar sesión utilizando un nombre de usuario y contraseña válidos.
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
        if (req.body.username != null && req.body.password != null){
            if (req.body.username == process.env.ROOT_USER && req.body.password == process.env.ROOT_PASSWORD){
                const token = generateAccessToken('root', req.body.username);
                return res.status(200).json({
                    user_type: 'root',
                    token: token,
                })
            }
            const pool = await poolPromise;
            const result = await pool.request()
                .input("correo", sql.VarChar, req.body.username)
                .query("SELECT * FROM usuario.usuario WHERE correo = @correo");
            
            // Validate username
            if (result.recordset.length == 0){
                return res.sendStatus(403);  
            }
            const userData = result.recordset[0];

            // Validate password
            if (bcrypt.compareSync(req.body.password, userData.CONTRASENIA)){
                if (userData.ADMIN == 1){
                    const token = generateAccessToken('admin', req.body.username);
                    return res.status(200).json({
                        user_type: 'admin',
                        token: token,
                    })
                }
                else{
                    const token = generateAccessToken('guest', req.body.username);
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
module.exports = router;



