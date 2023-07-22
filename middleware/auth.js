//Importation de jsonwebtoken :
const jsonwebtoken = require('jsonwebtoken');

//Importation de dotenv pour les variables d'environement :
const dotenv = require("dotenv").config();

 

module.exports = (req, res, next) => {
   try {
      const token = req.cookies.authToken;
      const decodedToken = jsonwebtoken.verify(token, `${process.env.JWT_KEY_TOKEN}`);
      const userId = decodedToken.userId;   
         
      if (req.cookies.userId && req.cookies.userId !== userId) {
         throw "erreur identification userId"
      }
      
      else{
         next();
      }
         
   } 
   
   catch(error) {
      res.status(401).json({ 
         message: "Echec d'authentification",
         error : error
      });
   }
};