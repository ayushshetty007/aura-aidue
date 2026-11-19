export interface CompanyFinancialRecord {
  year: string;
  revenue: string;
  netProfit: string;
  patGrowth: string;
}

export interface CompanyProfile {
  id: string;
  name: string;
  ticker: string;
  parentGroup?: string;
  exchange: string;
  sector: string;
  marketCap: string;
  revenue: string;
  netProfit: string;
  latestProfitFigure: string;
  profitGrowth: string;
  profitMargin: string;
  summary: string;
  profitExplanation: string;
  keyFinancials: CompanyFinancialRecord[];
  profitDrivers: string[];
  headquarters: string;
  tags: string[];
}

export const COMPANY_PROFILES: CompanyProfile[] = [
  {
    id: 'tata-motors',
    name: 'Tata Motors Limited',
    ticker: 'TATAMOTORS',
    parentGroup: 'Tata Group',
    exchange: 'NSE / BSE',
    sector: 'Automotive & Electric Vehicles',
    marketCap: '₹3,62,000 Crore (₹3.62 Lakh Cr)',
    revenue: '₹4,39,695 Crore (FY25) / ₹4,37,928 Crore (FY24)',
    netProfit: '₹28,149 Crore (FY25) / ₹31,807 Crore (FY24)',
    latestProfitFigure: '₹31,807 Crore net profit in FY24 and ₹28,149 Crore in FY25',
    profitGrowth: 'Consolidated PAT grew by +26.6% in FY24 to record high',
    profitMargin: '6.4% - 7.3% Consolidated Net Margin',
    summary: 'India\'s leading automotive manufacturer and global parent of Jaguar Land Rover (JLR), with dominance in commercial trucks and 70%+ market share in domestic passenger electric vehicles.',
    profitExplanation: 'Tata Motors achieved a historic all-time record consolidated net profit of ₹31,807 Crore in FY24 and sustained high profitability of ₹28,149 Crore in FY25. The immense profit was driven by record operational performance and high average selling prices at Jaguar Land Rover (Range Rover, Defender), alongside strong realizations in Indian commercial vehicles and market leadership in passenger EVs. The automotive business successfully achieved net-zero debt.',
    keyFinancials: [
      {
        year: 'FY25',
        revenue: '₹4,39,695 Cr',
        netProfit: '₹28,149 Cr',
        patGrowth: 'Resilient profitability amidst global supply headwinds'
      },
      {
        year: 'FY24',
        revenue: '₹4,37,928 Cr',
        netProfit: '₹31,807 Cr',
        patGrowth: '+1,100%+ YoY turn into record all-time company profit'
      },
      {
        year: 'FY23',
        revenue: '₹3,45,967 Cr',
        netProfit: '₹2,414 Cr',
        patGrowth: 'Post-pandemic recovery and initial JLR turnaround'
      }
    ],
    profitDrivers: [
      'Jaguar Land Rover (JLR) record order book with high-margin Range Rover, Range Rover Sport & Defender models.',
      'Domestic commercial vehicle infrastructure demand and freight rate stability across India.',
      '70%+ market leadership in India\'s passenger electric vehicle sector (Nexon.ev, Punch.ev, Tiago.ev).',
      'Automotive net debt reduced to zero in FY25, saving thousands of crores in annual financing charges.'
    ],
    headquarters: 'Mumbai, Maharashtra, India',
    tags: ['tata', 'tata motors', 'tatamotors', 'jlr', 'jaguar', 'ev', 'automotive']
  },
  {
    id: 'maruti-suzuki',
    name: 'Maruti Suzuki India Limited',
    ticker: 'MARUTI',
    parentGroup: 'Suzuki Motor Corporation',
    exchange: 'NSE / BSE',
    sector: 'Automotive (Passenger Cars & SUVs)',
    marketCap: '₹3,85,000 Crore (₹3.85 Lakh Cr)',
    revenue: '₹1,56,650 Crore (FY25) / ₹1,44,787 Crore (FY24)',
    netProfit: '₹13,955 Crore (FY25) / ₹13,209 Crore (FY24)',
    latestProfitFigure: '₹13,955 Crore net profit in FY25 (Record High)',
    profitGrowth: '+5.6% YoY growth in FY25 after +64.1% surge in FY24',
    profitMargin: '8.9% - 9.1% Net Profit Margin',
    summary: 'India\'s largest passenger vehicle maker with over 41% market share, jointly held by Japan\'s Suzuki Motor Corporation (58.28% stake) and Indian public shareholders.',
    profitExplanation: 'Maruti Suzuki recorded its highest-ever annual net profit of ₹13,955 Crore in FY25, surpassing its previous record of ₹13,209 Crore in FY24. The strong profit expansion was propelled by aggressive expansion into higher-margin utility vehicles (Grand Vitara, Brezza, Fronx), premiumization through the Nexa sales channel (32%+ volume mix), record exports across 100+ countries, and substantial interest income from over ₹50,000 crore in net cash reserves.',
    keyFinancials: [
      {
        year: 'FY25',
        revenue: '₹1,56,650 Cr',
        netProfit: '₹13,955 Cr',
        patGrowth: '+5.6% YoY to fresh all-time record'
      },
      {
        year: 'FY24',
        revenue: '₹1,44,787 Cr',
        netProfit: '₹13,209 Cr',
        patGrowth: '+64.1% YoY driven by utility vehicle expansion'
      },
      {
        year: 'FY23',
        revenue: '₹1,17,523 Cr',
        netProfit: '₹8,049 Cr',
        patGrowth: 'Post-supply chain chip clearance normalization'
      }
    ],
    profitDrivers: [
      'SUV portfolio leadership: Grand Vitara, Brezza, Fronx, and Jimny driving higher average selling price (ASP).',
      'Nexa premium retail network contributing over 32% of total volumes at expanded margins.',
      'Record global automotive exports to over 100 markets across Africa, Middle East, and Latin America.',
      'Robust fortress balance sheet with ₹50,000+ Crore cash reserves generating massive treasury yield.'
    ],
    headquarters: 'New Delhi, India',
    tags: ['suzuki', 'maruti', 'maruti suzuki', 'msil', 'cars', 'automotive']
  },
  {
    id: 'tcs',
    name: 'Tata Consultancy Services (TCS)',
    ticker: 'TCS',
    parentGroup: 'Tata Group',
    exchange: 'NSE / BSE',
    sector: 'Information Technology & Cloud AI',
    marketCap: '₹15,10,000 Crore (₹15.1 Lakh Cr)',
    revenue: '₹2,40,893 Crore (FY24)',
    netProfit: '₹46,099 Crore (FY24)',
    latestProfitFigure: '₹46,099 Crore net profit in FY24',
    profitGrowth: '+9.1% YoY with 24.6% operating EBIT margin',
    profitMargin: '19.1% Net Profit Margin',
    summary: 'India\'s most valuable IT services and enterprise software company, serving global Fortune 500 banks, retailers, and healthcare giants with mission-critical cloud and generative AI systems.',
    profitExplanation: 'TCS generated an immense annual net profit of ₹46,099 Crore in FY24 on revenues of ₹2,40,893 Crore. The company achieved this through disciplined cost execution, industry-leading 24.6% operating margins, and strong multi-billion dollar total contract value (TCV) in financial services (BFSI), cloud migration, and cyber transformation.',
    keyFinancials: [
      {
        year: 'FY24',
        revenue: '₹2,40,893 Cr',
        netProfit: '₹46,099 Cr',
        patGrowth: '+9.1% YoY with over ₹44,000 Cr free cash flow'
      },
      {
        year: 'FY23',
        revenue: '₹2,25,458 Cr',
        netProfit: '₹42,147 Cr',
        patGrowth: '+10.0% YoY sustained double-digit expansion'
      }
    ],
    profitDrivers: [
      'Over $34 Billion in annual Total Contract Value (TCV) deal pipeline.',
      'Industry-benchmark 24.5%+ EBIT margins sustained through wage cycles.',
      'Return on Equity (ROE) exceeding 45% with nearly 100% free cash flow conversion.'
    ],
    headquarters: 'Mumbai, Maharashtra, India',
    tags: ['tata', 'tcs', 'tata consultancy', 'it', 'software', 'cloud']
  },
  {
    id: 'reliance',
    name: 'Reliance Industries Limited',
    ticker: 'RELIANCE',
    parentGroup: 'Reliance Group',
    exchange: 'NSE / BSE',
    sector: 'Conglomerate (Telecom, Retail, Energy)',
    marketCap: '₹20,20,000 Crore (₹20.2 Lakh Cr)',
    revenue: '₹10,00,122 Crore (FY24, First Indian firm crossing ₹10 Lakh Cr)',
    netProfit: '₹69,621 Crore (FY24)',
    latestProfitFigure: '₹69,621 Crore consolidated net profit in FY24',
    profitGrowth: '+7.3% YoY',
    profitMargin: '6.9% Consolidated Net Margin',
    summary: 'India\'s largest private sector enterprise spanning telecom (Jio Infocomm), national organized retail, oil-to-chemicals refining, and new green energy gigafactories.',
    profitExplanation: 'Reliance Industries posted a consolidated net profit of ₹69,621 Crore in FY24 on historic revenue surpassing ₹10 Lakh Crore. Profitability was powered by Jio telecom subscriber additions and 5G tariff monetization, strong retail EBITDA expansion across 18,500+ stores, and resilient refining margins at the Jamnagar integrated complex.',
    keyFinancials: [
      {
        year: 'FY24',
        revenue: '₹10,00,122 Cr',
        netProfit: '₹69,621 Cr',
        patGrowth: '+7.3% YoY to record corporate revenues'
      },
      {
        year: 'FY23',
        revenue: '₹8,92,912 Cr',
        netProfit: '₹66,702 Cr',
        patGrowth: '+14.0% YoY across digital and retail growth'
      }
    ],
    profitDrivers: [
      'Jio telecom network with over 475 million subscribers driving recurring ARPU growth.',
      'Reliance Retail spanning grocery, fashion, and electronics with double-digit EBITDA margins.',
      'Jamnagar refinery complex operating at high crude flexibility and petrochemical margins.'
    ],
    headquarters: 'Mumbai, Maharashtra, India',
    tags: ['reliance', 'jio', 'mukesh ambani', 'telecom', 'energy', 'oil']
  }
];

export function searchCompanies(query: string): CompanyProfile[] {
  if (!query || !query.trim()) {
    return COMPANY_PROFILES;
  }
  const q = query.toLowerCase().trim();
  return COMPANY_PROFILES.filter((c) => {
    return (
      c.name.toLowerCase().includes(q) ||
      c.ticker.toLowerCase().includes(q) ||
      c.sector.toLowerCase().includes(q) ||
      (c.parentGroup && c.parentGroup.toLowerCase().includes(q)) ||
      c.tags.some((t) => t.includes(q))
    );
  });
}

