// Copyright (c) 2015, Evan Summers (twitter.com/evanxsummers)
// ISC license, see http://github.com/evanx/redex/LICENSE

import nodemailer from 'nodemailer';

export function create(config, logger, required) {

   let that = {};

   function formatMessage(email, subject, message) {
      return message + '\n\n' + 'Sent by Chronica on ' + required.stores.environment.hostname + ' to ' + email;
   }

   async function sendEmail(email, subject, message) {
      let options = {
         from: config.fromEmail,
         to: email,
         subject: 'Chronica ' + subject
      };
      if (message) {
         options.text = formatMessage(email, subject, message);
      }
      logger.info('sendEmail', email, subject);
      return new Promise((resolve, reject) => {
         that.transport.sendMail(options, (error, response) => {
            if (error) {
               reject(error);
            } else {
               logger.debug('Message sent', response.envelope.to, subject);
               resolve(response);
            }
         });
      });
   }

   const those = {
      async start() {
         assert(config.fromEmail, 'fromEmail');
         that.transport = nodemailer.createTransport();
      },
      async end() {
         that.transport.close();
      },
      async sendAlert(subject, message) {
         logger.info('sendAlert', {subject, message});
         if (lodash.isEmpty(message)) {
            logger.debug('sendAlert empty message', subject);
         }
         if (lodash.includes(config.disableHostnames, required.stores.environment.hostname)) {
            logger.info('sendAlert excluded', subject, required.stores.environment.hostname);
            return;
         }
         return config.admins.map(admin => {
            sendEmail(admin.email, subject, message);
         });
      }
   };

   return those;
}
