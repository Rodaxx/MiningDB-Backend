const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const router = express.Router();

const { poolPromise , sql } = require('../config_mssql');
const { validateRoot, validateAdmin ,validateToken } = require('../middlewares/jwt');

/**
 * @swagger
 * tags:
 *   name: Usuarios
 *   description: Endpoints relacionados con la gestion de usuarios
 */

/**
 * @swagger
 * tags:
 *   name: Root
 *   description: Endpoints relacionados con la vista root
 */

/** CREACION DE USUARIOS */

/**
 * @swagger
 * /users/createAdmin:
 *   post:
 *     tags: [Usuarios, Root]
 *     summary: Crear usuario con permisos de administrador (Se requiere acceso root).
 *     description: Permite a un usuario root crear administradores.
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
 *               password:
 *                 type: string
 *                 description: Contraseña del usuario.
 *              
 *             example:
 *               email: username@domain.com
 *               password: 12345678
 *     responses:
 *       200:
 *         description: Creacion de usuario exitosa.
 *       400:
 *         description: Solicitud invalida, faltan datos o error de sintaxis.
 */
router.post("/createAdmin", validateRoot , async (req, res) => {
    try {
        if (req.body.email && req.body.password){
            const hashedPassword = await bcrypt.hash(req.body.password,12);
            const pool = await poolPromise;
            const result = await pool.request()
                .input("admin",sql.Bit, 1)
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
 * /users/createGuest:
 *   post:
 *     tags: [Usuarios, Root]
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
router.post("/createGuest", validateRoot , async (req, res) => {
    try {
        if (req.body.username && req.body.password){
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

/** PERMISOS DE USUARIOS */

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

/**
 * @swagger
 * /users/addPermission:
 *   post:
 *     tags: [Usuarios, Root]
 *     summary: Añade permisos sobre un rajo a un usuario.
 *     description: 
 *                 Le da permisos a un usuario sobre un rajo. <br>
 *                 [ROOT] Puede dar permisos a cualquier usuario sobre cualquier rajo. <br>
 *                 [ADMIN] Los administradores necesitan tener permisos sobre el rajo para poder añadir a otros usuarios al rajo. <br>
 *                 Consideraciones  <br>
 *                  - Al intentar dar permisos al usuario root no se genera ningun cambio en el sistema. <br>
 *                  - Un administrador puede darle permisos a otro administrador o a un invitado. <br>
 *                  - No se generan registros dobles en la base de datos. 
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
 *                 description: Usuario al que se le quiere dar un nuevo permiso.
 *               rajo:
 *                 type: string
 *                 description: Rajo al cual se le quiere dar permiso
 *             example:
 *               username: rodrigovega
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
router.post("/addPermission", validateToken, async (req, res) => {
    try{
        if (!req.body.username && !req.body.rajo){
            return res.sendStatus(400);
        }
        if (req.body.username == process.env.ROOT_USER){
            return res.sendStatus(200); // El usuario root ya tiene permiso sobre todos los rajos.
        }
        const token = req.headers.authorization;
        const decoded = jwt.verify(token.split(" ")[1], process.env.TOKEN_SECRET);
        const user_type = decoded.user_type;

        if (user_type == 'guest'){
            return res.sendStatus(403);
        }

        const pool = await poolPromise;
        if (user_type == 'root'){
            const addPermission = await pool.request()
            .input('username', sql.VarChar, req.body.username)
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
        else if (user_type == 'admin'){
            const getPermissions = await pool.request() //Valida los permisos del usuario sobre los rajos
                .input('username', sql.VarChar, decoded.username)
                .query(`SELECT rajos.ID_RAJO , rajos.NOMBRE  FROM USUARIO.USUARIO users 
                INNER JOIN COMBINACION.USUARIO_RAJO permissions 
                ON users.ID_USUARIO = permissions.ID_USUARIO 
                INNER JOIN RAJO.RAJO rajos ON permissions.ID_RAJO = rajos.ID_RAJO 
                WHERE users.CORREO = @username`);
        
            let havePermission = false; // Verifica si tiene permisos sobre el rajo al que se quiere dar permiso
            getPermissions.recordset.forEach(element => {
                if (element.NOMBRE == req.body.rajo){
                    havePermission = true;
                    return
                }
            });
            if (!havePermission){
                return res.sendStatus(403);
            }

            const addPermission = await pool.request()
                .input('username', sql.VarChar, req.body.username)
                .input('rajo', sql.VarChar, req.body.rajo)
                .query(`INSERT INTO COMBINACION.USUARIO_RAJO (id_rajo, id_usuario)
                        SELECT rajo.ID_RAJO, usuario.ID_USUARIO
                        FROM RAJO.RAJO as rajo
                        JOIN USUARIO.USUARIO as usuario ON rajo.NOMBRE  = @rajo AND usuario.CORREO = @username
                        WHERE NOT EXISTS (
                            SELECT 1
                            FROM COMBINACION.USUARIO_RAJO as ur
                            WHERE ur.id_rajo = rajo.ID_RAJO AND ur.id_usuario = usuario.ID_USUARIO
                        );`);
            return res.sendStatus(200);
        }
        else{
            return res.sendStatus(400);
        }
    }
    catch (error){
        console.log(error)
    }
})

/** ELIMINAR USUARIOS */

module.exports = router;



