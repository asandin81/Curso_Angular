'use strict'


const User = require('../models/user');
const bcrypt = require('bcrypt-nodejs');
const jwt = require('../services/jwt');
const message = require('../models/message');
const mongoosePaginate = require('mongoose-pagination')
const fs = require('fs')
const path = require('path')

function home(req, res) {
    res.status(200).send({
        message:'Accion de pruebas en el servidor de nodeJS'
    })
}

function pruebas(req, res) {
    res.status(200).send({
        message:'Accion de pruebas en el servidor de nodeJS'
    })
}

function saveUser(req, res) {
    let params = req.body;
    let user = new User();

    if(params.name && params.surname && params.nick && params.email && params.password){
        user.name = params.name
        user.surname = params.surname
        user.nick = params.nick
        user.email = params.email
        user.role = 'ROLE_USER'
        user.image = null

        User.find({ $or: [
            { email: user.email.toLowerCase() },
            {nick: user.nick.toLowerCase()}
        ]}).exec().then(users => {
            console.log(users)
            console.log(users.length)
            if(users && users.length >= 1){
                console.log('Existe el usuario')
                return res.status(200).send({message:'El usuario que intenta registrar ya existe'})
            } else {
                bcrypt.hash(params.password, null, null, async (err, hash) =>  {
                    user.password = hash
        
                     await user.save()
                        .then(userStored => {
                            res.status(200).send({user: userStored})
                        }).catch(err => {
                            res.status(500).send({message:'Error al guardar el usuario'});
                        })
                })
            }
        }).catch(err => {
            return res.status(500).send({message:'Error en la peticion de Usuarios'})
        })
        
        
         
        
    } else {
        res.status(200).send({
            message: 'Envia todos los campos necesarios!!'
        })
    }
}

function loginUser(req, res){
    let params = req.body
    let email = params.email
    let password = params.password

    User.findOne({email: email}).exec()
        .then(user =>{
            
            if(user){
                bcrypt.compare(password, user.password, (err, check) => {
                    if(check){
                        if(params.gettoken){
                            // Generar el Token
                            return res.status(200).send({token: jwt.createToken(user)})
                        }else{
                            // Devolver datos de usuario
                        user.password = undefined
                        return res.status(200).send({user})
                        }
                        
                    } else {
                        return res.status(404).send({message:'El usuario no se a podido identificar'})
                    }
                })
            }else{
                return res.status(404).send({message:'El usuario no existe'})
            }
        }).catch(err=>{
            return res.status(500).send({message:'Error en la peticion'})
        })     
}

function getUser(req, res){
    let params = req.body;
    let userId = req.params.id;

    User.findById(userId).exec().then(user =>{
        if(!user) return res.status(404).send({message:'El usuario no existe'})
            return res.status(200).send({user})
    }).catch(err =>{
        return res.status(500).send({message:'Error en la peticion'})
    });

}

function getUsers(req,res){
    let identity_user_id = req.user.sub
    var page = 1
    if(req.params.page){
        page = req.params.page
    }
    var itemsPerPage = 5

    User.find().sort('_id').paginate(page, itemsPerPage).exec()
        .then(result =>{
            console.log(result)
            if(!result.length) return res.status(404).send({message:'No hay usuarios disponibles'})
                return res.status(200).send({
                    users: result,
                    total: result.length,
                    pages: Math.ceil(result.length/itemsPerPage)
                })
        }).catch(err => res.status(500).send({message:'Error en la peticion'}))

}

function updateUser(req, res){
    let userId = req.params.id
    let update = req.body

    delete update.password
    if(userId != req.user.sub){
        return res.status(500).send({message:'No tienes permiso para modificar este usuario.'})
    }

    User.findByIdAndUpdate(userId, update, {new:true}).exec()
        .then(userUpdate =>{
            if(!userUpdate) return res.status(404).send({message:'No se ha podido modificar el usuario'})
            res.status(200).send({user:userUpdate})
        }).catch(err => res.status(500).send({message:'Error en la peticion'}))
}

function uploadImage(req, res){
    let userId = req.params.id

    if(req.files){
        
        let file_path = req.files.image.path
        console.log(file_path)
        let file_split = file_path.split('\/')
        console.log(file_split)
        let file_name = file_split[2]
        console.log(file_name)

        let ext_split = file_name.split('\.')
        let file_ext = ext_split[1]

        if(userId != req.user.sub){
            return removeFilesOfUpload(res, file_path, 'No tienes permisos para modificar la imagen.')
        }

        if(file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif'){
            // Actualizar en la BBDD
            User.findByIdAndUpdate(userId,{image:file_name}, {new:true}).exec()
                .then(userUpdate => {
                    if(!userUpdate) return res.status(404).send({message:'No se ha podido modificar el usuario'})
                        res.status(200).send({user:userUpdate})
                }).catch(err => res.status(500).send({message:'Error en la peticion'}))
        }else{
            return removeFilesOfUpload(res, file_path, 'La extension no es valida.')
            
        }


    } else {
        return res.status(200).send({message:'No se han subido archivos.'})
    }

}

function removeFilesOfUpload(res, file_path, message){
    fs.unlink(file_path, (err) => {
        return res.status(500).send({message: message})
    })
}

function getImageFile(req, res){
    let image_file = req.params.imageFile;

    let path_file = './uploads/users/'+image_file

    fs.exists(path_file, (exists) => {
        if(exists){
            res.sendFile(path.resolve(path_file))
        }else{
            res.status(200).send({message: 'No existe la imagen...'})
        }
    })
}



module.exports = {
    home,
    pruebas,
    saveUser,
    loginUser,
    getUser,
    getUsers,
    updateUser,
    uploadImage,
    getImageFile,
}