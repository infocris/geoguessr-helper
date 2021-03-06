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
        function (files) {
          afterFiltersLoaded(files);
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
        function (files) {
          afterFiltersLoaded(files);
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
      if (!$rootScope.customFiltering && e.customIsos[k]) {
        return;
      }
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

  $rootScope.customFiltering = localStorage.customFiltering !== "disabled";

  $rootScope.updateCustomFiltering = function () {
    $rootScope.customFiltering = !$rootScope.customFiltering;
    localStorage.customFiltering = !$rootScope.customFiltering
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
        _.each(filters, function (e2) {
          if (
            !e.filter &&
            e2.filterType === e.filterType &&
            e2.isos === e.isos
          ) {
            e.filter = e2;
          }
        }); // endforeach loaded filters
        if (!e.filter) {
          _.each(filters, function (e2) {
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
        if (e.filter && e.filter.isos2[e3.iso]) {
          delete e.similarity;
        }
        if (e.filter && !e.filter.isos2[e3.iso]) {
          if (!e.filter.customIsos) {
            e.filter.customIsos = {};
          }
          e.filter.isos2[e3.iso] = 5;
          e.filter.customIsos[e3.iso] = true;
        }
        if (!e.filter) {
          console.warn("filter not found", e);
          data.errors++;
        }
        data.filters.push(e);
      }); // endforeach saved filters
      $rootScope.customFilters.push(data);
    }); // endforeach saved record

    window.makepatch = function () {
      var res = "";
      _.each(files, function (file) {
        console.log(file);
        var content = file.response.data;
        _.each(file.data.filters || file.data, function (filter) {
          if (!filter.customIsos) {
            return;
          }
          var isos = filter.isos.split(/\s*,\s*/);
          _.each(filter.customIsos, function (v, k) {
            isos.push(k);
          });
          isos = _.sortBy(isos, function (v) {
            return v.charCodeAt(0);
          });
          isos = _.uniq(isos);
          content = content.replace(
            "isos: " + filter.isos + "\n",
            "isos: " + isos.join(",") + "\n"
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
    var previous_length = isos.length;
    isos = _.uniq(isos);
    if (isos.length !== previous_length) {
      console.warn("filter has duplicate isos", v);
    }
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
    var files = [];
    _.each(filterFilenames, function (e) {
      var curr = {};
      curr.file = e;
      curr.previous = files[files.length - 1] || null;
      curr.index = files.length;
      curr.loaded = false;
      files.push(curr);
      loadYAMLFile(e, function (data, response) {
        curr.response = response;
        curr.data = data;
        _.each(files, function (e) {
          if ((e.previous && !e.previous.loaded) || !e.data || e.loaded) {
            return;
          }
          e.loaded = true;
          processData(e.data, e.response);
        });

        if (files[files.length - 1].loaded && onComplete) {
          var previousOnComplete = onComplete;
          onComplete = null;
          previousOnComplete(files);
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
          if (
            (!$rootScope.customFiltering && filter.customIsos[k]) ||
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
