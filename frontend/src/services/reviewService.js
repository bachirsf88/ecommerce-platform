import api from './api';

const reviewService = {
  async createReview(payload) {
    const response = await api.post('/reviews', {
      product_id: payload.product_id,
      order_id: Number(payload.order_id),
      rating: Number(payload.rating),
      comment: payload.comment?.trim() || null,
    });

    return response.data.data ?? null;
  },
};

export default reviewService;
