window.angular.module("app", []).run(function ($rootScope, $http) {
  var selectedChar = {};
  var matchFlags = ($rootScope.matchFlags = {});
  var exactMatchFlags = ($rootScope.exactMatchFlags = {});
  var errors, tips, filters;
  var filterCoverage = {};
  var countryOrdering;

  var _ = window._ || {};

  $rootScope.$scope = $rootScope;

  $rootScope.errors = errors = [];
  $rootScope.tips = tips;
  $rootScope.filters = filters = [];

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

  loadYAMLFile("data/toggles.yml", function (data) {
    $rootScope.toggles = data;
  });

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
  loadYAMLFile("data/countries.yml", function (data) {
    var styles = [];
    var styles_covered = [];
    _.each(data.list, function (v, k) {
      styles.push("table." + k + "_select div.flag." + k);
      styles_covered.push("table." + k + "_covered div.flag." + k);
    });
    appendCssRule(
      styles.join(",") +
        " { background-color: #D9D933; opacity: 1; } " +
        styles_covered.join(",") +
        " { opacity: 1; } "
    );

    $rootScope.countries = data.list;
    $rootScope.commercialTlds = data.commercialTlds;

    _.each($rootScope.countries, function (v, k) {
      if (!$rootScope.filtersByCountry[k]) {
        $rootScope.filtersByCountry[k] = [];
      }
    });

    countryOrdering = data.order.replace(/\s$/, "").split(" ");
    loadYAMLFile("data/languages.yml", function (data) {
      $rootScope.languages = data;
      _.each(data.groups, function (v) {
        readFilterValue(v);
        v.file = "languages.yml";
      });
      loadLevels();
      loadFlags();
      countMatch();
    });

    if (window.location.hash === "#!#dev" || window.location.hash === "#dev") {
      loadFilterData(
        [
          "data/filters/landscapes.yml",
          "data/filters/googlecars.yml",
          "data/filters/plates.yml",
          "data/filters/bollards.yml",
          "data/filters/turns.yml",
          "data/filters/signs.yml"
        ],
        function () {
          afterFiltersLoaded();
        }
      );
    } else {
      loadFilterData(
        [
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
          "data/filters/polls.yml",
          "data/filters/signs.yml",
          "data/filters/misc.yml",
          "data/filters/inprogress.yml"
        ],
        function () {
          afterFiltersLoaded();
        }
      );
      _.each(["pedestrians", "residentials", "cycles"], function (e) {
        loadYAMLFile("sign/" + e + ".yml", function (data) {
          _.each(data.countries, function (v, k) {
            v.file = e + ".yml";
            appendDataCountry(k, v);
          });
        });
      });

      return;

      function appendDataCountry(k, v) {
        readFilterValue(v);
        if (!v.length) {
          $rootScope.filtersByCountry[k].push(v);
          return;
        }
        _.each(v, function (v) {
          $rootScope.filtersByCountry[k].push(v);
        });
      }
    }
  }); // endfunction loadYAMLFile("data/countries.yml"

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

  $rootScope.mouseOverFilter = function (e, elt) {
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
      $rootScope.toggledClasses[k + "_select"] = true;
    });
    $rootScope.toggledClasses["overFilter"] = true;
  };

  $rootScope.mouseLeaveFilter = function (e) {
    $rootScope.toggledClasses["overFilter"] = false;
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

  $rootScope.selectFilter = function (e) {
    e.selected = !e.selected;
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
    _.each([filters, $rootScope.languages.groups], function (collection) {
      _.each(collection, function (e) {
        e.selected = false;
      });
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
    var res = { iso: iso, filters: [] };
    var savedValue = { iso: iso, filters: [], date: new Date().toISOString() };
    res.savedValue = res;
    _.each([filters, $rootScope.languages.groups], function (collection) {
      _.each(collection, function (e) {
        if (!e.selected) {
          return;
        }
        if (!e.isos2[iso]) {
          e.isos2[iso] = 5;
          if (!e.customIsos) {
            e.customIsos = {};
          }
          e.customIsos[iso] = true;
        }
        res.filters.push({
          filter: e,
          isos: e.isos,
          fig: e.fig || null,
          filterType: e.filterType,
          file: e.file
        });
        savedValue.filters.push({
          $$hashKey: e.$$hashKey,
          isos: e.isos,
          fig: e.fig || null,
          svg: e.svg || null,
          filterType: e.filterType,
          file: e.file
        });
      }); // endforeach
    }); // endforeach filters
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

  // start angular run inner functions

  function afterFiltersLoaded() {
    customFilters = JSON.parse(localStorage.filters);
    //console.log(localStorage.filters);
    $rootScope.customFilters = [];
    _.each(customFilters, function (e3) {
      var data = { iso: e3.iso, filters: [], date: e3.date };
      data.savedValue = e3;
      _.each(e3.filters, function (e) {
        e = _.clone(e);
        _.each(filters, function (e2) {
          if (e2.filterType !== e.filterType || e2.isos !== e.isos) {
            return;
          }
          e.filter = e2;
          if (!e2.isos2[e3.iso]) {
            if (!e2.customIsos) {
              e2.customIsos = {};
            }
            e2.isos2[e3.iso] = 5;
            e2.customIsos[e3.iso] = true;
          }
          data.filters.push(e);
        }); // endforeach loaded filters
      }); // endforeach saved filters
      $rootScope.customFilters.push(data);
    }); // endforeach saved record
  } // endfunction afterFiltersLoaded

  function readFilterValue(v) {
    v.filterType = getFilterType(v);
    if (v.image || v.image2) {
      v.imageClass = $rootScope.imageClass(v);
    }
    if (!v.isos) {
      return;
    }
    var isos = v.isos.split(/\s*,\s*/);
    v.isos2 = {};
    var defaultWeight = 5;
    if (isos.length > 20) {
      defaultWeight = 0.0001;
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
      Object.values($rootScope.countries).length - Object.values(isos).length >
      20
    ) {
      defaultWeight = 0.0001;
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

  function loadFilterData(filterFilenames, onComplete) {
    var array = [];
    _.each(filterFilenames, function (e) {
      var curr = {};
      curr.file = e;
      curr.previous = array[array.length - 1] || null;
      curr.index = array.length;
      curr.loaded = false;
      array.push(curr);
      loadYAMLFile(e, function (data, response) {
        curr.response = response;
        curr.data = data;
        _.each(array, function (e) {
          if ((e.previous && !e.previous.loaded) || !e.data || e.loaded) {
            return;
          }
          e.loaded = true;
          processData(e.data, e.response);
        });

        if (array[array.length - 1].loaded && onComplete) {
          var previousOnComplete = onComplete;
          onComplete = null;
          previousOnComplete();
        }
      });
    });

    /*
    loadYAMLFile(
      filterFilenames.shift(),
      function (data, response) {
        processData(data, response);
      },
      function () {
        if (filterFilenames.length > 0) {
          loadFilterData(filterFilenames, onComplete);
          return;
        }
        if (onComplete) {
          onComplete();
        }
      }
    );
    */

    return;

    function processData(data, response) {
      if (data.filters) {
        _.each(data.filters, function (v, k) {
          eachValue(v, response);
        });
        return;
      }
      _.each(data, function (v, k) {
        eachValue(v, response);
      });
    }

    function eachValue(v, response) {
      if (!v.isos) {
        console.warn("empty isos", v);
        return;
      }
      readFilterValue(v);
      v.previous = filters[filters.length - 1] || null;
      if (v.previous) {
        v.previous.next = v;
      }
      v.file = response.config.url.replace(/^.+\/([^\\/]+)$/, "$1");
      filters.push(v);
      if (v.svg && v.svg[0] === "turn") {
      } else if (v.fig && v.fig.type && v.fig.type.match(/^bollard/)) {
      } else {
        return;
      }
      _.each(v.isos2, function (v2, k) {
        $rootScope.filtersByCountry[k].push(v);
      });
    }
  } // endfunction loadFilterData

  function loadYAMLFile(url, callback, complete) {
    $http.get(url).then(function (response) {
      try {
        callback(window.jsyaml.load(response.data), response);
      } catch (err) {
        console.error(err);
        errors.push({ error: err, response: response });
      }
      if (complete) {
        complete();
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
      return 10 - (weights[k] || 5);
    });

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
      _.each([filters, $rootScope.languages.groups], function (collection) {
        _.each(collection, function (filter) {
          if (!filter.selected) {
            return;
          }
          if (!filter.isos2[k]) {
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
        });
      });
      if ($rootScope.search_text) {
        if (
          !(($rootScope.texts[k] || []).join(",") + "," + k)
            .toLowerCase()
            .match($rootScope.search_text.toLowerCase())
        ) {
          matched = false;
          return;
        }
        weights[k] += 5;
      } // endif search_text
      return matched;
    } // endfunction isFlagMatch
  } // endfunction loadFlags

  function countMatch() {
    var max = 0;
    updateMatch($rootScope.levels1);
    updateMatch($rootScope.levels2);
    updateMatch($rootScope.levels3);

    _.each([filters, $rootScope.languages.groups], function (collection) {
      _.each(collection, function (g) {
        g.match = 0;
        _.each(matchFlags, function (e) {
          if (g.isos.match(e)) {
            g.match++;
          }
        }); // endforeach filters
        g.match_ratio = Math.ceil((g.match / $rootScope.flags.length) * 5);
      }); // endforeach filters
    });

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

  function loadLevels() {
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
      if (v[1] > 1) {
        $rootScope.levels2[v[0]] = {
          value: v[0],
          selected: !!selectedChar[v[0]]
        };
      } else {
        $rootScope.levels3[v[0]] = {
          value: v[0],
          selected: !!selectedChar[v[0]]
        };
      }
    });
  } // endfunction loadLevels
});
