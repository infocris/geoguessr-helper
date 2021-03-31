window.app.run(function ($rootScope, $http) {
  var _ = window._ || {};
  var x = 0;
  var y = 0;
  var max_height = 0;
  var tiles = {};
  var canvas2d = document.getElementById("canvas").getContext("2d");
  $rootScope.max_width = 1500;
  $rootScope.height = 300;
  $rootScope.onAppLoaded.then(function () {
    setTimeout(function () {
      eachPic();
      $rootScope.$apply();

      x = y = max_height = 0;
      eachPic(function (e, x, y, width, height) {
        if (e.nodeName !== "svg") {
          canvas2d.drawImage(e, x, y, width, height);
          return;
        }

        console.log(e.outerHTML);

        var v = window.canvg.Canvg.fromString(
          document.getElementById("canvas2").getContext("2d"),
          "<svg>" + e.innerHTML + "</svg>"
        );

        // Start SVG rendering with animations and mouse handling.
        v.start();

        canvas2d.drawImage(e, x, y, width, height);

        return;

        e = new Image();
        e.onload = () => {
          console.log("a");
          if (fn) {
            fn(e, x, y, bbox.width, bbox.height);
          }
        };
        //console.log(e);
        e.src = window.webkitURL.createObjectURL(
          new Blob(["<svg>" + e.innerHTML + "</svg>"], {
            type: "image/svg+xml;charset=utf-8"
          })
        );

        //document.body.appendChild(e);

        return;

        tiles[e.getAttribute("src")] = [x, y, e.width, e.height];
      });

      return;

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
          if (e.nodeName === "NG-INCLUDE") {
            //console.log(e.childNodes.length);
            _.each(e.childNodes, function (e2) {
              if (e2.nodeName === "svg") {
                e = e2;
              }
            });
            if (e.nodeName !== "svg") {
              return;
            }
            //console.log(e);
            //return;
            bbox = e.getBBox();
            bbox.width = Math.floor(bbox.width);
            bbox.height = Math.floor(bbox.height);
            //document.body.appendChild(e);
            //console.log(e);
          } else if (e.nodeName === "IMG") {
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
    }, 1000);
  }); // endcallback onAppLoaded
});
