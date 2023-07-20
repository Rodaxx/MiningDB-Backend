const fs = require('fs');
const { poolPromise , sql } = require('./config_mssql');
const moment = require('moment');
const { parse } = require('path');
const path = require('path');

function readCiclo(filename){
    const fileText = fs.readFileSync(filename, 'utf-8');
    
    const allLines = fileText.split(/\r\n|\r|\n/, -1);
    
    const headers = allLines[0];
    const fieldNames = headers.split(';');
    fieldNames[2] = 'camion';
    fieldNames[0] = 'fecha';
    
    let objList = [];
    for (let i = 1; i < allLines.length; i++){
        let obj = {};
        const data = allLines[i].split(';');
        for (let j = 0; j < fieldNames.length; j++){
            const fieldName = fieldNames[j].toLowerCase();
            obj[fieldName] = data[j];
        }
        objList.push(obj);
    }
    return objList;
}

async function loadCiclos(objList, fileName){
    let transaction;
    try{
        const pool = await poolPromise;
        transaction = await pool.transaction();
        await transaction.begin();
        for (let i = 0; i<objList.length; i++){
            const request = await transaction.request(); // Crear nueva instancia de solicitud en cada iteración
            const obj = objList[i];
            obj.fecha = moment(obj.fecha, 'DD-MM-YYYY').format('YYYY-MM-DD');
            await request
              .input("fecha", sql.Date, obj.fecha)
              .input("pala", sql.VarChar, obj.carguio)
              .input("camion", sql.VarChar, obj.camion)
              .input("flota", sql.VarChar, obj.flota)
              .input("material", sql.VarChar, obj.material)
              .input("origen", sql.VarChar, obj.origen)
              .input("zona", sql.VarChar, obj.zona)
              .input("destino", sql.VarChar, obj.destino)
              .input("tonelaje", sql.Real, obj.tonelaje.replace(",", "."))
              .input("vueltas", sql.Real, obj.ciclos)
              .input("rajo", sql.VarChar, obj.rajo)
              .query(
                "EXECUTE CICLO.SP_INSERT_CICLO_FULL @fecha, @pala, @camion, @flota, @material, @origen, @zona, @destino, @tonelaje, @vueltas, @rajo"
              );
        }
        await transaction.commit();
        return true;


    }
    catch (err) {
        if (transaction){
            await transaction.rollback();
            return false;
        }
        console.log(err);
    }
}

async function processCiclos(files) {
    for (let i = 0; i < files.length; i++) {
        const filePath = './ftp/shared/new/' + files[i];
        const ciclos_json = readCiclo(filePath);
        if (await loadCiclos(ciclos_json, files[i])){
            console.log("Ciclo añadido: "+ files[i])
            fs.rename(filePath, './ftp/shared/added/'+files[i], (err) => {
                if (err) {
                  console.error('Error al renombrar el archivo:', err);
                  // Manejar el error aquí
                }
            });
        }
        else{
            console.log("Ciclo revocado: "+ files[i])
            fs.rename(filePath, './ftp/shared/revoked/'+files[i], (err) => {
                if (err) {
                  console.error('Error al renombrar el archivo:', err);
                  // Manejar el error aquí
                }
            });
        }
    }
}

const express = require('express');
const router = express.Router();

router.get("/", async (req, res) => {
    const ciclos = fs.readdirSync('./ftp/shared/new');
    processCiclos(ciclos)
    .then(() => {
        console.log("All files processed successfully.");
        res.sendStatus(200);
    })
    .catch((error) => {
        console.error("Error processing files:", error);
        res.sendStatus(400);
    })

})

module.exports = router;
