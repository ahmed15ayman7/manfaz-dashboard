
const appendQueryParams = (url: string, params: Record<string, any> = {}) => {
    const query = new URLSearchParams(params).toString();
    return query ? `${url}?${query}` : url;
  };
  const API_ENDPOINTS = {
    auth: {
      register:(params:Record<string, any>) => appendQueryParams('/auth/register', params),
      login:(params:Record<string, any>) => appendQueryParams('/auth/login', params),
      changePassword:(params:Record<string, any>) => appendQueryParams('/auth/change-password', params),
      resendVerificationCode:(params:Record<string, any>) => appendQueryParams('/auth/resend-verification-code', params),
      verifyAccount:(params:Record<string, any>) => appendQueryParams('/auth/verify-account', params),
    },
    users: {
      getAll:(params:Record<string, any>) => appendQueryParams('/users', params),
      getById: (id: string, params:Record<string, any>) => appendQueryParams(`/users/${id}`, params),
      update: (id: string, params:Record<string, any>) => appendQueryParams(`/users/${id}`, params),
      delete: (id: string, params:Record<string, any>) => appendQueryParams(`/users/${id}`, params),
    },
    categories: {
      getAll: (params:Record<string, any>) => appendQueryParams('/categories', params),
      create:(params:Record<string, any>) => appendQueryParams('/categories', params),
      update: (id: string, params:Record<string, any>) => appendQueryParams(`/categories/${id}`, params),
      delete: (id: string, params:Record<string, any>) => appendQueryParams(`/categories/${id}`, params),
    },
    services: {
      getAll: (params:Record<string, any>) => appendQueryParams('/services', params),
      create:(params:Record<string, any>) => appendQueryParams('/services', params),
      getById: (id: string, params:Record<string, any>) => appendQueryParams(`/services/${id}`, params),
      update: (id: string, params:Record<string, any>) => appendQueryParams(`/services/${id}`, params),
      delete: (id: string, params:Record<string, any>) => appendQueryParams(`/services/${id}`, params),
    },
    workers: {
      getAll: (params:Record<string, any>) => appendQueryParams('/workers', params),
      create:(params:Record<string, any>) => appendQueryParams('/workers', params),
      getById: (id: string, params:Record<string, any>) => appendQueryParams(`/workers/${id}`, params),
      update: (id: string, params:Record<string, any>) => appendQueryParams(`/workers/${id}`, params),
      delete: (id: string, params:Record<string, any>) => appendQueryParams(`/workers/${id}`, params),
    },
    deliveryDrivers: {
      getAll: (params:Record<string, any>) => appendQueryParams('/delivery-drivers', params),
      getById: (id: string, params:Record<string, any>) => appendQueryParams(`/delivery-drivers/${id}`, params),
      create:(params:Record<string, any>) => appendQueryParams('/delivery-drivers', params),
      update: (id: string, params:Record<string, any>) => appendQueryParams(`/delivery-drivers/${id}`, params),
      delete: (id: string, params:Record<string, any>) => appendQueryParams(`/delivery-drivers/${id}`, params),
    },
    orders: {
      getAll: (params:Record<string, any>) => appendQueryParams('/orders', params),
      create:(params:Record<string, any>) => appendQueryParams('/orders', params),
      getById: (id: string, params:Record<string, any>) => appendQueryParams(`/orders/${id}`, params),
      update: (id: string, params:Record<string, any>) => appendQueryParams(`/orders/${id}`, params),
      delete: (id: string, params:Record<string, any>) => appendQueryParams(`/orders/${id}`, params),
    },
    stores: {
      getAll: (params:Record<string, any>) => appendQueryParams('/stores', params),
      getById: (id: string, params:Record<string, any>) => appendQueryParams(`/stores/${id}`, params),
      create:(params:Record<string, any>) => appendQueryParams('/stores', params),
      update: (id: string, params:Record<string, any>) => appendQueryParams(`/stores/${id}`, params),
      delete: (id: string, params:Record<string, any>) => appendQueryParams(`/stores/${id}`, params),
      categories: (storeId: string, params:Record<string, any>) => appendQueryParams(`/stores/${storeId}/categories`, params),
      products: (storeId: string, params:Record<string, any>) => appendQueryParams(`/stores/${storeId}/products`, params),
      offers: (storeId: string, params:Record<string, any>) => appendQueryParams(`/stores/${storeId}/offers`, params),
      locations: (storeId: string, params:Record<string, any>) => appendQueryParams(`/stores/${storeId}/locations`, params),
      discounts: {
        getAll: (storeId: string, params:Record<string, any>) => appendQueryParams(`/stores/${storeId}/discounts`, params),
        create: (storeId: string, params:Record<string, any>) => appendQueryParams(`/stores/${storeId}/discounts`, params),
        update: (storeId: string, id: string, params:Record<string, any>) => appendQueryParams(`/stores/${storeId}/discounts/${id}`, params),
        delete: (storeId: string, id: string, params:Record<string, any>) => appendQueryParams(`/stores/${storeId}/discounts/${id}`, params),
      },
      coupons: {
        getAll: (storeId: string, params:Record<string, any>) => appendQueryParams(`/stores/${storeId}/coupons`, params),
        create: (storeId: string, params:Record<string, any>) => appendQueryParams(`/stores/${storeId}/coupons`, params),
        update: (storeId: string, id: string, params:Record<string, any>) => appendQueryParams(`/stores/${storeId}/coupons/${id}`, params),
        delete: (storeId: string, id: string, params:Record<string, any>) => appendQueryParams(`/stores/${storeId}/coupons/${id}`, params),
        validate: (storeId: string, params:Record<string, any>) => appendQueryParams(`/stores/${storeId}/coupons/validate`, params),
      },
      giftCards: {
        create: (storeId: string, params:Record<string, any>) => appendQueryParams(`/stores/${storeId}/gift-cards`, params),
        getAll: (storeId: string, params:Record<string, any>) => appendQueryParams(`/stores/${storeId}/gift-cards`, params),
        checkBalance: (code: string, params:Record<string, any>) => appendQueryParams(`/gift-cards/${code}/balance`, params),
        redeem: (code: string, params:Record<string, any>) => appendQueryParams(`/gift-cards/${code}/redeem`, params),
      },
      rewards: {
        create: (params:Record<string, any>) => appendQueryParams('/rewards', params),
        getAll: (storeId: string, params:Record<string, any>) => appendQueryParams(`/stores/${storeId}/rewards`, params),
        redeem: (id: string, params:Record<string, any>) => appendQueryParams(`/rewards/${id}/redeem`, params),
        getUserRewards: (userId: string, params:Record<string, any>) => appendQueryParams(`/users/${userId}/rewards`, params),
      },
      workingHours: {
        get: (storeId: string, params:Record<string, any>) => appendQueryParams(`/stores/${storeId}/working-hours`, params),
        set: (storeId: string, params:Record<string, any>) => appendQueryParams(`/stores/${storeId}/working-hours`, params),
        update: (storeId: string, day: string, params:Record<string, any>) => appendQueryParams(`/stores/${storeId}/working-hours/${day}`, params),
        addSpecialDay: (storeId: string, params:Record<string, any>) => appendQueryParams(`/stores/${storeId}/special-days`, params),
        deleteSpecialDay: (storeId: string, id: string, params:Record<string, any>) => appendQueryParams(`/stores/${storeId}/special-days/${id}`, params),
        checkOpen: (storeId: string, params:Record<string, any>) => appendQueryParams(`/stores/${storeId}/check-open`, params),
      },
    },
    userLocations: {
      getAll: (userId: string, params:Record<string, any>) => appendQueryParams(`/users/${userId}/locations`, params),
      create: (userId: string, params:Record<string, any>) => appendQueryParams(`/users/${userId}/locations`, params),
      update: (id: string, params:Record<string, any>) => appendQueryParams(`/locations/${id}`, params),
      delete: (id: string, params:Record<string, any>) => appendQueryParams(`/locations/${id}`, params),
      setDefault: (id: string, params:Record<string, any>) => appendQueryParams(`/locations/${id}/set-default`, params),
    },
  };
  
  export default API_ENDPOINTS;
  