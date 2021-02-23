angular.module("app", []).run(function ($rootScope) {
  var selectedChar = {};
  var matchFlags = {};
  $rootScope.commercialTlds = commercialTlds;
  $rootScope.signs = signs;
  $rootScope.tips = tips;
  $rootScope.alpha = { selected: true };
  $rootScope.groups = groups;
  $rootScope.countries = countries;
  $rootScope.languageSpecialCharset = languageSpecialCharset;
  $rootScope.texts = texts;
  $rootScope.selectLang = function (e) {
    e.selected = !e.selected;
    selectedChar[e.value] = !selectedChar[e.value];
    loadFlags();
    loadLevels();
    countMatch();
  };
  $rootScope.selectGroup = function (e, complement) {
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
    loadFlags();
    countMatch();
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
    _.each(groups, function (group) {
      if (!group.selected) {
        return;
      }
      if (!group.isos.match(k) && !group.inverted) {
        matched = false;
      } else if (group.isos.match(k) && group.inverted) {
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
    _.each(countries, function (v, k) {
      if (isFlagMatch(k)) {
        $rootScope.flags.push(k);
        matchFlags[k] = k;
      }
    });
  } // endfunction loadFlags

  function countMatch() {
    updateMatch($rootScope.levels1);
    updateMatch($rootScope.levels2);
    updateMatch($rootScope.levels3);

    _.each(groups, function (g) {
      g.match = 0;
      _.each(matchFlags, function (e) {
        if (g.isos.match(e)) {
          g.match++;
        }
      }); // endforeach groups
      g.match_ratio = Math.ceil((g.match / $rootScope.flags.length) * 5);
    }); // endforeach groups

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
        e.match_ratio = Math.ceil((e.match / $rootScope.flags.length) * 5);
      }); // endforeach chars
    } // endfunction updateMatch
  } // endfunction countMatch

  function loadLevels() {
    $rootScope.levels1 = {};
    $rootScope.levels2 = {};
    $rootScope.levels3 = {};
    _.each(languages, function (e) {
      if (e[1]) {
        $rootScope.levels1[e[1]] = {
          value: e[1],
          selected: !!selectedChar[e[1]],
          count: 0,
          match: 0
        };
      }
      if (e[2] && (selectedChar[e[1]] || selectedChar[e[2]])) {
        $rootScope.levels2[e[2]] = {
          value: e[2],
          selected: !!selectedChar[e[2]],
          count: 0,
          match: 0
        };
      }
    }); // endforeach languages

    var count = 0;
    _.each(selectedChar, function (v, k) {
      if (!$rootScope.levels1[k] || !v) {
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
