window.app.run(function ($rootScope, $http) {
  var _ = window._ || {};
  var x = 0;
  var y = 0;
  var i = 0;
  var max_height = 0;
  var tiles = {};
  var canvas2d = document.getElementById("canvas").getContext("2d");
  $rootScope.max_width = 1536;
  $rootScope.height = 100;
  $rootScope.onAppLoaded.then(function () {
    setTimeout(function () {
      eachPic();
      $rootScope.$apply();

      x = y = max_height = 0;
      eachPic(function (e, x, y, width, height) {
        canvas2d.drawImage(e, x, y, width, height);
        tiles[e.getAttribute("src")] = [i++, x, y, width, height];
      });

      console.log(JSON.stringify(tiles));
      var output = "";
      _.each(tiles, function (v, k) {
        output += k + ": [" + v.join(",") + "]" + "\n";
      });
      console.log(output + "\n\n");

      return;

      function eachPic(fn) {
        _.each(document.getElementById("images").childNodes, function (e) {
          var bbox;
          if (e.nodeName === "IMG") {
            bbox = e;
          } else {
            return;
          }

          $rootScope.height = y + max_height;
          //console.log(y + max_height);
          if (x + bbox.width >= $rootScope.max_width) {
            x = 0;
            y += max_height;
            max_height = bbox.height;
          }
          try {
            if (fn) {
              fn(e, x, y, bbox.width, bbox.height);
            }
            x += bbox.width;
            max_height = Math.max(max_height, bbox.height);
          } catch (err) {
            console.error(err);
          }
        });
      }
    }, 5000);
  }); // endcallback onAppLoaded
});
