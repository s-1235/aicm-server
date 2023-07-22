const fs = require('fs');
const path = require('path');

const config = require('../config');

const Welcoming = require('../models/Welcoming');

//Get message in config
exports.getWelcoming = (req, res, next) => {
    Welcoming.find()
        .then(welcomings => {
            const inverseWelcomings = welcomings.reverse();
            res.status(200).json(inverseWelcomings);
        })
        .catch(() => res.status(400).json({message : "Failed to load welcomings"}))
}

//Update mess in config
exports.updateMess = (req, res, next) => {
    const { mess } = req.body;
    try {
        const configFilePath = path.join(__dirname, '../config.js');
        const configData = require(configFilePath);

        // Update the value in memory
        configData.welcoming.message = mess;

        // Write the updated value to the config.js file
        const updatedConfigFileContent = `module.exports = ${JSON.stringify(configData, null, 2)};\n`;
        fs.writeFileSync(configFilePath, updatedConfigFileContent, 'utf8');
        res.status(200).json({ message: 'Message updated' });
    } catch (error) {
        console.log("Problem when saving new mess");
        res.status(500).json({ message: 'Failed to update message' });
    }
}

//Get message in config
exports.getMess = (req, res, next) => {
    res.status(200).json(config.welcoming.message);
}



