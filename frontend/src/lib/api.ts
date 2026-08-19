import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        if (typeof window !== 'undefined') {
          // Read token from Zustand persisted state in localStorage
          try {
            const authStorage = JSON.parse(localStorage.getItem('auth-storage') || '{}')
            const token = authStorage?.state?.token
            if (token) {
              config.headers.Authorization = `Bearer ${token}`
            }
          } catch {
            // Ignore parse errors
          }
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config
        // Don't try to refresh on auth endpoints or if already retried
        const isAuthEndpoint = originalRequest.url?.includes('/api/auth/')
        if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
          originalRequest._retry = true
          try {
            const response = await this.refreshToken()
            if (response.data.success) {
              if (typeof window !== 'undefined') {
                const authStorage = JSON.parse(localStorage.getItem('auth-storage') || '{}')
                if (authStorage?.state) {
                  authStorage.state.token = response.data.token
                  localStorage.setItem('auth-storage', JSON.stringify(authStorage))
                }
              }
              originalRequest.headers.Authorization = `Bearer ${response.data.token}`
              return this.client(originalRequest)
            }
          } catch {
            if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
              localStorage.removeItem('auth-storage')
              window.location.href = '/login'
            }
          }
        }
        return Promise.reject(error)
      }
    )
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.get<T>(url, config)
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.post<T>(url, data, config)
  }

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.put<T>(url, data, config)
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.delete<T>(url, config)
  }

  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.patch<T>(url, data, config)
  }

  // Auth methods
  async login(email: string, password: string) {
    return this.post('/api/auth/login', { email, password })
  }

  async register(data: {
    email: string
    password: string
    firstName: string
    lastName: string
  }) {
    return this.post('/api/auth/register', data)
  }

  async logout() {
    return this.post('/api/auth/logout')
  }

  async refreshToken() {
    return this.post('/api/auth/refresh-token')
  }

  async forgotPassword(email: string) {
    return this.post('/api/auth/forgot-password', { email })
  }

  async resetPassword(token: string, password: string) {
    return this.post('/api/auth/reset-password', { token, password })
  }

  // Super Admin methods
  async getTenants(params?: Record<string, unknown>) {
    return this.get('/api/super-admin/tenants', { params })
  }

  async createTenant(data: Record<string, unknown>) {
    return this.post('/api/super-admin/tenants', data)
  }

  async updateTenant(id: string, data: Record<string, unknown>) {
    return this.put(`/api/super-admin/tenants/${id}`, data)
  }

  async suspendTenant(id: string) {
    return this.post(`/api/super-admin/tenants/${id}/suspend`)
  }

  async resetTenantAdminPassword(id: string) {
    return this.post(`/api/super-admin/tenants/${id}/reset-admin-password`)
  }

  async getTenantAdmin(id: string) {
    return this.get(`/api/super-admin/tenants/${id}/admin`)
  }

  async createTenantAdmin(id: string, data: { email: string; firstName: string; lastName: string }) {
    return this.post(`/api/super-admin/tenants/${id}/create-admin`, data)
  }

  async getDashboardStats() {
    return this.get('/api/super-admin/dashboard/stats')
  }

  // Tenant Admin methods
  async getStudents(params?: Record<string, unknown>) {
    return this.get('/api/tenant/students', { params })
  }

  async createStudent(data: Record<string, unknown>) {
    return this.post('/api/tenant/students', data)
  }

  async bulkImportStudents(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    return this.post('/api/tenant/students/bulk', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  }

  async updateStudent(id: string, data: Record<string, unknown>) {
    return this.put(`/api/tenant/students/${id}`, data)
  }

  async suspendStudent(id: string) {
    return this.post(`/api/tenant/students/${id}/suspend`)
  }

  // Student methods
  async getDashboard() {
    return this.get('/api/student/dashboard')
  }

  async getProfile() {
    return this.get('/api/student/profile')
  }

  async updateProfile(data: Record<string, unknown>) {
    return this.put('/api/student/profile', data)
  }

  // Voice AI
  async submitVoiceSession(data: Record<string, unknown>) {
    return this.post('/api/student/voice/submit-session', data)
  }

  async getVoiceSessions() {
    return this.get('/api/student/voice/sessions')
  }

  // Y-Codes
  async getCodeChallenges() {
    return this.get('/api/student/code-challenges')
  }

  async submitCode(data: Record<string, unknown>) {
    return this.post('/api/student/code-submit', data)
  }

  // Aptitude Arena
  async getQuestions(params?: Record<string, unknown>) {
    return this.get('/api/student/questions', { params })
  }

  async startExam(data: Record<string, unknown>) {
    return this.post('/api/student/exam/start', data)
  }

  async submitExam(data: Record<string, unknown>) {
    return this.post('/api/student/exam/submit', data)
  }

  async getExamResults(id: string) {
    return this.get(`/api/student/exam/results/${id}`)
  }

  // Job Hunt
  async getJobs(params?: Record<string, unknown>) {
    return this.get('/api/student/jobs', { params })
  }

  async applyToJob(jobId: string, data?: Record<string, unknown>) {
    return this.post(`/api/student/jobs/${jobId}/apply`, data)
  }

  async getApplications() {
    return this.get('/api/student/applications')
  }

  // Resume Craft
  async getResumes() {
    return this.get('/api/student/resumes')
  }

  async createResume(data: Record<string, unknown>) {
    return this.post('/api/student/resumes', data)
  }

  async updateResume(id: string, data: Record<string, unknown>) {
    return this.put(`/api/student/resumes/${id}`, data)
  }

  async downloadResume(id: string) {
    return this.post(`/api/student/resumes/${id}/download`)
  }

  // Credits
  async getCredits() {
    return this.get('/api/student/credits')
  }

  async purchaseCredits(amount: number) {
    return this.post('/api/student/credits/purchase', { amount })
  }

  // Super Admin - Roles & Permissions
  async getRoles() {
    return this.get('/api/super-admin/roles')
  }

  async getPermissions() {
    return this.get('/api/super-admin/permissions')
  }

  async getSettings() {
    return this.get('/api/super-admin/settings')
  }

  async updateSettings(settings: Record<string, string>) {
    return this.put('/api/super-admin/settings', { settings })
  }

  async getInvoices(params?: Record<string, unknown>) {
    return this.get('/api/super-admin/invoices', { params })
  }

  async getSubscriptions() {
    return this.get('/api/super-admin/subscriptions')
  }

  async getActivity(limit?: number) {
    return this.get('/api/super-admin/activity', { params: { limit } })
  }

  // Tenant Admin - Content Management
  async getQuestions(params?: Record<string, unknown>) {
    return this.get('/api/tenant/questions', { params })
  }

  async createQuestion(data: Record<string, unknown>) {
    return this.post('/api/tenant/questions', data)
  }

  async deleteQuestion(id: string) {
    return this.delete(`/api/tenant/questions/${id}`)
  }

  async getCodingChallenges(params?: Record<string, unknown>) {
    return this.get('/api/tenant/coding-challenges', { params })
  }

  async createCodingChallenge(data: Record<string, unknown>) {
    return this.post('/api/tenant/coding-challenges', data)
  }

  async deleteCodingChallenge(id: string) {
    return this.delete(`/api/tenant/coding-challenges/${id}`)
  }

  async getJobListings(params?: Record<string, unknown>) {
    return this.get('/api/tenant/job-listings', { params })
  }

  async createJobListing(data: Record<string, unknown>) {
    return this.post('/api/tenant/job-listings', data)
  }

  async deleteJobListing(id: string) {
    return this.delete(`/api/tenant/job-listings/${id}`)
  }

  async getTenantSettings() {
    return this.get('/api/tenant/settings')
  }

  async updateTenantSettings(data: Record<string, unknown>) {
    return this.put('/api/tenant/settings', data)
  }
}

export const api = new ApiClient()
export default api
