import React from 'react';
import { ExternalLink, Star } from 'lucide-react';
import { motion } from 'motion/react';

interface BrokerSectionProps {
  type?: 'home' | 'general';
}

const BROKERS = {
  home: [
    {
      name: 'HDFC Bank',
      logo: 'https://www.google.com/s2/favicons?domain=hdfcbank.com&sz=64',
      rate: '8.45%',
      rating: 4.8,
      tags: ['Fast Approval', 'Digital Process'],
      url: 'https://www.hdfcbank.com/personal/borrow/popular-loans/home-loan'
    },
    {
      name: 'ICICI Bank',
      logo: 'https://www.google.com/s2/favicons?domain=icicibank.com&sz=64',
      rate: '8.60%',
      rating: 4.7,
      tags: ['Low Processing Fee'],
      url: 'https://www.icicibank.com/personal-banking/loans/home-loan'
    },
    {
      name: 'SBI',
      logo: 'https://www.google.com/s2/favicons?domain=onlinesbi.sbi&sz=64',
      rate: '8.40%',
      rating: 4.6,
      tags: ['Trusted', 'Wide Network'],
      url: 'https://homeloans.sbi/'
    },
    {
      name: 'Axis Bank',
      logo: 'https://www.google.com/s2/favicons?domain=axisbank.com&sz=64',
      rate: '8.75%',
      rating: 4.5,
      tags: ['Flexible Tenure'],
      url: 'https://www.axisbank.com/retail/loans/home-loan'
    }
  ],
  general: [
    {
      name: 'HDFC Bank',
      logo: 'https://www.google.com/s2/favicons?domain=hdfcbank.com&sz=64',
      rate: '10.5%',
      rating: 4.8,
      tags: ['All Loan Types', 'Digital'],
      url: 'https://www.hdfcbank.com/personal/borrow/popular-loans'
    },
    {
      name: 'ICICI Bank',
      logo: 'https://www.google.com/s2/favicons?domain=icicibank.com&sz=64',
      rate: '10.75%',
      rating: 4.7,
      tags: ['Personal & Auto', 'Easy'],
      url: 'https://www.icicibank.com/personal-banking/loans'
    },
    {
      name: 'SBI',
      logo: 'https://www.google.com/s2/favicons?domain=onlinesbi.sbi&sz=64',
      rate: '10.25%',
      rating: 4.6,
      tags: ['Government Trusted'],
      url: 'https://bank.sbi/web/personal-banking/loans'
    },
    {
      name: 'Axis Bank',
      logo: 'https://www.google.com/s2/favicons?domain=axisbank.com&sz=64',
      rate: '10.99%',
      rating: 4.5,
      tags: ['Quick Disbursal'],
      url: 'https://www.axisbank.com/retail/loans'
    }
  ]
};

export default function BrokerSection({ type = 'general' }: BrokerSectionProps) {
  const brokers = BROKERS[type];

  return (
    <div className="space-y-6 pt-8 border-t border-white/5">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">Top Lenders</h3>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {brokers.map((broker, i) => (
          <motion.a 
            key={broker.name}
            href={broker.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-5 hover:bg-white/5 transition-all group cursor-pointer border border-white/5 hover:border-white/10 block"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-white p-1.5 flex items-center justify-center">
                <img 
                  src={broker.logo} 
                  alt={broker.name} 
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex items-center gap-1 bg-yellow-500/10 px-1.5 py-0.5 rounded text-[10px] font-bold text-yellow-500">
                <Star className="w-2.5 h-2.5 fill-current" />
                {broker.rating}
              </div>
            </div>
            
            <div className="space-y-1 mb-4">
              <h4 className="font-bold text-white group-hover:text-purple-400 transition-colors">{broker.name}</h4>
              <p className="text-xs text-zinc-500">Starting at <span className="text-white font-semibold">{broker.rate}</span></p>
            </div>
            
            <div className="flex flex-wrap gap-1.5 mb-4">
              {broker.tags.map(tag => (
                <span key={tag} className="text-[9px] font-bold text-zinc-400 bg-white/5 px-2 py-0.5 rounded uppercase tracking-wider">
                  {tag}
                </span>
              ))}
            </div>
            
            <div className="flex items-center justify-between text-[10px] font-bold text-purple-500 uppercase tracking-widest pt-3 border-t border-white/5">
              Check Eligibility
              <ExternalLink className="w-3 h-3" />
            </div>
          </motion.a>
        ))}
      </div>
    </div>
  );
}
