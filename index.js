const {Client, SpeechBuilder, Middleware } = require('@line/clova-cek-sdk-nodejs');
const express = require('express');
const bodyParser = require('body-parser');
const APPLICATION_ID = process.env.APPLICATION_ID;

const launchHandler = async responseHelper => {
    responseHelper.setSimpleSpeech(
        SpeechBuilder.createSpeechText('お出かけの確認を行います。はい、かいいえ、でお答えください。窓は閉めましたか？')
    );
    responseHelper.responseObject.sessionAttributes = {
        type: 1
    };
};

const intentHandler = async responseHelper => {
    const intent = responseHelper.getIntentName();
    switch(intent) {
        case "Clova.YesIntent":
            const type = responseHelper.responseObject.sessionAttributes.type;
            if (type === 1) {
                const speech = SpeechBuilder.createSpeechText('OKです。' + '冷暖房器具は消しましたか？');
                responseHelper.setSimpleSpeech(speech);
                responseHelper.setSimpleSpeech(speech, true);
                responseHelper.responseObject.sessionAttributes = {
                    type: 2
                };
                break;
            } else if (type === 2) {
                const speech = SpeechBuilder.createSpeechText('OKです。' + '照明は消しましたか？');
                responseHelper.setSimpleSpeech(speech);
                responseHelper.setSimpleSpeech(speech, true);
                responseHelper.responseObject.sessionAttributes = {
                    type: 3
                };
                break;
            } else if (type === 3) {
                const speech = SpeechBuilder.createSpeechText('OKです。' + '財布は持ちましたか？');
                responseHelper.setSimpleSpeech(speech);
                responseHelper.setSimpleSpeech(speech, true);
                responseHelper.responseObject.sessionAttributes = {
                    type: 4
                };
                break;
            } else if (type === 4) {
                const speeches = [
                    SpeechBuilder.createSpeechText('OKです。' 
                        + '鍵をかけるのを忘れないでください。'
                        + 'いってらっしゃい!'),
                    SpeechBuilder.createSpeechUrl('https://s3-ap-northeast-1.amazonaws.com/syukkin/odekake.mp3')
                ];
                responseHelper.setSpeechList(speeches);
                responseHelper.endSession();
                break;
            } else {
                /* ここには絶対こないはず */
                responseHelper.setSimpleSpeech(
                    SpeechBuilder.createSpeechText('もう一度最初から確認します。窓は閉めましたか？')
                );
                responseHelper.responseObject.sessionAttributes = {
                    type: 1
                };
                break;
            }
        case "Clova.NoIntent":
            responseHelper.setSimpleSpeech(
                SpeechBuilder.createSpeechText('もう一度確認してください。')
            );
            responseHelper.endSession();
            break;
        default:
            responseHelper.setSimpleSpeech(
                SpeechBuilder.createSpeechText('はい、か、いいえでお答えください。')
            );
            responseHelper.responseObject.sessionAttributes = {
                type: responseHelper.responseObject.sessionAttributes.type
            };
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
// app.post('/clova', clovaMiddleware, clovaHandler);

// const port = process.env.PORT || 3000;
// app.listen(port, () => {
//     console.log(`Server running on ${port}`);
// });

app.post('/mySyukkin', clovaMiddleware, clovaHandler);

const awsServerlessExpress = require('aws-serverless-express');
const server = awsServerlessExpress.createServer(app);
exports.handler = (event, context) => awsServerlessExpress.proxy(server, event, context);