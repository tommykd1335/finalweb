const mongoose = require('mongoose')
const articuloSchema = new mongoose.Schema({
   codigo:{
    type: String,
    required: true
   },
   nombre:{
      type: String,
      required: true
   },
   foto:{
      type: String,
      required: true
   },
   descripcion:{
      type: String,
      required: true
   },
   cantidad:{
      type: String,
      required: true
   },
   precio:{
      type: String,
      required: true
   },
   created:{
      type: String,
      required: true,
      default: Date.now
   }
})
const articulos = mongoose.model('articulos', articuloSchema)
module.exports = articulos