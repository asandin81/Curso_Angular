'use strict'

const express = require('express');
const bodyParser = require('body-parser');

const app = express()


// cargar rutas
const user_routes = require('./routes/user')
const follow_routes = require('./routes/follow')
const publication_routes = require('./routes/publication')

//Middlewares
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

//Cors


//Rutas
app.use('/api', user_routes)
app.use('/api', follow_routes)
app.use('/api', publication_routes)


module.exports = app