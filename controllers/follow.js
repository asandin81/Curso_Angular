'use strict'

// const path = require('path')
// const fs = require('fs')
const mongoosePaginate = require('mongoose-pagination')

const User = require('../models/user')
const Follow = require('../models/follow')
const message = require('../models/message')

function prueba(req, res){
    res.status(200).send({message: 'Hola munudo desde el controlador follows'})
}

function saveFollow(req,res){
    let params = req.body
    let follow = new Follow()
    follow.user = req.user.sub
    follow.followed = params.followed

    follow.save().then(followStored => {
        if(!followStored) return res.status(404).send({message:'El seguimiento no se ha guardado'})
        return res.status(200).send({follow: followStored})
    }).catch(err => {
        return res.status(500).send({message: 'Error al guardar el seguimeinto.'})
    })
}

function deleteFollow(req,res){    
    let userId = req.user.sub
    let followedId = req.params.id
    
    Follow.findOneAndDelete({'user':userId, 'followed': followedId}).then(() => {
        return res.status(200).send('El follow se ha eliminado')
    }).catch(err =>{
        res.status(500).send({message: 'Error al dejar de seguir.'})
    })
}

function getFollowingUsers(req,res){    
    let userId = req.user.sub

    if(req.params.id && req.params.page){
        userId = req.params.id
    }

    var page = 1
    if(req.params.page){
        page = req.params.page
    } else {
        page = req.params.id
    }

    var itemsPerPage = 4;

    Follow.find({user:userId}).populate({path:'followed'}).paginate(page, itemsPerPage).exec()
        .then(result => {
            if(!result) return res.status(404).send({message:'No estas siguiendo a ningun usuario'})
            Follow.countDocuments({user:userId}).then(total => {
                res.status(200).send({
                    total: total,
                    pages: Math.ceil(result.length/itemsPerPage),
                    follows: result
            })
        })
    }).catch(err => {
            res.status(500).send({message: 'Error en el servidor'})
        })

}

function getFollowedUsers(req, res){
    let userId = req.user.sub

    if(req.params.id && req.params.page){
        userId = req.params.id
    }

    var page = 1
    if(req.params.page){
        page = req.params.page
    } else {
        page = req.params.id
    }

    var itemsPerPage = 4;

    Follow.find({followed:userId}).populate('user, followed').paginate(page, itemsPerPage).exec()
        .then(result => {
            if(!result) return res.status(404).send({message:'No estas siguiendo a ningun usuario'})
            Follow.countDocuments({followed:userId}).then(total => {
                res.status(200).send({
                    total: total,
                    pages: Math.ceil(result.length/itemsPerPage),
                    follows: result
            })
        })
    }).catch(err => {
            res.status(500).send({message: 'Error en el servidor'})
        })
}

function getMyFollows(req, res){
    let userId = req.user.sub
    

    var find = Follow.find({user: userId})

    if(req.params.followed){
        find = Follow.find({followed: userId})
    }
    find.populate('user followed').exec()
        .then(follows => {
            res.status(200).send({follows})
        }).catch(err => {
            res.status(500).send({message: 'Error en el servidor'})
        });
}


module.exports = {
    prueba,
    saveFollow,
    deleteFollow,
    getFollowingUsers,
    getFollowedUsers,
    getMyFollows
}

