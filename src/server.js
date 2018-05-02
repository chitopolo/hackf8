var express = require("express");
var path = require("path");
var bodyParser = require('body-parser')
var app = express();
var node_env = process.env.NODE_ENV || 'development'

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, '../dist')))


var MESSENGER_CONFIG = {
    "appSecret": "1dde38c9e7c669a0ec589e5c7abd4e54",
    "pageAccessToken": "EAACyHdvJkUIBAKqArz01LIgiudjAdFuUrymAJZBFPZBA0fGsDoWd7B0h9H3HgwigMdVADMStIlAXY0dnWOUH2oAJNwuCCjZBGfXc0U4vw8a3dZB1ntPcAKWTBY8VNm2u1l0CwsBQFBhJ5ZCSywTtza6ZAHyt8knZBL98eDeDFZCJ1QZDZD",
    "validationToken": "123456789",
    "serverURL": "https://biciruta.azurewebsites.net"
}

var serverPort = process.env.PORT || 8080;


// if(node_env == 'development'){
//   var webpack = require('webpack');
  
//     var config = require('./../webpack.config');
//     var compiler = webpack(config);
//      console.log('inside development')
//           app.use(require('webpack-dev-middleware')(compiler, {
//             publicPath: config.output.publicPath
//           }));
//      app.use(require('webpack-hot-middleware')(compiler));
//   }




app.get("*", function(req, res) {
  res.sendFile(path.join(__dirname, "./../dist/index.html"));
});




//Messenger start

// App Secret can be retrieved from the App Dashboard
const APP_SECRET = (process.env.MESSENGER_APP_SECRET) ? 
  process.env.MESSENGER_APP_SECRET :
  MESSENGER_CONFIG.appSecret;

// Arbitrary value used to validate a webhook
const VALIDATION_TOKEN = (process.env.MESSENGER_VALIDATION_TOKEN) ?
  (process.env.MESSENGER_VALIDATION_TOKEN) :
  MESSENGER_CONFIG.validationToken;

// Generate a page access token for your page from the App Dashboard
const PAGE_ACCESS_TOKEN = (process.env.MESSENGER_PAGE_ACCESS_TOKEN) ?
  (process.env.MESSENGER_PAGE_ACCESS_TOKEN) :
  MESSENGER_CONFIG.pageAccessToken;

// URL where the app is running (include protocol). Used to point to scripts and 
// assets located at this address. 
const SERVER_URL = (process.env.SERVER_URL) ?
  (process.env.SERVER_URL) :
  MESSENGER_CONFIG.serverURL;

if (!(APP_SECRET && VALIDATION_TOKEN && PAGE_ACCESS_TOKEN && SERVER_URL)) {
  console.error("Missing config values");
  process.exit(1);
}



app.get('/webhook', function(req, res) {
  if (req.query['hub.mode'] === 'subscribe' &&
      req.query['hub.verify_token'] === VALIDATION_TOKEN) {
    console.log("Validating webhook");
    res.status(200).send(req.query['hub.challenge']);
  } else {
    console.error("Failed validation. Make sure the validation tokens match.");
    res.sendStatus(403);          
  }  
});




app.post('/webhook', function (req, res) {
  var data = req.body;

  // Make sure this is a page subscription
  if (data.object == 'page') {
    // Iterate over each entry
    // There may be multiple if batched
    data.entry.forEach(function(pageEntry) {
      var pageID = pageEntry.id;
      var timeOfEvent = pageEntry.time;

      // Iterate over each messaging event
      pageEntry.messaging.forEach(function(messagingEvent) {
        if (messagingEvent.optin) {
          receivedAuthentication(messagingEvent);
        } else if (messagingEvent.message) {
          receivedMessage(messagingEvent);
        } else if (messagingEvent.delivery) {
          receivedDeliveryConfirmation(messagingEvent);
        } else if (messagingEvent.postback) {
          receivedPostback(messagingEvent);
        } else if (messagingEvent.read) {
          receivedMessageRead(messagingEvent);
        } else if (messagingEvent.account_linking) {
          receivedAccountLink(messagingEvent);
        } else {
          console.log("Webhook received unknown messagingEvent: ", messagingEvent);
        }
      });
    });
    // Assume all went well.
    //
    // You must send back a 200, within 20 seconds, to let us know you've 
    // successfully received the callback. Otherwise, the request will time out.
    res.sendStatus(200);
  }
});



app.get('/authorize', function(req, res) {
  var accountLinkingToken = req.query.account_linking_token;
  var redirectURI = req.query.redirect_uri;

  // Authorization Code should be generated per user by the developer. This will 
  // be passed to the Account Linking callback.
  var authCode = "1234567890";

  // Redirect users to this URI on successful login
  var redirectURISuccess = redirectURI + "&authorization_code=" + authCode;

  res.render('authorize', {
    accountLinkingToken: accountLinkingToken,
    redirectURI: redirectURI,
    redirectURISuccess: redirectURISuccess
  });
});
/*
 * Verify that the callback came from Facebook. Using the App Secret from 
 * the App Dashboard, we can verify the signature that is sent with each 
 * callback in the x-hub-signature field, located in the header.
 *
 * https://developers.facebook.com/docs/graph-api/webhooks#setup
 *
 */
function verifyRequestSignature(req, res, buf) {
  var signature = req.headers["x-hub-signature"];

  if (!signature) {
    // For testing, let's log an error. In production, you should throw an 
    // error.
    console.error("Couldn't validate the signature.");
  } else {
    var elements = signature.split('=');
    var method = elements[0];
    var signatureHash = elements[1];

    var expectedHash = crypto.createHmac('sha1', APP_SECRET)
                        .update(buf)
                        .digest('hex');

    if (signatureHash != expectedHash) {
      throw new Error("Couldn't validate the request signature.");
    }
  }
}

/*
 * Authorization Event
 *
 * The value for 'optin.ref' is defined in the entry point. For the "Send to 
 * Messenger" plugin, it is the 'data-ref' field. Read more at 
 * https://developers.facebook.com/docs/messenger-platform/webhook-reference/authentication
 *
 */
function receivedAuthentication(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfAuth = event.timestamp;

  // The 'ref' field is set in the 'Send to Messenger' plugin, in the 'data-ref'
  // The developer can set this to an arbitrary value to associate the 
  // authentication callback with the 'Send to Messenger' click event. This is
  // a way to do account linking when the user clicks the 'Send to Messenger' 
  // plugin.
  var passThroughParam = event.optin.ref;

  console.log("Received authentication for user %d and page %d with pass " +
    "through param '%s' at %d", senderID, recipientID, passThroughParam, 
    timeOfAuth);

  // When an authentication is received, we'll send a message back to the sender
  // to let them know it was successful.
  sendTextMessage(senderID, "Authentication successful");
}

/*
 * Message Event
 *
 * This event is called when a message is sent to your page. The 'message' 
 * object format can vary depending on the kind of message that was received.
 * Read more at https://developers.facebook.com/docs/messenger-platform/webhook-reference/message-received
 *
 * For this example, we're going to echo any text that we get. If we get some 
 * special keywords ('button', 'generic', 'receipt'), then we'll send back
 * examples of those bubbles to illustrate the special message bubbles we've 
 * created. If we receive a message with an attachment (image, video, audio), 
 * then we'll simply confirm that we've received the attachment.
 * 
 */
function receivedMessage(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;

  console.log("Received message for user %d and page %d at %d with message:", 
    senderID, recipientID, timeOfMessage);
  console.log(JSON.stringify(message));

  var isEcho = message.is_echo;
  var messageId = message.mid;
  var appId = message.app_id;
  var metadata = message.metadata;

  // You may get a text or attachment but not both
  var messageText = message.text;
  var messageAttachments = message.attachments;
  var quickReply = message.quick_reply;

  if (isEcho) {
    // Just logging message echoes to console
    console.log("Received echo for message %s and app %d with metadata %s", 
      messageId, appId, metadata);
    return;
  } else if (quickReply) {
    var quickReplyPayload = quickReply.payload;
    console.log("Quick reply for message %s with payload %s",
      messageId, quickReplyPayload);

    sendTextMessage(senderID, "Quick reply tapped");
    return;
  }

  if (messageText) {

    // If we receive a text message, check to see if it matches any special
    // keywords and send back the corresponding example. Otherwise, just echo
    // the text we received.
    switch (messageText) {
      case 'image':
        sendImageMessage(senderID);
        break;

      case 'gif':
        sendGifMessage(senderID);
        break;

      case 'audio':
        sendAudioMessage(senderID);
        break;

      case 'video':
        sendVideoMessage(senderID);
        break;

      case 'file':
        sendFileMessage(senderID);
        break;

      case 'button':
        sendButtonMessage(senderID);
        break;

      case 'generic':
        sendGenericMessage(senderID);
        break;

      case 'receipt':
        sendReceiptMessage(senderID);
        break;

      case 'quick reply':
        sendQuickReply(senderID);
        break;        

      case 'read receipt':
        sendReadReceipt(senderID);
        break;        

      case 'typing on':
        sendTypingOn(senderID);
        break;        

      case 'typing off':
        sendTypingOff(senderID);
        break;        

      case 'account linking':
        sendAccountLinking(senderID);
        break;

      default:
        sendTextMessage(senderID, messageText);
    }
  } else if (messageAttachments) {
    sendTextMessage(senderID, "Message with attachment received");
  }
}


/*
 * Delivery Confirmation Event
 *
 * This event is sent to confirm the delivery of a message. Read more about 
 * these fields at https://developers.facebook.com/docs/messenger-platform/webhook-reference/message-delivered
 *
 */
function receivedDeliveryConfirmation(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var delivery = event.delivery;
  var messageIDs = delivery.mids;
  var watermark = delivery.watermark;
  var sequenceNumber = delivery.seq;

  if (messageIDs) {
    messageIDs.forEach(function(messageID) {
      console.log("Received delivery confirmation for message ID: %s", 
        messageID);
    });
  }

  console.log("All message before %d were delivered.", watermark);
}


/*
 * Postback Event
 *
 * This event is called when a postback is tapped on a Structured Message. 
 * https://developers.facebook.com/docs/messenger-platform/webhook-reference/postback-received
 * 
 */
function receivedPostback(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfPostback = event.timestamp;

  // The 'payload' param is a developer-defined field which is set in a postback 
  // button for Structured Messages. 
  var payload = event.postback.payload;

  console.log("Received postback for user %d and page %d with payload '%s' " + 
    "at %d", senderID, recipientID, payload, timeOfPostback);

  // When a postback is called, we'll send a message back to the sender to 
  // let them know it was successful
  sendTextMessage(senderID, "Postback called");
}

/*
 * Message Read Event
 *
 * This event is called when a previously-sent message has been read.
 * https://developers.facebook.com/docs/messenger-platform/webhook-reference/message-read
 * 
 */
function receivedMessageRead(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;

  // All messages before watermark (a timestamp) or sequence have been seen.
  var watermark = event.read.watermark;
  var sequenceNumber = event.read.seq;

  console.log("Received message read event for watermark %d and sequence " +
    "number %d", watermark, sequenceNumber);
}

/*
 * Account Link Event
 *
 * This event is called when the Link Account or UnLink Account action has been
 * tapped.
 * https://developers.facebook.com/docs/messenger-platform/webhook-reference/account-linking
 * 
 */
function receivedAccountLink(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;

  var status = event.account_linking.status;
  var authCode = event.account_linking.authorization_code;

  console.log("Received account link event with for user %d with status %s " +
    "and auth code %s ", senderID, status, authCode);
}

/*
 * Send an image using the Send API.
 *
 */
function sendImageMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "image",
        payload: {
          url: SERVER_URL + "/assets/rift.png"
        }
      }
    }
  };

  callSendAPI(messageData);
}

/*
 * Send a Gif using the Send API.
 *
 */
function sendGifMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "image",
        payload: {
          url: SERVER_URL + "/assets/instagram_logo.gif"
        }
      }
    }
  };

  callSendAPI(messageData);
}

/*
 * Send audio using the Send API.
 *
 */
function sendAudioMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "audio",
        payload: {
          url: SERVER_URL + "/assets/sample.mp3"
        }
      }
    }
  };

  callSendAPI(messageData);
}

/*
 * Send a video using the Send API.
 *
 */
function sendVideoMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "video",
        payload: {
          url: SERVER_URL + "/assets/allofus480.mov"
        }
      }
    }
  };

  callSendAPI(messageData);
}

/*
 * Send a file using the Send API.
 *
 */
function sendFileMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "file",
        payload: {
          url: SERVER_URL + "/assets/test.txt"
        }
      }
    }
  };

  callSendAPI(messageData);
}

/*
 * Send a text message using the Send API.
 *
 */
function sendTextMessage(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText,
      metadata: "DEVELOPER_DEFINED_METADATA"
    }
  };

  callSendAPI(messageData);
}

/*
 * Send a button message using the Send API.
 *
 */
function sendButtonMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: "This is test text",
          buttons:[{
            type: "web_url",
            url: "https://www.oculus.com/en-us/rift/",
            title: "Open Web URL"
          }, {
            type: "postback",
            title: "Trigger Postback",
            payload: "DEVELOPER_DEFINED_PAYLOAD"
          }, {
            type: "phone_number",
            title: "Call Phone Number",
            payload: "+16505551234"
          }]
        }
      }
    }
  };  

  callSendAPI(messageData);
}

/*
 * Send a Structured Message (Generic Message type) using the Send API.
 *
 */
function sendGenericMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [{
            title: "Universiclick",
            subtitle: "Profesionalizate desde donde tú quieras!",
            item_url: "https://universiclick.com/",               
            image_url: "https://scontent-lga3-1.xx.fbcdn.net/v/t1.0-9/15826145_568971989974591_525371669703543395_n.png?oh=54ff968d88e4b0c71b2218d21d376f95&oe=58D7512B",
            buttons: [{
              type: "web_url",
              url: "https://www.universiclick.com/curso/curso-bsico-intensivo-de-javascript-desde-0",
              title: "Javascript"
            }, {
              type: "postback",
              title: "Ver más información",
              payload: "Payload for first bubble",
            }],
          }, {
            title: "Photoshop",
            subtitle: "Aprende photoshop",
            item_url: "https://www.universiclick.com/curso/photoshop",               
            image_url: "https://firebasestorage.googleapis.com/v0/b/project-4497057642811650248.appspot.com/o/images%2Fcourses%2F444444.jpg?alt=media&token=d7920344-34b0-4124-85da-7518ec270f12",
            buttons: [{
              type: "web_url",
              url: "http://www.universiclick.com/curso/photoshop",
              title: "Ir a la página"
            }, {
              type: "postback",
              title: "Ver más información",
              payload: "Payload for second bubble",
            }]
          }]
        }
      }
    }
  };  

  callSendAPI(messageData);
}

/*
 * Send a receipt message using the Send API.
 *
 */
function sendReceiptMessage(recipientId) {
  // Generate a random receipt ID as the API requires a unique ID
  var receiptId = "order" + Math.floor(Math.random()*1000);

  var messageData = {
    recipient: {
      id: recipientId
    },
    message:{
      attachment: {
        type: "template",
        payload: {
          template_type: "receipt",
          recipient_name: "Peter Chang",
          order_number: receiptId,
          currency: "USD",
          payment_method: "Visa 1234",        
          timestamp: "1428444852", 
          elements: [{
            title: "Oculus Rift",
            subtitle: "Includes: headset, sensor, remote",
            quantity: 1,
            price: 599.00,
            currency: "USD",
            image_url: SERVER_URL + "/assets/riftsq.png"
          }, {
            title: "Samsung Gear VR",
            subtitle: "Frost White",
            quantity: 1,
            price: 99.99,
            currency: "USD",
            image_url: SERVER_URL + "/assets/gearvrsq.png"
          }],
          address: {
            street_1: "1 Hacker Way",
            street_2: "",
            city: "Menlo Park",
            postal_code: "94025",
            state: "CA",
            country: "US"
          },
          summary: {
            subtotal: 698.99,
            shipping_cost: 20.00,
            total_tax: 57.67,
            total_cost: 626.66
          },
          adjustments: [{
            name: "New Customer Discount",
            amount: -50
          }, {
            name: "$100 Off Coupon",
            amount: -100
          }]
        }
      }
    }
  };

  callSendAPI(messageData);
}

/*
 * Send a message with Quick Reply buttons.
 *
 */
function sendQuickReply(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: "Hola!, cual es el area de tu interes?, Programación, Diseño, Aministración, edición de video u otros.",
      quick_replies: [
        {
          "content_type":"text",
          "title":"Action",
          "payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_ACTION"
        },
        {
          "content_type":"text",
          "title":"Comedy",
          "payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_COMEDY"
        },
        {
          "content_type":"text",
          "title":"Drama",
          "payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_DRAMA"
        }
      ]
    }
  };

  callSendAPI(messageData);
}

/*
 * Send a read receipt to indicate the message has been read
 *
 */
function sendReadReceipt(recipientId) {
  console.log("Sending a read receipt to mark message as seen");

  var messageData = {
    recipient: {
      id: recipientId
    },
    sender_action: "mark_seen"
  };

  callSendAPI(messageData);
}

/*
 * Turn typing indicator on
 *
 */
function sendTypingOn(recipientId) {
  console.log("Turning typing indicator on");

  var messageData = {
    recipient: {
      id: recipientId
    },
    sender_action: "typing_on"
  };

  callSendAPI(messageData);
}

/*
 * Turn typing indicator off
 *
 */
function sendTypingOff(recipientId) {
  console.log("Turning typing indicator off");

  var messageData = {
    recipient: {
      id: recipientId
    },
    sender_action: "typing_off"
  };

  callSendAPI(messageData);
}

/*
 * Send a message with the account linking call-to-action
 *
 */
function sendAccountLinking(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: "Welcome. Link your account.",
          buttons:[{
            type: "account_link",
            url: SERVER_URL + "/authorize"
          }]
        }
      }
    }
  };  

  callSendAPI(messageData);
}

/*
 * Call the Send API. The message data goes in the body. If successful, we'll 
 * get the message id in a response 
 *
 */
function callSendAPI(messageData) {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: messageData

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var recipientId = body.recipient_id;
      var messageId = body.message_id;

      if (messageId) {
        console.log("Successfully sent message with id %s to recipient %s", 
          messageId, recipientId);
      } else {
      console.log("Successfully called Send API for recipient %s", 
        recipientId);
      }
    } else {
      console.error("Failed calling Send API", response.statusCode, response.statusMessage, body.error);
    }
  });  
}


//Messenger ends



// var courses = db.ref("courses");
// var chats = db.ref("chats");
// var users = db.ref("users");


// courses.on('value', (courses) => {
//   courses.forEach((childSnapshot) => {
//     //Here you can access  childSnapshot.key
//     CoursesList.push(childSnapshot.key)
//   });
//     io.on('connection', (socket) => {
//     console.log('on connection')
//     //Globals
//     var defaultRoom = 'general';
//     //Emit the rooms array
//     socket.emit('setup', {
//       rooms: CoursesList
//     });
//     //Listens for new user
//     socket.on('new user', (data) => {
//       console.log('on new user')
//       var Room = data.room || defaultRoom ;
//       //New user joins the default room
//       socket.join(Room);
//       //Tell all those in the room that a new user joined
//       io.in(Room).emit('user joined', data);
//       console.log('user: ', data.username ,' joined', Room, ' data', data )
//     });
//     //Listens for switch room
//     //Se crea nueva instancia
//     socket.on('switch room', (data) => {
//       console.log('switch room')
//       //Handles joining and leaving rooms
//       //console.log(data);
//       socket.leave(data.oldRoom);
//       socket.join(data.newRoom);
//       io.in(data.oldRoom).emit('user left', data);
//       io.in(data.newRoom).emit('user joined', data);

//     });
//     //Listens for a new chat message
//     socket.on('new message', (data) => {
//       console.log('new message')
//       //Crrear mensaje
//       var msg = {
//         username: data.username,
//         content: data.message,
//         room: data.room,
//         created: data.date,
//         avatar: data.avatar
//       };
//       var messageSaved = chats.child(data.room).push().set(msg)
//       users.child('chats/'+messageSaved.key).set(true)
//       console.log("msg:", msg, " message saved ", messageSaved.key)
//       //Save it to database
//       // newMsg.save(function(err, msg){
//       //Send message to those connected in the room
//       io.to(msg.room).emit('message created', msg);
//       console.log('message created to ' , msg.room)
//       // });
//     });
//     });

// })


app.post('/paymentStatus', function(req, res){
  var data = req.body;

  // res.json(data)

  console.log('got here PAYMENT STATUS req ', req.body)


    return res.render(  path.join(__dirname, '../views/paymentstatus.html'), data ) ;

})


app.post('/pagos', function(req, res){

  console.log('---> ', req.body)
    var claveSecreta = 'EGrTtNnqJAszVFzdvA-32737939889'
    var md = forge.md.sha512.create()
    var gotThisChunk = req.body.data

    md.update(gotThisChunk+ claveSecreta)
    console.log(md.digest().toHex())

res.send(md.digest().toHex())
   //  var idEntCommerce = '400012'
   //  var codCardHolderCommerce = '205' 
   //  var names = 'Rene'
   //  var lastNames = 'Polo'
   //  var mail = 'renejpolo@me.com' 
   //  var reserved1 = ''
   //  var reserved2 = ''
   //  var reserved3 = ''


   //  // var registerVerification = openssl_digest(idEntCommerce+codCardHolderCommerce+mail+claveSecreta, 'sha512')

   //  var claveSecreta = 'rXYxLbTcQLgjGddsaKY*392585235767';

   //  var registerVerification = crypto.createHmac('sha512', idEntCommerce+codCardHolderCommerce+mail+claveSecreta);

   // console.log(`${registerVerification.digest('hex')}`);
   // var wsdl = 'https://test2.alignetsac.com/WALLETWS/services/WalletCommerce?wsdl'; 
   // // var client = new SoapClient(wsdl);   


   // var params = {
   // 'idEntCommerce': idEntCommerce, 
   // 'codCardHolderCommerce': codCardHolderCommerce, 
   // 'names': names,
   // 'lastNames': lastNames,
   // 'mail': mail,
   // 'reserved1': reserved1, 
   // 'reserved2': reserved2, 
   // 'reserved3': reserved3, 
   // 'registerVerification': registerVerification.digest('hex')
   // };

   // soap.createClient(wsdl, function(err, client){
   //  client.RegisterCardHolder(params, function(err, result){
   //      console.log(result)
   //  })
   // })
     // var url = 'http://example.com/wsdl?wsdl';
     
     // var args = {name: 'value'};
     // soap.createClient(url, function(err, client) {
     //     client.MyFunction(args, function(err, result) {
     //         console.log(result);
     //     });
     // });





})

app.get('/*', (req, res) => {
    var data = {
        intento: 'Andy',
        cosa:'blabla'
    } ;
    return res.render(  path.join(__dirname, '../views/welcome.html'), data ) ;
});



app.get('/chat/:classId', function(req, res){
 var classId = req.body.classId


})


app.get( '/test', function( req, res ) {
    var data = {
        intento: 'Andy',
        cosa:'blabla'
    } ;
    return res.render( path.join(__dirname, '../views/welcome.html'), data ) ;
} ) ;

app.post('/api/suscribed', function(req, res){
  console.log('body.data: ', typeof(req.body.data))
    var  emailInfo = JSON.parse(req.body.data) 

    var SENDER_EMAIL= "info@universiclick.com"
    var FROM_NAME= "Universiclick"
    var template_name= emailInfo.templateName || "universiclick-mensaje-standard"

    var template_content = [{
            "name": "example name",
            "content": "example content",
        }];
    var message = {
        "from_email": SENDER_EMAIL,
        "subject": emailInfo.subject,
        "from_name": FROM_NAME,
        "to": [{
                "email": emailInfo.recipientEmail,
                "name": emailInfo.recipientName,
                "type": "to"
            }],
        "headers": {
            "Reply-To": "info@universiclick.com"
        },
        "merge": true,
        "merge_language": "handlebars",
        "global_merge_vars": [{
                "name": "titulo",
                "content": emailInfo.mailTitle,
                }, {
                "name": "contenido",
                "content": emailInfo.mailContent
                }],
      
        "recipient_metadata": [{
                "rcpt": emailInfo.recipientEmail,
                "values": {
                    "user_id": emailInfo.userId
                }
            }],
    };


    var async = false;
    var ip_pool = null;
    var send_at = moment().format();
    mandrill_client.messages.sendTemplate({"template_name": template_name, "template_content": template_content, "message": message, "async": async, "ip_pool": ip_pool, "send_at": send_at}, function(result) {
        console.log(result);
        /*
        [{
                "email": "recipient.email@example.com",
                "status": "sent",
                "reject_reason": "hard-bounce",
                "_id": "abc123abc123abc123abc123abc123"
            }]
        */

        res.send('Enviado')
    }, function(e) {
      res.send('Error: ', e.message)
        // Mandrill returns the error as an object with name and message keys
        console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
        // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
    });
})



app.listen(serverPort, "localhost", function (err) {
  if (err) {
    console.log(err);
    return;
  }

  console.log("Listening at http://localhost:" + serverPort);
});

