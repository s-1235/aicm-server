//Importation de Express :
const express = require('express');

//Appel de Express pour crée le router de chaque midellware :
const router = express.Router();

//Importation de fichier user.js de controllers :
const userControllers = require('../controllers/user');

//importation du middleware/password :
const password = require('../middleware/password');


//Router POST (admin):
router.post('/logadmin', userControllers.logadmin);
router.post('/createadmin', password.psdmidadduser, userControllers.creteadmin);
router.put('/changepsd', password.changepsdmid, userControllers.changepsd);


//Exportation du fichier user.js de routes :
module.exports = router;