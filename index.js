const data = require('./data.json');

function noop(err, value) {
  if (err) return err;
  return value;
}

function isFunction(obj) {
  return typeof obj === 'function';
}

exports.getCountries = function () {
  return data.countries;
};

exports.getLanguages = function () {
  return data.languages;
};

exports.getLanguageFamilies = function () {
  return data.languageFamilies;
};

exports.getLanguageCodes = function (codeType, cb) {
  const { languages } = data;
  const cTypeNames = ['iso639_1', 'iso639_2en', 'iso639_3'];
  const codes = [];

  cb = cb || (isFunction(codeType) ? codeType : noop);

  codeType = codeType && !isFunction(codeType) ? codeType : 1;
  codeType = Math.floor(Number(codeType));
  if (Number.isNaN(codeType) || codeType < 1 || codeType > cTypeNames.length) {
    return cb(
      'Wrong language code type provided. Valid values: 1, 2, 3 for iso639-1, iso639-2, iso639-3 respectively'
    );
  }

  const cType = cTypeNames[codeType - 1];
  for (const language of languages) {
    if (language[cType]) codes.push(language[cType]);
  }

  return cb(null, codes);
};

exports.getCountryCodes = function (codeType, cb) {
  const { countries } = data;
  const cTypeNames = ['numCode', 'code_2', 'code_3'];
  const codes = [];

  cb = cb || (isFunction(codeType) ? codeType : noop);

  codeType = codeType && !isFunction(codeType) ? codeType : 2;
  codeType = Math.floor(Number(codeType));
  if (Number.isNaN(codeType) || codeType < 1 || codeType > cTypeNames.length) {
    return cb(
      'Wrong country code type provided. Valid values: 1, 2, 3 for numeric code, alpha-2, alpha-3 respectively'
    );
  }

  const cType = cTypeNames[codeType - 1];
  for (const country of countries) {
    if (country[cType]) codes.push(country[cType]);
  }

  return cb(null, codes);
};

exports.languageCodeExists = function (code) {
  let codes;
  let exists;

  if (!code) return false;
  code = code.toLowerCase();
  for (let i = 1; i < 4; i++) {
    codes = exports.getLanguageCodes(i);
    exists = codes.includes(code);
    if (exists) break;
  }

  return exists;
};

exports.countryCodeExists = function (code) {
  let codes;
  let exists;

  if (!code) return false;
  code = code.toUpperCase();
  for (let i = 1; i < 4; i++) {
    codes = exports.getCountryCodes(i);
    exists = codes.includes(code);
    if (exists) break;
  }

  return exists;
};

exports.getCountry = function (code, cb, noLangInfo) {
  const { countries } = data;
  let country;
  let codeFld;
  let langs;

  if (typeof code !== 'string') {
    return cb('No country code provided');
  }

  cb = cb || noop;
  code = code.toUpperCase();

  if (code.length === 2) {
    codeFld = 'code_2';
  } else if (code.length === 3) {
    codeFld = 'code_3';
  }

  if (codeFld) {
    country = countries.find((c) => {
      return c[codeFld] === code;
    });
    if (!country) {
      return cb('There is no country with code "' + code + '"');
    }

    country = { ...country };
    if (!noLangInfo) {
      langs = country.languages;
      country.languages = [];
      for (const l of langs) {
        country.languages.push(exports.getLanguage(l, null, true));
      }
    }

    return cb(null, country);
  }

  return cb('Wrong type of country code provided');
};

exports.getLanguage = function (code, cb, noCountryInfo) {
  const { languages } = data;
  let language;
  const codeFld = [];
  let countrs;

  cb = cb || noop;

  if (typeof code !== 'string') {
    return cb('No language code provided');
  }

  code = code.toLowerCase();

  if (code.length === 2) {
    codeFld.push('iso639_1');
  } else if (code.length === 3) {
    codeFld.push('iso639_2', 'iso639_2en', 'iso639_3');
  }

  if (codeFld) {
    for (const element of codeFld) {
      language = languages.find((l) => {
        return l[element] === code;
      });
      if (language) break;
    }

    if (!language) {
      return cb('There is no language with code "' + code + '"');
    }

    language = { ...language };
    if (!noCountryInfo) {
      countrs = language.countries;
      language.countries = [];

      if (countrs)
        for (const c of countrs) {
          language.countries.push(exports.getCountry(c, null, true));
        }
    }

    return cb(null, language);
  }

  return cb('Wrong type of language code provided');
};

exports.getCountryLanguages = function (code, cb) {
  const codes = [];

  cb = cb || noop;

  exports.getCountry(code, function (err, country) {
    if (err) return cb(err);
    for (const l of country.languages) {
      codes.push({
        iso639_1: l.iso639_1,
        iso639_2: l.iso639_2en,
        iso639_3: l.iso639_3
      });
    }
  });
  return cb(null, codes);
};

exports.getLanguageCountries = function (code, cb) {
  const codes = [];

  cb = cb || noop;

  exports.getLanguage(code, function (err, language) {
    if (err) return cb(err);
    for (const c of language.countries) {
      codes.push({
        code_2: c.code_2,
        code_3: c.code_3,
        numCode: c.numCode
      });
    }
  });
  return cb(null, codes);
};

exports.getCountryMsLocales = function (code, cb) {
  let codes = [];

  cb = cb || noop;

  exports.getCountry(code, function (err, country) {
    if (err) return cb(err);
    codes = country.langCultureMs;
  });
  return cb(null, codes);
};

exports.getLanguageMsLocales = function (code, cb) {
  let codes = [];

  cb = cb || noop;

  exports.getLanguage(code, function (err, language) {
    if (err) return cb(err);
    codes = language.langCultureMs;
  });
  return cb(null, codes);
};

exports.getLanguageFamilyMembers = function (family, cb) {
  const { languages } = data;
  const ret = [];

  cb = cb || noop;

  if (typeof family !== 'string') {
    return cb('No language family provided');
  }

  family = family.toLowerCase();

  const check = data.languageFamilies.find((f) => {
    return f.toLowerCase() === family;
  });
  if (!check) {
    return cb('There is no language family "' + family + '"');
  }

  const members = languages.filter((l) => {
    return l.family.toLowerCase() === family;
  });
  for (const l of members) {
    ret.push(exports.getLanguage(l.iso639_3));
  }

  return cb(null, ret);
};

exports.getLocales = function (mode) {
  const { locales } = data;
  const ret = [];
  let loc2;
  for (const loc of locales) {
    loc2 = loc[2] ? '-' + loc[2] : '';
    if (mode) {
      ret.push(loc[0] + loc2 + '-' + loc[1]);
    } else {
      ret.push(loc[0] + '-' + loc[1] + loc2);
    }
  }

  return ret;
};
