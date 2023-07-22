//Importation du fichier User de models :
var Admin = require('../models/Admin');

//Importation de bcrypt pour hasher le password :
const bcrypt = require('bcryptjs');

//Importation de crypto-js pour chiffrer le mail :
const cryptojs = require('crypto-js');

//Importation de dotenv pour les variables d'environement :
const dotenv = require("dotenv").config();

//Importation de jsonwebtoken :
const jsonwebtoken = require('jsonwebtoken');

//Logique pour controler la validité de l'utilisateur POST (login) :
exports.logadmin = (req, res, next) => {
    //chiffrer l'email dans la base de donnée s'il existe :
    const emailCryptoJS = cryptojs.HmacSHA256(req.body.email, `${process.env.CRYPT_EMAIL}`).toString();

    Admin.findOne({email: emailCryptoJS})
         .then((user) => {
             if (!user){
                 return res.status(401).json({message: "Email not found"})
             }
 
         //le user existe on utilise la méthode compare( ) de bcrypt pour comparer le mot de passe  envoyé par l'utilisateur,
         //avec le hash qui est enregistré avec le user dans la base de donnée :
         bcrypt.compare(req.body.password, user.password)  
             .then(valid => {
                 if(!valid){
                   return res.status(401).json({ message: "Incorrect Password" });
                 }
                 else{
                     res.status(200).json({
                         userId: user._id,
                         token: jsonwebtoken.sign(
                             //user id :
                             {userId: user._id},
                             //la clé de chiffrement du token
                             `${process.env.JWT_KEY_TOKEN}`,
                             //le temps de validité du token
                             {expiresIn:'24h'}
                         )
                     })
                 }
             })
             .catch(error => res.status(500).json({message: "Server error"}));
         })
         .catch(error => res.status(500).json({message: "Server error"}));
}

//Logique POST pour enregistrer un nouvel utilisateur (signup) :
exports.creteadmin = (req, res, next) => {
    //chiffrer l'email dans la base de donnée :
    const emailCryptoJS = cryptojs.HmacSHA256(req.body.email, `${process.env.CRYPT_EMAIL}`).toString();
    //hasher le mot de passe, salet 10x combien de fois sera exécuté l'algorithme de hashage :
    bcrypt.hash(req.body.password, 10)
        .then((hash) => {
            //ce qui va être enregistré dans mongoDB :
            const user = new Admin({
                email: emailCryptoJS,
                password: hash,
            });

            //l'enregistrer dans la base de donnée :
            user.save()
                .then(() => res.status(201).json({message: "User has been created!"}))
                .catch(error => res.status(400).json({message: "Unable to create user"}))
        })
        .catch(error => res.status(500).json({error}));
};


//Logique pour changer le mot de passe de l'utilisateur PUT (change password) :
exports.changepsd = (req, res, next) => {
    // On récupère l'ID de l'utilisateur depuis le token JWT
    const userId = req.body.userId;
    console.log(userId);
    // On récupère le mot de passe actuel de l'utilisateur
    Admin.findById(userId)
      .then(user => {
        if (!user) {
          return res.status(404).json({ message: "User not found!" });
        }
  
        // On compare le mot de passe actuel de l'utilisateur avec celui fourni dans la requête
        bcrypt.compare(req.body.oldPassword, user.password, function (err, result) {
          if (err) {
            return res.status(500).json({ message: "Server error" });
          }
  
          if (!result) {
            return res.status(401).json({ message: "Incorrect password" });
          }
  
          // On hash le nouveau mot de passe fourni par l'utilisateur
          bcrypt.hash(req.body.newPassword, 10, function (err, hash) {
            if (err) {
              return res.status(500).json({ message: "Server error" });
            }
  
            // On met à jour le mot de passe de l'utilisateur dans la base de données
            Admin.updateOne({ _id: userId }, { password: hash })
              .then(() => {
                res.status(200).json({ message: "Your password has beend changed" });
              })
              .catch((error) => {
                res.status(500).json({ message: "Server error" });
              });
          });
        });
      })
      .catch((error) => {
        res.status(500).json({ message: "Server error" });
      });
  };
  

