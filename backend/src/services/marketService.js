const https = require('https');

class MarketService {
  constructor() {
    this.apiKey = process.env.FINNHUB_API_KEY ? process.env.FINNHUB_API_KEY.trim() : null;
    this.baseUrl = 'https://finnhub.io/api/v1';
    
    // In-memory cache to respect API rate limits (60 calls/min)
    // Structure: { [cacheKey]: { data: any, timestamp: number } }
    this.cache = new Map();
    this.CACHE_DURATION = 30000; // 30 seconds
    
    // Prevent duplicate concurrent requests
    this.pendingRequests = new Map();
  }

  async fetchWithCache(endpoint, cacheKey) {
    if (!this.apiKey || this.apiKey === 'your_finnhub_key_here') {
      return this.getMockData(endpoint);
    }

    const now = Date.now();
    const cached = this.cache.get(cacheKey);

    if (cached && (now - cached.timestamp < this.CACHE_DURATION)) {
      return cached.data;
    }

    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey);
    }

    const url = `${this.baseUrl}${endpoint}&token=${this.apiKey}`;
    
    const requestPromise = new Promise((resolve, reject) => {
      https.get(url, (res) => {
        let data = '';

        if (res.statusCode === 429) {
          reject(new Error('Rate limit exceeded'));
          return;
        }

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const parsedData = JSON.parse(data);
            this.cache.set(cacheKey, { data: parsedData, timestamp: Date.now() });
            resolve(parsedData);
          } catch (error) {
            reject(new Error('Invalid response from Finnhub'));
          }
        });
      }).on('error', (err) => {
        reject(err);
      });
    });

    this.pendingRequests.set(cacheKey, requestPromise);

    try {
      const data = await requestPromise;
      return data;
    } finally {
      this.pendingRequests.delete(cacheKey);
    }
  }

  async getQuote(symbol) {
    try {
      const data = await this.fetchWithCache(`/quote?symbol=${symbol.toUpperCase()}`, `quote_${symbol}`);
      return {
        symbol: symbol.toUpperCase(),
        price: data.c || 0,
        change: data.d || 0,
        changePercent: data.dp || 0,
        high: data.h || 0,
        low: data.l || 0,
        open: data.o || 0,
        previousClose: data.pc || 0,
      };
    } catch (error) {
      console.error(`Error fetching quote for ${symbol}:`, error.message);
      return this.getMockQuote(symbol);
    }
  }

  async getProfile(symbol) {
    try {
      const data = await this.fetchWithCache(`/stock/profile2?symbol=${symbol.toUpperCase()}`, `profile_${symbol}`);
      return data;
    } catch (error) {
      console.error(`Error fetching profile for ${symbol}:`, error.message);
      return { ticker: symbol, name: `${symbol} Corp` };
    }
  }

  async searchSymbols(query) {
    try {
      const data = await this.fetchWithCache(`/search?q=${encodeURIComponent(query)}`, `search_${query}`);
      return data.result ? data.result.filter(item => item.type === 'Common Stock') : [];
    } catch (error) {
      console.error(`Error searching symbols for ${query}:`, error.message);
      return [];
    }
  }

  getMockQuote(symbol) {
    const base = Math.random() * 200 + 50;
    return {
      symbol: symbol.toUpperCase(),
      price: parseFloat(base.toFixed(2)),
      change: parseFloat(((Math.random() - 0.5) * 5).toFixed(2)),
      changePercent: parseFloat(((Math.random() - 0.5) * 2).toFixed(2)),
      high: parseFloat((base + 5).toFixed(2)),
      low: parseFloat((base - 5).toFixed(2)),
      open: parseFloat(base.toFixed(2)),
      previousClose: parseFloat(base.toFixed(2)),
    };
  }

  getMockData(endpoint) {
    if (endpoint.startsWith('/quote')) {
      const symbol = new URLSearchParams(endpoint.split('?')[1]).get('symbol');
      const base = Math.random() * 200 + 50;
      return {
        c: parseFloat(base.toFixed(2)),
        d: parseFloat(((Math.random() - 0.5) * 5).toFixed(2)),
        dp: parseFloat(((Math.random() - 0.5) * 2).toFixed(2)),
        h: parseFloat((base + 5).toFixed(2)),
        l: parseFloat((base - 5).toFixed(2)),
        o: parseFloat(base.toFixed(2)),
        pc: parseFloat(base.toFixed(2))
      };
    }
    if (endpoint.startsWith('/search')) {
      const q = new URLSearchParams(endpoint.split('?')[1]).get('q').toLowerCase();
      const mockDatabase = [
        { description: 'APPLE INC', displaySymbol: 'AAPL', symbol: 'AAPL', type: 'Common Stock' },
        { description: 'MICROSOFT CORP', displaySymbol: 'MSFT', symbol: 'MSFT', type: 'Common Stock' },
        { description: 'TESLA INC', displaySymbol: 'TSLA', symbol: 'TSLA', type: 'Common Stock' },
        { description: 'NVIDIA CORP', displaySymbol: 'NVDA', symbol: 'NVDA', type: 'Common Stock' },
        { description: 'AMAZON.COM INC', displaySymbol: 'AMZN', symbol: 'AMZN', type: 'Common Stock' },
        { description: 'META PLATFORMS INC', displaySymbol: 'META', symbol: 'META', type: 'Common Stock' },
        { description: 'ALPHABET INC', displaySymbol: 'GOOGL', symbol: 'GOOGL', type: 'Common Stock' },
        { description: 'NETFLIX INC', displaySymbol: 'NFLX', symbol: 'NFLX', type: 'Common Stock' },
        { description: 'ADVANCED MICRO DEVICES', displaySymbol: 'AMD', symbol: 'AMD', type: 'Common Stock' },
        { description: 'INTEL CORP', displaySymbol: 'INTC', symbol: 'INTC', type: 'Common Stock' }
      ];
      
      const filtered = mockDatabase.filter(stock => 
        stock.symbol.toLowerCase().includes(q) || 
        stock.description.toLowerCase().includes(q)
      );

      return { result: filtered };
    }
    return {};
  }
}

module.exports = new MarketService();
