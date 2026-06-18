import { useState } from 'react';
import { Newspaper, Clock, ExternalLink } from 'lucide-react';

const MOCK_NEWS = [
  {
    id: 1,
    title: "Reserve Bank of India maintains repo rate at 6.5%",
    source: "Financial Express",
    time: "2 hours ago",
    category: "Economy",
    url: "#"
  },
  {
    id: 2,
    title: "Reliance Industries reports 12% jump in Q3 profits, driven by retail growth",
    source: "Mint",
    time: "4 hours ago",
    category: "Earnings",
    url: "#"
  },
  {
    id: 3,
    title: "Tech stocks rally as TCS secures major cloud migration contract in Europe",
    source: "Economic Times",
    time: "5 hours ago",
    category: "Technology",
    url: "#"
  },
  {
    id: 4,
    title: "Foreign Portfolio Investors inject ₹15,000 crore into Indian equities this week",
    source: "Bloomberg Quint",
    time: "8 hours ago",
    category: "Markets",
    url: "#"
  },
  {
    id: 5,
    title: "Automobile sector sees strong month-on-month sales recovery",
    source: "Reuters",
    time: "12 hours ago",
    category: "Automobile",
    url: "#"
  }
];

export default function MarketNewsPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const categories = ['All', 'Markets', 'Economy', 'Earnings', 'Technology'];

  const filteredNews = activeCategory === 'All' 
    ? MOCK_NEWS 
    : MOCK_NEWS.filter(n => n.category === activeCategory);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white flex items-center gap-2">
            <Newspaper className="text-brand-500" />
            Market News
          </h1>
          <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">Live updates from the financial world</p>
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeCategory === cat 
                  ? 'bg-brand-500 text-white' 
                  : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredNews.map(news => (
          <a 
            key={news.id} 
            href={news.url}
            className="block glass-card p-6 group hover:border-brand-500/50 hover:shadow-brand-500/10 transition-all"
          >
            <div className="flex justify-between items-start gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400">
                    {news.category}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-surface-500">
                    <Clock className="w-3 h-3" />
                    {news.time}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-surface-900 dark:text-white group-hover:text-brand-500 transition-colors">
                  {news.title}
                </h3>
                <p className="text-sm text-surface-500 mt-2 font-medium">Source: {news.source}</p>
              </div>
              <div className="p-2 rounded-lg bg-surface-50 dark:bg-surface-800 text-surface-400 group-hover:text-brand-500 transition-colors">
                <ExternalLink className="w-5 h-5" />
              </div>
            </div>
          </a>
        ))}
        {filteredNews.length === 0 && (
          <div className="text-center py-12 text-surface-500">
            No news found for this category.
          </div>
        )}
      </div>
    </div>
  );
}
