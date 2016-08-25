var RtmClient = require('@slack/client').RtmClient;
var request = require('request');
var search = require('./search');
var token = require('./variables');
var _ = require('underscore');

var terms = ['image', 'images', 'picture', 'pictures', 'flickr', 'youtube', 'video', 'play', 'busca', 'google', 'web', 'search'];

var token = process.env.SLACK_API_TOKEN || token;

var rtm = new RtmClient(token, {/*logLevel: 'debug'*/});

var RTM_EVENTS = require('@slack/client').RTM_EVENTS;

var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;

rtm.start();

rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, function (rtmStartData) {
  console.log(`Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team.name}, but not yet connected to a channel`);
});

rtm.on(RTM_EVENTS.MESSAGE, function (message) {
    if(message.user){  
          var user = rtm.dataStore.getUserById(message.user);
          var dm = rtm.dataStore.getDMByName(user.name);
          var texto = message.text.split(" ");
          var query = texto[0];
          var querySource = _.without(texto, texto[0]).join(' ');
          console.log('user name, id y querySource: ', user.name, dm.id, querySource );
          if(_.indexOf(terms,query) != -1){
            rtm.sendMessage('En que dispositivo lo quieres mostrar? 1. showroom, 2. tv sala 1: ', dm.id, function (err, msg) {
              console.log('mensaje esperando respuesta: ', msg)
              rtm.updateMessage(msg, function (err, res) {
                console.log('error y respuesta: ',err, res);
              });
            });
              /*rtm.sendMessage('En que dispositivo lo quieres mostrar?: ', dm.id, function messageSent(resp1) {
                  console.log('numero de dispositivo: ', resp1);
                  rtm.sendMessage('1. showroom, 2. tv sala 1: ', dm.id, function messageSent(resp2) {
                        console.log('respuesta dispositivo: ',resp2);
                  });
                  /*search.search(query, querySource, function(err, content){
                      if(err) content = {'type': 'image', 'content': 'http://i.imgur.com/Ql6Dvqa.jpg' };
                      request.post({
                            url:'https://c67cac8a2eae1d04f5928b5b1603a36ae49eafede475c07838e278610d7e0a.resindevice.io/content',
                            json: content
                       });
                  });
               });   */
          }
          else { rtm.sendMessage('Me tienes que decir que es lo que quieres hacer ' + user.name + '!', dm.id); };
    }
});
