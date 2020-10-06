'use strict';

const {
    Devices,
    ResponseApdu,
    CommandApdu
} = require('smartcard')
const COMMAND = require('./APDUCommand')
const ReaderUtils = require('./ReaderUtils')

const devices = new Devices();
let device = null;
devices.on('error', err => console.log(err))
devices.on('device-deactivated', event => this.emit('device-deactivated', event))
devices.on('device-activated', event => {
    device = event.device;
    device.on('card-inserted', async event => {
        let card = event.card

        await card.issueCommand(new CommandApdu({
            bytes: COMMAND.MOI
        }))
        let commandRequest = await card.issueCommand(new CommandApdu({
            bytes: COMMAND.GET.TH_FULLNAME
        }))
        let response = new ResponseApdu(commandRequest)
        if (response.hasMoreBytesAvailable()) {
            let numOfAvaiableData = response.numberOfBytesAvailable();
            let responData = await card.issueCommand(new CommandApdu({
                bytes: [...COMMAND.GET.RESPONSE, numOfAvaiableData]
            }))
            let responDataResponse = new ResponseApdu(responData)
            let morebyte = [];
            morebyte.push(...responDataResponse.buffer);
            let data = morebyte.splice(0, morebyte.length - 2);
            console.log(ReaderUtils.stringFromUTF8Array(ReaderUtils.tis620ToUTF8(data)));
        }
        console.log('card insert')

    });
    device.on('card-removed', event => {
        console.log(`Card removed   `);
    });
});