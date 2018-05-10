const request = require('request')

// Grab the Bot OAuth token from the environment.
const BOT_TOKEN = process.env.BOT_TOKEN
// Define the URL of the targeted Slack API resource.
// We'll send our replies there.
const SLACK_URL = 'https://slack.com/api/chat.postMessage'

exports.lambdaHandler = (data, context) => {
  // Handle an incoming HTTP request from a Slack chat-bot.
  if ("challenge" in data) {
   return data.challenge
  }

  // Grab the Slack event data.
  const slackEvent = data.event 

  // We need to discriminate between events generated by 
  // the users, which we want to process and handle, 
  // and those generated by the bot.
  if ("bot_id" in slackEvent) {
    console.log("Ignore bot event")
  } else {
    // Get the text of the message the user sent to the bot,
    // and reverse it.
    const text = slackEvent.text
    const reversedText = text.split('').reverse().join('') + ' JavaScript The Best'
    // Get the ID of the channel where the message was posted.
    const channelId = slackEvent.channel
    
    const body = {
      token: BOT_TOKEN,
      channel: channelId,
      text: reversedText
    }
    request.post(SLACK_URL).form(body)
  }
  return "200 OK"
}