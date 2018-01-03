const sendgrid = require('sendgrid');

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const SENDGRID_TO_EMAIL = process.env.SENDGRID_TO_EMAIL;
const SENDGRID_FROM_EMAIL = 'updates@fb-targeting-changes.com'

const sendStatusEmail = (emailContent) => {
  const helper = sendgrid.mail;
  const from_email = new helper.Email(SENDGRID_FROM_EMAIL);
  const to_email = new helper.Email(SENDGRID_TO_EMAIL);
  const subject = `Daily Fb Targeting Changes Update`;
  const content = new helper.Content('text/plain', emailContent);
  const mail = new helper.Mail(from_email, subject, to_email, content);
  
  const sg = sendgrid(SENDGRID_API_KEY);

  const request = sg.emptyRequest({
    method: 'POST',
    path: '/v3/mail/send',
    body: mail.toJSON(),
  });
  
  sg.API(request, function(error, response) {
    console.log(response.statusCode);
    console.log(response.body);
    console.log(response.headers);
  });
};

exports.sendStatusEmail = sendStatusEmail;

