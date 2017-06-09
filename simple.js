var util = require('util')
var bleno = require('./index');
var Descriptor = bleno.Descriptor;
var descriptor = new Descriptor({
  uuid: '2901',
  value: 'value' // static value, must be of type Buffer or string if set
});

var Characteristic = bleno.Characteristic;
var characteristic = new Characteristic({
  uuid: 'fff1',
  properties: ['read', 'write', 'writeWithoutResponse'],
  value: 'ff', // optional static value, must be of type Buffer
  descriptors: [descriptor]
});
var PrimaryService = bleno.PrimaryService;
var primaryService = new PrimaryService({
  uuid: 'fffffffffffffffffffffffffffffff0',
  characteristics: [characteristic]
});
var services = [primaryService];
bleno.on('advertisingStart', function(error) {
  bleno.setServices(services);
});
bleno.on('stateChange', function(state) {
  console.log('BLE stateChanged to: ' + state);
  if (state === 'poweredOn') {
    bleno.startAdvertising('SanyamArya', [
      'fffffffffffffffffffffffffffffff0'
    ]);
  } else {
    bleno.stopAdvertising();
  }
});
