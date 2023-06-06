const fs = require('fs');
const { poolPromise , sql } = require('../config_mssql');

function leerCsv(filename){
    const fileText = fs.readFileSync(filename, 'utf-8');
    
    const allLines = fileText.split(/\r\n|\r|\n/, -1);
    
    const headers = allLines[0];
    const fieldNames = headers.split(';');
    fieldNames[2] = 'camion';
    
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
async function cargarDatos(){
    try {
        for (let i = 0; i<objList.length; i++){
            const pool = await poolPromise;
            const result = await pool.request()
                .input("fecha",sql.Date,  objList[i].fecha)
                .input("pala",sql.VarChar, objList[i].carguio)
                .input("camion", sql.VarChar, objList[i].camion)
                .input("flota", sql.VarChar, objList[i].flota)
                .input("material", sql.VarChar, objList[i].material)
                .input("origen", sql.VarChar, objList[i].origen)
                .input("zona", sql.VarChar, objList[i].zona)
                .input("destino", sql.VarChar, objList[i].destino)
                .input("tonelaje", sql.Real, objList[i].tonelaje)
                .input("ciclos", sql.Real, objList[i].ciclos)
                .input("rajo", sql.VarChar, objList[i].rajo)
                .query("INSERT INTO ciclo (fecha, pala, camion, flota, material, origen, zona, destino, tonelaje, ciclos, rajo) VALUES (@fecha, @pala, @camion, @flota, @material, @origen, @zona, @destino, @tonelaje, @ciclos, @rajo)");
        }
    }
    catch (err){
        console.error(err);
    }
    finally{
        pool.close();
    }
}

cargarDatos(leerCsv('excel/ejemplo.csv'));
