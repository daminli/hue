// Licensed to Cloudera, Inc. under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  Cloudera, Inc. licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

(function () {

  var originalSetInterval = window.setInterval;
  var originalClearInterval = window.clearInterval;
  var hueIntervals = [];

  /**
   * @param {Function} fn - the function to be called at intervals
   * @param {Number} timeout - timeout in milliseconds
   * @param {string} [app] - context for the interval
   */
  window.setInterval = function (fn, timeout, app) {
    var id = originalSetInterval(fn, timeout);
    hueIntervals.push({
      args: arguments,
      id: id,
      originalId: id,
      status: 'running'
    });
    return id;
  }

  /**
   * @param {Number} id - the original interval id generated by window.setInterval
   */

  window.clearInterval = function (id) {
    var foundIntervals = hueIntervals.filter(function (obj) {
      return obj.originalId === id
    });
    if (foundIntervals && foundIntervals.length > 0) {
      originalClearInterval(foundIntervals[0].id);
    }
    else {
      originalClearInterval(id);
    }
    hueIntervals = hueIntervals.filter(function (obj) {
      return obj.originalId !== id
    });
  }

  /**
   * @param {string} app - context for the intervals to be suspended
   */
  window.pauseAppIntervals = function (app) {
    hueIntervals.forEach(function (interval) {
      if (interval.args[2] && interval.args[2] === app) {
        interval.status = 'paused';
        originalClearInterval(interval.id);
      }
    });
  }

  /**
   * @param {string} app - context for the intervals to be restarted
   */
  window.resumeAppIntervals = function (app) {
    hueIntervals.forEach(function (interval) {
      if (interval.args[2] && interval.args[2] === app && interval.status === 'paused') {
        interval.status = 'running';
        var id = originalSetInterval(interval.args[0], interval.args[1]);
        interval.id = id;
      }
    });
  }

  /**
   * @param {string} app - context for the intervals to be cleared
   */
  window.clearAppIntervals = function (app) {
    hueIntervals.forEach(function (interval) {
      if (interval.args[2] && interval.args[2] === app) {
        window.clearInterval(interval.originalId);
      }
    });
  }

})()