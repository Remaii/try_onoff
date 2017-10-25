## Try OnOff
It's simple project to use `onoff` middleware on Raspberry Pi
#### Objectif
- Emit a light signal when there is a difference between the return and the old return from an API

### Pre-Request
- Raspberry Pi `>=ARMV7`
- Node.JS `6.11.1`
- An URL to check and return `{total:Number, onb:Number}`

### Install
- Create Main folder and go in : `mkdir main ; cd main`
- Clone repo : `git clone https://github.com/Remaii/try_onoff.git`
- Go into repo and install dependency : `cd try_onoff ; npm i`
- Copy config example to main folder : `cp example.config.js ../config.js`
- Now you need to set your settings with : `nano ../config.js`

### Settings
- Set interval to check value, in milliseconds, at `line 3: var "duree"`
- Set url to make request, at `line 5: var "url"` ex: `https://api.website.com/v1/count`
- Set options of request, at `line 33: "key : options"`
- Set the GPIO pin number of the led, at `line 41/42: "key : pin1/pin2"`

### Launch
- Use `node script.js` for normal mode
- Use `DEBUG="true" node script.js` for debug mode
- PM2:
- - Use `pm2 start script.js --name try_onoff --watch`
- - Get log `pm2 logs try_onoff`
- - Active Debug mode `pm2 set try_onoff:DEBUG true ; pm2 reload try_onoff`
- - Launch at startup `sudo pm2 startup ; pm2 save`
- - Uninstall `pm2 delete try_onoff`
