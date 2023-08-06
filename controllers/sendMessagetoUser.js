const { TwitterApi } = require('twitter-api-v2');


const client = new TwitterApi({
  appKey: process.env.API_KEY_TWITTER,
  appSecret: process.env.API_KEY_SECRET_TWITTER,
  accessToken: '3165205576-6pi4KeDoavIA7CF4UCiBJ7sZY2CpJpBa9xRcofc',
  accessSecret: 'VJ49GQW0u0njjORb1mw0uVVdGgmkjn7gGS3dZtHkYn5Cn',
});

exports.sendDirectGroupMessages = async (req, res, next) => {
  const recipient_ids = req.body.recipient_ids;
  const text = req.body.text;

  if (recipient_ids.length < 2 || !text ) {
    return res.status(400).json({ error: 'You must provide a recipient ID and a message text.' });
  }

  try {
    const messageData = {
        conversation_type: 'Group',
        participant_ids: recipient_ids,
        message: {  
            text: text,
        },
    };
    const response = await client.readWrite.v2.createDmConversation(messageData);
    res.status(200).json(response);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(error.code).json({ message: error.data.detail });
  }
};

exports.sendDirectMessage = async (req, res, next) => {
    const participant_id = req.body.recipient_id;
    const text = req.body.text;
  
    if (!participant_id || !text ) {
      return res.status(400).json({ error: 'You must provide a recipient ID and a message text.' });
    }
  
    try {
      const messageData = {
        text: text,
      };
      const response = await client.readWrite.v2.sendDmToParticipant(participant_id, messageData);
      res.status(200).json(response);
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(error.code).json({ message: error.detail });
    }
};