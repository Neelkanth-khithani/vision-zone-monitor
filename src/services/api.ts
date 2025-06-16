
const API_BASE_URL = 'http://localhost:3001/api';
const WS_URL = 'ws://localhost:3001';

export class ApiService {
  private static token: string | null = null;
  private static ws: WebSocket | null = null;

  static setToken(token: string) {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  static getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('authToken');
    }
    return this.token;
  }

  static clearToken() {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  private static async request(endpoint: string, options: RequestInit = {}) {
    const token = this.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  // Auth endpoints
  static async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  static async register(email: string, password: string, fullName: string) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, fullName }),
    });
  }

  // Camera endpoints
  static async getCameras() {
    return this.request('/cameras');
  }

  static async createCamera(name: string, rtspUrl: string) {
    return this.request('/cameras', {
      method: 'POST',
      body: JSON.stringify({ name, rtspUrl }),
    });
  }

  static async deleteCamera(cameraId: string) {
    return this.request(`/cameras/${cameraId}`, {
      method: 'DELETE',
    });
  }

  // Zone endpoints
  static async getZones(cameraId: string) {
    return this.request(`/cameras/${cameraId}/zones`);
  }

  static async createZone(cameraId: string, zone: any) {
    return this.request(`/cameras/${cameraId}/zones`, {
      method: 'POST',
      body: JSON.stringify(zone),
    });
  }

  static async updateZone(cameraId: string, zoneId: string, updates: any) {
    return this.request(`/cameras/${cameraId}/zones/${zoneId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  static async deleteZone(cameraId: string, zoneId: string) {
    return this.request(`/cameras/${cameraId}/zones/${zoneId}`, {
      method: 'DELETE',
    });
  }

  // WebSocket connection for real-time detections
  static connectWebSocket(cameraId: string, onDetection: (detection: any) => void) {
    if (this.ws) {
      this.ws.close();
    }

    this.ws = new WebSocket(`${WS_URL}?cameraId=${cameraId}&token=${this.getToken()}`);
    
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'detection') {
        onDetection(data.data);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return this.ws;
  }

  static disconnectWebSocket() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
