'use strict'

var path = require('path');
var fs = require('fs');
var Artist = require('../models/artist');
var Album = require('../models/album');
var Song = require('../models/song');
var mongoosePaginate = require('mongoose-pagination');


function getAlbum(req, res) {
	var albumId = req.params.id;

	Album.findById(albumId).populate({path: 'artist'}).exec((err, album) => {
		if (err) {
			res.status(500).send({ message: 'Error en el servidor'});
		} else {
			if (!album) {
				res.status(404).send({ message: 'El album no existe'});
			} else {
				res.status(200).send({album});
			}
		}
	});
}

function saveAlbum(req, res) {
	var album = new Album();

	var params = req.body;
	album.title = params.title;
	album.description = params.description;
	album.year = params.year;
	album.image = 'null';
	album.artist = params.artist;

	if (album.title != null){
		album.save((err, albumStored) => {
			if (err) {
				res.status(500).send({ message: 'Error en el servidor'});
			} else {
				if (!albumStored) {
					res.status(404).send({ message: 'El album no pudo ser guardado'});
				} else {
					res.status(200).send({ album: albumStored });
				}
			}
		});
	} else {
		res.status(500).send({ message: 'Error en el request'});
	}
}

function getAlbums(req, res) {
	var artistId = req.params.artist;

	if (!artistId) {
		//sacar todos los albums de la base de datos
		var find = Album.find({}).sort('title');
	} else {
		//sacar los albums de un artista concreto de la base de datos
		var find = Album.find({artist: artistId}).sort('year');
	}

	find.populate({path: 'artist'}).exec((err, albums) => {
		if (err) {
			res.status(500).send({ message: 'Error en la peticion'});
		} else {
			if (!albums) {
				res.status(404).send({ message: 'No hay artistas'});
			} else {
				return res.status(200).send({ albums });
			}
		}
	});
}

function updateAlbum (req, res) {
	var albumId = req.params.id;
	var update = req.body;

	Album.findByIdAndUpdate(albumId, update, (err, albumUpdated) => {
		if (err) {
			res.status(500).send({ message: 'Error en la peticion'});
		} else {
			if (!albumUpdated) {
				res.status(404).send({ message: 'El album no ha sido actualizado'});
			} else {
				return res.status(200).send({ album: albumUpdated });
			}
		}
	});
}

function deleteAlbum(req, res) {
	var albumId = req.params.id;

	Album.findByIdAndRemove(albumId, (err, albumRemoved) => {
		if (err) {
			res.status(500).send({ message: 'Error en la peticion'});
		} else {
			if (!albumRemoved) {
				res.status(404).send({ message: 'El album no ha sido eliminado'});
			} else {
				Song.find({album: albumRemoved._id}).remove((err, songRemoved) => {
					if (err) {
						res.status(500).send({ message: 'Error en la peticion'});
					} else {
						if (!songRemoved) {
							res.status(404).send({ message: 'La cancion no ha sido eliminada'});
						} else {
							return res.status(200).send({ album: albumRemoved });
						}
					}
				});
			}
		}
	});
}

function uploadImage(req, res) {
	var albumId = req.params.id;
	var file_name = 'No subido ...';

	if (req.files) {
		var file_path = req.files.image.path;
		var file_split = file_path.split('\\');
		var file_name = file_split[2];

		var ext_split = file_name.split('\.');
		var file_ext = ext_split[1];

		if (file_ext.toLowerCase() == 'png' || file_ext.toLowerCase() == 'jpg' || file_ext.toLowerCase() == 'gif'){
			Album.findByIdAndUpdate(albumId, {image: file_name}, (err, albumUpdated) => {
				if (!albumUpdated) {
					res.status(404).send({ message: 'No se ha podido actualizar el album' });
				} else {
					res.status(200).send({album: albumUpdated});
				}
			});
		} else {
			res.status(500).send({ message: 'Extension del archivo no valida'});
		}	

	} else {
		res.status(500).send({ message: 'No ha subido ninguna imagen'});
	}

}

function getImageFile(req, res){
	var imageFile = req.params.imageFile;
	var path_file = './uploads/albums/' + imageFile;
	console.log(path_file);
	fs.exists(path_file, function (existe) {
		if (existe) {
			res.sendFile(path.resolve(path_file));
		} else {
			res.status(500).send({ message: 'No existe la imagen'});
		}
	});
}

module.exports = {
	getAlbum,
	saveAlbum,
	getAlbums,
	updateAlbum,
	deleteAlbum,
	uploadImage,
	getImageFile
};	