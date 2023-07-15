require('dotenv').config();
const express = require('express');
const cors = require('cors');

const login_routes = require('./routes/login');
const users_routes = require('./routes/users')


const app = express();
const port = 80;

//Auto documentacion
const swagger = require('./docs/swagger');
swagger(app);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/login', login_routes);
app.use('/users', users_routes);


app.get('/', (req, res) => {
  res.send('Backend MiningDB');
});

app.listen(port, () => {
  console.log(`Servidor iniciado!`);
});

