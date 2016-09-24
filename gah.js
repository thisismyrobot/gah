window.gah = (function () {
  'use strict'

  var setup = function (clientId) {
    var eventTarget = document.createElement('div')

    window.gapi.analytics.ready(function () {
      window.gapi.analytics.auth.authorize({
        container: 'auth-button',
        clientid: clientId
      })
      window.gapi.analytics.auth.on('success', function (response) {
        document.getElementById('auth-button').outerHTML = ''
        eventTarget.dispatchEvent(new window.Event('success'))
      })
    })

    return {
      on: function (evt, handler) {
        eventTarget.addEventListener(evt, function (e) {
          handler(e)
        }, false)
      }
    }
  }

  var check = function (viewId, target) {
    var eventTarget = document.createElement('div')

    new window.gapi.analytics.report.Data({
      'query': {
        'ids': 'ga:' + viewId,
        'metrics': 'ga:uniquePageViews',
        'dimensions': 'ga:pagePath,ga:day',
        'filters': 'ga:pagePath==' + target,
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
      eventTarget.dispatchEvent(new window.CustomEvent('success', payload))
    }).execute()

    return {
      on: function (evt, handler) {
        eventTarget.addEventListener(evt, function (e) {
          handler(e)
        }, false)
      }
    }
  }

  return {
    setup: setup,
    check: check
  }
})()
