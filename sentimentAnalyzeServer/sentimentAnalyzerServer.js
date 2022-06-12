const express = require('express');
const app = new express();


app.use(express.static('client'));

const cors_app = require('cors');
app.use(cors_app());

const dotenv = require('dotenv');
const { text } = require('express');
dotenv.config();

const api_key = process.env.API_KEY;
const api_url = process.env.API_URL;

function getNLUInstance() {
    const NaturalLanguageUnderstandingV1 = require('ibm-watson/natural-language-understanding/v1');
    const { IamAuthenticator } = require('ibm-watson/auth');

    const naturalLanguageUnderstanding = new NaturalLanguageUnderstandingV1({
        version: '2022-04-07',
        authenticator: new IamAuthenticator({
            apikey: api_key,
        }),
        serviceUrl: api_url,
    });
    return naturalLanguageUnderstanding;
}

const naturalLanguageUnderstanding = getNLUInstance();

app.get(['/url/sentiment', '/text/sentiment'], function (req, res, next) {
    const analyzeParams = {
        "features": {
            "keywords": {
                "sentiment" : true,
                "limit": 1
            }
        }
    }
    if (req.query.url) {
        analyzeParams["url"] = req.query.url;
    } else if (req.query.text) {
        analyzeParams["text"] = req.query.text;
    }
    console.log(analyzeParams);
    naturalLanguageUnderstanding.analyze(analyzeParams)
        .then(analysisResults => {
            return res.send(analysisResults.result.keywords[0].sentiment, null, 2);
        })
        .catch(err => {
            return res.send("Could not do desired operation " + err);
        });
})

app.get(['/url/emotion', '/text/emotion'], function (req, res, next) {
    const analyzeParams = {
        "features": {
            "keywords": {
                "emotion" : true,
                "limit": 1
            }
        }
    }
    if (req.query.url) {
        analyzeParams["url"] = req.query.url;
    } else if (req.query.text) {
        analyzeParams["text"] = req.query.text;
    }
    console.log(analyzeParams);
    naturalLanguageUnderstanding.analyze(analyzeParams)
        .then(analysisResults => {
            return res.send(analysisResults.result.keywords[0].emotion, null, 2);
        })
        .catch(err => {
            return res.send("Could not do desired operation " + err);
        });
})

app.get("/",(req,res)=>{
    res.render('index.html');
});

let server = app.listen(8080, () => {
    console.log('Listening', server.address().port)
})

