var SlackBot = require('slackbots');
var request = require('request');
var search = require('./search');
 
var bot = new SlackBot({
    token: 'xoxb-72085709538-vWIYEWyRloUk6GFeuUXeoJf0',
    name: 'Master'
});
 
bot.on('start', function() {
    bot.postMessageToUser('5erg10', 'now i have the screen control!', { }); 
});

bot.on('message', function(data) {
    console.log(data);
    if(data.text && data.username != 'Master') {
        console.log(data);
        bot.postMessage('U241YGGSJ', 'marchando', function(data) {
            var query = 'marwan';
            var querySource = 'youtube';
            search.search(query, querySource, function(err, content){
                if(err) content = {'type': 'image', 'content': 'http://i.imgur.com/Ql6Dvqa.jpg' };
                request.post({
                        url:'http://29e16bf3.ngrok.io/content',
                        json: content
                });
            });
        });
    }
});