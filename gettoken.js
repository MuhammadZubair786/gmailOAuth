const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');
const fs = require('fs');

const SCOPES = ['https://www.googleapis.com/auth/contacts.readonly'];
const credentials=  {
    "installed": {
        "client_id": "616812037390-9id77djl7miek2b43okkkolkh3pid6bm.apps.googleusercontent.com",
        "project_id": "apple-website-38458",
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_secret": "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",
        "redirect_uris": [
            "http://localhost"
        ]
    }
}
const TOKEN_PATH = 'token.json';
const { client_secret, client_id, redirect_uris } = credentials.installed;
const oauth2Client = new OAuth2Client(
    client_id,
    client_secret,
    redirect_uris[0]
);

function getNewToken(oauth2Client, callback) {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });

  console.log('Authorize this app by visiting this url:', authUrl);

  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  readline.question('Enter the code from that page here: ', (code) => {
    readline.close();

    oauth2Client.getToken(code, (err, token) => {
      if (err) {
        console.error('Error retrieving access token', err);
        return;
      }

      oauth2Client.setCredentials(token);

      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) {
          console.error(err);
          return;
        }

        console.log(`Token stored in ${TOKEN_PATH}`);
      });

      callback(oauth2Client);
    });
  });
}
getNewToken()
// module.exports = getNewToken;
