// Copyright (c) 2015, Evan Summers (twitter.com/evanxsummers)
// ISC license, see http://github.com/evanx/redex/LICENSE

import * as YamlAsserts from '../lib/YamlAsserts';

export default class JsonMonitor {

   constructor(config, logger, context) {
      this.config = config;
      this.logger = logger;
      this.context = context;
      this.init();
   }

   init() {
      for (let name in this.config.services) {
         let service = this.config.services[name];
         service.name = 'json:' + name;
         service.type = 'json';
         assert(service.url, 'service.url');
         assert(service.name, 'service.name');
         if (!service.label) {
            service.label = service.name;
         }
         service.timeout = service.timeout || this.config.timeout;
         this.context.stores.service.add(service);
         this.logger.info('service', service.name);
      }
   }

   async checkServices() {
      for (const [name, service] of this.context.stores.service.services) {
         if (service.type === 'json') {
            await this.checkService(service);
         }
      }
   }

   async checkService(service) {
      try {
         let content = await Requests.request({
            url: service.url,
            method: 'get',
            timeout: service.timeout,
            json: true
         });
         assert(!lodash.isEmpty(content), 'content');
         if (service.minLength || service.each) {
            assert(lodash.isArray(content), 'array: ' + (typeof content));
            service.debug.length = content.length;
            service.debug.first = content[0];
         }
         if (service.minLength) {
            assert(lodash.size(content) >= service.minLength, 'minLength: ' + service.minLength);
         }
         if (service.required) {
            service.debug.content = content;
            let errors = YamlAsserts.getErrors(service.required, content);
            if (errors.length) {
               throw 'asserts: ' + errors.join(', ');
            }
         }
         if (service.each) {
            for (let item of content) {
               let errors = YamlAsserts.getErrors(service.each, item);
               if (errors.length) {
                  throw 'asserts: ' + errors.join(', ');
               }
            }
         }
         this.logger.verbose('checkService', service.name, typeof content);
         await this.context.components.tracker.processStatus(service, 'OK');
      } catch (err) {
         service.debug.error = {
            message: err.message,
            statusCode: err.statusCode,
            time: new Date()
         };
         this.logger.debug('checkService', service.name, err);
         this.context.components.tracker.processStatus(service, 'WARN', err.message);
      }
   }

   async pub() {
      return null;
   }

   async start() {
      this.logger.info('started');
   }

   async end() {
   }

   async scheduledTimeout() {
      this.logger.verbose('scheduledTimeout');
      await this.checkServices();
   }

   async scheduledInterval() {
      this.logger.verbose('scheduledInterval');
      await this.checkServices();
   }
}
