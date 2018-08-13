const {Client, SpeechBuilder, Middleware } = require('@line/clova-cek-sdk-nodejs');
const express = require('express');
const bodyParser = require('body-parser');
const APPLICATION_ID = process.env.APPLICATION_ID;

const launchHandler = async responseHalper => {
    responseHalper.setSimpleSpeech(
        SpeechBuilder.createSpeechText('お出かけの確認を行います。照明は消しましたか？')
    );
    responseHelper.responseObject.sessionAttributes = {
        type : 0
    };
};

const intentHandler = async responseHelper => {
    const intent = responseHelper.getIntentName();
    const type = responseHelper.responseObject.sessionAttributes;
    switch(intent) {
        case "Clova.YesIntent":
            responseHelper.setSimpleSpeech(
                SpeechBuilder.createSpeechText('OKです。' + type)
            );
            responseHelper.responseObject.sessionAttributes = {
                type : 1
            };
            break;
        case "Clova.NoIntent":
            responseHelper.setSimpleSpeech(
                SpeechBuilder.createSpeechText('もう一度確認してください。')
            );
            break;
        case "Clova.CancelIntent":
        default:
            responseHelper.setSimpleSpeech(
                SpeechBuilder.createSpeechText(intent)
            );
            break;
    }
};

const sessionEndedHandler = async responseHelper => { };

const clovaHandler = Client
    .configureSkill()
    .onLaunchRequest(launchHandler)
    .onIntentRequest(intentHandler)
    .onSessionEndedRequest(sessionEndedHandler)
    .handle();

const app = new express();
const clovaMiddleware = Middleware({ applicationId: APPLICATION_ID });
app.post('/clova', clovaMiddleware, clovaHandler);

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on ${port}`);
});
    
// const awsServerlessExpress = require('aws-serverless-express');
// const server = awsServerlessExpress.createServer(app);
// exports.handler = (event, context) => awsServerlessExpress.proxy(server, event, context);