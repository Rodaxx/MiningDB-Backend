require('dotenv').config();

const express = require('express');
const cors = require('cors');

const login_routes = require('./routes/login');
const root_routes = require('./routes/root')
const admin_routes = require('./routes/admin')
const users_routes = require('./routes/users')
const csv_route = require('./csv');

const app = express();
const port = 80;

const firstRun = require('./createDatabase')
app.get('/database', (req, res) => {
  firstRun();
  return res.sendStatus(200);
})

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
app.use('/root', root_routes);
app.use('/admin', admin_routes);
app.use('/users', users_routes);
app.use('/csv', csv_route )

app.listen(port, () => {
  console.log(`Servidor iniciado!`);
}
)
