const fs = require('fs');
const { poolPromise , sql } = require('../config_mssql');


const filename = 'excel/ejemplo.csv';
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
/** 
const jsonText = JSON.stringify(objList);
console.log(JSON.parse(jsonText));
*/

for (let i = 0; i<objList.length; i++){
    try{
        const pool = await poolPromise;
        const result = await pool.request()
            .input("id_fecha",sql.Int,  objList[i].fecha.replace("-",""))
            .input("id_pala",sql.SmallInt, objList[i].carguio)
            .query("INSERT INTO Ciclo.ciclo (id_fecha, id_pala) VALUES (@id_fecha, @id_pala)")
    }
    catch{

    }
    //console.log(objList[0]);
}

/**  
try{
    const pool = await poolPromise
    const result = await pool.request()
    .input()
    .query()
}catch (err){
    console.log(err.message);
}
*/
