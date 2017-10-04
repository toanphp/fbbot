var apiUrl = "https://graph.facebook.com/v2.6/me/messages";
var accessToken = "EAABq4EaNvwoBANYknCWl1hUSwFTrRo5M4WgHDZBL5cjW9ZCfgKSat2wT8zudklohSjE8JDRfkyZAAGTBcanjmiiuLlKZCBSu0Nj4CfK1iYZC30oZB8ZBIBMOwLqI5tLibSCZB5osR9hnAigxUskZAWJOLvVNGKjQjgOtx2XFJzmmMQgetGh53dZATAmTncynSZBdtjuYP3SZB6D6CQZDZD";
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
    ] 
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
