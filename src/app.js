require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const router = require('./routes/routes');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;

// Conexión a MongoDB
mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', (error) => console.log(error));
db.once('open', () => console.log('Conectado a la base de datos'));

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Configuración de sesiones
app.use(session({
    secret: 'mi palabra clave',
    saveUninitialized: true,
    resave: false,
}));

// Middleware para mensajes
app.use((req, res, next) => {
    res.locals.message = req.session.message;
    delete req.session.message;
    next();
});

// Configuración del motor de vistas
app.set('views', path.join(__dirname, './views'));
app.engine('ejs', require('ejs').__express);
app.set('view engine', 'ejs');

// Usar rutas

app.use('', router);
app.use('/upload', express.static(path.join(__dirname, 'upload')));


// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor iniciado en ${PORT}`);
});