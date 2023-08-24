window.app.run(function ($rootScope, $http) {
  var _ = window._ || {};
  var x = 0;
  var y = 0;
  var tiles = {};
  var canvas2d = document.getElementById("canvas").getContext("2d");
  $rootScope.onAppLoaded.then(function () {
    setTimeout(function () {
      /*
      _.each($rootScope.flags, function (e) {
        var img = new Image();
        img.src = "flags/4x3/" + e + ".svg";
        canvas2d.drawImage(img, x * 50, y * 50, 50, 50);
        tiles[e] = [x, y];
        x += 1;
        if (x >= 10) {
          x = 0;
          y += 1;
        }
      });
      */
      _.each(document.getElementById("images").childNodes, function (e) {
        if (e.nodeName !== "IMG") {
          return;
        }
        canvas2d.drawImage(
          e,
          x * 100,
          y * 100,
          100,
          (100 * e.height) / e.width
        );
        tiles[e.getAttribute("src").replace(/.*\/(..)_?\.svg/, "$1")] = [x, y];
        x += 1;
        if (x >= 10) {
          x = 0;
          y += 1;
        }
      });
      console.log(JSON.stringify(tiles));
      var output = "";
      _.each(tiles, function (v, k) {
        output += k + ": [" + v.join(",") + "]" + "\n";
      });
      console.log(output + "\n\n");
    }, 1000);
  }); // endcallback onAppLoaded
});
