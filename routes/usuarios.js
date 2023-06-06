const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.send('¡Hola, mundo!');
  });
  
  router.post('/', (req, res) => {
    // Lógica para crear un nuevo recurso
    res.send('Recurso creado');
  });
  
  router.put('/:id', (req, res) => {
    // Lógica para actualizar un recurso con el ID proporcionado
    res.send('Recurso actualizado');
  });
  
  router.delete('/:id', (req, res) => {
    // Lógica para eliminar un recurso con el ID proporcionado
    res.send('Recurso eliminado');
  });
  
module.exports = router;
