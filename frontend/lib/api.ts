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

  encryptWithParams: async (data: {
    plaintext: string
    p: number
    q: number
    e: number
  }) => {
    return apiCall<ApiResponse>('/rsa/encrypt-with-params', 'POST', data)
  },

  decryptWithParams: async (data: {
    ciphertext: string
    p: number
    q: number
    d: number
  }) => {
    return apiCall<ApiResponse>('/rsa/decrypt-with-params', 'POST', data)
  },

  getInfo: async () => {
    return apiCall<ApiResponse>('/rsa/info')
  }
}

// ECC API functions
export const eccAPI = {
  generateKeypair: async (curve = 'secp256r1') => {
    return apiCall<ApiResponse>('/ecc/generate-keypair', 'POST', { curve })
  },

  sign: async (data: {
    message: string
    private_key: string
  }) => {
    return apiCall<ApiResponse>('/ecc/sign', 'POST', data)
  },

  verify: async (data: {
    message: string
    signature: string
    public_key: string
  }) => {
    return apiCall<ApiResponse>('/ecc/verify', 'POST', data)
  },

  generateSharedSecret: async (data: {
    private_key: string
    public_key: string
  }) => {
    return apiCall<ApiResponse>('/ecc/shared-secret', 'POST', data)
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
  }) => {
    return apiCall<ApiResponse>('/signature/sign', 'POST', data)
  },

  verify: async (data: {
    message: string
    signature: string
    public_key: string
    algorithm?: string
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

// Health check
export const healthCheck = async () => {
  return apiCall<ApiResponse>('/health')
}

// Test endpoint
export const testAPI = async () => {
  const response = await fetch('http://127.0.0.1:5000/test')
  return response.json()
}
