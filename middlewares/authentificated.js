'use strict'

const jwt = require('jwt-simple');
const moment = require('moment');
const message = require('../models/message');

const secret = 'clave-secreta-curso-desarrollar-red-social-angular'

exports.ensureAuth = function(req, res, next){
    if(!req.headers.authorization){
        return res.status(403).send({message: 'La peticion no tiene token de autentificacion'})
    }
    let token = req.headers.authorization.replace(/['"']+/g, '');

    try{
        var playload = jwt.decode(token, secret);
        if(playload.exp <= moment().unix()){
            return res.status(401).send({message: 'El token a expirado'})
        }
        
    }catch(ex){
        return res.status(404).send({message: 'El token no es valido'})
    }

    req.user = playload;
        next();
    
    
}