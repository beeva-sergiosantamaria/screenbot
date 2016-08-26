var RtmClient = require('@slack/client').RtmClient;
var request = require('request');
var search = require('./search');
var tokenLibrary = require('./variables');
var _ = require('underscore');
var nextStep = false;

var respuesta = {};
var screens;
var directURL = false;

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
          //console.log('mensaje: ', message);
          //else directURL = false;
          var checkrespuesta =  parseInt(message.text); 
          respuesta.user = rtm.dataStore.getUserById(message.user);
          respuesta.dm = rtm.dataStore.getDMByName(respuesta.user.name);
          respuesta.texto = message.text.split(" ");
          if(!isNaN(checkrespuesta) && nextStep && checkrespuesta < screens.length) {
                    console.log('entra en search');
                    search.search(respuesta.query, respuesta.querySource, function(err, content){
                           content.screen = screens[checkrespuesta].name; 
                           console.log('contenido a enviar: ', content); 
                           request.post({
                                url: tokenLibrary.baseUrl+'/content',
                                json: content
                           });
                    });  
                rtm.sendMessage('enviando '+ respuesta.query +' a la pantalla '+ screens[checkrespuesta].name, respuesta.dm.id);  
          }
          else if( isNaN(checkrespuesta)){
                if(message.text.charAt(0) === '<') { respuesta.querySource = 'web' }
                else respuesta.querySource = respuesta.texto[0];
                if(_.indexOf(terms,respuesta.querySource) != -1 || directURL != false){
                    if(message.text.charAt(0) === '<') respuesta.query = message.text;
                    else respuesta.query = respuesta.query = _.without(respuesta.texto, respuesta.texto[0]).join(' ');
                    nextStep = true;
                    console.log('respuesta: ', respuesta);
                    rtm.sendMessage('En que dispositivo lo quieres mostrar?:', respuesta.dm.id, function (err, msg) {});
                    request.get( tokenLibrary.baseUrl+'/screens', function(error, resp, body) {
                            screens = JSON.parse(body);
                            if(screens.length < 1) respuesta.tell("no tienes teles, eres pobre");
                            screens.map(function(item, i){ 
                                rtm.sendMessage( '>*' + i + '.:*   ' + item.name, respuesta.dm.id, function (err, msg) {});
                            });
                      })
                }
                else {
                        rtm.sendMessage(">utiliza *'youtube'*, *'video'* o *'play'* seguido del termino que quieras encontrar para reproducir un _*video*_.", respuesta.dm.id);
                        rtm.sendMessage(">utiliza *'image'*, *'images'*, *'picture'*, *'pictures'* o *'flickr'* seguido del termino que quieras encontrar para mostrar una _*imagen*_.", respuesta.dm.id);
                        rtm.sendMessage(">y por ultimo utiliza *'busca'*, *'google'*, *'web'* o *'search'* seguido del termino que quieras encontrar para mostrar la _*pagina web*_ que desees.", respuesta.dm.id); 
                }
          }
          else { rtm.sendMessage('tienes que decirme que quieres que busque y que hago con ello ' + respuesta.user.name + '!', respuesta.dm.id); };
    }
});
