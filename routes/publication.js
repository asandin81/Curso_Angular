'use strict'

const express = require('express');
const PublicationController = require('../controllers/publication');
const md_auth = require('../middlewares/authentificated')

const multipart = require('connect-multiparty');
const md_upload = multipart({uploadDir: './uploads/publications'})

const api = express.Router();

api.post('/publication', md_auth.ensureAuth, PublicationController.savePublication);
api.get('/publications/:page?', md_auth.ensureAuth, PublicationController.getPublications)
api.get('/publication/:id', md_auth.ensureAuth, PublicationController.getPublication)
api.delete('/publication/:id', md_auth.ensureAuth, PublicationController.deletePublication)
api.post('/upload-image-pub/:id', [md_auth.ensureAuth, md_upload], PublicationController.uploadImage);
api.get('/get-image-pub/:imageFile', PublicationController.getImageFile)


module.exports = api