var RtmClient = require('@slack/client').RtmClient;
var request = require('request');
var search = require('./search');
var tokenLibrary = require('./variables');
var _ = require('underscore');
var nextStep = false;

var response = {};

var terms = ['image', 'images', 'picture', 'pictures', 'flickr', 'youtube', 'video', 'play', 'busca', 'google', 'web', 'search'];

var token = process.env.SLACK_API_TOKEN || tokenLibrary.apiSlack;

var rtm = new RtmClient(token, {/*logLevel: 'debug'*/});

var RTM_EVENTS = require('@slack/client').RTM_EVENTS;

var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;

rtm.start();

rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, function (rtmStartData) {
  console.log(`Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team.name}, but not yet connected to a channel`);
});

rtm.on(RTM_EVENTS.MESSAGE, function (message) {
    if(message.user && message.user != 'U242HLVFU'){ 
          var checkResponse =  parseInt(message.text); 
          response.user = rtm.dataStore.getUserById(message.user);
          response.dm = rtm.dataStore.getDMByName(response.user.name);
          response.texto = message.text.split(" ");
          if(!isNaN(checkResponse) && nextStep && checkResponse < 3) {
                console.log('mensaje original: ', checkResponse, response.query, response.querySource );
                if(checkResponse == 1) var device = 'Showroom.1';
                else if(checkResponse == 2) var device = 'tv.1';
                search.search(response.query, response.querySource, function(err, content){
                       content.screen = device; 
                       console.log('contenido a enviar: ', content); 
                       request.post({
                            url: tokenLibrary.baseUrl+'/content',
                            json: content
                       });
                });
                rtm.sendMessage('enviando '+ response.query +' a la pantalla '+ device, response.dm.id);  
          }
          else if( isNaN(checkResponse)){
                response.querySource = response.texto[0];
                if(_.indexOf(terms,response.querySource) != -1){
                    nextStep = true;
                    console.log(message.text);
                    response.query = _.without(response.texto, response.texto[0]).join(' ');
                        rtm.sendMessage('En que dispositivo lo quieres mostrar? _*1.*_:    showroom, _*2.*_:    tv sala 1: ', response.dm.id, function (err, msg) {
                         
                    });
                }
                else {
                        rtm.sendMessage(">utiliza *'youtube'*, *'video'* o *'play'* seguido del termino que quieras encontrar para reproducir un _*video*_.", response.dm.id);
                        rtm.sendMessage(">utiliza *'image'*, *'images'*, *'picture'*, *'pictures'* o *'flickr'* seguido del termino que quieras encontrar para mostrar una _*imagen*_.", response.dm.id);
                        rtm.sendMessage(">y por ultimo utiliza *'busca'*, *'google'*, *'web'* o *'search'* seguido del termino que quieras encontrar para mostrar la _*pagina web*_ que desees.", response.dm.id); 
                }
          }
          else { rtm.sendMessage('tienes que decirme que quieres que busque y que hago con ello ' + response.user.name + '!', response.dm.id); };
    }
});
