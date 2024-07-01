'use strict'

const mongoose = require('mongoose');
const app = require('./app')
const port = 3800;

const url = 'mongodb://127.0.0.1:27017/curso_mean_social'

mongoose.Promise = global.Promise;
mongoose.set('debug', true);
mongoose.connect(url)
    .then(()=> {
        console.log('La conexion a la base de datos se realizo correctamente.')
        //Crear servidor
        app.listen(port, () => {
            console.log('Servidor corriendo en http://localhost:3800');
        })
    })
    .catch(err => console.log(err))
