//Importation de Mongoose :
const mongoose = require('mongoose');

//Importation de dotenv pour les variables d'environement :
const dotenv = require("dotenv").config();

//Conection de mongoDB à l'API grâce à mongoose :
mongoose.set('strictQuery', true)
mongoose.connect(`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_CLUSTER}.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`,
    { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB s\'est connecté avec succée !'))
    .catch((error) => console.log('MongoDB n\'est pas connecté !', error)) 

//Exportation mongoose :    
module.exports = mongoose;