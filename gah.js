/*

  Usage:

    var client = new Gah(oathClientId, analyticsViewId, targetPath)

    client.on('checked', function (e) {
      alert('Count: ' + e.detail.count)
    })

    client.setup()
    client.on('ready', function () {
      client.check()
    })

*/
window.Gah = function (clientId, viewId, target) {
  'use strict'

  var _clientId = clientId
  var _viewId = viewId
  var _target = target

  var _eventTarget = document.createElement('div')
  var _setup = false

  var _hideAuthButton = function () {
    var button = document.getElementById('auth-button')
    if (button !== null) {
      button.outerHTML = ''
    }
  }

  var setup = function () {
    window.gapi.analytics.ready(function () {
      window.gapi.analytics.auth.authorize({
        container: 'auth-button',
        clientid: _clientId
      })
      window.gapi.analytics.auth.on('success', function (response) {
        _hideAuthButton()
        _setup = true
        _eventTarget.dispatchEvent(new window.Event('ready'))
      })
    })
  }

  var check = function () {
    if (_setup !== true) {
      console.log('ERROR: Must call setup() before check()')
      return
    }
    new window.gapi.analytics.report.Data({
      'query': {
        'ids': 'ga:' + _viewId,
        'metrics': 'ga:uniquePageViews',
        'dimensions': 'ga:pagePath,ga:day',
        'filters': 'ga:pagePath==' + _target,
        'start-date': '0daysAgo',
        'end-date': '0daysAgo',
        'samplingLevel': 'HIGHER_PRECISION'
      }
    }).on('success', function (response) {
      var count = 0
      if (response.totalResults > 0) {
        count = parseInt(response.rows[0][2], 10)
      }
      var payload = {'detail': {'count': count}}
      _eventTarget.dispatchEvent(new window.CustomEvent('checked', payload))
    }).execute()
  }

  var on = function (evt, handler) {
    if (evt === 'checked' || evt === 'ready') {
      _eventTarget.addEventListener(evt, function (e) {
        handler(e)
      }, false)
      return
    }
    console.log('ERROR: Unknown event "' + evt + '", must be "ready" or "checked"')
  }

  return {
    on: on,
    setup: setup,
    check: check
  }
}
