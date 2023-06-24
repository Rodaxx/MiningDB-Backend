require('dotenv').config();
const express = require('express');

const login_routes = require('./routes/login');
const users_routes = require('./routes/users')


const app = express();
const port = 3000;

//Auto documentacion
const swagger = require('./docs/swagger');
swagger(app);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/login', login_routes);
app.use('/users', users_routes);


app.get('/', (req, res) => {
  res.send('¡Hola, mundo!');
});

app.listen(port, () => {
  console.log(`El servidor está escuchando en el puerto ${port}`);
});

