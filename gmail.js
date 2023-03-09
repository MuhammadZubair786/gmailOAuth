const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');
const fs = require('fs');

// Replace with your own credentials file path
const CREDENTIALS_PATH = 'credentials.json';
const TOKEN_PATH = 'token.json';

async function authorize() {
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new OAuth2Client(client_id, client_secret, redirect_uris[0]);

  try {
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH));
    oAuth2Client.setCredentials(token);
    return oAuth2Client;
  } catch (err) {
    console.log('Error retrieving access token:', err);
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/gmail.readonly', 'https://www.googleapis.com/auth/contacts.readonly']
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const code = await getCodeFromUser();
    const token = await getTokenFromCode(code, oAuth2Client);
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
    console.log('Token stored to', TOKEN_PATH);
    oAuth2Client.setCredentials(token);
    return oAuth2Client;
  }
}

async function getCodeFromUser() {
  // Replace with your own code to get the authorization code from the user
  // For example, you can use the `readline` module to prompt the user for input
  // and return the code.
}

async function getTokenFromCode(code, oAuth2Client) {
  const { tokens } = await oAuth2Client.getToken(code);
  return tokens;
}

async function getContacts(auth) {
  const service = google.people({ version: 'v1', auth });
  const response = await service.people.connections.list({
    resourceName: 'people/me',
    personFields: 'names,emailAddresses'
  });

  console.log( response.data.connections)
  return response.data.connections;
}

const Excel = require('exceljs');

function exportContactsToExcel(contacts) {
  // Create a new workbook
  const workbook = new Excel.Workbook();

  // Add a worksheet
  const worksheet = workbook.addWorksheet('Contacts');

  // Define the columns
  worksheet.columns = [
    { header: 'Name', key: 'name', width: 30 },
    { header: 'Email', key: 'email', width: 30 },
    { header: 'Phone', key: 'phone', width: 20 }
  ];

  // Add the contact data to the worksheet
  contacts.forEach(contact => {
    worksheet.addRow({
      name: contact.names ? contact.names[0].displayName : '',
      email: contact.emailAddresses ? contact.emailAddresses[0].value : '',
      phone: contact.phoneNumbers ? contact.phoneNumbers[0].value : ''
    });
  });

  // Save the workbook to a file
  workbook.xlsx.writeFile('contacts.xlsx')
    .then(() => {
      console.log('Contacts exported to contacts.xlsx');
    })
    .catch(err => {
      console.error(err);
    });
}


async function main() {
  const auth = await authorize();
  const contacts = await getContacts(auth);
  await exportContactsToExcel(contacts);
}

main().catch(console.error);
