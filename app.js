'use strict'

const express = require('express');
const bodyParser = require('body-parser');

const app = express()


// cargar rutas
const user_routes = require('./routes/user')

//Middlewares
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

//Cors


//Rutas
app.use('/api', user_routes)



module.exports = app