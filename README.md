# [**@ladjs/country-language**](https://github.com/ladjs/country-language)

[![build status](https://github.com/ladjs/country-language/actions/workflows/ci.yml/badge.svg)](https://github.com/ladjs/country-language/actions/workflows/ci.yml)
[![code coverage](https://img.shields.io/codecov/c/github/ladjs/country-language.svg)](https://codecov.io/gh/ladjs/country-language)
[![code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![made with lass](https://img.shields.io/badge/made_with-lass-95CC28.svg)](https://lass.js.org)
[![license](https://img.shields.io/github/license/ladjs/country-language.svg)]()

> **Maintained fork of country-language with zero-dependencies.** Query any country's spoken languages or countries where a language is spoken.


## Table of Contents

* [Install](#install)
* [Usage](#usage)
  * [.getLanguageCodes (languageCodeType, cb)](#getlanguagecodes-languagecodetype-cb)
  * [.getCountryCodes (countryCodeType, cb)](#getcountrycodes-countrycodetype-cb)
  * [.languageCodeExists (languageCode)](#languagecodeexists-languagecode)
  * [.countryCodeExists (countryCode)](#countrycodeexists-countrycode)
  * [.getCountry (code, cb)](#getcountry-code-cb)
  * [.getLanguage (code, cb)](#getlanguage-code-cb)
  * [.getCountryLanguages (code, cb)](#getcountrylanguages-code-cb)
  * [.getLanguageCountries (code, cb)](#getlanguagecountries-code-cb)
  * [.getCountryMsLocales (code, cb)](#getcountrymslocales-code-cb)
  * [.getLanguageMsLocales (code, cb)](#getlanguagemslocales-code-cb)
  * [.getCountries ()](#getcountries-)
  * [.getLanguages ()](#getlanguages-)
  * [.getLanguageFamilies ()](#getlanguagefamilies-)
  * [.getLocales (mode)](#getlocales-mode)
  * [.getLanguageFamilyMembers (family, cb)](#getlanguagefamilymembers-family-cb)
* [Contributors](#contributors)
* [License](#license)


## Install

[npm][]:

```sh
npm install @ladjs/country-language
```


## Usage

Once you require `@ladjs/country-language`, the following API will be available.

```js
const CountryLanguage = require('@ladjs/country-language');
```

### .getLanguageCodes (languageCodeType, cb)

* **@param** *{String}* language code type. Acceptable values: 1, 2 or 3.
* **@param** *{Function}* callback on complete or error
* **@cb** *{Error|null}* if error
* **@cb** *{Object}* array String with language codes

Acceptable language code type parameter values: 1, 2, 3 for returning ISO-639-1, ISO-639-2, ISO-639-3 codes respectively.
If not provided, ISO-639-1 codes will be returned.

```js
const allLanguageCodes = CountryLanguage.getLanguageCodes(2);
```

### .getCountryCodes (countryCodeType, cb)

* **@param** *{String}* country code type. Acceptable values: 1, 2 or 3.
* **@param** *{Function}* callback on complete or error
* **@cb** *{Error|null}* if error
* **@cb** *{Object}* array String with country codes

Acceptable country code type parameter values: 1, 2, 3 for returning numerical code, alpha-2, alpha-3 codes respectively.
If not provided, alpha-2 codes will be returned.

```js
const allCountryCodes = CountryLanguage.getCountryCodes(2);
```

### .languageCodeExists (languageCode)

* **@param** *{String}* language code to check.

Returns Boolean indicating language existance.
Language code parameter can be either a ISO-639-1, ISO-639-2 or ISO-639-3 code.

```js
const languageExists = CountryLanguage.languageCodeExists('en');
```

### .countryCodeExists (countryCode)

* **@param** *{String}* country code to check.

Returns Boolean indicating country existance.
Country code parameter can be either an alpha-2, alpha-3 or numerical code.

```js
const countryExists = CountryLanguage.countryCodeExists('GB');
```

### .getCountry (code, cb)

* **@param** *{String}* country code
* **@param** *{Function}* callback on complete or error
* **@cb** *{Error|null}* if error
* **@cb** *{Object}* object containing country info

Country code can be either an Alpha-2 or Alpha-3 code.
The returned object includes the following info:

* `code_2`: Country alpha-2 code (2 letters)
* `code_3`: Country alpha-3 code (3 letters)
* `numCode`: Country numeric code
* `name`: Country name
* `languages`: Array of language objects for each language spoken in the country
* `langCultureMs`: Array of language cultures for the country supported by Microsoft©

Each language object in `languages` property includes the following info:

* `iso639_1`: language iso639-1 code (2 letters)
* `iso639_2`: language iso639-2 code (3 letters)
* `iso639_2en`: language iso639-2 code with some codes derived from English names rather than native names of languages (3 letters)
* `iso639_3`: language iso639-3 code (3 letters)
* `name`: String array with one or more language names (in English)
* `nativeName`: String array with one or more language names (in native language)
* `direction`: Language script direction (either "LTR" or "RTL") - Left-to-Right, Right-to-Left
* `family`: language family
* `countries`: Array of country objects where this language is spoken

Each Microsoft© language culture object in `langCultureMs` property icludes the following info:

* `langCultureName`: language culture name
* `displayName`: language culture dispaly name
* `cultureCode`: language culture code

```js
CountryLanguage.getCountry('GB', function (err, country) {
  if (err) {
    console.log(err);
  } else {
    const languagesInGB = country.languages;
  }
});
```

### .getLanguage (code, cb)

* **@param** *{String}* language code
* **@param** *{Function}* callback on complete or error
* **@cb** *{Error|null}* if error
* **@cb** *{Object}* object containing language info

Language code can be either iso639-1, iso639-2, iso639-2en or iso639-3 code.
Contents of the returned language object are described in **`.getCountry`** method.

```js
CountryLanguage.getLanguage('en', function (err, language) {
  if (err) {
    console.log(err);
  } else {
    const countriesSpeakingEN = language.countries;
  }
});
```

### .getCountryLanguages (code, cb)

* **@param** *{String}* country code
* **@param** *{Function}* callback on complete or error
* **@cb** *{Error|null}* if error
* **@cb** *{Object}* object array containing country languages info

Country code can be either an Alpha-2 or Alpha-3 code.
Each language object contains the following info:

* `iso639_1`: language iso639-1 code (2 letters)
* `iso639_2`: language iso639-2 code with some codes derived from English names rather than native names of languages (3 letters)
* `iso639_3`: language iso639-3 code (3 letters)

```js
CountryLanguage.getCountryLanguages('GB', function (err, languages) {
  if (err) {
    console.log(err);
  } else {
    languages.forEach(function (languageCodes) {
      console.log(languageCodes.iso639_1);
    });
  }
});
```

### .getLanguageCountries (code, cb)

* **@param** *{String}* language code
* **@param** *{Function}* callback on complete or error
* **@cb** *{Error|null}* if error
* **@cb** *{Object}* object array containing country info

Language code can be either iso639-1, iso639-2, iso639-2en or iso639-3 code.
Each Country object contains the following info:

* `code_2`: Country alpha-2 code (2 letters)
* `code_3`: Country alpha-3 code (3 letters)
* `numCode`: Country numeric code

```js
CountryLanguage.getLanguageCountries('en', function (err, countries) {
  if (err) {
    console.log(err);
  } else {
    countries.forEach(function (countryCodes) {
      console.log(countryCodes.code_3);
    });
  }
});
```

### .getCountryMsLocales (code, cb)

* **@param** *{String}* country code
* **@param** *{Function}* callback on complete or error
* **@cb** *{Error|null}* if error
* **@cb** *{Object}* object array containing Language Cultures info for the country

Country code can be either an Alpha-2 or Alpha-3 code.
Contents of each Language Culture object are described in **`.getCountry`** method.

```js
CountryLanguage.getCountryMsLocales('GB', function (err, locales) {
  if (err) {
    console.log(err);
  } else {
    locales.forEach(function (locale) {
      console.log(locale.langCultureName);
    });
  }
});
```

### .getLanguageMsLocales (code, cb)

* **@param** *{String}* language code
* **@param** *{Function}* callback on complete or error
* **@cb** *{Error|null}* if error
* **@cb** *{Object}* object array containing Language Cultures info for the language

Language code can be either iso639-1, iso639-2, iso639-2en or iso639-3 code.
Contents of each Language Culture object are described in **`.getCountry`** method.

```js
CountryLanguage.getLanguageMsLocales('en', function (err, locales) {
  if (err) {
    console.log(err);
  } else {
    locales.forEach(function (locale) {
      console.log(locale.langCultureName);
    });
  }
});
```

### .getCountries ()

Returns an array object with info for every country in the world having an ISO 3166 code.
Contents of each country object in the array is described in **`.getCountry`** method.

```js
const allCountries = CountryLanguage.getCountries();
```

### .getLanguages ()

Returns an array object with info for every language in the world having an ISO 639-2 code (and a few more).
Contents of each language object in the array is described in **`.getCountry`** method.

```js
const allLanguages = CountryLanguage.getLanguages();
```

### .getLanguageFamilies ()

Returns an array of strings with the names of each language family.

```js
const allLanguageFamilies = CountryLanguage.getLanguageFamilies();
```

### .getLocales (mode)

* **@param** *{Boolean}* locale symbols mode

Returns an array of strings with all locale codes.
If mode ommited or false, locales with 3 parts will be returned like: **az-Cyrl-AZ**

```js
const localesSymbols = CountryLanguage.getLocales();
```

If mode is set to true, they will be returned like: **az-AZ-Cyrl**

```js
const localesSymbols = CountryLanguage.getLocales(true);
```

### .getLanguageFamilyMembers (family, cb)

Returns an array object with info for every language in the world having an ISO 639-2 code (and a few more).
Contents of each language object in the array is described in **`.getCountry`** method.

* **@param** *{String}* language family name (
* **@param** *{Function}* callback on complete or error
* **@cb** *{Error|null}* if error
* **@cb** *{Object}* object array containing languages info for each language member in the family.

Contents of the returned language object are described in **`.getCountry`** method.

```js
CountryLanguage.getLanguageFamilyMembers('Indo-European', function (err, languages) {
  if (err) {
    console.log(err);
  } else {
    languages.forEach(function (language) {
      console.log(language.name);
    });
  }
});
```

<br />
## Notes

For the following methods:

* **.getLanguageCodes**
* **.getCountryCodes**
* **.getCountry**
* **.getLanguage**
* **.getCountryLanguages**
* **.getLanguageCountries**
* **.getCountryMsLocales**
* **.getLanguageMsLocales**
* **.getLanguageFamilyMembers**

the `cb` parameter is optional. When not provided, each method returns either an Object when there is no error, or a String in case of an error.

Any input parameter (country code, language code, language family name) is case insensitive.

`Language#nativeName` string is not displayed correclty on the console for Right-to-Left (RTL) languages. However, there is no issue on string rendering (either on the browser or any text editor).


## Contributors

| Name         |
| ------------ |
| **titanism** |


## License

[MIT](LICENSE) © Tassos Diamantidis


##

[npm]: https://www.npmjs.com/
