const express = require('express')
const router = express.Router()
const articulos = require('../../models/articulos')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

const carpetaUpload = path.join(__dirname, '../upload')

var storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, carpetaUpload)
    },

    filename: function(req, file, cb){
        cb(null, Date.now() + file.originalname)
    }
})

var upload = multer({
    storage: storage
}).single('foto')

// Ruta de inicio
router.get('/',(req,res)=>{
    res.render('index', { titulo: 'Inicio'})
})

// Ruta para agregar artículo
router.get('/add',(req,res)=>{
    res.render('addArticulo', { titulo: 'Agregar artículo'})
})

// Ruta para ver el inventario
router.get('/inventario', (req, res) => {
    articulos.find() 
        .then((articulosEncontrados) => {
            res.render('inventario', { titulo: 'Inventario', articulos: articulosEncontrados }); 
        })
        .catch((error) => {
            console.log(error); 
            res.render('inventario', { titulo: 'Inventario', articulos: [] }); 
        });
});

// Ruta para agregar un artículo al inventario
router.post('/inventario', upload, (req, res) => {
    const articulo = new articulos({
        codigo: req.body.codigo,
        nombre: req.body.nombre,
        foto: req.file.filename,
        descripcion: req.body.descripcion,
        cantidad: req.body.cantidad,
        precio: req.body.precio
    })

    articulo.save().then(() => {
        req.session.message = {
            message: 'Artículo agregado correctamente!',
            type: 'success'
        }
        res.redirect('/inventario')

    }).catch((error) => {
        res.json({
            message: error.message,
            type: 'danger'
        })
    })
})

// Ruta para editar un artículo
router.get('/edit/:id', async (req, res) => {
    const id = req.params.id

    try {
        const articulo = await articulos.findById(id)
        if (articulo == null) {
            res.redirect('/inventario')
        } else {
            res.render('editarArticulo', {
                titulo: 'Editar artículo',
                articulo: articulo
            })
        }
    } catch (error) {
        res.status(500).send()
    }
})

// Ruta para actualizar un artículo
router.post('/update/:id', upload, async (req, res) => {
    const id = req.params.id
    let nuevaImagen = ''

    // Verifica si hay un archivo nuevo
    if (req.file) {
        nuevaImagen = req.file.filename
        try {
            // Elimina la imagen anterior si existe
            fs.unlinkSync('./upload/' + req.body.old_image)
        } catch (error) {
            console.log(error)
        }     
    } else {
        nuevaImagen = req.body.old_image
    }

    try {
        // Actualiza el artículo en la base de datos
        await articulos.findByIdAndUpdate(id, {
            codigo: req.body.codigo,
            nombre: req.body.nombre,
            foto: nuevaImagen,
            descripcion: req.body.descripcion,
            cantidad: req.body.cantidad,
            precio: req.body.precio  
        })
        
        req.session.message = {
            message: 'Artículo editado correctamente!',
            type: 'success'
        }
        
        res.redirect('/inventario')

    } catch (error) {
        res.json({
            message: error.message,
            type: 'danger'
        })
    }
});

// Ruta para eliminar un artículo
router.get('/delete/:id', async (req, res) => {
    const id = req.params.id
    try {
        const articulo = await articulos.findByIdAndDelete(id)
        if (articulo != null && articulo.foto != '') {
            try {
                // Elimina la imagen asociada al artículo
                fs.unlinkSync('./upload/' + articulo.foto)
            } catch (error) {
                console.log(error)
            }
        }
        req.session.message = {
            message: 'Artículo eliminado correctamente!',
            type: 'info'
        }
        res.redirect('/inventario')
    } catch (error) {
        res.json({
            message: error.message,
            type: 'danger'
        })
    }
})

module.exports = router
