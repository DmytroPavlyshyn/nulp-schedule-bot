const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const { createMessageAdapter } = require('@slack/interactive-messages');
const { WebClient } = require('@slack/client');
const { users, neighborhoods } = require('./models');
const axios = require('axios');
const cheerio = require('cheerio')
const request = require('request')

var inst = []
var kafs = []
var namesOfTeachers = []
var groups = []
var chosenInstValue = "1"
var chosenGroupValue = "1"
var chosenKafValue = "1"
var chosenTeacherValue = "1"
var timetableURL = "http://lp.edu.ua/rozklad-dlya-studentiv?inst=8&group=11241&semestr=1&semest_part=1"








 








// Read the verification token from the environment variables
const slackVerificationToken = process.env.SLACK_VERIFICATION_TOKEN;
const slackAccessToken = process.env.SLACK_ACCESS_TOKEN;
if (!slackVerificationToken || !slackAccessToken) {
  throw new Error('Slack verification token and access token are required to run this app.');
}

// Create the adapter using the app's verification token
const slackInteractions = createMessageAdapter(slackVerificationToken);

// Create a Slack Web API client
const web = new WebClient(slackAccessToken);

// Initialize an Express application
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

// Attach the adapter to the Express application as a middleware
app.use('/slack/actions', slackInteractions.expressMiddleware());

// Attach the slash command handler
app.post('/slack/commands', slackSlashCommand);

// Start the express application server
const port = process.env.PORT || 0;
http.createServer(app).listen(port, () => {
  console.log(`server listening on port ${port}`);
});

// Slack interactive message handlers
slackInteractions.action('accept_tos', (payload, respond) => {
  console.log(`The user ${payload.user.name} in team ${payload.team.domain} pressed a button`);

  // Use the data model to persist the action
  users.findBySlackId(payload.user.id)
    .then(user => user.TeacherOrStudent(payload.actions[0].value === 'stud'))
    .then((user) => {
      // After the asynchronous work is done, call `respond()` with a message object to update the
      // message.
      let choice_;
      if (user.TeachOrStud) {
        //student
        timetableURL = "http://lp.edu.ua/rozklad-dlya-studentiv?inst=8&group=11241&semestr=1&semest_part=1"
        request(timetableURL, function (error, response, body) {
          var $ = cheerio.load(body);
            $('#stud select[name="inst"]').find('option').each((index, option) => {
              const $option = $(option)
              const value=$option.attr('value');
              if (value){
                  inst.push({
                      value,
                      text: $option.text()
                  })  
              }
          });
        });
        console.log(inst)
        respond(interactiveMenuInst)
      } else {
        //teacher
        timetableURL="http://lp.edu.ua/rozklad-dlya-vykladachiv?kaf=8557&fnsn=%D0%91%D1%80%D0%B8%D0%BB%D0%B8%D0%BD%D1%81%D1%8C%D0%BA%D0%B8%D0%B9+%D0%A0%D0%BE%D0%BC%D0%B0%D0%BD&semestr=1&semest_part=1"
        request(timetableURL, function (error, response, body) {
          var $ = cheerio.load(body);
            $('#vykl select[name="kaf"]').find('option').each((index, option) => {
              const $option = $(option)
              const value=$option.attr('value');
              if (value){
                  kafs.push({
                      value,
                      text: $option.text()
                  })  
              }
          });
        });
        console.log(kafs)
        respond(interactiveMenuKaf)
      }
      respond({ text: choice_ });
    })
    .catch((error) => {
      // Handle errors
      console.error(error);
      respond({
        text: 'An error occurred while recording your choice.'
      });
    });

  // Before the work completes, return a message object that is the same as the original but with
  // the interactive elements removed.
  const reply = payload.original_message;
  delete reply.attachments[0].actions;
  return reply;
});





slackInteractions
  .options({ callbackId: 'pick_inst', within: 'interactive_message' }, (payload) => {
    console.log(`The user ${payload.user.name} in team ${payload.team.domain} has requested options`);



    


      console.log(inst)
      return {
        options: inst
      }
  })
  .action('pick_inst', (payload, respond) => {
    console.log(`The user ${payload.user.name} in team ${payload.team.domain} selected from a menu`);

    inst=[];
    console.log(inst)

    




    chosenInstValue=payload.actions[0].selected_options[0].value;
    
    timetableURL="http://lp.edu.ua/rozklad-dlya-studentiv?inst="+chosenInstValue+"&group=&semestr=1&semest_part=1";

    request(timetableURL, function (error, response, body) {
      var $ = cheerio.load(body);
      $('#stud select[name="group"]').find('option').each((index, option) => {
          const $option = $(option)
          const value=$option.attr('value');
          groups.push({
              value,
              text: $option.text()
          })
      });
    });
    respond(interactiveMenuGroup)
      .catch((error) => {
        console.error(error);
        respond({
          text: 'An error occurred while finding the neighborhood.'
        });
      });

    const reply = payload.original_message;
    delete reply.attachments[0].actions;
    return reply;
  });






  slackInteractions
  .options({ callbackId: 'pick_group', within: 'interactive_message' }, (payload) => {
    console.log(`The user ${payload.user.name} in team ${payload.team.domain} has requested options`);
    console.log(groups)
      return {
        options: groups
      }
  })
  .action('pick_group', (payload, respond) => {
    console.log(`The user ${payload.user.name} in team ${payload.team.domain} selected from a menu`);
    chosenGroupValue=payload.actions[0].selected_options[0].value;
    
    groups=[]
    console.log(groups)
    respond({
        text: "http://lp.edu.ua/rozklad-dlya-studentiv?inst="+chosenInstValue+"&group="+chosenGroupValue+"&semestr=1&semest_part=1"
    })
      .catch((error) => {
        console.error(error);
        respond({
          text: 'An error occurred while finding the neighborhood.'
        });
      });
    
    const reply = payload.original_message;
    delete reply.attachments[0].actions;
    return reply;
  });






  slackInteractions
  .options({ callbackId: 'pick_kaf', within: 'interactive_message' }, (payload) => {
    console.log(`The user ${payload.user.name} in team ${payload.team.domain} has requested options`);


   



      return {
        options: kafs
      }
  })
  .action('pick_kaf', (payload, respond) => {
    console.log(`The user ${payload.user.name} in team ${payload.team.domain} selected from a menu`);
    kafs=[]


    




    chosenKafValue=payload.actions[0].selected_options[0].value;
    console.log(chosenKafValue)
    timetableURL="http://lp.edu.ua/rozklad-dlya-vykladachiv?kaf="+chosenKafValue+"&fnsn=&semestr=1&semest_part=1"

    request(timetableURL, function (error, response, body) {
      var $ = cheerio.load(body);
      $('#vykl select[name="fnsn"]').find('option').each((index, option) => {
          const $option = $(option)
          const value=$option.attr('value');
          namesOfTeachers.push({
              value,
              text: $option.text()
          })
      });
    });
    respond(interactiveMenuTeachers)
      .catch((error) => {
        console.error(error);
        respond({
          text: 'An error occurred while finding the neighborhood.'
        });
      });

    const reply = payload.original_message;
    delete reply.attachments[0].actions;
    return reply;
  });




  slackInteractions
  .options({ callbackId: 'pick_teach', within: 'interactive_message' }, (payload) => {
    console.log(`The user ${payload.user.name} in team ${payload.team.domain} has requested options`);

      return {
        options: namesOfTeachers
      }
  })
  .action('pick_teach', (payload, respond) => {
    console.log(`The user ${payload.user.name} in team ${payload.team.domain} selected from a menu`);
    chosenTeacherValue=payload.actions[0].selected_options[0].value;
    namesOfTeachers =[];
    var link=chosenTeacherValue.replace(/ /g, '+')
    kafs=[]
    namesOfTeachers=[]
    respond({
        text: "http://lp.edu.ua/rozklad-dlya-vykladachiv?kaf="+chosenKafValue+"&fnsn="+ link +"&semestr=1&semest_part=1"
    })
      .catch((error) => {
        console.error(error);
        respond({
          text: 'An error occurred while finding the neighborhood.'
        });
      });
    
    const reply = payload.original_message;
    delete reply.attachments[0].actions;
    return reply;
  });




// Example interactive messages
const interactiveButtons = {
  text: 'Are you looking for student`s or teacher`s schedule?',
  response_type: 'in_channel',
  attachments: [{
    text: '',
    callback_id: 'accept_tos',
    actions: [
      {
        name: 'accept_tos',
        text: 'Student',
        value: 'stud',
        type: 'button',
        style: 'primary',
      },
      {
        name: 'accept_tos',
        text: 'Teacher',
        value: 'teach',
        type: 'button',
        style: 'primary',
      },
    ],
  }],
};

const interactiveMenuInst = {
  text: 'Choose institute.',
  response_type: 'in_channel',
  attachments: [{
    text: '',
    callback_id: 'pick_inst',//pick_sf_neighborhood
    actions: [{
      name: 'institute',//neighborhood
      text: 'Choose an institute',//choose a neighborhood
      type: 'select',
      data_source: 'external',
    }],
  }],
};

const interactiveMenuGroup = {
  text: 'Choose group.',
  response_type: 'in_channel',
  attachments: [{
    text: '',
    callback_id: 'pick_group',//pick_sf_neighborhood
    actions: [{
      name: 'group',//neighborhood
      text: 'Choose a group',//choose a neighborhood
      type: 'select',
      data_source: 'external',
    }],
  }],
};

const interactiveMenuKaf = {
  text: 'Choose kaf',
  response_type: 'in_channel',
  attachments: [{
    text: '',
    callback_id: 'pick_kaf',//pick_sf_neighborhood
    actions: [{
      name: 'kafedra',//neighborhood
      text: 'Choose a kafedra',//choose a neighborhood
      type: 'select',
      data_source: 'external',
    }],
  }],
};

const interactiveMenuTeachers = {
  text: 'Choose teacher',
  response_type: 'in_channel',
  attachments: [{
    text: '',
    callback_id: 'pick_teach',//pick_sf_neighborhood
    actions: [{
      name: 'teacher',//neighborhood
      text: 'Choose teacher`s name',//choose a neighborhood
      type: 'select',
      data_source: 'external',
    }],
  }],
};



// Slack slash command handler
function slackSlashCommand(req, res, next) {
  if (req.body.token === slackVerificationToken && req.body.command === '/interactive-example') {
    const type = req.body.text.split(' ')[0];
    if (type === 'button') {
      res.json(interactiveButtons);
    } else if (type === 'menu') {
      res.json(interactiveMenu);
    } else {
      res.send('Use this command followed by `button`, `menu`, or `dialog`.');
    }
  } else {
    next();
  }
}

// Helpers
function formatNeighborhoodsAsOptions(neighborhoods) {
  return {
    options: neighborhoods.map(n => ({ text: n.name, value: n.name })),
  };
}

function validateKudosSubmission(submission) {
  let errors = [];
  if (!submission.comment.trim()) {
    errors.push({
      name: 'comment',
      error: 'The comment cannot be empty',
    });
  }
  if (errors.length > 0) {
    return { errors };
  }
}
