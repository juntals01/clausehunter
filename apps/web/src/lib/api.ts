import axios from "axios"

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
  headers: { "Content-Type": "application/json" },
})

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      // Don't redirect if already on auth pages
      const path = window.location.pathname
      if (!path.startsWith("/sign-in") && !path.startsWith("/sign-up")) {
        localStorage.removeItem("access_token")
        localStorage.removeItem("user")
        window.location.href = "/sign-in"
      }
    }
    return Promise.reject(error)
  }
)

export default api
