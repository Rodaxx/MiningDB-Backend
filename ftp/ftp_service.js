const FtpSrv = require('ftp-srv');
require('dotenv').config();

const options = {
  pasv_url: 'ftp://localhost',
  anonymous: false
};

// Crea una instancia del servidor FTP
const server = new FtpSrv(options);

server.on('login', ({ connection, username, password }, resolve, reject) => {
  // Aquí puedes realizar la lógica de autenticación
  // Verificar las credenciales y permitir o denegar el acceso

  // Ejemplo básico: Permitir cualquier usuario y contraseña
  if (username == process.env.FTP_USER && password == process.env.FTP_PASSWORD) {
    resolve({ root: './ftp/shared' });
  }
});

module.exports = {
  server
}
