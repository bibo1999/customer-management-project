const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5080/api')
  .replace(/\/$/, '')

async function request(path, options = {}) {
  let response

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers,
      },
    })
  } catch {
    throw new Error('Could not connect to the API. Make sure the backend is running.')
  }

  if (!response.ok) {
    let message = `Request failed (${response.status}).`
    try {
      const data = await response.json()
      if (data?.title) message = data.title
      if (data?.errors) {
        message = Object.values(data.errors).flat().join(' ')
      }
    } catch {
      // The response may have no JSON body.
    }
    throw new Error(message)
  }

  if (response.status === 204) return null
  return response.json()
}

export const customerService = {
  getAll(search = '', signal) {
    const query = new URLSearchParams()
    if (search.trim()) query.set('search', search.trim())
    const suffix = query.size ? `?${query.toString()}` : ''
    return request(`/customers${suffix}`, { signal })
  },

  getById(id) {
    return request(`/customers/${id}`)
  },

  create(customer) {
    return request('/customers', {
      method: 'POST',
      body: JSON.stringify(customer),
    })
  },

  update(id, customer) {
    return request(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(customer),
    })
  },

  remove(id) {
    return request(`/customers/${id}`, { method: 'DELETE' })
  },
}
