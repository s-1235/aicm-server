  const fs = require('fs');
  const path = require('path');

  const userInteraction = require('../models/UserInteraction');
  const Stats = require('../models/Stats');

  //Interactions function
  exports.interactions = (req, res, next) => {
      userInteraction.find()
      .then(interactions => res.status(200).json(interactions))
      .catch(error => res.status(400).json({error}));
  }
      
  //Update statistics bot
  exports.updateStats = (req, res, next) => {
      const { maxresult } = req.body;
      if (0 < maxresult && maxresult < 101 && Number.isInteger(maxresult)) {
          const configFilePath = path.join(__dirname, '../config.js');
          const configData = require(configFilePath);

          // Update the value in memory
          configData.stats.max_result = maxresult;

          // Write the updated value to the config.js file
          const updatedConfigFileContent = `module.exports = ${JSON.stringify(configData, null, 2)};\n`;
          fs.writeFileSync(configFilePath, updatedConfigFileContent, 'utf8');
          res.status(200).json({ message: 'Statistic bot has been updated' });
      } else if (!Number.isInteger(maxresult)) {
          return res.status(401).json({message: "Maxresult must be an integer!"})
      } else {
          return res.status(401).json({message: "Maxresult must be less than 100 and greater than 1!"})
      }
  }

  exports.getStats = (req, res, next) => {
      // Get the last 10 records from the database
      Stats.find()
        .sort({ date: -1 })
        .limit(10)
        .then((stats) => {
          if (stats.length < 1) {
            // No statistics found
            return res.status(404).json({ error: 'No statistics found.' });
          } else if (stats.length < 7) {
            //implement data binding depending 
          }
    
          // Calculate the percentage change for each metric
          const currentStats = stats[0];
          const previousDayStats = stats[1];
          const previousWeekStats = stats[6];
    
          const percentageChangeDay = {
            dayfollowers: calculatePercentageChange(currentStats.followers, previousDayStats.followers),
            dayviews: calculatePercentageChange(currentStats.views, previousDayStats.views),
            daylikes: calculatePercentageChange(currentStats.likes, previousDayStats.likes),
            daycomments: calculatePercentageChange(currentStats.comments, previousDayStats.comments),
            dayretweets: calculatePercentageChange(currentStats.retweets, previousDayStats.retweets),
          };

          const percentageChangeWeek = {
              weekfollowers: calculatePercentageChange(currentStats.followers, previousWeekStats.followers),
              weekviews: calculatePercentageChange(currentStats.views, previousWeekStats.views),
              weeklikes: calculatePercentageChange(currentStats.likes, previousWeekStats.likes),
              weekcomments: calculatePercentageChange(currentStats.comments, previousWeekStats.comments),
              weekretweets: calculatePercentageChange(currentStats.retweets, previousWeekStats.retweets),
            };
    
          res.status(200).json({
            currentStats,
            percentageChangeDay,
            percentageChangeWeek
          });
        })
        .catch((error) => {
          console.error('Error retrieving statistics:', error);
          res.status(500).json({ message: 'An error occurred while retrieving statistics.' });
        });
    };
    
  // Helper function to calculate percentage change
  function calculatePercentageChange(currentValue, previousValue) {
      if (previousValue === 0) {
          return currentValue === 0 ? 0 : 100;
      }

      return ((currentValue - previousValue) / previousValue) * 100;
  }
