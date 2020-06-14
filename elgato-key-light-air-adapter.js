/**
 * key-light-air-adapter.js
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

'use strict';

const http = require('http');

const {Adapter, Device, Property} = require('gateway-addon');

const manifest = require('./manifest.json');

class KeyLightAirProperty extends Property {
  constructor(device, name, propertyDescription) {
    super(device, name, propertyDescription);
    this.setCachedValue(propertyDescription.value);
    this.device.notifyPropertyChanged(this);
  }

  /**
   * Set the value of the property.
   *
   * @param {*} value The new value to set
   * @returns a promise which resolves to the updated value.
   *
   * @note it is possible that the updated value doesn't match
   * the value passed in.
   */
  setValue(value) {
    return new Promise((resolve, reject) => {
      super
        .setValue(value)
        .then((updatedValue) => {
          const {minimum, maximum} = this.device.properties.get('temperature');
          let temperature = this.device.properties.get('temperature').value;
          // Convert to a percentage
          temperature = (temperature - minimum) / (maximum - minimum);
          // Inverse between whatever these numbers mean
          temperature = Math.round((344 - 143) * (1 - temperature) + 143);
          const lightProps = {
            temperature,
            brightness: this.device.properties.get('brightness').value,
            on: this.device.properties.get('on').value ? 1 : 0
          };
          const testPayload = JSON.stringify({
            lights: [lightProps],
            numberOfLights: 1
          });
          const testOptions = {
            host: 'elgato-key-light-air-90de.local',
            path: '/elgato/lights',
            port: 9123,
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Content-Length': testPayload.length
            }
          };
          http
            .request(testOptions, (res) => {
              console.log(testPayload);
              // console.log(`STATUS: ${res.statusCode}`);
              // res.on('data', (chunk) => {
              //     console.log(`BODY: ${chunk}`);
              //   });
              resolve(updatedValue);
              this.device.notifyPropertyChanged(this);
            })
            .write(testPayload);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
}

class KeyLightAirDevice extends Device {
  constructor(adapter, id, deviceDescription) {
    super(adapter, id);
    this.name = deviceDescription.name;
    this.type = deviceDescription.type;
    this['@type'] = deviceDescription['@type'];
    this.description = deviceDescription.description;
    for (const propertyName in deviceDescription.properties) {
      const propertyDescription = deviceDescription.properties[propertyName];
      const property = new KeyLightAirProperty(
        this,
        propertyName,
        propertyDescription
      );
      this.properties.set(propertyName, property);
    }
  }
}

class KeyLightAdapter extends Adapter {
  constructor(addonManager) {
    super(addonManager, 'KeyLightAdapter', manifest.id);
    addonManager.addAdapter(this);

    if (!this.devices['key-light-air']) {
      const device = new KeyLightAirDevice(this, 'key-light-air', {
        name: 'Key Light Air',
        // https://iot.mozilla.org/schemas/#Light
        '@type': ['OnOffSwitch', 'Light'],
        description: 'Elgato Key Light Air',
        properties: {
          // https://iot.mozilla.org/schemas/#OnOffProperty
          on: {
            '@type': 'OnOffProperty',
            label: 'On/Off',
            name: 'on',
            type: 'boolean',
            value: false
          },
          // https://iot.mozilla.org/schemas/#BrightnessProperty
          brightness: {
            '@type': 'BrightnessProperty',
            label: 'Brightness',
            name: 'brightness',
            type: 'integer',
            value: 50,
            minimum: 3,
            maximum: 100
          },
          // https://iot.mozilla.org/schemas/#ColorTemperatureProperty
          temperature: {
            '@type': 'ColorTemperatureProperty',
            label: 'Temperature',
            name: 'temperature',
            type: 'integer',
            value: 4950,
            minimum: 2900,
            maximum: 7000
          }
        }
      });

      this.handleDeviceAdded(device);
    }
  }

  /**
   * Example process to add a new device to the adapter.
   *
   * The important part is to call: `this.handleDeviceAdded(device)`
   *
   * @param {String} deviceId ID of the device to add.
   * @param {String} deviceDescription Description of the device to add.
   * @return {Promise} which resolves to the device added.
   */
  addDevice(deviceId, deviceDescription) {
    return new Promise((resolve, reject) => {
      if (deviceId in this.devices) {
        reject(`Device: ${deviceId} already exists.`);
      } else {
        const device = new KeyLightAirDevice(this, deviceId, deviceDescription);
        this.handleDeviceAdded(device);
        resolve(device);
      }
    });
  }

  /**
   * Example process to remove a device from the adapter.
   *
   * The important part is to call: `this.handleDeviceRemoved(device)`
   *
   * @param {String} deviceId ID of the device to remove.
   * @return {Promise} which resolves to the device removed.
   */
  removeDevice(deviceId) {
    return new Promise((resolve, reject) => {
      const device = this.devices[deviceId];
      if (device) {
        this.handleDeviceRemoved(device);
        resolve(device);
      } else {
        reject(`Device: ${deviceId} not found.`);
      }
    });
  }

  /**
   * Start the pairing/discovery process.
   *
   * @param {Number} timeoutSeconds Number of seconds to run before timeout
   */
  startPairing(_timeoutSeconds) {
    console.log(
      'KeyLightAdapter:',
      this.name,
      'id',
      this.id,
      'pairing started'
    );
  }

  /**
   * Cancel the pairing/discovery process.
   */
  cancelPairing() {
    console.log(
      'KeyLightAdapter:',
      this.name,
      'id',
      this.id,
      'pairing cancelled'
    );
  }

  /**
   * Unpair the provided the device from the adapter.
   *
   * @param {Object} device Device to unpair with
   */
  removeThing(device) {
    console.log(
      'KeyLightAdapter:',
      this.name,
      'id',
      this.id,
      'removeThing(',
      device.id,
      ') started'
    );

    this.removeDevice(device.id)
      .then(() => {
        console.log('KeyLightAdapter: device:', device.id, 'was unpaired.');
      })
      .catch((err) => {
        console.error('KeyLightAdapter: unpairing', device.id, 'failed');
        console.error(err);
      });
  }

  /**
   * Cancel unpairing process.
   *
   * @param {Object} device Device that is currently being paired
   */
  cancelRemoveThing(device) {
    console.log(
      'KeyLightAdapter:',
      this.name,
      'id',
      this.id,
      'cancelRemoveThing(',
      device.id,
      ')'
    );
  }
}

module.exports = KeyLightAdapter;
