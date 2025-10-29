// API utility functions for CryptoLearn backend

const API_BASE_URL = 'http://127.0.0.1:5000/api'

export interface ApiResponse<T = any> {
  success: boolean
  error?: string
  [key: string]: any
}

// Generic API call function
async function apiCall<T>(
  endpoint: string, 
  method: 'GET' | 'POST' = 'GET', 
  data?: any,
  isFormData = false
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  
  const config: RequestInit = {
    method,
    credentials: 'include', // Include cookies for session management
    headers: isFormData ? {} : {
      'Content-Type': 'application/json',
    },
  }

  if (data) {
    if (isFormData) {
      config.body = data // FormData object
    } else {
      config.body = JSON.stringify(data)
    }
  }

  try {
    const response = await fetch(url, config)
    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(result.error || `HTTP error! status: ${response.status}`)
    }
    
    return result
  } catch (error) {
    console.error('API call failed:', error)
    throw error
  }
}

// AES API functions
export const aesAPI = {
  encrypt: async (data: {
    plaintext: string
    key: string
    mode?: string
    key_size?: number
  }) => {
    return apiCall<ApiResponse>('/aes/encrypt', 'POST', {
      plaintext: data.plaintext,
      key: data.key,
      mode: data.mode || 'CBC',
      key_size: data.key_size || 256
    })
  },

  decrypt: async (data: {
    ciphertext: string
    key: string
    mode?: string
    key_size?: number
    iv?: string
  }) => {
    return apiCall<ApiResponse>('/aes/decrypt', 'POST', data)
  },

  getInfo: async () => {
    return apiCall<ApiResponse>('/aes/info')
  }
}

// RSA API functions
export const rsaAPI = {
  generateKeypair: async (keySize = 2048) => {
    return apiCall<ApiResponse>('/rsa/generate-keypair', 'POST', { key_size: keySize })
  },

  encrypt: async (data: {
    plaintext: string
    public_key: string
  }) => {
    return apiCall<ApiResponse>('/rsa/encrypt', 'POST', data)
  },

  decrypt: async (data: {
    ciphertext: string
    private_key: string
  }) => {
    return apiCall<ApiResponse>('/rsa/decrypt', 'POST', data)
  },

  sign: async (data: {
    message: string
    private_key: string
  }) => {
    return apiCall<ApiResponse>('/rsa/sign', 'POST', data)
  },

  verify: async (data: {
    message: string
    signature: string
    public_key: string
  }) => {
    return apiCall<ApiResponse>('/rsa/verify', 'POST', data)
  },

  getInfo: async () => {
    return apiCall<ApiResponse>('/rsa/info')
  }
}

// ECC API functions
export const eccAPI = {
  // ECDSA Key Generation
  generateKeypair: async (curve = 'secp256r1') => {
    return apiCall<ApiResponse>('/ecc/generate-keypair', 'POST', { curve })
  },

  // ECDH Key Generation
  generateECDHKeypair: async (curve = 'brainpoolP256r1') => {
    return apiCall<ApiResponse>('/ecc/generate-ecdh-keypair', 'POST', { curve })
  },

  // ECDH Shared Secret Calculation
  ecdhSharedSecret: async (data: {
    private_key_a: string
    public_key_b_x: string
    public_key_b_y: string
    curve?: string
  }) => {
    return apiCall<ApiResponse>('/ecc/ecdh-shared-secret', 'POST', {
      ...data,
      curve: data.curve || 'brainpoolP256r1'
    })
  },

  // ECDSA Signing
  sign: async (private_key: string, message: string) => {
    return apiCall<ApiResponse>('/ecc/sign', 'POST', {
      message: message,
      private_key: private_key
    })
  },

  // ECDSA Verification
  verify: async (public_key: string, message: string, signature: string) => {
    return apiCall<ApiResponse>('/ecc/verify', 'POST', {
      message: message,
      signature: signature,
      public_key: public_key
    })
  },

  // Get Curve Information
  getCurveInfo: async (curve = 'brainpoolP256r1') => {
    return apiCall<ApiResponse>('/ecc/curve-info', 'POST', { curve })
  },

  // Compare ECC with RSA
  compareWithRSA: async (eccKeySize: number) => {
    return apiCall<ApiResponse>('/ecc/compare-rsa', 'POST', { ecc_key_size: eccKeySize })
  },

  getInfo: async () => {
    return apiCall<ApiResponse>('/ecc/info')
  }
}

// Digital Signature API functions
export const signatureAPI = {
  generateKeypair: async (data: {
    algorithm?: string
    key_size?: number
    curve?: string
  }) => {
    return apiCall<ApiResponse>('/signature/generate-keypair', 'POST', data)
  },

  sign: async (data: {
    message: string
    private_key: string
    algorithm?: string
    hash_algorithm?: string
  }) => {
    return apiCall<ApiResponse>('/signature/sign', 'POST', data)
  },

  verify: async (data: {
    message: string
    signature: string
    public_key: string
    algorithm?: string
    hash_algorithm?: string
  }) => {
    return apiCall<ApiResponse>('/signature/verify', 'POST', data)
  },

  signAndVerify: async (data: {
    message: string
    algorithm?: string
    key_size?: number
    curve?: string
  }) => {
    return apiCall<ApiResponse>('/signature/sign-and-verify', 'POST', data)
  },

  hashSign: async (data: {
    message: string
    key: string
    algorithm?: string
  }) => {
    return apiCall<ApiResponse>('/signature/hash-sign', 'POST', data)
  },

  hashVerify: async (data: {
    message: string
    signature: string
    key: string
    algorithm?: string
  }) => {
    return apiCall<ApiResponse>('/signature/hash-verify', 'POST', data)
  },

  getInfo: async () => {
    return apiCall<ApiResponse>('/signature/info')
  }
}

// Steganography API functions
export const steganographyAPI = {
  embed: async (imageFile: File, message: string) => {
    const formData = new FormData()
    formData.append('image', imageFile)
    formData.append('message', message)
    
    return apiCall<ApiResponse>('/steganography/embed', 'POST', formData, true)
  },

  embedDownload: async (imageFile: File, message: string) => {
    const formData = new FormData()
    formData.append('image', imageFile)
    formData.append('message', message)
    
    const url = `${API_BASE_URL}/steganography/embed-download`
    const response = await fetch(url, {
      method: 'POST',
      body: formData
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || `HTTP error! status: ${response.status}`)
    }
    
    return response.blob()
  },

  extract: async (imageFile: File) => {
    const formData = new FormData()
    formData.append('image', imageFile)
    
    return apiCall<ApiResponse>('/steganography/extract', 'POST', formData, true)
  },

  getCapacity: async (imageFile: File) => {
    const formData = new FormData()
    formData.append('image', imageFile)
    
    return apiCall<ApiResponse>('/steganography/capacity', 'POST', formData, true)
  },

  compare: async (originalFile: File, encodedFile: File) => {
    const formData = new FormData()
    formData.append('original', originalFile)
    formData.append('encoded', encodedFile)
    
    return apiCall<ApiResponse>('/steganography/compare', 'POST', formData, true)
  },

  getInfo: async () => {
    return apiCall<ApiResponse>('/steganography/info')
  }
}

// Watermarking API functions
export const watermarkAPI = {
  addTextWatermark: async (imageFile: File, data: {
    text: string
    opacity?: number
    position?: string
    font_size?: number
    color?: string
  }) => {
    const formData = new FormData()
    formData.append('image', imageFile)
    formData.append('text', data.text)
    if (data.opacity !== undefined) formData.append('opacity', data.opacity.toString())
    if (data.position) formData.append('position', data.position)
    if (data.font_size) formData.append('font_size', data.font_size.toString())
    if (data.color) formData.append('color', data.color)
    
    return apiCall<ApiResponse>('/watermark/text', 'POST', formData, true)
  },

  addTextWatermarkDownload: async (imageFile: File, data: {
    text: string
    opacity?: number
    position?: string
    font_size?: number
    color?: string
  }) => {
    const formData = new FormData()
    formData.append('image', imageFile)
    formData.append('text', data.text)
    if (data.opacity !== undefined) formData.append('opacity', data.opacity.toString())
    if (data.position) formData.append('position', data.position)
    if (data.font_size) formData.append('font_size', data.font_size.toString())
    if (data.color) formData.append('color', data.color)
    
    const url = `${API_BASE_URL}/watermark/text-download`
    const response = await fetch(url, {
      method: 'POST',
      body: formData
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || `HTTP error! status: ${response.status}`)
    }
    
    return response.blob()
  },

  addImageWatermark: async (baseImageFile: File, watermarkImageFile: File, data: {
    opacity?: number
    position?: string
    scale?: number
  }) => {
    const formData = new FormData()
    formData.append('base_image', baseImageFile)
    formData.append('watermark_image', watermarkImageFile)
    if (data.opacity !== undefined) formData.append('opacity', data.opacity.toString())
    if (data.position) formData.append('position', data.position)
    if (data.scale !== undefined) formData.append('scale', data.scale.toString())
    
    return apiCall<ApiResponse>('/watermark/image', 'POST', formData, true)
  },

  addInvisibleWatermark: async (imageFile: File, data: {
    text: string
    strength?: number
  }) => {
    const formData = new FormData()
    formData.append('image', imageFile)
    formData.append('text', data.text)
    if (data.strength !== undefined) formData.append('strength', data.strength.toString())
    
    return apiCall<ApiResponse>('/watermark/invisible', 'POST', formData, true)
  },

  extractInvisibleWatermark: async (imageFile: File, data: {
    length?: number
    strength?: number
  }) => {
    const formData = new FormData()
    formData.append('image', imageFile)
    if (data.length !== undefined) formData.append('length', data.length.toString())
    if (data.strength !== undefined) formData.append('strength', data.strength.toString())
    
    return apiCall<ApiResponse>('/watermark/extract-invisible', 'POST', formData, true)
  },

  getInfo: async () => {
    return apiCall<ApiResponse>('/watermark/info')
  }
}

// Authentication API functions
export const authApi = {
  register: async (data: {
    username: string
    email: string
    password: string
    full_name?: string
  }) => {
    return apiCall<ApiResponse>('/auth/register', 'POST', data)
  },

  login: async (username: string, password: string) => {
    return apiCall<ApiResponse>('/auth/login', 'POST', { username, password })
  },

  logout: async () => {
    return apiCall<ApiResponse>('/auth/logout', 'POST')
  },

  getCurrentUser: async () => {
    return apiCall<ApiResponse>('/auth/me')
  },

  checkAuth: async () => {
    return apiCall<ApiResponse>('/auth/check')
  },

  getAllUsers: async () => {
    return apiCall<ApiResponse>('/auth/users')
  },

  getInfo: async () => {
    return apiCall<ApiResponse>('/auth/info')
  }
}

// Health check
export const healthCheck = async () => {
  return apiCall<ApiResponse>('/health')
}

// Test endpoint
export const testAPI = async () => {
  const response = await fetch('http://127.0.0.1:5000/test')
  return response.json()
}
