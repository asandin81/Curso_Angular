'use strict'

const jwt = require('jwt-simple');
const moment = require('moment');
const secret = 'clave-secreta-curso-desarrollar-red-social-angular'

exports.createToken = function(user){
    let playload = {
        sub: user._id,
        name: user.name,
        surname: user.surname,
        email: user.email,
        nick: user.nick,
        role: user.role,
        image: user.image,
        iat: moment().unix(),
        exp: moment().add(30,'days').unix()
    };
    return jwt.encode(playload, secret );
}