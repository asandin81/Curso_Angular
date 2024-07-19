'use strict'

const path = require('path')
const fs = require('fs')
const moment = require('moment')
const mongoosePaginate = require('mongoose-pagination')

 const Publication = require('../models/publication')
 const User = require('../models/user')
 const Follow = require('../models/follow')
const message = require('../models/message')
const publication = require('../models/publication')

 function savePublication(req, res){
    let params = req.body

    if(!params.text)  return res.status(200).send({message: 'Debes enviar un texto.'})
    
    let publication = new Publication()
    publication.text = params.text
    publication.file = 'null'
    publication.user = req.user.sub 
    publication.created_at = moment().unix()

    publication.save().then(publicationStored =>{
        console.log(publicationStored)

        if(!publicationStored) return res.status(404).send({message: 'La publicacion no a sido guardada'})

        return res.status(200).send({publication: publicationStored})
    }).catch(err =>{
        return res.status(500).send({message: 'Error al guardar la publicacion'})
    })

 }

 function getPublications(req, res){
    var page = 1
    if(req.params.page){
        page = req.params.page
    }

    let itemsPerPage = 4
    Follow.find({user: req.user.sub}).populate('followed').exec()
        .then(follows =>{
            var follows_clean = []
            follows.forEach(follow => {
                follows_clean.push(follow.followed)
            });
            Publication.find({user:{'$in': follows_clean}}).sort('-created_at').populate('user').paginate(page, itemsPerPage).exec()
                .then(result =>{
                    if(!result) return res.status(404).send({message: 'No hay publicaciones'})

                    Publication.countDocuments({user:{'$in': follows_clean}}).then(total => {
                        res.status(200).send({
                            total: total,
                            pages: Math.ceil(result.length/itemsPerPage),
                            publications: result
                    })
                }).catch(err =>{
                    return res.status(500).send({message: 'Error devolver el publicaciones'})
                })
            
        }).catch(err =>{
            return res.status(500).send({message: 'Error devolver el seguimiento'})
        })
    })
 }

 function getPublication(req, res){
    let publicationId = req.params.id 
    console.log(req.params)
    Publication.findById(publicationId).then(publication => {
        if(!publication) return res.status(404).send({message: 'No existe la publicacion'})
        
        return res.status(200).send({publication})
    }).catch(err =>{
        return res.status(500).send({message: 'Error devolver la publicacion'})
    })

 }

 function deletePublication(req, res){
    let publicationId = req.params.id



    Publication.findOneAndDelete({'user': req.user.sub, '_id':publicationId}).then(publicationRemoved => {
        if(!publicationRemoved)  return res.status(404).send({message: 'No se ha borrado la publicacion'})

        return res.status(200).send({publication: publicationRemoved})

    }).catch(err =>{
        return res.status(500).send({message: 'Error al borrar la publicacion'})
    })
 }

 function uploadImage(req, res){
    let publicationId = req.params.id

    if(req.files){
        
        let file_path = req.files.image.path
        console.log(file_path)
        let file_split = file_path.split('\/')
        console.log(file_split)
        let file_name = file_split[2]
        console.log(file_name)

        let ext_split = file_name.split('\.')
        let file_ext = ext_split[1]


        if(file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif'){
            // Actualizar en la BBDD
            Publication.findByIdAndUpdate(publicationId,{file:file_name}, {new:true}).exec()
                .then(publicationUpdate => {
                    if(!publicationUpdate) return res.status(404).send({message:'No se ha podido modificar el usuario'})
                        res.status(200).send({publication:publicationUpdate})
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

    let path_file = './uploads/publications/'+image_file

    fs.exists(path_file, (exists) => {
        if(exists){
            res.sendFile(path.resolve(path_file))
        }else{
            res.status(200).send({message: 'No existe la imagen...'})
        }
    })
}

 module.exports = {
    savePublication,
    getPublications,
    getPublication,
    deletePublication,
    uploadImage,
    getImageFile
 }