if (process.env.NODE_ENV !== 'production') {
    require('dotenv').load();
  }
var express=require('express');
var app=express();
var twilio=require('twilio');
var bodyParser=require('body-parser');
var path=require('path');
var cors=require('cors');
var firebase=require('firebase');

firebase.initializeApp({
    databaseURL: "https://chat-dashboard-5dbff.firebaseio.com",
});

const accountSid=process.env.FILLIPI;
const authToken=process.env.AUTH_KEY;
var client=new twilio(accountSid, authToken);

 app.use(bodyParser.urlencoded({ extended: true }))
 app.use(bodyParser.json());
 app.use(cors());

app.get('/', function (req, res) {
   res.send('wassup Woooooorld');
});

 /* 
  * a post request to /sendsms is made when the agent sends a message through the Middle panel text 
  * input bar. The text is then saved into firebase database under /messages 
  */

 app.post('/sendsms', function (req, res) {
    res.header("Access-Control-Allow-Origin", "http://localhost:8080");
    res.header("Access-Control-Allow-Headers");
    console.log(req.body);
    client.messages.create({
        body: req.body.text,
        to: req.body.phone,  
        from: '+15103437234',
    })
    .then((message) => {
        res.json(message);
        console.log(message.from);
        processMessage(message);
      })
      .done();

      function processMessage(message) {
        var receivingNum = message.to;

        var ref= firebase.database().ref('/messages');
        ref.child(receivingNum).once("value", snapshot => {
    
            if(!snapshot.exists()) {
              ref.child(receivingNum).set(0);
            }
    
        });
    
    
      }
 });

 // a post request to /sms is made when a customer sends an sms from their phone to the agents twilio number. text is 
 // logged into firebase then input into middle panel

app.post('/sms', function (req, res) {
    let incomingNum=req.body.From;
    var newMessageData={
    phone: incomingNum,
    message: req.body.Body
    };
    var ref=firebase.database().ref('messages/all');
    ref.child(incomingNum).once("value", snapshot => {
        var newMessageKey=ref.child(incomingNum).push().key;
        var updates={};

         updates['messages/' + incomingNum + '/all/' + newMessageKey]=newMessageData;
         firebase.database().ref().update(updates);
    });
    console.log(req.body);  
});
var server=app.listen(8081, function () {
   var host=server.address().address
   var port=server.address().port
   
   console.log("Server listening at http://%s:%s", host, port)
});