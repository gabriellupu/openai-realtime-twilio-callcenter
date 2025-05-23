// TypeScript service to interact with boogiT PoS API based on Swagger 2.0 definition

import axios from 'axios';

const API_BASE_URL = 'https://pos.boogit.ro';

// Define request interfaces
interface ThirdPartyOrder {
  clientId: string;
  orderId: string;
  type: 'PICKUP' | 'DELIVERY';
  customer: {
    name?: string;
    email?: string;
    phone: string;
  };
  deliveryAddress?: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    latitude?: number;
    longitude?: number;
  };
  deliveryPrice?: number;
  deliveryTime?: string;
  desiredDeliveryTime?: boolean;
  discountAmount?: number;
  items: Array<any>; // Could be typed further
  notes?: string;
  paymentMethod: 'CASH' | 'CARD' | 'PROTOCOL' | 'CARD_ONLINE' | 'BANK_TRANSFER' | 'NONE';
  pickupCode?: string;
}

interface ThirdPartyMenuRequest {
  clientId: string;
  categories: any[]; // Could be typed further
}

interface ThirdPartyOrderStatusRequest {
  clientId: string;
  orderId: string;
  notes?: string;
  duration?: number;
}

const headers = (authToken: string) => ({
  'Content-Type': 'application/json',
  Authorization: authToken,
});

export class BoogiTService {
  static async saveOrder(order: ThirdPartyOrder, auth: string) {
    return axios.post(`${API_BASE_URL}/api/v1/int/orders/generic`, order, {
      headers: headers(auth),
    });
  }

  static async webhookCancelOrder(data: ThirdPartyOrderStatusRequest, auth: string) {
    return axios.post(`${API_BASE_URL}/api/v1/int/orders/generic/webhook-cancel-order-endpoint`, data, {
      headers: headers(auth),
    });
  }

  static async webhookConfirmOrder(data: ThirdPartyOrderStatusRequest, auth: string) {
    return axios.post(`${API_BASE_URL}/api/v1/int/orders/generic/webhook-confirm-order-endpoint`, data, {
      headers: headers(auth),
    });
  }

  static async webhookSaveMenu(data: ThirdPartyMenuRequest, auth: string) {
    return axios.post(`${API_BASE_URL}/api/v1/int/orders/generic/webhook-save-menu-endpoint`, data, {
      headers: headers(auth),
    });
  }

  static async getReceipts(
    clientId: number,
    startDate: string,
    endDate: string,
    auth: string
  ) {
    return axios.get(`${API_BASE_URL}/api/v2/receipts`, {
      params: { clientId, startDate, endDate },
      headers: headers(auth),
    });
  }
}
