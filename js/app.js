angular.module("app", []).run(function ($rootScope, $http) {
  var selectedChar = {};
  var matchFlags = {};
  $rootScope.$scope = $rootScope;
  $rootScope.matchFlags = matchFlags;
  $rootScope.commercialTlds = commercialTlds;
  $rootScope.signs = signs;
  $rootScope.errors = errors = [];
  $rootScope.tips = tips;
  $rootScope.filters = filters = [];

  $http.get("data/toggles.yml").then(function (response) {
    try {
      $rootScope.toggles = jsyaml.load(response.data);
    } catch (err) {
      errors.push({ error: err, response: response });
    }
  });

  loadFilterData([
    "regions.yml",
    "landscapes.yml",
    "languages.yml",
    "googlecars.yml",
    "plates.yml",
    "bollards.yml",
    "turns.yml",
    "pedestrians.yml",
    "roads.yml",
    "polls.yml",
    "signs.yml",
    "misc.yml"
  ]);

  function loadFilterData(filterFilenames) {
    $http
      .get("data/filters/" + filterFilenames.shift())
      .then(function (response) {
        try {
          _.each(jsyaml.load(response.data), function (v) {
            filters.push(v);
          });
        } catch (err) {
          errors.push({ error: err, response: response });
        }
        if (filterFilenames.length > 0) {
          loadFilterData(filterFilenames);
        }
      });
  }

  $rootScope.countries = countries;
  $rootScope.languageSpecialCharset = languageSpecialCharset;
  $rootScope.texts = texts;
  $rootScope.selectLang = function (e) {
    $rootScope.alpha = { selected: true };
    e.selected = !e.selected;
    selectedChar[e.value] = !selectedChar[e.value];
    loadFlags();
    loadLevels();
    countMatch();
  };
  $rootScope.selectGroup = function (e, complement) {
    var m;
    if (e.image) {
      if ((m = e.image.match(/(\/|^)([^\/]+)\/([^\/]+)$/))) {
        $rootScope[m[2]] = { selected: true };
      }
    }
    /*
    if (e.fig && e.fig.type && e.fig.type.match(/^bollard/)) {
      $rootScope.bollard = { selected: true };
    }
    */
    if (!e.selected || !!e.inverted == !!complement) {
      e.selected = !e.selected;
    }
    e.inverted = complement;
    loadFlags();
    countMatch();
  };
  $rootScope.reverseGroup = function (e) {
    e.inverted = !e.inverted;
    loadFlags();
    countMatch();
  };
  $rootScope.updateSearchText = function (text) {
    $rootScope.search_text = text;
    loadFlags();
    countMatch();
  };

  $rootScope.imageClass = function (e) {
    var m = e.image.match(/(\/|^)([^\/]+)\/([^\/]+)$/);
    if (!m) {
      return "";
    }
    return m[2];
  };

  loadLevels();
  loadFlags();
  countMatch();

  function isFlagMatch(k) {
    var matched = true;
    _.each(selectedChar, function (v, k2) {
      if (!v) {
        return;
      }
      if (!languageSpecialCharset[k]) {
        matched = false;
        return;
      }
      if (!languageSpecialCharset[k].match(k2)) {
        matched = false;
      }
    });
    _.each(filters, function (filter) {
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

    _.each(filters, function (g) {
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

    function updateMatch(chars) {
      _.each(chars, function (e) {
        e.match = 0;
        _.each(matchFlags, function (v) {
          if (
            languageSpecialCharset[v] &&
            languageSpecialCharset[v].match(e.value)
          ) {
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
    _.each(languages2.split(" "), function (e) {
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
    _.each(languageSpecialCharset, function (v, k) {
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
    }); // endforeach languageSpecialCharset

    /*
          _.each(selectedChar, function (v, k) {
            if (!v) {
              return;
            }
            if ($rootScope.levels1[k]) {
              return;
            }
            $rootScope.levels1[k] = {
              value: k,
              selected: !!selectedChar[k]
            };
          }); // endforeach selectedChar
          */

    if (count == 0) {
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
