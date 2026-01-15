// Carrier delivery time estimates (in days)
const CARRIER_ESTIMATES: Record<string, { domestic: number; international: number }> = {
  'Delhivery': { domestic: 4, international: 12 },
  'BlueDart': { domestic: 3, international: 10 },
  'DTDC': { domestic: 5, international: 14 },
  'FedEx': { domestic: 3, international: 7 },
  'DHL': { domestic: 3, international: 5 },
  'India Post': { domestic: 7, international: 21 },
  'Ecom Express': { domestic: 4, international: 15 },
  'Xpressbees': { domestic: 4, international: 14 },
  'Shadowfax': { domestic: 3, international: 12 },
  'Standard Shipping': { domestic: 5, international: 15 },
};

// Metro cities have faster delivery
const METRO_CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Bengaluru', 'Chennai', 'Kolkata', 
  'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Chandigarh'
];

// States with potentially slower delivery
const REMOTE_STATES = [
  'Jammu and Kashmir', 'Ladakh', 'Arunachal Pradesh', 'Sikkim', 
  'Meghalaya', 'Mizoram', 'Nagaland', 'Manipur', 'Tripura',
  'Andaman and Nicobar Islands', 'Lakshadweep'
];

interface DeliveryEstimateParams {
  carrierName?: string;
  city?: string;
  state?: string;
  country?: string;
  prepTimeDays?: number;
  isMadeToOrder?: boolean;
}

export const calculateEstimatedDelivery = ({
  carrierName = 'Standard Shipping',
  city = '',
  state = '',
  country = 'India',
  prepTimeDays = 0,
  isMadeToOrder = false,
}: DeliveryEstimateParams): Date => {
  const today = new Date();
  
  // Get carrier estimate
  const carrier = CARRIER_ESTIMATES[carrierName] || CARRIER_ESTIMATES['Standard Shipping'];
  
  // Determine if domestic or international
  const isIndia = country.toLowerCase() === 'india';
  let transitDays = isIndia ? carrier.domestic : carrier.international;
  
  // Adjust for metro vs non-metro cities
  if (isIndia) {
    const isMetro = METRO_CITIES.some(metro => 
      city.toLowerCase().includes(metro.toLowerCase())
    );
    
    const isRemote = REMOTE_STATES.some(remoteState => 
      state.toLowerCase().includes(remoteState.toLowerCase())
    );
    
    if (isMetro) {
      transitDays = Math.max(1, transitDays - 1);
    } else if (isRemote) {
      transitDays += 3;
    }
  }
  
  // Add preparation time for made-to-order items
  const prepTime = isMadeToOrder ? (prepTimeDays || 7) : 1;
  
  // Calculate total days
  const totalDays = prepTime + transitDays;
  
  // Add business days (skip weekends)
  let daysAdded = 0;
  const deliveryDate = new Date(today);
  
  while (daysAdded < totalDays) {
    deliveryDate.setDate(deliveryDate.getDate() + 1);
    const dayOfWeek = deliveryDate.getDay();
    // Skip Sundays (0)
    if (dayOfWeek !== 0) {
      daysAdded++;
    }
  }
  
  return deliveryDate;
};

export const formatDeliveryDate = (date: Date): string => {
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

export const getDeliveryRangeText = (params: DeliveryEstimateParams): string => {
  const estimatedDate = calculateEstimatedDelivery(params);
  
  // Add 1-2 days buffer for range
  const earlyDate = new Date(estimatedDate);
  const lateDate = new Date(estimatedDate);
  lateDate.setDate(lateDate.getDate() + 2);
  
  const earlyStr = earlyDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  const lateStr = lateDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  
  return `${earlyStr} - ${lateStr}`;
};

export const AVAILABLE_CARRIERS = Object.keys(CARRIER_ESTIMATES);
