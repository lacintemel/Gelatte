// ═══════════════════════════════════════════
// Gelatte — API Client
// Wrapper for making authenticated requests to the backend.
// ═══════════════════════════════════════════

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:3001') + '/api';

function getToken() {
  try {
    const session = localStorage.getItem('gelatte_session');
    if (!session) return null;
    const parsed = JSON.parse(session);
    return parsed?.token || null;
  } catch {
    return null;
  }
}

async function request(endpoint, options = {}) {
  const { body, method = 'GET', headers: extraHeaders = {}, raw = false } = options;

  const headers = {
    ...extraHeaders,
  };

  let guestId = localStorage.getItem('gelatte_guest_id');
  if (!guestId) {
    guestId = 'gst_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    localStorage.setItem('gelatte_guest_id', guestId);
  }
  headers['x-guest-id'] = guestId;

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (body && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const config = {
    method,
    headers,
  };

  if (body) {
    config.body = body instanceof FormData ? body : JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, config);

  // For raw responses (e.g., payment callback returns plain text)
  if (raw) return response;

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || data.error || 'Request failed');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // ── Auth ──
  login: (email, password) =>
    request('/auth/login', { method: 'POST', body: { email, password } }),

  register: (userData) =>
    request('/auth/register', { method: 'POST', body: userData }),

  getMe: () =>
    request('/auth/me'),

  updateProfile: (updates) =>
    request('/auth/profile', { method: 'PUT', body: updates }),

  changePassword: (oldPassword, newPassword) =>
    request('/auth/password', { method: 'PUT', body: { oldPassword, newPassword } }),

  // ── Products ──
  getProducts: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/products${query ? `?${query}` : ''}`);
  },

  getProduct: (id) =>
    request(`/products/${id}`),

  // ── Categories ──
  getCategories: () =>
    request('/categories'),

  // ── Cart ──
  getCart: () =>
    request('/cart'),

  addToCart: (productId, quantity = 1, variantId = null) =>
    request('/cart/items', { method: 'POST', body: { productId, quantity, variantId } }),

  updateCartItem: (itemId, quantity) =>
    request(`/cart/items/${itemId}`, { method: 'PUT', body: { quantity } }),

  removeCartItem: (itemId) =>
    request(`/cart/items/${itemId}`, { method: 'DELETE' }),

  clearCart: () =>
    request('/cart', { method: 'DELETE' }),

  // ── Checkout ──
  checkout: (data) =>
    request('/checkout', {
      method: 'POST',
      body: data,
      headers: data.idempotencyKey
        ? { 'X-Idempotency-Key': data.idempotencyKey }
        : {},
    }),

  // ── Orders ──
  getOrders: () =>
    request('/orders'),

  getOrder: (id) =>
    request(`/orders/${id}`),

  // ── Coupons ──
  validateCoupon: (code, orderTotal) =>
    request('/coupons/validate', { method: 'POST', body: { code, orderTotal } }),

  // ── Reviews ──
  reviews: {
    getProductReviews: (productId) =>
      request(`/reviews/product/${productId}`),
    createReview: (productId, rating, comment) =>
      request(`/reviews`, { method: 'POST', body: { productId, rating, comment } }),
  },

  // ── Admin ──
  admin: {
    getDashboard: () =>
      request('/admin/dashboard'),

    getOrders: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/admin/orders${query ? `?${query}` : ''}`);
    },

    updateOrderStatus: (id, status) =>
      request(`/admin/orders/${id}/status`, { method: 'PUT', body: { status } }),

    createProduct: (data) =>
      request('/products', { method: 'POST', body: data }),

    updateProduct: (id, data) =>
      request(`/products/${id}`, { method: 'PUT', body: data }),

    deleteProduct: (id) =>
      request(`/products/${id}`, { method: 'DELETE' }),

    createCategory: (data) =>
      request('/categories', { method: 'POST', body: data }),
    updateCategory: (id, data) =>
      request(`/categories/${id}`, { method: 'PUT', body: data }),
    deleteCategory: (id) =>
      request(`/categories/${id}`, { method: 'DELETE' }),

    // Admin Users
    getUsers: () => request('/admin/users'),
    createUser: (data) => request('/admin/users', { method: 'POST', body: data }),
    updateUser: (id, data) => request(`/admin/users/${id}`, { method: 'PUT', body: data }),
    deleteUser: (id) => request(`/admin/users/${id}`, { method: 'DELETE' }),

    // Admin Reviews
    getAllReviews: () => request('/reviews/admin/all'),
    deleteReview: (id) => request(`/reviews/${id}`, { method: 'DELETE' }),

    getCoupons: () =>
      request('/admin/coupons'),

    createCoupon: (data) =>
      request('/admin/coupons', { method: 'POST', body: data }),

    updateCoupon: (id, data) =>
      request(`/admin/coupons/${id}`, { method: 'PUT', body: data }),

    deleteCoupon: (id) =>
      request(`/admin/coupons/${id}`, { method: 'DELETE' }),
  },
};
