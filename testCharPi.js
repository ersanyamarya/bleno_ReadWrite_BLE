var fs = require("fs");
var util = require('util');
var bleno = require('./index');
var LED_File_Red = "/sys/class/gpio/gpio17/value";
var LED_File_Blue = "/sys/class/gpio/gpio27/value";
var LED_File_Green = "/sys/class/gpio/gpio22/value";
var CPU_TEMP_FILE = '/sys/class/thermal/thermal_zone0/temp'
var sensor = require('node-dht-sensor');
var datatosend = 'nothing to send';
var datatFormat = {
  dhtsensor: {
    temperature: 'nothing',
    humidity: 'nothing'
  },
  cpudata: {
    temperature: 'nothing'
  },
  check: function(key) {
    datatosend = 'simply nothing';
    sensor.read(11, 4, function(err, temperature, humidity) {
      if (!err) {
        console.log('temp: ' + temperature.toFixed(1) + '°C, ' +
          'humidity: ' + humidity.toFixed(1) + '%'
        );
        datatFormat.dhtsensor.temperature = 'Temperature: ' +
          temperature.toFixed(
            1) + '°C';
        datatFormat.dhtsensor.humidity = 'humidity: ' + humidity.toFixed(
            1) +
          '%';
        if (key == 'temp' || key == 'Temp') {
          datatosend = datatFormat.dhtsensor.temperature;
          console.log(datatosend);
        }
        if (key == 'humidity' || key == 'Humidity') {
          datatosend = datatFormat.dhtsensor.humidity;
          console.log(datatosend);
        }

      } else {
        throw err;
      }
    });


    if (key == 'RedOn' || key == 'Redon') {
      fs.writeFile(LED_File_Red, '0', function(err) {
        if (err) {
          return console.console.error(err);
        }
      });
    }
    if (key == 'RedOff' || key == 'Redoff') {
      fs.writeFile(LED_File_Red, '1', function(err) {
        if (err) {
          return console.console.error(err);
        }
      });
    }

    if (key == 'BlueOn' || key == 'Blueon') {
      fs.writeFile(LED_File_Blue, '0', function(err) {
        if (err) {
          return console.console.error(err);
        }
      });
    }
    if (key == 'BlueOff' || key == 'Blueoff') {
      fs.writeFile(LED_File_Blue, '1', function(err) {
        if (err) {
          return console.console.error(err);
        }
      });
    }
    if (key == 'GreenOn' || key == 'Greenon') {
      fs.writeFile(LED_File_Green, '0', function(err) {
        if (err) {
          return console.console.error(err);
        }
      });
    }
    if (key == 'GreenOff' || key == 'Greenoff') {
      fs.writeFile(LED_File_Green, '1', function(err) {
        if (err) {
          return console.console.error(err);
        }
      });
    }

    if (key == 'AllOff' || key == 'Alloff') {
      fs.writeFile(LED_File_Green, '1', function(err) {
        if (err) {
          return console.console.error(err);
        }
      });
      fs.writeFile(LED_File_Blue, '1', function(err) {
        if (err) {
          return console.console.error(err);
        }
      });
      fs.writeFile(LED_File_Red, '1', function(err) {
        if (err) {
          return console.console.error(err);
        }
      });
    }

    if (key == 'CpuTemp' || key == 'Cputemp') {
      fs.readFile(CPU_TEMP_FILE, function(err, data) {
        if (err) {
          return console.error(err);
        }
        datatFormat.cpudata.temperature = 'Cpu Temperature: ' + (data /
          1000).toFixed(2);
        datatosend = datatFormat.cpudata.temperature;
        console.log(datatosend);
      });
    }
  }
};



var BlenoPrimaryService = bleno.PrimaryService;
var BlenoCharacteristic = bleno.Characteristic;
var BlenoDescriptor = bleno.Descriptor;


console.log('bleno');

var StaticReadOnlyCharacteristic = function() {
  StaticReadOnlyCharacteristic.super_.call(this, {
    uuid: 'fffffffffffffffffffffffffffffff1',
    properties: ['read'],
    //value is sned with the read call
    value: new Buffer('value'),
    descriptors: [
      new BlenoDescriptor({
        uuid: '2901',
        value: 'user description'
      })
    ]
  });
};
util.inherits(StaticReadOnlyCharacteristic, BlenoCharacteristic);

var DynamicReadOnlyCharacteristic = function() {
  DynamicReadOnlyCharacteristic.super_.call(this, {
    uuid: 'fffffffffffffffffffffffffffffff2',
    properties: ['read']
  });
};

util.inherits(DynamicReadOnlyCharacteristic, BlenoCharacteristic);

DynamicReadOnlyCharacteristic.prototype.onReadRequest = function(offset,
  callback) {
  var result = this.RESULT_SUCCESS;
  var data = new Buffer(datatosend);

  if (offset > data.length) {
    result = this.RESULT_INVALID_OFFSET;
    data = null;
  } else {
    data = data.slice(offset);
  }

  callback(result, data);
};

var LongDynamicReadOnlyCharacteristic = function() {
  LongDynamicReadOnlyCharacteristic.super_.call(this, {
    uuid: 'fffffffffffffffffffffffffffffff3',
    properties: ['read']
  });
};

util.inherits(LongDynamicReadOnlyCharacteristic, BlenoCharacteristic);

LongDynamicReadOnlyCharacteristic.prototype.onReadRequest = function(offset,
  callback) {
  var result = this.RESULT_SUCCESS;
  var data = new Buffer(512);

  for (var i = 0; i < data.length; i++) {
    data[i] = i % 256;
  }

  if (offset > data.length) {
    result = this.RESULT_INVALID_OFFSET;
    data = null;
  } else {
    data = data.slice(offset);
  }

  callback(result, data);
};

var WriteOnlyCharacteristic = function() {
  WriteOnlyCharacteristic.super_.call(this, {
    uuid: 'fffffffffffffffffffffffffffffff4',
    properties: ['write', 'writeWithoutResponse']
  });
};

util.inherits(WriteOnlyCharacteristic, BlenoCharacteristic);

WriteOnlyCharacteristic.prototype.onWriteRequest = function(data, offset,
  withoutResponse, callback) {
  console.log('WriteOnlyCharacteristic write request: ' + data.toString('hex') +
    ' ' + offset + ' ' + withoutResponse);
  //data is read on read call
  datatFormat.check(data);
  callback(this.RESULT_SUCCESS);
};

var NotifyOnlyCharacteristic = function() {
  NotifyOnlyCharacteristic.super_.call(this, {
    uuid: 'fffffffffffffffffffffffffffffff5',
    properties: ['notify']
  });
};

util.inherits(NotifyOnlyCharacteristic, BlenoCharacteristic);

NotifyOnlyCharacteristic.prototype.onSubscribe = function(maxValueSize,
  updateValueCallback) {
  console.log('NotifyOnlyCharacteristic subscribe');

  this.counter = 0;
  this.changeInterval = setInterval(function() {
    var data = new Buffer(4);
    data.writeUInt32LE(this.counter, 0);

    console.log('NotifyOnlyCharacteristic update value: ' + this.counter);
    updateValueCallback(data);
    this.counter++;
  }.bind(this), 5000);
};

NotifyOnlyCharacteristic.prototype.onUnsubscribe = function() {
  console.log('NotifyOnlyCharacteristic unsubscribe');

  if (this.changeInterval) {
    clearInterval(this.changeInterval);
    this.changeInterval = null;
  }
};

NotifyOnlyCharacteristic.prototype.onNotify = function() {
  console.log('NotifyOnlyCharacteristic on notify');
};

var IndicateOnlyCharacteristic = function() {
  IndicateOnlyCharacteristic.super_.call(this, {
    uuid: 'fffffffffffffffffffffffffffffff6',
    properties: ['indicate']
  });
};

util.inherits(IndicateOnlyCharacteristic, BlenoCharacteristic);

IndicateOnlyCharacteristic.prototype.onSubscribe = function(maxValueSize,
  updateValueCallback) {
  console.log('IndicateOnlyCharacteristic subscribe');

  this.counter = 0;
  this.changeInterval = setInterval(function() {
    var data = new Buffer(4);
    data.writeUInt32LE(this.counter, 0);

    console.log('IndicateOnlyCharacteristic update value: ' + this.counter);
    updateValueCallback(data);
    this.counter++;
  }.bind(this), 1000);
};

IndicateOnlyCharacteristic.prototype.onUnsubscribe = function() {
  console.log('IndicateOnlyCharacteristic unsubscribe');

  if (this.changeInterval) {
    clearInterval(this.changeInterval);
    this.changeInterval = null;
  }
};

IndicateOnlyCharacteristic.prototype.onIndicate = function() {
  console.log('IndicateOnlyCharacteristic on indicate');
};

function SampleService() {
  SampleService.super_.call(this, {
    uuid: 'fffffffffffffffffffffffffffffff0',
    characteristics: [
      new StaticReadOnlyCharacteristic(),
      new DynamicReadOnlyCharacteristic(),
      new LongDynamicReadOnlyCharacteristic(),
      new WriteOnlyCharacteristic(),
      new NotifyOnlyCharacteristic(),
      new IndicateOnlyCharacteristic()
    ]
  });
}

util.inherits(SampleService, BlenoPrimaryService);

bleno.on('stateChange', function(state) {
  console.log('on -> stateChange: ' + state + ', address = ' + bleno.address);

  if (state === 'poweredOn') {
    bleno.startAdvertising('CharPi', [
      'fffffffffffffffffffffffffffffff0'
    ]);
  } else {
    bleno.stopAdvertising();
  }
});

// Linux only events /////////////////
bleno.on('accept', function(clientAddress) {
  console.log('on -> accept, client: ' + clientAddress);

  bleno.updateRssi();
});

bleno.on('disconnect', function(clientAddress) {
  console.log('on -> disconnect, client: ' + clientAddress);
});

bleno.on('rssiUpdate', function(rssi) {
  console.log('on -> rssiUpdate: ' + rssi);
});
//////////////////////////////////////

bleno.on('mtuChange', function(mtu) {
  console.log('on -> mtuChange: ' + mtu);
});

bleno.on('advertisingStart', function(error) {
  console.log('on -> advertisingStart: ' + (error ? 'error ' + error :
    'success'));

  if (!error) {
    bleno.setServices([
      new SampleService()
    ]);
  }
});

bleno.on('advertisingStop', function() {
  console.log('on -> advertisingStop');
});

bleno.on('servicesSet', function(error) {
  console.log('on -> servicesSet: ' + (error ? 'error ' + error :
    'success'));
});
