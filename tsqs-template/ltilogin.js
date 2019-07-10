'use strict';
const querystring = require('querystring');
const oauth = require('oauth-signature');
var AWS = require('aws-sdk');
let serviceconfig = require("./stackvariables").variables();
AWS.config.region = 'us-west-2';
const documentClient = new AWS.DynamoDB.DocumentClient();


module.exports.testwebservice = async (event, context, callback) => {
  let cr = await documentClient.get({
    TableName: serviceconfig.service + '-servicerequest',
    Key: {
      key: 1234
    }
  }).promise();
  callback(null, cr);

}

module.exports.ltilogin = (event, context, callback) => {
  //You would look this secret up from a database based on consumer key
  let ltisecret = 'testsecret';

  var inbound = JSON.parse(JSON.stringify(querystring.parse(event.body)));
  var inboundsignature = inbound.oauth_signature;
  delete inbound.oauth_signature;
  let signature = oauth.generate(event.requestContext['httpMethod'], 'https://' + event.requestContext['domainName'] + '/' + event.requestContext['stage'] + event.requestContext['resourcePath'], inbound, ltisecret, '', {
    encodeSignature: false
  });
  if (signature === inboundsignature) {
    console.log('signature is good');

    // let response = {
    //   statusCode: 200,
    //   headers: {
    //     'Set-Cookie': 'elsess=1234',
    //   },
    //   body: JSON.stringify({
    //     message: 'Hello ' + inbound.lis_person_name_full + '. Here is the authenticated data from eClass',
    //     input: inbound,
    //   })
    // };

    // // This urlscheme will need to be added by us to a white list in eClass Prod. We have left it open for Spark Conference to save time
    // let urlscheme = 'https://' + event.requestContext['domainName'] + '/' + event.requestContext['stage'] + '/tokencallback?moodletoken=';

    let response = {
      statusCode: 302,
      headers: {
        'Set-Cookie': 'elsess=1234',
        Location: '/' + event.requestContext['stage'] + '/public/testwebservice.html'
      },
    };



    callback(null, response);

  } else {
    console.log('signature is no good');
    var response = {
      statusCode: 200,
      headers: {

      },
      body: 'Signature no good'
    };
    callback(null, response);
  }
};