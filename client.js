var client = (function() {

  return {
    setup: function(clientId) {
      var eventTarget = document.createElement('div');

      // Bring in the API client.
      (function(w,d,s,g,js,fjs){
        g=w.gapi||(w.gapi={});g.analytics={q:[],ready:function(cb){this.q.push(cb)}};
        js=d.createElement(s);fjs=d.getElementsByTagName(s)[0];
        js.src='https://apis.google.com/js/platform.js';
        fjs.parentNode.insertBefore(js,fjs);js.onload=function(){g.load('analytics')};
      }(window,document,'script'));

      // Do setup once it's ready.
      gapi.analytics.ready(function() {
        gapi.analytics.auth.authorize({
          container: 'auth-button',
          clientid: clientId,
        });
        gapi.analytics.auth.on('success', function(response) {
          document.getElementById('auth-button').outerHTML = '';
          eventTarget.dispatchEvent(new Event('success'));
        });
      });

      return {
        on: function(evt, handler) {
          eventTarget.addEventListener(evt, function(e) {
            handler(e);
          }, false);
        }
      };
    },

    check: function(viewId, target) {
      var eventTarget = document.createElement('div');

      var report = new gapi.analytics.report.Data({
          'query': {
            'ids': 'ga:' + viewId,
            'metrics': 'ga:uniquePageViews',
            'dimensions': 'ga:pagePath,ga:day',
            'filters': 'ga:pagePath==' + target,
            'start-date': '0daysAgo',
            'end-date': '0daysAgo',
            'samplingLevel': 'HIGHER_PRECISION',
          }
        }).on('success', function(response) {
          var count = 0;
          if (response.totalResults > 0) {
            count = parseInt(response.rows[0][2], 10);
          }
          var payload = {'detail': {'count': count}};
          eventTarget.dispatchEvent(new CustomEvent('success', payload));
        }).execute();

      return {
        on: function(evt, handler) {
          eventTarget.addEventListener(evt, function(e) {
            handler(e);
          }, false);
        }
      };
    }

  };
})();


