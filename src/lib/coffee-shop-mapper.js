const camelToSnakeFields = {
  reviewCount: 'review_count',
  priceMin: 'price_min',
  priceMax: 'price_max',
  priceCategory: 'price_category',
  openHour: 'open_hour',
  closeHour: 'close_hour',
  mapsUrl: 'maps_url',
  secondaryUrl: 'secondary_url',
  secondaryLabel: 'secondary_label',
  itemCategory: 'item_category',
  bookingUrl: 'booking_url',
  isFeatured: 'is_featured',
};

const snakeToCamelFields = Object.fromEntries(
  Object.entries(camelToSnakeFields).map(([camel, snake]) => [snake, camel]),
);

const remapFields = (source, fieldMap) => {
  if (!source) return source;

  return Object.entries(source).reduce((result, [key, value]) => {
    result[fieldMap[key] || key] = value;
    return result;
  }, {});
};

export const normalizeCoffeeShop = (shop) => {
  const normalized = remapFields(shop, snakeToCamelFields);

  if (!normalized) return normalized;

  return {
    ...normalized,
    tags: Array.isArray(normalized.tags) ? normalized.tags : [],
  };
};

export const normalizeCoffeeShops = (shops = []) => shops.map(normalizeCoffeeShop);

export const serializeCoffeeShop = (shop) => remapFields(shop, camelToSnakeFields);
