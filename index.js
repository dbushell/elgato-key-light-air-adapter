/**
 * index.js - Loads the adapter.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

'use strict';

const KeyLightAdapter = require('./elgato-key-light-air-adapter');

module.exports = (addonManager) => {
  new KeyLightAdapter(addonManager);
};
