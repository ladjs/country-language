let fs = require('fs'),
  async = require('breeze-async'),
  jsdom = require('jsdom'),
  csv = require('csv'),
  _ = require('underscore'),
  obj = {},
  rtl_langs = require('./dataSources/rtl_languages').langs;

_.str = require('underscore.string');

obj.languageFamilies = [];
obj.languages = [];
obj.countries = [];
obj.locales = [];

function setLanguageScriptDirection(iso_1, iso_2, iso_3) {
  let rtl_1 = _.find(rtl_langs, function (langObj) {
      return langObj.iso639_1 === iso_1;
    }),
    rtl_2 = _.find(rtl_langs, function (langObj) {
      return langObj.iso639_2 === iso_2;
    }),
    rtl_3 = _.find(rtl_langs, function (langObj) {
      return langObj.iso639_3 === iso_3;
    }),
    direction = 'LTR';
  if (rtl_1 || rtl_2 || rtl_3) {
    direction = 'RTL';
  }

  return direction;
}

function strCommaToArray(commaStr) {
  let strArr = commaStr.split(',');
  for (let i = 0; i < strArr.length; i++) {
    strArr[i] = _.str.trim(strArr[i]);
  }

  return strArr;
}

function outputJSON(obj, filename) {
  let filepath = __dirname + '/' + filename,
    output = JSON.stringify(obj, undefined, 2);
  fs.writeFileSync(filepath, output, 'utf8');
}

function parseLanguages(next) {
  let langFamily,
    filePath = __dirname + '/dataSources/ISO639_codes.csv',
    langName,
    iso639_3;

  csv()
    .from.path(filePath, { delimiter: ',', escape: '"' })
    .on('record', function (row) {
      langFamily = row[0];
      if (
        !_.find(obj.languageFamilies, function (name) {
          return name === langFamily;
        })
      ) {
        obj.languageFamilies.push(langFamily);
      }

      iso639_3 = _.str.trim(row[6].split('+')[0]);
      langName = row[1].replace(' (modern)', '');
      langName = langName.replace(' (Farsi)', ', Farsi');
      obj.languages.push({
        iso639_1: row[3],
        iso639_2: row[4],
        iso639_2en: row[5],
        iso639_3: iso639_3,
        name: strCommaToArray(langName),
        nativeName: strCommaToArray(row[2]),
        direction: setLanguageScriptDirection(row[3], row[4], iso639_3),
        family: langFamily
      });
    })
    .on('end', function () {
      next();
    });
}

function parseAdditionalLanguages(next) {
  jsdom.env(
    'http://www.loc.gov/standards/iso639-2/php/code_list.php',
    ['http://code.jquery.com/jquery.js'],
    function (errors, window) {
      let {$} = window
        ; var tweakLanguage = function (langObj) {
          if (langObj.iso639_2 === 'bal') {
            langObj.name.push('Balochi');
          }

          return langObj;
        };

      $('tr[valign="top"]').each(function (i) {
        if (i > 0) {
          let $tds = $(this).children('td'),
            iso639_all = $($tds[0]).html().split('<br>'),
            iso639_2,
            iso639_2en,
            name_all = $($tds[2]).text(),
            names = name_all.split(';');
          if (iso639_all.length === 1) {
            iso639_2 = iso639_2en = iso639_all[0];
          } else {
            iso639_2 = iso639_all[1].slice(0, 3);
            iso639_2en = iso639_all[0].slice(0, 3);
          }

          names = names.map(function (name) {
            return name.trim();
          });
          if (
            !_.find(obj.languages, function (lang) {
              return lang.iso639_2 === iso639_2;
            })
          ) {
            obj.languages.push(
              tweakLanguage({
                iso639_1: '',
                iso639_2: iso639_2,
                iso639_2en: iso639_2en,
                iso639_3: iso639_2,
                name: names,
                nativeName: [''],
                direction: setLanguageScriptDirection('', iso639_2, iso639_2),
                family: ''
              })
            );
          }
        }
      });
      next();
    }
  );
}

function parseCountries(next) {
  let filePath = __dirname + '/dataSources/ISO3166_codes.csv';

  csv()
    .from.path(filePath, { delimiter: ',', escape: '"' })
    .on('record', function (row) {
      obj.countries.push({
        code_2: row[1],
        code_3: row[2],
        numCode: row[3],
        name: row[0]
      });
    })
    .on('end', function () {
      obj.countries.splice(0, 1);
      next();
    });
}

function parseCountryLanguages(next) {
  let objCountries = obj.countries,
    objLanguages = obj.languages;

  jsdom.env(
    'http://en.wikipedia.org/wiki/List_of_official_languages',
    ['http://code.jquery.com/jquery.js'],
    function (errors, window) {
      let {$} = window
        parseStarted = false,
        parseEnded = false,
        langLetterHeaderCode = 65, // A
        language,
        langCode,
        langObj,
        fakeCountries = ['TRNC'],
        countryCode;

      $('#mw-content-text')
        .children()
        .each(function () {
          var $this = $(this),
            tag = $this.prop('tagName');

          if ((parseStarted || tag === 'H3') && !parseEnded) {
            parseStarted = true;
            switch (tag) {
              case 'H3':
                var cont = $this.children('span').html(),
                ; var letterCode = cont.charCodeAt(0);
                if (letterCode === langLetterHeaderCode) {
                  langLetterHeaderCode = letterCode + 1;
                } else {
                  parseEnded = true;
                  next(
                    'Some parse error happened before parsing language group ' +
                      letterCode
                  );
                }

                break;
              case 'P':
                if ($this.children('b').length > 0) {
                  language = $($this.children('b')).children('a').html();
                  if (!language) language = $($this.children('b')).html();
                  language = language.replace('Cantonese', 'Chinese');
                  language = language.replace(', Mandarin', '');
                  if (language.indexOf('Ndebele') === 0) {
                    language = $($this.children('a')).html() + ' ' + language;
                  }

                  if (language === 'Sotho') language = 'Southern Sotho';
                  langObj = _.find(objLanguages, function (lng) {
                    return _.find(lng.name, function (name) {
                      return name === language;
                    });
                  });
                  if (langObj) {
                    langCode = langObj.iso639_3;
                  } else {
                    langObj = _.find(objLanguages, function (lng) {
                      return _.find(lng.nativeName, function (name) {
                        return name === language;
                      });
                    });
                    if (langObj) {
                      langCode = langObj.iso639_3;
                    } else {
                      langCode = null;
                      console.log('-- Language [', language, '] not used');
                    }
                  }

                  if (langObj) {
                    langObj.countries = langObj.countries || [];
                  }
                }

                break;
              case 'UL':
                if (langCode) {
                let country
                    mCountry,
                    cRef = [
                      {
                        name: 'Syria',
                        ref: 'Syrian Arab Republic'
                      },
                      {
                        name: 'Bolivia',
                        ref: 'Bolivia, Plurinational State of'
                      },
                      {
                        name: 'Burma',
                        ref: 'Myanmar'
                      },
                      {
                        name: 'Macau',
                        ref: 'Macao'
                      },
                      {
                        name: 'Taiwan',
                        ref: 'Taiwan, Province of China'
                      },
                      {
                        name: 'The Bahamas',
                        ref: 'Bahamas'
                      },
                      {
                        name: 'The Gambia',
                        ref: 'Gambia'
                      },
                      {
                        name: 'Republic of Ireland',
                        ref: 'Ireland'
                      },
                      {
                        name: 'Sint Maarten',
                        ref: 'Sint Maarten (Dutch part)'
                      },
                      {
                        name: 'Tanzania',
                        ref: 'Tanzania, United Republic of'
                      },
                      {
                        name: 'United States of America',
                        ref: 'United States'
                      },
                      {
                        name: 'Democratic Republic of the Congo',
                        ref: 'Congo, the Democratic Republic of the'
                      },
                      {
                        name: 'Republic of the Congo',
                        ref: 'Congo'
                      },
                      {
                        name: 'Vatican City',
                        ref: 'Holy See (Vatican City State)'
                      },
                      {
                        name: 'North Korea',
                        ref: "Korea, Democratic People's Republic of"
                      },
                      {
                        name: 'South Korea',
                        ref: 'Korea, Republic of'
                      },
                      {
                        name: 'Laos',
                        ref: "Lao People's Democratic Republic"
                      },
                      {
                        name: 'Republic of Macedonia',
                        ref: 'Macedonia, the former Yugoslav Republic of'
                      },
                      {
                        name: 'Brunei',
                        ref: 'Brunei Darussalam'
                      },
                      {
                        name: 'Iran',
                        ref: 'Iran, Islamic Republic of'
                      },
                      {
                        name: 'East Timor',
                        ref: 'Timor-Leste'
                      },
                      {
                        name: 'São Tomé and Príncipe',
                        ref: 'Sao Tome and Principe'
                      },
                      {
                        name: 'Moldova',
                        ref: 'Moldova, Republic of'
                      },
                      {
                        name: 'Russia',
                        ref: 'Russian Federation'
                      },
                      {
                        name: 'Venezuela',
                        ref: 'Venezuela, Bolivarian Republic of'
                      },
                      {
                        name: 'Vietnam',
                        ref: 'Viet Nam'
                      }
                    ];

                  // eslint-disable-next-line no-inner-declarations
                  function addCountryLanguage(langObj, mCountry, langCode) {
                    countryCode = mCountry.code_3;
                    var arrIns = countryCode !== 'NOR' ? 'push' : 'unshift';
                    langObj.countries.push(countryCode);
                    let countrObj = _.find(objCountries, function (c) {
                      return c.code_3 === countryCode;
                    });
                    countrObj.languages = countrObj.languages || [];
                    if (_.indexOf(countrObj.languages, langCode) === -1) {
                      countrObj.languages[arrIns](langCode);
                    }
                  }

                  // eslint-disable-next-line no-inner-declarations
                  function processLangCountry(lis) {
                    var childrenCountries;

                    _.each($(lis), function (li) {
                      country = $(li).children('a').html();
                      if (!country && language === 'Tagalog') { // ref Filipino
                        country = 'Philippines';
                      }
                      if (
                        !_.find(fakeCountries, function (c) {
                          return c === country;
                        })
                      ) {
                        mCountry = _.find(objCountries, function (c) {
                          return c.name === country;
                        });
                        if (mCountry) {
                          console.log('++++++++++ country:', country); // DEBUG
                        } else {
                          let cNameTranslation = _.find(cRef, function (ref) {
                            return ref.name === country;
                          });
                          if (cNameTranslation) {
                            mCountry = _.find(objCountries, function (c) {
                              return c.name === cNameTranslation.ref;
                            });
                            country = mCountry.name;
                            console.log('++++++++++ country:', country); // DEBUG
                          } else {
                            mCountry = null;
                            console.log('---------- country:', country); // DEBUG
                          }
                        }
                      } else {
                        mCountry = null;
                      }

                      if (langObj && mCountry) {
                        addCountryLanguage(langObj, mCountry, langCode);

                        if (langCode === 'nor') {
                          langCode = 'nno';
                          langObj = _.find(objLanguages, function (lng) {
                            return lng.iso639_3 === langCode;
                          });
                          langObj.countries = langObj.countries || [];
                          addCountryLanguage(langObj, mCountry, langCode);
                          langCode = 'nob';
                          langObj = _.find(objLanguages, function (lng) {
                            return lng.iso639_3 === langCode;
                          });
                          langObj.countries = langObj.countries || [];
                          addCountryLanguage(langObj, mCountry, langCode);
                        }

                        childrenCountries = $(li).children('ul');
                        if (childrenCountries) {
                          processLangCountry(
                            $(childrenCountries).children('li')
                          );
                        }
                      }
                    });
                  }

                  console.log('language:', language); // DEBUG
                  processLangCountry($($this.children('li')));
                }

                break;
              case 'H2':
                if (parseStarted) parseEnded = true;
                break;
            }
          }
        });
      next();
    }
  );
}

function parseCountryLanguageCultures(next) {
  let objCountries = obj.countries,
    objLanguages = obj.languages,
    countryIndex,
    languageIndex,
    langCultureName,
    countryCode,
    languageCode,
    filePath = __dirname + '/dataSources/language_codes_ms.csv';

  csv()
    .from.path(filePath, { delimiter: ',', escape: '"' })
    .on('record', function (row, index) {
      if (index > 0) {
        langCultureName = row[0].split('-');
        if (row[0] === 'zh-CHS' || row[0] === 'zh-CHT') {
          countryCode = 'CN';
        } else if (langCultureName[langCultureName.length - 1] === 'SP') {
          countryCode = 'RS';
        } else {
          countryCode = langCultureName[langCultureName.length - 1].slice(
            0,
            2
          );
        }

        languageCode =
          langCultureName[langCultureName.length - 2].toLowerCase();
        langCultureName = langCultureName.join('-');
        countryIndex = -1;
        for (let j = 0; j < objCountries.length; j++) {
          if (objCountries[j].code_2 === countryCode) {
            countryIndex = j;
            break;
          }
        }

        if (countryIndex > -1) {
          objCountries[countryIndex].langCultureMs =
            objCountries[countryIndex].langCultureMs || [];
          objCountries[countryIndex].langCultureMs.push({
            langCultureName
            displayName: row[1],
            cultureCode: row[2]
          });
        }

        languageIndex = -1;
        let codeFld = languageCode.length === 2 ? 'iso639_1' : 'iso639_3';
        for (let k = 0; k < objLanguages.length; k++) {
          if (objLanguages[k][codeFld] === languageCode) {
            languageIndex = k;
            break;
          }
        }

        if (languageIndex > -1) {
          objLanguages[languageIndex].langCultureMs =
            objLanguages[languageIndex].langCultureMs || [];
          objLanguages[languageIndex].langCultureMs.push({
            langCultureName
            displayName: row[1],
            cultureCode: row[2]
          });
        }
      }
    })
    .on('end', function () {
      next();
    });
}

function parseAllLocales(next) {
  let filepath = __dirname + '/dataSources/locales.txt',
    locContents = fs.readFileSync(filepath, 'utf8').split('\n');
  for (const loc of locContents) {
    if (loc) {
      obj.locales.push(loc.split('-'));
    }
  }
  next();
}

function finish(err) {
  if (err) return console.log('ERROR:', err);
  outputJSON(obj, '../data.json');
  console.log('\nProcess completed successfully.');
}

async.series(
  [
    parseLanguages,
    parseAdditionalLanguages,
    parseCountries,
    parseCountryLanguages,
    parseCountryLanguageCultures,
    parseAllLocales
  ],
  finish
);
