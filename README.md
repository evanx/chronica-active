
# chronica - microservice-based monitoring

Chronica is envisaged as monitoring solution using Node.js and Redis.

This is a Node redesign of my abandoned Java <a href="https://github.com/evanx/chronic">Chronic</a> project.

It's a design/work in progress, as a side-project.
 

### Background: Chronic

The intial problem that prompted Chronic, was a sysadmin receiving many overnight custom cronjob emails. 

Chronic was a Java monitoring server whereby client machines can pipe post output e.g. from shell scripts, to this server. This text is diff'ed to the previous posting e.g from the previous day, and then emailed only when the content has changed.

An extensible client bash script was developed, which included various standard checks. More importantly, it enabled custom checks. It piped the output of "checks" into `curl` to HTTPS POST to the server via secure SSL.

Anyway, the Chronic server was a terribly monolithic Java/SQL application, with an Angular front-end. Anyway, I abandoned that project.

But monitoring is fun. Chronica will re-imagine that solution, and implement it using Node microservices, Redis and ReactJS.


### Related services

https://github.com/evanx/certserver - certificate enrollment, management and authentication


### Other resources

Wiki home: https://github.com/evanx/vellum/wiki

