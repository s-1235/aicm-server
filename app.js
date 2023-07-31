//Importation de Express :
const express = require('express');

//Importation de morgan (logger http) :
const morgan = require("morgan");

//Importation conexion base de donnée mongoDB :
const mongoose = require('./mongoDB/db');

//Importation du path de notre serveur :
const path = require('path');

//Importation de helmet :
const helmet = require("helmet");

//CORS
const cors = require('cors');

const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now());
    }
  });
  
  var upload = multer({ storage: storage });
  




//Importation de fichier user.js de routes :
const userRoutes = require('./routes/user');
const twitterRoutes = require('./routes/twitter');


//Appel de Express pour crée une application :
const app = express();
const cookieParser = require('cookie-parser');

//logger les requests et les responses :
app.use(morgan('dev'));

// Enable CORS 
app.use(cors());

// in your Express app setup:
app.use(upload.array('imageData', 'tweetContent')); // for parsing multipart/form-data

// CORS configuration:
// app.use((req, res, next) => {
//     res.setHeader('Access-Control-Allow-Origin', 'https://aicmiranfree.online'); 
//     res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
//     res.setHeader('Access-Control-Allow-Credentials', 'true'); 
//     next();
//   });



//Utilisation de la fonction express.json() grâce à Express pour récupérer les requêtes et les afficher en format json :
app.use(express.json());
app.use(cookieParser());

// utilisation du module 'helmet' pour la sécurité en protégeant l'application de certaines vulnérabilités :
app.use(helmet({crossOriginResourcePolicy: false,}));



//Routes :
app.use('/api/auth', userRoutes);
app.use('/api/twitter', twitterRoutes);


//Exportation du fichier app.js :
module.exports = app;


