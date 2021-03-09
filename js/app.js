angular.module("app", []).run(function ($rootScope, $http) {
  var selectedChar = {};
  var matchFlags = {};
  var errors, tips, filters;
  $rootScope.$scope = $rootScope;
  $rootScope.matchFlags = matchFlags;
  //$rootScope.signs = signs;
  $rootScope.errors = errors = [];
  $rootScope.tips = tips;
  $rootScope.filters = filters = [];
  $rootScope.toggledClasses = {};

  loadYAMLFile("data/toggles.yml", function (data) {
    $rootScope.toggles = data;
  });

  function appendDataCountry(k, v) {
    if (!$rootScope.filtersByCountry[k]) {
      $rootScope.filtersByCountry[k] = [];
    }
    if (!v.length) {
      $rootScope.filtersByCountry[k].push(v);
      return;
    }
    _.each(v, function (v) {
      $rootScope.filtersByCountry[k].push(v);
    });
  }

  loadYAMLFile("data/texts.yml", function (data) {
    $rootScope.texts = data;
  });

  loadYAMLFile("data/misc.yml", function (data) {
    $rootScope.signs = data.countries;
  });

  loadYAMLFile("sign/pedestrians.yml", function (data) {
    _.each(data.countries, function (v, k) {
      v.file = "pedestrians.yml";
      appendDataCountry(k, v);
    });
  });

  loadYAMLFile("sign/residentials.yml", function (data) {
    _.each(data.countries, function (v, k) {
      v.file = "residentials.yml";
      appendDataCountry(k, v);
    });
  });

  loadFilterData([
    "data/filters/regions.yml",
    "data/filters/landscapes.yml",
    "data/filters/googlecars.yml",
    "data/filters/plates.yml",
    "data/filters/bollards.yml",
    "data/filters/turns.yml",
    "sign/pedestrians.yml",
    "sign/residentials.yml",
    "data/filters/roads.yml",
    "data/filters/polls.yml",
    "data/filters/signs.yml",
    "data/filters/cycles.yml",
    "data/filters/misc.yml"
  ]);

  $rootScope.filtersByCountry = {};

  function loadFilterData(filterFilenames) {
    loadYAMLFile(
      filterFilenames.shift(),
      function (data, response) {
        if (data.filters) {
          _.each(data.filters, function (v, k) {
            eachValue(v);
          });
          return;
        }
        _.each(data, function (v, k) {
          eachValue(v);
        });
        function eachValue(v) {
          v.previous = filters[filters.length - 1] || null;
          if (v.previous) {
            v.previous.next = v;
          }
          v.file = response.config.url.replace(/^.+\/([^\/]+)$/, "$1");
          filters.push(v);
          if (v.svg && v.svg[0] === "turn") {
          } else if (v.fig && v.fig.type && v.fig.type.match(/^bollard/)) {
          } else {
            return;
          }
          _.each(v.isos.split(","), function (e) {
            //appendDataCountry(e, v);
            if (!$rootScope.filtersByCountry[e]) {
              $rootScope.filtersByCountry[e] = [];
            }
            $rootScope.filtersByCountry[e].push(v);
          });
        }
      },
      function () {
        if (filterFilenames.length > 0) {
          loadFilterData(filterFilenames);
        }
      }
    );
  }

  function loadYAMLFile(url, callback, complete) {
    $http.get(url).then(function (response) {
      try {
        callback(jsyaml.load(response.data), response);
      } catch (err) {
        errors.push({ error: err, response: response });
      }
      if (complete) {
        complete();
      }
    });
  }

  loadYAMLFile("data/countries.yml", function (data) {
    var styles = [];
    _.each(data.list, function (v, k) {
      styles.push("table." + k + " div.flag." + k);
    });
    var style = document.createElement("style");
    style.type = "text/css";
    style.innerHTML = styles.join(",") + " { background-color: #D9D933; }";
    document.getElementsByTagName("head")[0].appendChild(style);

    $rootScope.countries = data.list;
    $rootScope.commercialTlds = data.commercialTlds;
    countryOrdering = data.order.replace(/\s$/, "").split(" ");
    loadYAMLFile("data/languages.yml", function (data) {
      $rootScope.languages = data;
      loadLevels();
      loadFlags();
      countMatch();
    });
  });

  $rootScope.mouseOverFilter = function (e) {
    _.each(e.isos.split(","), function (v) {
      $rootScope.toggledClasses[v] = true;
    });
  };
  $rootScope.mouseLeaveFilter = function (e) {
    _.each(e.isos.split(","), function (v) {
      $rootScope.toggledClasses[v] = false;
    });
  };

  $rootScope.mouseOverChar = function (e) {
    _.each(e.isos, function (v) {
      $rootScope.toggledClasses[v] = true;
    });
  };
  $rootScope.mouseLeaveChar = function (e) {
    _.each(e.isos, function (v) {
      $rootScope.toggledClasses[v] = false;
    });
  };

  $rootScope.selectChar = function (e) {
    e.selected = !e.selected;
    $rootScope.toggledClasses.alpha = e.selected;
    selectedChar[e.value] = !selectedChar[e.value];
    loadFlags();
    loadLevels();
    countMatch();
  };

  function getFilterType(e) {
    if (e.image || e.image2) {
      return $rootScope.imageClass(e);
    }
    if (e.svg) {
      return e.svg[0];
    }
    if (e.fig && e.fig.type.match(/^bollard/)) {
      return "bollard";
    }
    if (e.fig && e.fig.type) {
      return e.fig.type;
    }
    return "unknown";
  }

  $rootScope.selectFilter = function (e) {
    var m;
    e.selected = !e.selected;
    $rootScope.toggledClasses[getFilterType(e)] = e.selected;
    if (e.selected && e.match === 0) {
      if (deselectExclusiveFilter(e)) {
        return;
      }
    }
    loadFlags();
    countMatch();
    _.each(filters, function (e) {
      if (e.selected) {
        $rootScope.toggledClasses[getFilterType(e)] = true;
      }
    });
  };
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
  $rootScope.updateSearchText = function (text) {
    $rootScope.search_text = text;
    loadFlags();
    countMatch();
  };

  $rootScope.imageClass = function (e) {
    var image = e.image || e.image2;
    var m = image.match(/(\/|^)([^\/]+)\/([^\/]+)$/);
    if (!m) {
      return "";
    }
    return m[2];
  };

  $rootScope.resetFilters = function () {
    _.each(filters, function (e) {
      e.selected = false;
    });
    selectedChar = {};
    $rootScope.search_text = "";
    loadFlags();
    loadLevels();
    countMatch();
  };

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
      }
    });
    _.each([filters, $rootScope.languages.groups], function (collection) {
      _.each(collection, function (filter) {
        if (!filter.selected) {
          return;
        }
        if (filter.complementary) {
          if (filter.isos.match(k)) {
            matched = false;
          }
        } else if (!filter.isos.match(k) && !filter.inverted) {
          matched = false;
        } else if (filter.isos.match(k) && filter.inverted) {
          matched = false;
        }
      });
    });
    if ($rootScope.search_text) {
      if (
        !(($rootScope.texts[k] || []).join(",") + "," + k)
          .toLowerCase()
          .match($rootScope.search_text.toLowerCase())
      ) {
        matched = false;
      }
    } // endif search_text
    return matched;
  } // endfunction isFlagMatch

  function loadFlags() {
    $rootScope.flags = [];
    matchFlags = {};
    _.each(countryOrdering, function (k) {
      if (isFlagMatch(k)) {
        $rootScope.flags.push(k);
        matchFlags[k] = k;
      }
    });
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
          if (g.complementary) {
            if (!g.isos.match(e)) {
              g.match++;
            }
          } else if (g.isos.match(e)) {
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
    _.each($rootScope.languageSpecialCharset, function (v, k) {
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
    }); // endforeach $rootScope.languageSpecialCharset

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
