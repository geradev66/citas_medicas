import { ref } from 'vue'
import { api } from '../service/api'
import { useRouter } from 'vue-router'

const user = ref(JSON.parse(localStorage.getItem('user')) || null)
const token = ref(localStorage.getItem('token') || null)

export function useAuth() {
  const router = useRouter()
  const error = ref(null)
  const loading = ref(false)

  const login = async (email, password) => {
    loading.value = true
    error.value = null
    try {
      const res = await api.post('/auth/login', { email, password })
      const data = res.data
      token.value = data.token
      user.value = data.user
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      router.push('/inicio')
    } catch (err) {
      error.value = err.response?.data?.message || err.message || 'Error al iniciar sesión'
    } finally {
      loading.value = false
    }
  }

  const register = async (name, email, password) => {
    loading.value = true
    error.value = null
    try {
      const res = await api.post('/auth/register', { name, email, password })
      const data = res.data
      token.value = data.token
      user.value = data.user
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      router.push('/inicio')
    } catch (err) {
      error.value = err.response?.data?.message || err.message || 'Error al registrarse'
    } finally {
      loading.value = false
    }
  }

  const logout = () => {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/')
  }

  return { user, token, error, loading, login, register, logout }
}
