window.app.run(function ($rootScope, $http) {
  var _ = window._ || {};
  var x = 0;
  var y = 0;
  var tiles = {};
  var canvas2d = document.getElementById("canvas").getContext("2d");
  $rootScope.onAppLoaded.then(function () {
    /*
    _.each($rootScope.filters, function (e) {
      if (e.image) {
        var img = document.createElement("img");
        img.src = "images/" + e.image;
        canvas2d.drawImage(img, x * 128, y * 128);
        tiles["images/" + e.image] = [x, y];
        x += 1;
        if (x > 10) {
          x = 0;
          y += 1;
        }
      }
    });
    console.log(JSON.stringify(tiles));
    return;
    */

    setTimeout(function () {
      _.each(document.getElementById("images").childNodes, function (e) {
        if (e.nodeName !== "IMG") {
          return;
        }
        if (Math.abs(e.height - e.width) > 2) {
          return;
        }
        canvas2d.drawImage(e, x * 128, y * 128, 128, 128);
        tiles[e.getAttribute("src")] = [x, y];
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
