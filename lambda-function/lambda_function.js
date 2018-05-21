const request = require('request')
const cheerio = require("cheerio")

const BOT_TOKEN = process.env.BOT_TOKEN

const SLACK_URL = 'https://slack.com/api/chat.postMessage'
const timetableURL = "http://lp.edu.ua/rozklad-dlya-studentiv?inst=8&group=11241&semestr=1&semest_part=1"

const inst = []
const groups = []
const chosenInst = []
const chosenGroup = []

exports.lambdaHandler = (data, context) => {

  if ("challenge" in data) {
   return data.challenge
  }

  const slackEvent = data.event 

  if ("bot_id" in slackEvent) {
    console.log("Ignore bot event")
  } else {
    
   request(url, function (error, response, body) {
    if (!error) {
        var $ = cheerio.load(body);
        $('#stud select[name="inst"]').find('option').each((index, option) => {
          const $option = $(option)
          const value=$option.attr('value');
          if (value){
              inst.push({
                  value,
                  name: $option.text()
              })  
          }
      });
  
      $('#stud select[name="group"]').find('option').each((index, option) => {
          const $option = $(option)
          const value=$option.attr('value');
          groups.push({
              value,
              name: $option.text()
          })
      });
    } else {
      console.log("Ignore bot event")
    }
});

    

    const text=slackEvent.text;
    const i = 0;
    while(text[i]!=' '){
      chosenInst.push(text[i]);
      i++;
    }
    i++;
    while(text[i]!=' '){
      chosenGroup.push(text[i]);
      i++;
    }

    var instId = 0;
    for (var i = 0, len = inst.length; i < len; i++) {
        if(inst[i].name==chosenInst){
          instId=inst[i].value;
          break;
        }
    }

    var groupId = 0;
    for (var i = 0, len = inst.length; i < len; i++) {
        if(group[i].name==chosenGroup){
          grouId=group[i].value;
          break;
        }
    }
    const respondText="http://lp.edu.ua/rozklad-dlya-studentiv?inst="+instId+"&group="+groupId+"&semestr=1&semest_part=1";
  const body = {
      token: BOT_TOKEN,
      channel: channelId,
      text: respondText
    }
    
    request.post(SLACK_URL).form(body)
  }
  return "200 OK"
}