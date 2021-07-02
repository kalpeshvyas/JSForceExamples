var express = require('express');
var app = new express();
var sForceLib = require('./connection.js');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var jsforce = require('jsforce');
global.connection;

app.set('view engine', 'pug');
app.set('views','./views');

app.get('/',(req, res)=>{

    console.log('in app .get');
    res.render('home', {sfdcMessage : 'my Salesforce message'});

})

io.on('connection', function(socket){
  //  global.connection = await sForceLib.getConnection(null, 'integrationtesting1@learning.com', 'sfdc_test26zWVXapXWY41hewUZiDn3bzuc');
    var conn = new jsforce.Connection({
        // you can change loginUrl to connect to sandbox or prerelease env.
        loginUrl : 'https://login.salesforce.com'
      });
      conn.login('integrationtesting1@learning.com', 'sfdc_test26zWVXapXWY41hewUZiDn3bzuc', function(err, userInfo) {
        if (err) { return console.error(err); }
        // Now you can get the access token and instance URL information.
        // Save them to establish connection next time.
        console.log(conn.accessToken);
        console.log(conn.instanceUrl); 
        conn.query('Select Id, Name from Account', function(err, result) {
            if (err) {  console.error(err);}
            else{
                console.log("total : " + result.totalSize);
                console.log("fetched : " + result.records.length);
                //records = result.records;
            }
            
          });

          conn.streaming.topic('/event/Account_Notification__e').subscribe(function(message) {
            console.log('Event Type : ' + JSON.stringify(message));
            console.log(message.payload)
            socket.emit('testerEvent', JSON.stringify(message));
            return message;
          });   
      });     
   /* setTimeout(function() {
        socket.emit('testerEvent', { description: 'A custom event named testerEvent!'});
       }, 4000); */
});


http.listen('7800');