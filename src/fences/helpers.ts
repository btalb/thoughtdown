'use strict';

import {JSDOM} from 'jsdom';
import yaml from 'yaml';

export function createDummyDom() {
  return new JSDOM(`<!DOCTYPE html><head></head><body></body`).window.document;
}

export function constructDataJson(
  dataString,
  configString,
  defaultConfig = {}
) {
  return Object.assign(
    {},
    /^data:/.test(dataString)
      ? yaml.parse(dataString)
      : {data: dataString.trim()},
    {
      config: Object.assign(
        {},
        defaultConfig,
        configString ? yaml.parse(configString.replace(/, /g, '\n')) : {}
      ),
    }
  );
}
