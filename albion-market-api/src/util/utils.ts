import itemNames from './fixture/items.json';
import locationNames from './fixture/world.json';
import _ from 'lodash';

export const ITEM_NAMES = _(itemNames)
  .groupBy('UniqueName')
  .mapValues((values) => {
    if (!values[0]['LocalizedNames']) {
      return null;
    }
    return values[0]['LocalizedNames']['EN-US'];
  })
  .value();

export const LOCATION_NAMES = _(locationNames)
  .groupBy('Index')
  .mapValues((values) => {
    if (!values[0]['UniqueName']) {
      return null;
    }
    return values[0]['UniqueName'];
  })
  .value();
