import api from './api';

const sellerFinanceService = {
  async getOverview() {
    const response = await api.get('/seller/finance');
    return response.data.data ?? null;
  },

  async requestWithdrawal(payload) {
    const response = await api.post('/seller/finance/withdrawals', payload);
    return response.data.data ?? null;
  },
};

export default sellerFinanceService;
