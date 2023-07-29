//Importation de jsonwebtoken :
const jsonwebtoken = require('jsonwebtoken');

//Importation de dotenv pour les variables d'environement :
const dotenv = require("dotenv").config();
const Admin = require('./../models/Admin');

module.exports = async (req, res, next) => {
   try {
      // Extracting token from the Authorization header
      const token = req.headers.authorization.split(" ")[1]; // Assumes "Bearer YOUR_JWT_TOKEN"
      const decodedToken = jsonwebtoken.verify(token, `${process.env.JWT_KEY_TOKEN}`);
      const userId = decodedToken.userId;
      
      const user = await Admin.findById(userId);

      if (!user) {
        throw "User not found"
      }
      
      // Attach the user to the req object
      req.user = user;
      next();
         
   } catch(error) {
      res.status(401).json({ 
         message: "Echec d'authentification",
         error : error
      });
   }
};