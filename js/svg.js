window.app.run(function ($rootScope, $http) {
  var _ = window._ || {};
  var x = 0;
  var y = 0;
  var max_height = 0;
  var tiles = {};

  $rootScope.exportSvg = true;
  $rootScope.max_width = 1500;
  $rootScope.height = 300;
  $rootScope.onAppLoaded.then(function () {
    setTimeout(function () {
      var canvas = document.getElementById("canvas");
      window.html2canvas(document.querySelector("#htmlcanvas"), {
        backgroundColor: null,
        canvas: canvas
      });

      var i = -1;
      eachBox(document.getElementById("htmlcanvas").childNodes, function (
        e,
        key,
        width,
        height,
        node
      ) {
        //console.log(e.nodeName, width, height);
        $rootScope.height = y + max_height;
        if (i % 15 === 0) {
          x = 0;
          y += max_height;
          max_height = height;
        }

        tiles[key] = [i, x, y, width, height];

        x += width;
        max_height = Math.max(max_height, height);
      });

      if (window.location.hash.match(/#dev/)) {
        return;
      }

      console.log(JSON.stringify(tiles));
      var output = "";
      _.each(tiles, function (v, k) {
        output += '"' + k + '": [' + v.join(",") + "]\n";
      });
      console.log(output + "\n\n");

      function eachBox(nodes, fn, key, width, height, node, level) {
        var found = false;
        _.each(nodes, function (e) {
          if (e.getAttribute && e.getAttribute("data-fig")) {
            key = e.getAttribute("data-fig").replace(/["]/g, "");
            i++;
          }
          if (e.getAttribute && e.getAttribute("data-svg")) {
            key = JSON.parse(e.getAttribute("data-svg")).join("_");
            i++;
          }
          if (e.nodeName === "svg") {
          } else if (e.nodeName === "DIV" || e.nodeName === "NG-INCLUDE") {
            if (
              eachBox(
                e.childNodes,
                fn,
                key,
                width || e.offsetWidth,
                height || e.offsetHeight,
                node || e,
                (level || 1) + 1
              ) === true
            ) {
              found = true;
              return;
            }
          } else if (e.nodeName === "#comment" || e.nodeName === "#text") {
            return;
          } else {
            console.log(e.nodeName);
            return;
          }
          if (key && tiles[key]) {
            return;
          }
          if (width || e.offsetWidth === 0) {
            return;
          }

          fn(
            e,
            key,
            width || e.offsetWidth,
            height || e.offsetHeight,
            node || e
          );
          found = true;
          //console.log(e);
        });
        return found;
      } // function eachBox
      /*
      function eachPic(nodes, fn, width, height, node) {
        _.each(nodes, function (e) {
          var bbox;
          if (e.nodeName === "IMG") {
            bbox = e;
          } else if (e.nodeName === "svg") {
            bbox = e.getBBox();
            bbox.width = Math.floor(bbox.width);
            bbox.height = Math.floor(bbox.height);
          } else if (e.nodeName === "DIV" || e.nodeName === "NG-INCLUDE") {
            eachPic(
              e.childNodes,
              fn,
              width || e.offsetWidth,
              height || e.offsetHeight,
              node || e
            );
            return;
          } else if (e.nodeName === "#comment" || e.nodeName === "#text") {
            return;
          } else {
            console.log(e.nodeName);
            return;
          }

          fn(e, width || bbox.width, height || bbox.height, node || e);
        });
      } // function eachPic
      */
    }, 2000);
  }); // endcallback onAppLoaded
});
