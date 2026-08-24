const webPush = require("web-push");

const keys = webPush.generateVAPIDKeys();
console.log(JSON.stringify(keys, null, 2));
