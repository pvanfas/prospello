import api from './api';

// Bank Details API functions
export const bankDetailsAPI = {
  // Get all bank details for current user
  getBankDetails: (page = 1, limit = 10) => 
    api.get(`/v1/bank-details/?page=${page}&limit=${limit}`),
  
  // Get a specific bank details by ID
  getBankDetailsById: (bankId) => 
    api.get(`/v1/bank-details/${bankId}`),
  
  // Create new bank details
  createBankDetails: (bankData) => 
    api.post('/v1/bank-details/', bankData),
  
  // Update bank details
  updateBankDetails: (bankId, bankData) => 
    api.put(`/v1/bank-details/${bankId}`, bankData),
  
  // Delete bank details
  deleteBankDetails: (bankId) => 
    api.delete(`/v1/bank-details/${bankId}`),
  
  // Set default bank details
  setDefaultBank: (bankId) => 
    api.post(`/v1/bank-details/${bankId}/set-default`),
  
  // Get default bank details
  getDefaultBank: () => 
    api.get('/v1/bank-details/default/bank'),
  
  // Create withdrawal request
  createWithdrawal: (withdrawData) => 
    api.post('/v1/bank-details/withdraw', withdrawData),
};

export default bankDetailsAPI;
