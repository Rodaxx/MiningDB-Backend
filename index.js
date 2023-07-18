require('dotenv').config();

const express = require('express');
const cors = require('cors');

const login_routes = require('./routes/login');
const users_routes = require('./routes/users')
const root_routes = require('./routes/root')

const app = express();
const port = 80;

// FTP Server
if (process.env.FTP_ENABLED == 'true'){
  const server = require('./ftp/ftp_service').server
  server.listen()
}


//Auto documentacion
const swagger = require('./docs/swagger');
swagger(app);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/login', login_routes);
app.use('/users', users_routes);
app.use('/root', root_routes)

app.listen(port, () => {
  console.log(`Servidor iniciado!`);
}
)
