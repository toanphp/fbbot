var apiUrl = "https://graph.facebook.com/v2.6/me/messages";
var accessToken = "EAABq4EaNvwoBANY6SqaKZCrLZA1IAzsUclkLKy2fi6DeYAefbxrbYCI4fpB4QjZAdw5t1sQTQaWuJo4qvFzq2stfK8DF59CBKthJIKJZCHOxoZBYmVy2O8FtjNRTOuNrRBW1W10ho2z0NRhxZAu02J7bwrN1hrCfAYbPRfZC2W1uXv1WwZArHIkdWyrttQHqY7WR0ZBhuLfpOJAZDZD";
var request = require("request");


exports.sendMessage = function(senderId, message) {
    request({
        url: apiUrl,
        qs: {
          access_token: accessToken,
        },
        method: 'POST',
        json: {
          recipient: {
            id: senderId
          },
          message: {
            text: message
          },
        }
      });
}

/** buttons = [
      {
        "type":"postback",
        "title":"Bookmark Item",
        "payload":"DEVELOPER_DEFINED_PAYLOAD"
      }
    ];
*/
exports.sendButton = function(senderId, message, buttons=[]) {
    request({
        url: apiUrl,
        qs: {
          access_token: accessToken,
        },
        method: 'POST',
        json: {
          recipient: {
            id: senderId
          },
          message: {
            attachment: {
                type: "template",
                payload: {
                  template_type: "button",
                  text:message,
                  buttons:buttons
                }
              }
          },
        }
      });
}


/** quickReplies = [
      {
        "content_type":"text",
        "title":"Search",
        "payload":"<POSTBACK_PAYLOAD>",
        "image_url":"http://example.com/img/red.png"
      },
      {
        "content_type":"location"
      },
      {
        "content_type":"text",
        "title":"Something Else",
        "payload":"<POSTBACK_PAYLOAD>"
      }
    ]
*/
exports.sendQuickReplies = function(senderId, message, quickReplies) {
    request({
        url: apiUrl,
        qs: {
          access_token: accessToken,
        },
        method: 'POST',
        json: {
          recipient: {
            id: senderId
          },
          message: {
            text: message,
            quick_replies:quickReplies
          },
        }
      });
}
