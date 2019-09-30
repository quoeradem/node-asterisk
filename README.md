node-asterisk
====

A simple Asterisk Manager Interface client for NodeJS.

## Install
```
$ npm install quoeradem/node-asterisk
```

## Usage
``` javascript
const AsteriskManager = require('node-asterisk');
const ami = new AsteriskManager('host', 'port');

ami.connect();
ami.login('user', 'pass');

// Listen for a specific AMI event.
ami.on('QueueSummary', data => {})

// Perform an AMI action.
ami.action('QueueStatus', {}, res => {})
```

License
-------
This project is licensed under The MIT License (MIT). A copy of this license has been included in `LICENSE`.