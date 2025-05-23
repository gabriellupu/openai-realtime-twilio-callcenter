import { BoogiTService } from './boogitApi';
import {extractMenuFromStaticFile} from '../glovo/glovoService';

export class BoogitService {
  private authToken: string;
  private clientId: string;
  private static cache: Map<string, { data: any; timestamp: number }>;
  private static readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

  /**
   * https://pos.boogit.ro/store/9c103b22-eae5-4837-9dff-d2b3025b4356/integration-config/third-party/clients/<client_id>
   */
  private clientIds = [
    {
      name: 'Pizzeria Bada Bing',
      id: '2553461'
    },
    {
      name: 'Bada Bing Sf. Gheorghe',
      id: '2770085'
    }
  ]

  constructor(clientId?: string) {
    clientId = clientId || this.clientIds[0].id;
    this.clientId = clientId;
    const username = process.env.BOOGIT_USERNAME;
    const password = process.env.BOOGIT_PASSWORD;

    if (!username || !password) {
      throw new Error('BOOGIT_USERNAME and BOOGIT_PASSWORD environment variables must be set');
    }

    this.authToken = `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
    BoogitService.cache = new Map();
  }

  private getCacheKey(method: string, params: any): string {
    return `${method}-${JSON.stringify(params)}`;
  }

  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < BoogitService.CACHE_TTL;
  }

  private setCache(key: string, data: any): void {
    BoogitService.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  private getCache(key: string): any | null {
    const cached = BoogitService.cache.get(key);
    if (cached && this.isCacheValid(cached.timestamp)) {
      return cached.data;
    }
    return null;
  }

  /**
   * Save an order to Boogit POS
   */
  async saveOrder(order: any) {
    return BoogiTService.saveOrder({
      ...order,
      clientId: this.clientId
    }, this.authToken);
  }

  /**
   * Cancel an order in Boogit POS
   */
  async cancelOrder(orderId: string, notes?: string) {
    return BoogiTService.webhookCancelOrder({
      clientId: this.clientId,
      orderId,
      notes
    }, this.authToken);
  }

  /**
   * Confirm an order in Boogit POS
   */
  async confirmOrder(orderId: string, duration: number, notes?: string) {
    return BoogiTService.webhookConfirmOrder({
      clientId: this.clientId,
      orderId,
      duration,
      notes
    }, this.authToken);
  }

  /**
   * Save menu to Boogit POS
   */
  async saveMenu(menuData: any) {
    return BoogiTService.webhookSaveMenu({
      ...menuData,
      clientId: this.clientId
    }, this.authToken);
  }

  /**
   * Get receipts with caching
   */
  async getReceipts(startDate: string, endDate: string) {
    const cacheKey = this.getCacheKey('getReceipts', { startDate, endDate });
    const cachedData = this.getCache(cacheKey);

    if (cachedData) {
      return cachedData;
    }

    const response = await BoogiTService.getReceipts(
      parseInt(this.clientId),
      startDate,
      endDate,
      this.authToken
    );

    this.setCache(cacheKey, response.data);
    return response.data;
  }

  async getMenu() {
    const cacheKey = this.getCacheKey('getMenu', { cliendId: this.clientId });
    const cachedData = this.getCache(cacheKey);

    if (cachedData) {
      return cachedData;
    }

    const menuData = this.extractMenuFromStaticFile();
    this.setCache(cacheKey, menuData);
    return menuData;
  }

  extractMenuFromStaticFile() {
    try {
      const menu = require(`./menu_${this.clientId}.json`);
      return menu;
    } catch (err) {
      console.error('Error loading menu data from file:', err);
      return null;
    }
  }

  /**
   * Clear the cache for a specific method or all cache
   */
  clearCache(method?: string) {
    if (method) {
      for (const key of BoogitService.cache.keys()) {
        if (key.startsWith(method)) {
          BoogitService.cache.delete(key);
        }
      }
    } else {
      BoogitService.cache.clear();
    }
  }
}
