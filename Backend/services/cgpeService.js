const axios = require('axios');

class CgpeService {
  constructor() {
    this.apiKey = process.env.CGPE_API_KEY;
    this.baseUrl = process.env.CGPE_BASE_URL || 'https://api.cgpey.com';
    this.clientId = process.env.CGPE_CLIENT_ID;
    this.clientSecret = process.env.CGPE_CLIENT_SECRET;
  }

  /**
   * Helper to make POST requests to CGPE API
   */
  async makeRequest(endpoint, data) {
    const isMock = !this.apiKey || this.apiKey === 'your_cgpe_api_key_here';
    if (isMock) {
      return this.simulateSandboxResponse(endpoint, data);
    }

    try {
      const headers = {
        'Content-Type': 'application/json'
      };

      if (this.clientId && this.clientSecret && this.clientId !== 'your_cgpe_client_id_here') {
        const token = await this.getAccessToken();
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        headers['x-api-key'] = this.apiKey;
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      }

      const response = await axios.post(`${this.baseUrl}${endpoint}`, data, { headers });
      return response.data;
    } catch (error) {
      console.error(`[CGPE_SERVICE_ERROR] Endpoint: ${endpoint}`, error.response?.data || error.message);
      throw new Error(error.response?.data?.message || `CGPE Verification Error: ${error.message}`);
    }
  }

  /**
   * Fetch OAuth dynamic bearer token
   */
  async getAccessToken() {
    try {
      const response = await axios.post(`${this.baseUrl}/oauth/token`, {
        client_id: this.clientId,
        client_secret: this.clientSecret
      });
      return response.data.access_token;
    } catch (error) {
      console.error('[CGPE_SERVICE_AUTH_ERROR] Token fetch failed', error.response?.data || error.message);
      throw new Error('CGPE authentication handshake failed');
    }
  }

  /**
   * Verify Aadhaar Number
   */
  async verifyAadhaar(aadhaarNumber) {
    return this.makeRequest('/verify/aadhaar', { aadhaarNumber });
  }

  /**
   * Verify PAN card
   */
  async verifyPan(panNumber, fullName, dob) {
    return this.makeRequest('/verify/pan', { panNumber, fullName, dob });
  }

  /**
   * Verify Bank Account details
   */
  async verifyBank(accountNumber, ifsc) {
    return this.makeRequest('/verify/bank', { accountNumber, ifsc });
  }

  /**
   * Verify face matching between selfie and document photo
   */
  async verifySelfie(selfieUrl, docImageUrl) {
    return this.makeRequest('/verify/selfie', { selfieUrl, docImageUrl });
  }

  /**
   * Sandbox simulation mode fallback if no keys configured
   */
  simulateSandboxResponse(endpoint, data) {
    console.log(`[CGPE_MOCK] Simulating CGPE API call for ${endpoint}`, data);
    
    if (endpoint.includes('aadhaar')) {
      const num = data.aadhaarNumber || '123456789012';
      if (num === '000000000000') {
        throw new Error('Invalid Aadhaar number format or invalid digits');
      }
      return {
        success: true,
        requestId: `req_adh_${Date.now()}`,
        status: 'SUCCESS',
        data: {
          fullName: 'John Doe',
          dob: '1992-05-15',
          gender: 'MALE',
          state: 'Madhya Pradesh',
          pincode: '452001',
          careOf: 'C/O Richard Doe',
          aadhaarNumberMasked: 'XXXX-XXXX-' + num.slice(-4)
        }
      };
    }
    
    if (endpoint.includes('pan')) {
      const num = (data.panNumber || 'ABCDE1234F').toUpperCase();
      if (num === 'ABCDE0000F') {
        throw new Error('PAN status is INACTIVE or not matching records');
      }
      return {
        success: true,
        requestId: `req_pan_${Date.now()}`,
        status: 'SUCCESS',
        data: {
          fullName: data.fullName || 'John Doe',
          panNumberMasked: num.slice(0, 2) + 'XXXXX' + num.slice(-3),
          status: 'ACTIVE',
          category: 'INDIVIDUAL'
        }
      };
    }

    if (endpoint.includes('bank')) {
      const num = data.accountNumber || '1234567890';
      if (num === '0000000000') {
        throw new Error('Bank verification failed: Account number not active or invalid details');
      }
      return {
        success: true,
        requestId: `req_bnk_${Date.now()}`,
        status: 'SUCCESS',
        data: {
          accountHolderName: 'JOHN DOE',
          bankName: 'HDFC BANK',
          branchName: 'Vijay Nagar, Indore',
          accountNumberMasked: 'XXXXXX' + num.slice(-4),
          ifsc: data.ifsc
        }
      };
    }

    if (endpoint.includes('selfie')) {
      return {
        success: true,
        requestId: `req_slf_${Date.now()}`,
        status: 'SUCCESS',
        data: {
          matchScore: 88.4,
          faceDetected: true,
          status: 'MATCHED'
        }
      };
    }

    throw new Error('Unknown verification endpoint requested');
  }
}

module.exports = new CgpeService();
