const R = require('ramda');
const sendgrid = require('sendgrid');

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const SENDGRID_TO_EMAIL = R.pipe(
  R.split(','),
  R.map((email) => ({email}))
)(process.env.SENDGRID_TO_EMAIL);
const SENDGRID_FROM_EMAIL = 'updates@fb-targeting-changes.com'

const sendStatusEmail = (emailContent) => {
  const sg = sendgrid(SENDGRID_API_KEY);
  
  const subject = `Daily Fb Targeting Changes Update`;

  const request = sg.emptyRequest({
    method: 'POST',
    path: '/v3/mail/send',
    body: {
      from: {email: SENDGRID_FROM_EMAIL},
      personalizations: [{
        to: SENDGRID_TO_EMAIL
      }],
      subject,
      content: [{
        type: 'text/plain',
        value: emailContent
      }]
    },
  });
  
  sg.API(request, function(error, response) {
    console.log(response.statusCode);
    console.log(response.body);
    console.log(response.headers);
  });
};

exports.sendStatusEmail = sendStatusEmail;
