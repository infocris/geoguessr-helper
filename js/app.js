window.app = window.angular
  .module("app", [])
  .run(function ($rootScope, $http, $q) {
    var _ = window._ || {};
    var selectedChar = {};
    var matchFlags = ($rootScope.matchFlags = {});
    var exactMatchFlags = ($rootScope.exactMatchFlags = {});
    var errors, tips, filters;
    var filterCoverage = {};
    var countryOrdering;
    var allFilters = ($rootScope.allFilters = {});
    var levelsFilterCount = ($rootScope.levelsFilterCount = [0, 0, 0, 0, 0, 0]);
    var clickCount = ($rootScope.clickCount = localStorage.clickCount
      ? JSON.parse(localStorage.clickCount)
      : {});

    var tiledImages = {};
    var tiledSvgs = {};
    $rootScope.svgs = [];

    $rootScope.loaded = {};
    $rootScope.clickCountSorted = clickCountSortBy(clickCount);

    $rootScope.$scope = $rootScope;

    $rootScope.errors = errors = [];
    $rootScope.tips = tips;
    $rootScope.filters = filters = [];
    $rootScope.images = {};

    var resolveOnAppLoaded;
    $rootScope.onAppLoaded = $q(function (resolve, reject) {
      resolveOnAppLoaded = resolve;
    });

    $rootScope.toggledClasses =
      JSON.parse(localStorage.toggledClasses || "{}") || {};

    $rootScope.$watch(
      function () {
        return JSON.stringify($rootScope.toggledClasses);
      },
      function (value) {
        localStorage.toggledClasses = value;
      }
    );

    /*
    loadYAMLFile("data/toggles.yml", function (data) {
      $rootScope.toggles = data;
      _.each(data, function (e) {
        prepareImage(e);
      });
    });
    */

    loadYAMLFile("data/texts.yml", function (data) {
      $rootScope.texts = data;
    });

    loadYAMLFile("data/misc.yml", function (data) {
      $rootScope.signs = data.countries;
    });

    $rootScope.filtersByCountry = {};

    function appendCssRule(content) {
      var style = document.createElement("style");
      style.type = "text/css";
      style.innerHTML = content;
      document.getElementsByTagName("head")[0].appendChild(style);
    }

    asyncLoadFiles(
      window.location.hash === "#!#dev" || window.location.hash === "#dev"
        ? [
            "data/toggles.yml",
            "images/tiles/tiles.yml",
            "flags/flags.yml",
            "data/countries.yml",
            "data/languages.yml",
            "data/filters/landscapes.yml",
            "data/filters/googlecars.yml",
            "data/filters/plates.yml",
            "data/filters/bollards.yml",
            "data/filters/turns.yml",
            "data/filters/signs.yml"
          ]
        : [
            "data/toggles.yml",
            "images/tiles/tiles.yml",
            "tiles/svg.yml",
            "flags/flags.yml",
            "data/countries.yml",
            "data/languages.yml",
            "data/filters/regions.yml",
            "data/filters/landscapes.yml",
            "data/filters/googlecars.yml",
            "data/filters/plates.yml",
            "data/filters/bollards.yml",
            "data/filters/turns.yml",
            "sign/pedestrians.yml",
            "sign/residentials.yml",
            "sign/cycles.yml",
            "data/filters/roads.yml",
            "data/poll.yml",
            "data/filters/signs.yml",
            "data/filters/misc.yml",
            "data/filters/inprogress.yml",
            "data/nopriority.yml",
            "data/nopark.yml",
            "data/circular.yml"
          ],
      function (files, filesByName) {
        $rootScope.files = files;
        $rootScope.countries = filesByName["data/countries.yml"].data.list;
        $rootScope.commercialTlds =
          filesByName["data/countries.yml"].data.commercialTlds;
        countryOrdering = filesByName["data/countries.yml"].data.order
          .replace(/\s$/, "")
          .split(" ");

        $rootScope.languages = filesByName["data/languages.yml"].data;

        if (filesByName["images/tiles/tiles.yml"]) {
          tiledImages = filesByName["images/tiles/tiles.yml"].data;
        }

        if (filesByName["tiles/svg.yml"]) {
          tiledSvgs = filesByName["tiles/svg.yml"].data;
        }

        $rootScope.toggles = filesByName["data/toggles.yml"].data;
        _.each($rootScope.toggles, function (e) {
          prepareImage(e);
        });

        _.each(filesByName["flags/flags.yml"].data, function (v, k) {
          appendCssRule(
            ".flag-icon-" +
              k +
              " { background-position: -" +
              v[0] * 50 +
              "px -" +
              v[1] * 50 +
              "px; } "
          );
        });

        $rootScope.chars = {};
        _.each($rootScope.languages.charsets, function (charset, k) {
          _.each(charset.split(""), function (e) {
            if ($rootScope.chars[e]) {
              return;
            }
            $rootScope.chars[e] = {
              value: e,
              selected: false,
              count: 0,
              match: 0
            };
          });
        }); // endforeach languages charsets

        var styles = [];
        var styles_covered = [];
        _.each($rootScope.countries, function (v, k) {
          styles.push("table." + k + "_select div.flag." + k);
          styles_covered.push("table." + k + "_covered div.flag." + k);
        });
        appendCssRule(
          styles.join(",") +
            " { background-color: #D9D933; opacity: 1; } " +
            styles_covered.join(",") +
            " { opacity: 1; } "
        );

        _.each($rootScope.countries, function (v, k) {
          if (!$rootScope.filtersByCountry[k]) {
            $rootScope.filtersByCountry[k] = [];
          }
        });
        _.each($rootScope.languages.groups, function (v) {
          readFilterValue(v);
          allFilters[filterKey(v)] = v;
          v.file = "languages.yml";
        });

        _.each(files, function (v) {
          var i = 1;
          if (v.data.filters) {
            _.each(v.data.filters, function (e) {
              e.index = i++;
              eachValue(e, v.response);
            });
          } // endif has filters

          if (v.file.match(/\/filters\//)) {
            _.each(v.data, function (e) {
              e.index = i++;
              eachValue(e, v.response);
            });
          } // endif is file filters

          if (v.data.countries) {
            _.each(v.data.countries, function (v, k) {
              appendDataCountry(k, v);
            });
          } // endif has countries data
        }); // endforeach files > load filters

        afterFiltersLoaded(files);

        try {
          loadLevels();
          loadFlags();
          countMatch();
        } catch (err) {
          console.error(err);
        }

        resolveOnAppLoaded();

        return;

        function eachValue(v, response) {
          if (!v.isos) {
            console.warn("empty isos", v);
          }
          readFilterValue(v);
          if (v.fig) {
            _.extend(v, v.fig);
          }
          v.previous = filters[filters.length - 1] || null;
          if (v.previous) {
            v.previous.next = v;
          }
          v.file = response.config.url.replace(/^.+\/([^\\/]+)$/, "$1");
          filters.push(v);
          if (v.svg || v.fig) {
            $rootScope.svgs.push(v);
          }
          allFilters[filterKey(v)] = v;
          v.level = v.level || 1;
          var i;
          for (i = 1; i < 5; i++) {
            if (i >= v.level) {
              levelsFilterCount[i]++;
            }
          }
          if (v.svg && v.svg[0] === "turn") {
          } else if (v.fig && v.fig.type && v.fig.type.match(/^bollard/)) {
          } else {
            return;
          }
          _.each(v.isos2, function (v2, k) {
            try {
              $rootScope.filtersByCountry[k].push(v);
            } catch (err) {
              console.error(err);
            }
          });
        }
      }
    ); // endcallback asyncLoadFiles

    $rootScope.level = localStorage.level || 1;
    $rootScope.toggledClasses["level" + $rootScope.level] = true;
    $rootScope.updateLevel = function (level) {
      $rootScope.toggledClasses["level1"] = false;
      $rootScope.toggledClasses["level2"] = false;
      $rootScope.toggledClasses["level3"] = false;
      $rootScope.toggledClasses["level" + level] = true;
      localStorage.level = level;
      $rootScope.level = level;
    };

    var currentMouseOverFilter = null;
    var mouseLeaveTimeout = null;

    $rootScope.mouseOverFilter = function (e, elt) {
      clearTimeout(mouseLeaveTimeout);
      if (e.match === 0) {
        return;
      }
      if (currentMouseOverFilter) {
        currentMouseOverFilter.mouseovered = false;
      }
      currentMouseOverFilter = e;
      e.mouseovered = true;
      _.each($rootScope.toggledClasses, function (v, k) {
        if (k.match(/_covered$|_select$/)) {
          $rootScope.toggledClasses[k] = false;
        }
      });
      _.each(filterCoverage[e.filterType], function (v, k) {
        $rootScope.toggledClasses[k + "_covered"] = true;
      });
      _.each(e.isos2, function (v, k) {
        if (!$rootScope.customFiltering && e.customIsos && e.customIsos[k]) {
          return;
        }
        $rootScope.toggledClasses[k + "_select"] = true;
      });
      $rootScope.toggledClasses["overFilter"] = true;
    };

    $rootScope.mouseLeaveFilter = function (e) {
      $rootScope.toggledClasses["overFilter"] = false;
      clearTimeout(mouseLeaveTimeout);
      mouseLeaveTimeout = setTimeout(function () {
        currentMouseOverFilter.mouseovered = false;
        _.each($rootScope.toggledClasses, function (v, k) {
          var m = k.match(/_covered$|_select$/);
          if (m) {
            $rootScope.toggledClasses[k] = m[0] === "_covered";
          }
        });
        $rootScope.toggledClasses["overFilter"] = false;
        $rootScope.$apply();
      }, 100);
      if (!e.selected) {
        return;
      }
      _.each($rootScope.toggledClasses, function (v, k) {
        if (k.match(/_select$/)) {
          $rootScope.toggledClasses[k] = false;
        }
      });
    };

    $rootScope.mouseOverChar = function (e) {
      _.each($rootScope.toggledClasses, function (v, k) {
        if (k.match(/_covered$|_select$/)) {
          $rootScope.toggledClasses[k] = false;
        }
      });
      _.each(e.isos, function (v) {
        $rootScope.toggledClasses[v + "_select"] = true;
      });
    };
    $rootScope.mouseLeaveChar = function (e) {
      _.each(e.isos, function (v) {
        $rootScope.toggledClasses[v] = false;
      });
    };

    $rootScope.selectChar = function (e) {
      e.selected = !e.selected;

      clickCount[filterKey(e)] =
        (clickCount[filterKey(e)] || 0) + (e.selected ? 1 : -1);

      if (clickCount[filterKey(e)] <= 0) {
        delete clickCount[filterKey(e)];
      }

      localStorage.clickCount = JSON.stringify(clickCount);

      selectedChar[e.value] = !selectedChar[e.value];
      if (!selectedChar[e.value]) {
        delete selectedChar[e.value];
      }
      $rootScope.toggledClasses.alpha = Object.values(selectedChar).length > 0;
      loadFlags();
      loadLevels();
      countMatch();
    };

    $rootScope.exclusiveFiltering =
      localStorage.exclusiveFiltering !== "disabled";

    $rootScope.updateExclusiveFiltering = function () {
      $rootScope.exclusiveFiltering = !$rootScope.exclusiveFiltering;
      localStorage.exclusiveFiltering = !$rootScope.exclusiveFiltering
        ? "disabled"
        : "enabled";
      loadFlags();
      countMatch();
    };

    $rootScope.customFiltering = localStorage.customFiltering !== "disabled";

    $rootScope.updateCustomFiltering = function () {
      $rootScope.customFiltering = !$rootScope.customFiltering;
      localStorage.customFiltering = !$rootScope.customFiltering
        ? "disabled"
        : "enabled";
      loadFlags();
      countMatch();
    };

    $rootScope.filterKey = filterKey;
    function filterKey(e) {
      if (e.value) {
        return "char:" + e.value;
      }
      return e.filterType + ":" + e.isos;
    }

    $rootScope.clickCountSortBy = clickCountSortBy;
    function clickCountSortBy(clickCount) {
      return _.sortBy(
        _.map(clickCount, function (v, k) {
          return { key: k, value: v };
        }),
        function (v) {
          return -v.value;
        }
      );
    }

    $rootScope.selectFilter = function (e) {
      e.selected = !e.selected;

      clickCount[filterKey(e)] =
        (clickCount[filterKey(e)] || 0) + (e.selected ? 1 : -1);

      if (clickCount[filterKey(e)] <= 0) {
        delete clickCount[filterKey(e)];
      }

      localStorage.clickCount = JSON.stringify(clickCount);

      //rootScope.clickCountSorted = clickCountSortBy(clickCount);

      //localStorage["clickCount:filter:" + e.filterType + ":" + e.isos] = clickCount[e.filterType + ":" + e.isos];

      $rootScope.toggledClasses[e.filterType] = e.selected;
      if ($rootScope.exclusiveFiltering && e.selected && e.match === 0) {
        if (deselectExclusiveFilter(e)) {
          return;
        }
      }
      loadFlags();
      countMatch();
      _.each(filters, function (e) {
        if (e.selected) {
          $rootScope.toggledClasses[e.filterType] = true;
        }
      });
      function deselectExclusiveFilter(e) {
        if (e.next) {
          if (e.next.selected) {
            $rootScope.selectFilter(e.next);
            return true;
          }
          if (e.next.next && e.next.next.selected) {
            $rootScope.selectFilter(e.next.next);
            return true;
          }
        }
        if (e.previous) {
          if (e.previous.selected) {
            $rootScope.selectFilter(e.previous);
            return true;
          }
          if (e.previous.previous && e.previous.previous.selected) {
            $rootScope.selectFilter(e.previous.previous);
            return true;
          }
        }
      }
    };

    $rootScope.updateSearchText = function (text) {
      $rootScope.search_text = text;
      loadFlags();
      countMatch();
    };

    $rootScope.imageClass = function (e) {
      var image = e.image || e.image2;
      var m = image.match(/(\/|^)([^\\/]+)\/([^\\/]+)$/);
      if (!m) {
        return "";
      }
      return m[2];
    };

    $rootScope.resetFilters = function () {
      _.each(allFilters, function (e) {
        e.selected = false;
      });
      _.each($rootScope.toggledClasses, function (v, k) {
        if (!k.match(/_covered$|_select$|^level|^saveFiltersEnabled$/) && v) {
          $rootScope.toggledClasses[k] = false;
        }
      });
      selectedChar = {};
      $rootScope.search_text = "";
      loadFlags();
      loadLevels();
      countMatch();
    };

    var customFilters = [];
    $rootScope.customFilters = [];
    $rootScope.addFilter = function (iso) {
      var res = { iso: iso, filters: [], chars: "" };
      var savedValue = {
        iso: iso,
        filters: [],
        chars: "",
        date: new Date().toISOString()
      };
      res.savedValue = res;
      _.each(allFilters, function (e) {
        if (!e.selected) {
          return;
        }
        if (!e.isos2[iso]) {
          e.isos2[iso] = 5;
          if (!e.customIsos) {
            e.customIsos = {};
            e.customCount = 0;
            e.customDiff = 0;
          }
          e.customIsos[iso] = true;
        }
        var data = { isos: e.isos, filterType: e.filterType, file: e.file };
        _.each(["fig", "svg", "image", "image2", "title", "name"], function (
          ee
        ) {
          if (e[ee]) {
            data[ee] = e[ee];
          }
        });
        res.filters.push(_.extend({ filter: e }, data));
        savedValue.filters.push(
          _.extend(
            {
              $$hashKey: e.$$hashKey
            },
            data
          )
        );
      }); // endforeach filters

      _.each($rootScope.allLevels, function (e) {
        if (!e.selected) {
          return;
        }
        savedValue.chars += e.value;
        res.savedValue.chars += e.value;
      }); // endforeach levels language

      $rootScope.customFilters.push(res);
      customFilters.push(savedValue);

      localStorage.filters = JSON.stringify(
        _.reject(customFilters, function (e) {
          return !!e.deleted;
        })
      );

      loadFlags();
      countMatch();
    }; // endfunction addFilter
    $rootScope.updateCustomFilter = function (item) {
      item.savedValue.deleted = item.deleted;
      localStorage.filters = JSON.stringify(
        _.reject(customFilters, function (e) {
          return !!e.deleted;
        })
      );
    };

    return;

    // start angular.run inner functions

    function afterFiltersLoaded(files) {
      if (!localStorage.filters) {
        return;
      }
      customFilters = JSON.parse(localStorage.filters);
      //console.log(localStorage.filters);
      $rootScope.customFilters = [];
      _.each(customFilters, function (e3) {
        var data = { iso: e3.iso, filters: [], date: e3.date, errors: 0 };
        data.savedValue = e3;
        _.each(e3.filters, function (e) {
          e = _.clone(e);
          if (e.svg) {
            _.each(filters, function (e2) {
              if (e.filter || !e2.svg) {
                return;
              }
              if (
                e.svg[0] === e2.svg[0] &&
                JSON.stringify(e.svg) === JSON.stringify(e2.svg)
              ) {
                e.filter = e2;
              }
            }); // endforeach loaded filters
          } // endif svg
          if (e.fig) {
            delete e.fig.$$hashKey;
            _.each(filters, function (e2) {
              if (e.filter || !e2.fig) {
                return;
              }
              if (JSON.stringify(e.fig) === JSON.stringify(e2.fig)) {
                e.filter = e2;
              }
            }); // endforeach loaded filters
          } // endif fig
          if (!e.svg && !e.fig) {
            _.each(filters, function (e2) {
              if (e.filter) {
                return;
              }
              if (e2.filterType === e.filterType && e2.isos === e.isos) {
                e.filter = e2;
              }
            }); // endforeach loaded filters
            if (!e.filter) {
              _.each(allFilters, function (e2) {
                if (e.filter || e2.filterType !== e.filterType) {
                  return;
                }
                var similarity = similar_text(e2.isos, e.isos, true);
                if (similarity < 75) {
                  return;
                }
                e.similarity = similarity;
                e.filter = e2;
              }); // endforeach loaded filters
            } // endif trying to find filter by approximation
          } // endif not svg
          if (e.filter && e.filter.isos2[e3.iso]) {
            delete e.similarity;
          }
          if (e.filter && !e.filter.customIsos) {
            e.filter.customIsos = {};
            e.filter.customCount = 0;
            e.filter.customDiff = 0;
          }
          if (e.filter) {
            e.filter.customCount++;
          }
          if (e.filter && !e.filter.isos2[e3.iso]) {
            e.filter.isos2[e3.iso] = 5;
            e.filter.customIsos[e3.iso] = true;
            e.filter.customDiff++;
          }
          if (!e.filter) {
            console.warn("filter not found", e);
            data.errors++;
          }
          data.filters.push(e);
        }); // endforeach saved filters
        data.filters = _.sortBy(data.filters, function (e) {
          return e.filter ? (e.filter.customIsos[e3.iso] ? 1 : 2) : 3;
        });
        $rootScope.customFilters.push(data);
      }); // endforeach saved record

      $rootScope.customIsos = function (filter) {
        var isos = filter.isos.split(/\s*,\s*/);
        _.each(filter.customIsos, function (v, k) {
          isos.push(k);
        });
        isos = _.sortBy(isos, function (v) {
          return v.charCodeAt(0);
        });
        isos = _.reject(isos, function (v) {
          return v === "";
        });
        return _.uniq(isos);
      };

      window.makepatch = function () {
        var res = "";
        _.each(files, function (file) {
          var content = file.response.data;
          _.each(file.data.filters || file.data, function (filter) {
            if (!filter.customIsos) {
              return;
            }
            content = content.replace(
              "isos: " + filter.isos + "\n",
              "isos: " + $rootScope.customIsos(filter).join(",") + "\n"
            );
          }); // endforeach filters
          if (content === file.response.data) {
            return;
          }
          res += window.Diff.createTwoFilesPatch(
            file.file,
            file.file,
            file.response.data,
            content
          );
        }); // endforeach files
        console.log(res);
        return "Apply patch to update data.";
      }; // endfunction makepatch
    } // endfunction afterFiltersLoaded

    function appendDataCountry(k, v) {
      if (v.length) {
        _.each(v, function (v) {
          appendDataCountry(k, v);
        });
        return;
      }
      readFilterValue(v);
      $rootScope.filtersByCountry[k].push(v);
    }

    function prepareImage(v) {
      if (v.image || v.image2) {
        v.imageClass = $rootScope.imageClass(v);
      }
      var image = v.image || v.image2 || null;
      if (v.image) {
        image = "images/" + image;
      }
      if (image) {
        $rootScope.images[image] = v;
      }

      v.imageStyle = function (style) {
        if (!style) {
          return { "max-width": 48, "max-height": 48 };
        }
        return style;
      };

      var preCalculatedStyle = {};

      if (image && tiledImages[image]) {
        v.imagePlaceholder = v.image ? "blank.png" : "images/blank.png";
        v.imagePlaceholder += "#" + image;
        v.imageClass = [v.imageClass, "tile"];
        v.imageStyle = function (style) {
          return imageStyle(style || {}, tiledImages[image], 1536);
        };
      } // endif tiledImage

      var key;
      if (v.svg) {
        key = v.svg.join("_");
      }
      if (v.svg && tiledSvgs[key]) {
        v.image2 = "placeholder";
        v.imagePlaceholder = "images/blank.png#" + tiledSvgs[key][0];
        v.imageClass = ["tile", "tileSvg"];
        v.imageStyle = function (style) {
          return imageStyle(style || {}, tiledSvgs[key], 1500);
        };
      } // endif svg

      if (v.fig) {
        key = JSON.stringify(v.fig).replace(/["]/g, "");
      }
      if (v.fig && tiledSvgs[key]) {
        v.image2 = "placeholder";
        v.imagePlaceholder = "images/blank.png#" + tiledSvgs[key][0];
        v.imageClass = ["tile", "tileSvg"];
        v.imageStyle = function (style) {
          return imageStyle(style || {}, tiledSvgs[key], 1500);
        };
      } // endif fig

      function calculateStyle(widthHeight, data, background_width) {
        var style = {};
        var ratio = 1; // widthHeight / Math.max(data[3], data[4]);
        if (data[4] > widthHeight) {
          ratio = widthHeight / data[4];
        }
        //console.log(ratio, data[4], widthHeight);
        style["background-position"] =
          "-" +
          Math.round(data[1] * ratio) +
          "px -" +
          Math.round(data[2] * ratio) +
          "px";
        style["background-size"] = Math.round(background_width * ratio) + "px";
        style["width"] = Math.round(data[3] * ratio);
        style["height"] = Math.round(data[4] * ratio);

        //style["max-width"] = Math.round(data[3] * ratio);
        //style["max-height"] = Math.round(data[4] * ratio);
        return style;
      }

      function imageStyle(style, data, background_width) {
        var key = style["max-height"] || style["height"] || 48;
        if (v.file === "bollards.yml") {
          key = 60;
        }
        if (!preCalculatedStyle[key]) {
          preCalculatedStyle[key] = calculateStyle(key, data, background_width);
        }
        style = _.clone(style);
        _.extend(style, preCalculatedStyle[key]);
        return style;

        /*
        if (ratio > 1) {
          console.log(ratio);
          console.log(style["max-height"] || style["height"]);
          console.log(Math.max(data[3], data[4]));
          console.log(data[3], data[4]);
        }
        */
      }
    }

    function readFilterValue(v) {
      v.filterType = getFilterType(v);

      prepareImage(v);

      //v.customIsos = {};
      if (!v.isos) {
        v.isos = "";
        v.isos2 = {};
        return;
      }

      var isos = v.isos.split(/\s*,\s*/);
      var previous_length = isos.length;
      isos = _.uniq(isos);
      if (isos.length !== previous_length) {
        console.warn("filter has duplicate isos", v);
      }
      v.isos2 = {};
      var defaultWeight = 5;
      if (isos.length > 20) {
        //defaultWeight = 0.0001;
      }
      _.each(isos, function (e) {
        var m = e.match(/(.+)\.(.+)/);
        if (m) {
          v.isos2[m[1]] = parseInt(m[2], 10);
        } else {
          v.isos2[e] = defaultWeight;
        }
      });

      if (!v.complementary) {
        _.each(v.isos2, function (v2, k) {
          updateFilterCoverage(v, k, v2);
        });
        return;
      }
      var isos2 = {};
      defaultWeight = 5;
      if (
        Object.values($rootScope.countries).length -
          Object.values(isos).length >
        20
      ) {
        //defaultWeight = 0.0001;
      }
      isos = [];
      _.each($rootScope.countries, function (v2, k) {
        if (!v.isos2[k]) {
          isos2[k] = defaultWeight;
          updateFilterCoverage(v, k, v2);
          isos.push(k);
        }
      });
      v.isos2 = isos2;
      v.isos = isos.join(",");
      return;

      function updateFilterCoverage(filter, code, weight) {
        if (!filterCoverage[filter.filterType]) {
          filterCoverage[filter.filterType] = {};
        }
        if (
          !filterCoverage[filter.filterType][code] ||
          weight > filterCoverage[filter.filterType][code]
        ) {
          filterCoverage[filter.filterType][code] = weight;
        }
      }
    } // endfunction readFilterValue

    function asyncLoadFiles(filterFilenames, onComplete, processData) {
      var files = [];
      var filesByName = {};
      _.each(filterFilenames, function (e) {
        var curr = {};
        curr.file = e;
        curr.previous = files[files.length - 1] || null;
        curr.index = files.length;
        curr.loaded = false;
        files.push(curr);
        filesByName[e] = curr;
        loadYAMLFile(
          e,
          function (data, response) {
            curr.response = response;
            curr.data = data;
          },
          function (response) {
            if (!curr.data) {
              curr.response = response;
              curr.data = {};
              curr.loaded = true;
            }
            _.each(files, function (e) {
              if ((e.previous && !e.previous.loaded) || !e.data || e.loaded) {
                return;
              }
              e.loaded = true;
              if (processData) {
                processData(e.data, e.response);
              }
            });

            if (files[files.length - 1].loaded && onComplete) {
              var previousOnComplete = onComplete;
              onComplete = null;
              previousOnComplete(files, filesByName);
            }
          }
        );
      });
    }

    function loadYAMLFile(url, callback, complete) {
      $http
        .get(
          url,
          url.match(/\.ya?ml$/)
            ? { cache: true }
            : { cache: true, responseType: "arraybuffer" }
        )
        .then(function (response) {
          try {
            if (url.match(/\.ya?ml$/)) {
              callback(window.jsyaml.load(response.data), response);
            }
          } catch (err) {
            console.error(err);
            errors.push({ error: err, response: response });
          }
          if (complete) {
            complete(response);
          }
        });
    }

    function getFilterType(e) {
      if (e.group) {
        return e.group;
      }
      if (e.image || e.image2) {
        return $rootScope.imageClass(e);
      }
      if (e.svg) {
        return e.svg[0];
      }
      if (e.fig && e.fig.type) {
        if (e.fig.type.match(/^bollard/)) {
          return "bollard";
        }
        return e.fig.type;
      }
      return "misc";
    }

    function loadFlags() {
      var weights = ($rootScope.weightFlags = {});
      $rootScope.flags = [];
      $rootScope.matchFlags = matchFlags = {};
      $rootScope.exactMatchFlags = exactMatchFlags = {};
      $rootScope.sumWeight = 0;
      $rootScope.similarityCount = 0;
      _.each(countryOrdering, function (k) {
        weights[k] = 0;
      });
      _.each(countryOrdering, function (k) {
        if (isFlagMatch(k)) {
          $rootScope.flags.push(k);
          matchFlags[k] = k;
          exactMatchFlags[k] = k;
          $rootScope.sumWeight += weights[k];
          return;
        } else if (!$rootScope.exclusiveFiltering && weights[k] > 0.01) {
          $rootScope.flags.push(k);
          matchFlags[k] = k;
          $rootScope.similarityCount++;
          $rootScope.sumWeight += weights[k];
          return;
        }
      });

      $rootScope.flags = _.sortBy($rootScope.flags, function (k) {
        return 10 - (weights[k] || 5) - (exactMatchFlags[k] ? 100 : 0);
      });

      $rootScope.minWeight = 1;
      var weights2 = ($rootScope.weights2 = []);
      _.each($rootScope.flags, function (k) {
        weights2.push(weights[k]);
      });
      if (weights2.length >= 5 && weights2[0] === weights2[4]) {
        //$rootScope.minWeight = weights2[0] + 1;
      }
      if (weights2.length < 5) {
        $rootScope.minWeight = 0;
      }

      return;

      // start loadFlags inner functions

      function isFlagMatch(k) {
        var matched = true;
        _.each(selectedChar, function (v, k2) {
          if (!v) {
            return;
          }
          if (!$rootScope.languages.charsets[k]) {
            matched = false;
            return;
          }
          if (!$rootScope.languages.charsets[k].match(k2)) {
            matched = false;
            weights[k] -= 1;
            return;
          }
          weights[k] += 10;
        });
        _.each(allFilters, function (filter) {
          if (!filter.selected) {
            return;
          }
          if (
            (!$rootScope.customFiltering &&
              filter.customIsos &&
              filter.customIsos[k]) ||
            !filter.isos2[k]
          ) {
            if (
              filterCoverage[filter.filterType][k] &&
              filterCoverage[filter.filterType][k] < 5
            ) {
              weights[k] -= filterCoverage[filter.filterType][k];
            } else {
              weights[k] -= 1;
            }
            matched = false;
            return;
          }
          weights[k] += filter.isos2[k];
        }); // endforeach filters
        if ($rootScope.search_text && $rootScope.search_text.length >= 2) {
          if ($rootScope.search_text.length === 2) {
            if (k !== $rootScope.search_text) {
              matched = false;
              return;
            }
            weights[k] += 100;
          } else if (
            !($rootScope.texts[k] || [])
              .join(",")
              .toLowerCase()
              .match($rootScope.search_text.toLowerCase())
          ) {
            matched = false;
            return;
          }
          weights[k] += 15;
        } // endif search_text
        return matched;
      } // endfunction isFlagMatch
    } // endfunction loadFlags

    function countMatch() {
      var max = 0;
      updateMatch($rootScope.levels1);
      updateMatch($rootScope.levels2);
      updateMatch($rootScope.levels3);

      _.each(allFilters, function (g) {
        g.match = 0;
        _.each(matchFlags, function (e) {
          if (g.isos.match(e)) {
            g.match++;
          }
        }); // endforeach filters
        g.match_ratio = Math.ceil((g.match / $rootScope.flags.length) * 5);
      }); // endforeach filters

      function updateMatch(chars) {
        _.each(chars, function (e) {
          e.match = 0;
          e.isos = [];
          _.each(matchFlags, function (v, k) {
            if (
              $rootScope.languages.charsets[v] &&
              $rootScope.languages.charsets[v].match(e.value)
            ) {
              e.isos.push(k);
              e.match++;
            }
          });
          max = Math.max(max, e.match);
        }); // endforeach chars

        _.each(chars, function (e) {
          e.match_ratio = Math.ceil((e.match / max) * 5);
        });
      } // endfunction updateMatch
    } // endfunction countMatch

    /**
     * Load level 1/2/3 languages choices
     */
    function loadLevels() {
      $rootScope.allLevels = [];
      $rootScope.levels1 = {};
      $rootScope.levels2 = {};
      $rootScope.levels3 = {};
      _.each($rootScope.languages.charsl1.split(" "), function (e) {
        if (!e) {
          return;
        }
        $rootScope.levels1[e] = {
          value: e,
          selected: !!selectedChar[e],
          count: 0,
          match: 0
        };
        $rootScope.allLevels.push($rootScope.levels1[e]);
      }); // endforeach languages

      var count = 0;
      _.each(selectedChar, function (v, k) {
        if (/*!$rootScope.levels1[k] ||*/ !v) {
          return;
        }
        count++;
      }); // endforeach selectedChar

      var matchedCharsets = [];
      _.each($rootScope.languages.charsets, function (v, k) {
        var matched = true;
        _.each($rootScope.levels1, function (v2, k2) {
          if (v.match(k2)) {
            v2.count++;
          }
          if (!selectedChar[k2]) {
            return;
          }
          if (matched && !v.match(k2)) {
            matched = false;
          }
        }); // endforeach levels1
        if (matched) {
          matchedCharsets.push(v);
        }
      }); // endforeach $rootScope.languages.charsets

      if (count === 0) {
        return;
      }

      var countChars = {};
      _.each(matchedCharsets, function (v) {
        _.each(v.split(""), function (e) {
          if (!countChars[e]) {
            countChars[e] = 0;
          }
          countChars[e]++;
        });
      });
      // endforeach matchedCharsets

      var items = [];
      _.each(countChars, function (v, k) {
        if (v >= matchedCharsets.length) {
          return;
        }
        items.push([k, v]);
      });
      items = _.sortBy(items, function (a) {
        return -a[1];
      });
      _.each(items, function (v) {
        if ($rootScope.levels1[v[0]]) {
          return;
        }
        (function (k, v, e) {
          $rootScope.allLevels.push(e);
          if (v > 1) {
            $rootScope.levels2[k] = e;
            return;
          }
          $rootScope.levels3[k] = e;
        })(v[0], v[1], {
          value: v[0],
          selected: !!selectedChar[v[0]]
        });
      });
    } // endfunction loadLevels

    function similar_text(first, second, percent) {
      // eslint-disable-line camelcase
      //  discuss at: https://locutus.io/php/similar_text/
      // original by: Rafał Kukawski (https://blog.kukawski.pl)
      // bugfixed by: Chris McMacken
      // bugfixed by: Jarkko Rantavuori original by findings in stackoverflow (https://stackoverflow.com/questions/14136349/how-does-similar-text-work)
      // improved by: Markus Padourek (taken from https://www.kevinhq.com/2012/06/php-similartext-function-in-javascript_16.html)
      //   example 1: similar_text('Hello World!', 'Hello locutus!')
      //   returns 1: 8
      //   example 2: similar_text('Hello World!', null)
      //   returns 2: 0

      if (
        first === null ||
        second === null ||
        typeof first === "undefined" ||
        typeof second === "undefined"
      ) {
        return 0;
      }

      first += "";
      second += "";

      let pos1 = 0;
      let pos2 = 0;
      let max = 0;
      const firstLength = first.length;
      const secondLength = second.length;
      let p;
      let q;
      let l;
      let sum;

      for (p = 0; p < firstLength; p++) {
        for (q = 0; q < secondLength; q++) {
          for (
            l = 0;
            p + l < firstLength &&
            q + l < secondLength &&
            first.charAt(p + l) === second.charAt(q + l);
            l++
          ) {
            // eslint-disable-line max-len
            // @todo: ^-- break up this crazy for loop and put the logic in its body
          }
          if (l > max) {
            max = l;
            pos1 = p;
            pos2 = q;
          }
        }
      }

      sum = max;

      if (sum) {
        if (pos1 && pos2) {
          sum += similar_text(first.substr(0, pos1), second.substr(0, pos2));
        }

        if (pos1 + max < firstLength && pos2 + max < secondLength) {
          sum += similar_text(
            first.substr(pos1 + max, firstLength - pos1 - max),
            second.substr(pos2 + max, secondLength - pos2 - max)
          );
        }
      }

      if (!percent) {
        return sum;
      }

      return (sum * 200) / (firstLength + secondLength);
    } // endfunction similar_text
  });
