import { DataPoint } from '../types';
import { calculateRisk } from '../utils/hydrology';

/**
 * Curated Demonstration Dataset for FLOWSHIELD
 * 
 * DISCLAIMER & DATA ATTRIBUTION:
 * Clearly labeled as DEMO DATA (SYNTHESIZED GEO-CALIBRATED BASELINE).
 * This baseline dataset covers 60+ critical flood-monitoring points across
 * major Indian river basins (Brahmaputra, Ganga, Mahanadi, Godavari, Krishna,
 * Periyar, Narmada) with realistic SRTM elevations, gradients, and CHIRPS precipitation.
 * 
 * Users can import their real Google Earth Engine exported CSV at any time.
 */

interface RawDemoPoint {
  id: string;
  name: string;
  state: string;
  basin: string;
  lat: number;
  lng: number;
  rainfall: number;   // mm
  elevation: number;  // meters
  slope: number;      // degrees
  flood: number;      // 1 or 0
}

const RAW_DEMO_POINTS: RawDemoPoint[] = [
  // --- ASSAM & BRAHMAPUTRA BASIN (Historically highest flood vulnerability) ---
  { id: 'IN-AS-01', name: 'Majuli River Island', state: 'Assam', basin: 'Brahmaputra', lat: 26.96, lng: 94.21, rainfall: 218.4, elevation: 84, slope: 0.4, flood: 1 },
  { id: 'IN-AS-02', name: 'Kaziranga Buffer Zone', state: 'Assam', basin: 'Brahmaputra', lat: 26.58, lng: 93.17, rainfall: 195.2, elevation: 67, slope: 0.6, flood: 1 },
  { id: 'IN-AS-03', name: 'Dibrugarh Embankment', state: 'Assam', basin: 'Brahmaputra', lat: 27.47, lng: 94.91, rainfall: 178.6, elevation: 108, slope: 0.8, flood: 1 },
  { id: 'IN-AS-04', name: 'Dhubri River Confluence', state: 'Assam', basin: 'Brahmaputra', lat: 26.02, lng: 89.98, rainfall: 184.0, elevation: 34, slope: 0.5, flood: 1 },
  { id: 'IN-AS-05', name: 'Barpeta Lowlands', state: 'Assam', basin: 'Manas-Brahmaputra', lat: 26.32, lng: 91.01, rainfall: 162.5, elevation: 42, slope: 0.5, flood: 1 },
  { id: 'IN-AS-06', name: 'Guwahati Brahmaputra Bank', state: 'Assam', basin: 'Brahmaputra', lat: 26.18, lng: 91.75, rainfall: 138.2, elevation: 55, slope: 1.8, flood: 0 },
  { id: 'IN-AS-07', name: 'Silchar Barak Valley', state: 'Assam', basin: 'Barak', lat: 24.83, lng: 92.78, rainfall: 226.7, elevation: 22, slope: 0.3, flood: 1 },
  { id: 'IN-AS-08', name: 'Tezpur Ghat', state: 'Assam', basin: 'Brahmaputra', lat: 26.63, lng: 92.79, rainfall: 92.4, elevation: 76, slope: 1.2, flood: 0 },

  // --- BIHAR & KOSI / GANGA BASIN (Sorrow of Bihar, flat plains) ---
  { id: 'IN-BR-01', name: 'Supaul Kosi Floodway', state: 'Bihar', basin: 'Kosi', lat: 26.12, lng: 86.60, rainfall: 188.6, elevation: 48, slope: 0.3, flood: 1 },
  { id: 'IN-BR-02', name: 'Saharsa Diara Plains', state: 'Bihar', basin: 'Kosi', lat: 25.88, lng: 86.60, rainfall: 172.4, elevation: 44, slope: 0.4, flood: 1 },
  { id: 'IN-BR-03', name: 'Patna Ganga Floodplain', state: 'Bihar', basin: 'Ganga', lat: 25.61, lng: 85.14, rainfall: 142.1, elevation: 53, slope: 0.7, flood: 1 },
  { id: 'IN-BR-04', name: 'Bhagalpur Badua Confluence', state: 'Bihar', basin: 'Ganga', lat: 25.24, lng: 86.98, rainfall: 124.8, elevation: 49, slope: 0.6, flood: 0 },
  { id: 'IN-BR-05', name: 'Darbhanga Bagmati Belt', state: 'Bihar', basin: 'Bagmati', lat: 26.15, lng: 85.90, rainfall: 165.3, elevation: 51, slope: 0.4, flood: 1 },
  { id: 'IN-BR-06', name: 'Katihar Mahananda Basin', state: 'Bihar', basin: 'Mahananda', lat: 25.54, lng: 87.57, rainfall: 182.0, elevation: 36, slope: 0.3, flood: 1 },
  { id: 'IN-BR-07', name: 'Gaya Falgu Valley', state: 'Bihar', basin: 'Falgu', lat: 24.79, lng: 85.00, rainfall: 54.2, elevation: 111, slope: 2.1, flood: 0 },

  // --- UTTAR PRADESH (Ganga, Ghaghara, Rapti basins) ---
  { id: 'IN-UP-01', name: 'Gorakhpur Rapti Basin', state: 'Uttar Pradesh', basin: 'Rapti', lat: 26.76, lng: 83.37, rainfall: 154.6, elevation: 84, slope: 0.6, flood: 1 },
  { id: 'IN-UP-02', name: 'Ballia Ganga-Ghaghara Doab', state: 'Uttar Pradesh', basin: 'Ganga-Ghaghara', lat: 25.76, lng: 84.15, rainfall: 136.4, elevation: 62, slope: 0.5, flood: 1 },
  { id: 'IN-UP-03', name: 'Varanasi Assi Confluence', state: 'Uttar Pradesh', basin: 'Ganga', lat: 25.31, lng: 82.97, rainfall: 88.5, elevation: 79, slope: 0.9, flood: 0 },
  { id: 'IN-UP-04', name: 'Prayagraj Sangam Flats', state: 'Uttar Pradesh', basin: 'Ganga-Yamuna', lat: 25.43, lng: 81.84, rainfall: 96.2, elevation: 92, slope: 1.1, flood: 0 },
  { id: 'IN-UP-05', name: 'Bahraich Saryu Spill', state: 'Uttar Pradesh', basin: 'Saryu', lat: 27.57, lng: 81.60, rainfall: 148.0, elevation: 124, slope: 0.8, flood: 1 },
  { id: 'IN-UP-06', name: 'Ayodhya Saryu Ghat', state: 'Uttar Pradesh', basin: 'Saryu', lat: 26.80, lng: 82.20, rainfall: 78.4, elevation: 104, slope: 1.0, flood: 0 },
  { id: 'IN-UP-07', name: 'Jhansi Bundelkhand Plateau', state: 'Uttar Pradesh', basin: 'Betwa', lat: 25.45, lng: 78.57, rainfall: 28.5, elevation: 285, slope: 4.8, flood: 0 },

  // --- WEST BENGAL & SUNDARBANS (Tidal estuaries and sub-Himalayan duars) ---
  { id: 'IN-WB-01', name: 'Malda Ganga Inundation Zone', state: 'West Bengal', basin: 'Ganga', lat: 25.01, lng: 88.14, rainfall: 174.2, elevation: 24, slope: 0.4, flood: 1 },
  { id: 'IN-WB-02', name: 'Murshidabad Bhagirathi Belt', state: 'West Bengal', basin: 'Bhagirathi', lat: 24.18, lng: 88.27, rainfall: 145.8, elevation: 19, slope: 0.3, flood: 1 },
  { id: 'IN-WB-03', name: 'Sundarbans Gosaba Estuary', state: 'West Bengal', basin: 'Sundarbans Delta', lat: 22.16, lng: 88.80, rainfall: 192.5, elevation: 4, slope: 0.2, flood: 1 },
  { id: 'IN-WB-04', name: 'Jalpaiguri Teesta Basin', state: 'West Bengal', basin: 'Teesta', lat: 26.52, lng: 88.72, rainfall: 215.0, elevation: 88, slope: 1.4, flood: 1 },
  { id: 'IN-WB-05', name: 'Kolkata Hooghly Waterfront', state: 'West Bengal', basin: 'Hooghly', lat: 22.57, lng: 88.36, rainfall: 112.4, elevation: 9, slope: 0.5, flood: 0 },
  { id: 'IN-WB-06', name: 'Purulia Chota Nagpur Foothills', state: 'West Bengal', basin: 'Damodar', lat: 23.33, lng: 86.36, rainfall: 42.0, elevation: 230, slope: 5.6, flood: 0 },

  // --- ODISHA & MAHANADI DELTA ---
  { id: 'IN-OD-01', name: 'Kendrapara Mahanadi Delta', state: 'Odisha', basin: 'Mahanadi', lat: 20.50, lng: 86.42, rainfall: 185.3, elevation: 12, slope: 0.3, flood: 1 },
  { id: 'IN-OD-02', name: 'Jagatsinghpur Coastal Plain', state: 'Odisha', basin: 'Mahanadi', lat: 20.27, lng: 86.17, rainfall: 176.0, elevation: 14, slope: 0.4, flood: 1 },
  { id: 'IN-OD-03', name: 'Cuttack Mahanadi-Kathajodi Doab', state: 'Odisha', basin: 'Mahanadi', lat: 20.46, lng: 85.88, rainfall: 135.2, elevation: 26, slope: 0.8, flood: 0 },
  { id: 'IN-OD-04', name: 'Sambalpur Hirakud Downstream', state: 'Odisha', basin: 'Mahanadi', lat: 21.46, lng: 83.98, rainfall: 115.8, elevation: 148, slope: 2.2, flood: 0 },
  { id: 'IN-OD-05', name: 'Puri Coastal Lagoon Zone', state: 'Odisha', basin: 'Bhargavi', lat: 19.81, lng: 85.83, rainfall: 140.5, elevation: 7, slope: 0.3, flood: 1 },

  // --- ANDHRA PRADESH & TELANGANA (Godavari & Krishna) ---
  { id: 'IN-TG-01', name: 'Bhadrachalam Godavari River', state: 'Telangana', basin: 'Godavari', lat: 17.67, lng: 80.89, rainfall: 198.5, elevation: 49, slope: 0.9, flood: 1 },
  { id: 'IN-AP-01', name: 'Rajahmundry Godavari Delta', state: 'Andhra Pradesh', basin: 'Godavari', lat: 17.00, lng: 81.78, rainfall: 168.4, elevation: 21, slope: 0.5, flood: 1 },
  { id: 'IN-AP-02', name: 'Vijayawada Prakasam Barrage', state: 'Andhra Pradesh', basin: 'Krishna', lat: 16.51, lng: 80.62, rainfall: 152.0, elevation: 19, slope: 0.6, flood: 1 },
  { id: 'IN-AP-03', name: 'Eluru Kolleru Lake Plain', state: 'Andhra Pradesh', basin: 'Tammileru', lat: 16.71, lng: 81.10, rainfall: 142.3, elevation: 16, slope: 0.3, flood: 1 },
  { id: 'IN-AP-04', name: 'Kurnool Tungabhadra Basin', state: 'Andhra Pradesh', basin: 'Tungabhadra', lat: 15.83, lng: 78.03, rainfall: 82.1, elevation: 274, slope: 2.4, flood: 0 },
  { id: 'IN-TG-02', name: 'Hyderabad Musi Catchment', state: 'Telangana', basin: 'Musi', lat: 17.38, lng: 78.48, rainfall: 62.0, elevation: 512, slope: 3.1, flood: 0 },

  // --- KERALA (Western Ghats Runoff & Lowland Kayals) ---
  { id: 'IN-KL-01', name: 'Alappuzha Kuttanad Lowlands', state: 'Kerala', basin: 'Pamba', lat: 9.49, lng: 76.33, rainfall: 242.0, elevation: -1, slope: 0.2, flood: 1 },
  { id: 'IN-KL-02', name: 'Kochi Periyar Backwaters', state: 'Kerala', basin: 'Periyar', lat: 9.93, lng: 76.26, rainfall: 186.5, elevation: 5, slope: 0.4, flood: 1 },
  { id: 'IN-KL-03', name: 'Thrissur Kole Wetlands', state: 'Kerala', basin: 'Karuvannur', lat: 10.52, lng: 76.21, rainfall: 178.2, elevation: 3, slope: 0.3, flood: 1 },
  { id: 'IN-KL-04', name: 'Idukki Dam Catchment', state: 'Kerala', basin: 'Periyar', lat: 9.85, lng: 76.97, rainfall: 254.0, elevation: 712, slope: 16.4, flood: 0 },
  { id: 'IN-KL-05', name: 'Wayanad Kabini River Head', state: 'Kerala', basin: 'Kabini', lat: 11.68, lng: 76.13, rainfall: 210.3, elevation: 750, slope: 14.2, flood: 0 },
  { id: 'IN-KL-06', name: 'Palakkad Gap Basin', state: 'Kerala', basin: 'Bharathappuzha', lat: 10.78, lng: 76.65, rainfall: 98.4, elevation: 84, slope: 1.8, flood: 0 },

  // --- MAHARASHTRA & GOA (Konkan coastal ravines & Godavari source) ---
  { id: 'IN-MH-01', name: 'Chiplun Vashishti River Valley', state: 'Maharashtra', basin: 'Vashishti', lat: 17.53, lng: 73.51, rainfall: 275.4, elevation: 12, slope: 1.2, flood: 1 },
  { id: 'IN-MH-02', name: 'Mahad Savitri River Plain', state: 'Maharashtra', basin: 'Savitri', lat: 18.08, lng: 73.42, rainfall: 248.6, elevation: 18, slope: 1.1, flood: 1 },
  { id: 'IN-MH-03', name: 'Kolhapur Panchganga Flood Zone', state: 'Maharashtra', basin: 'Panchganga', lat: 16.70, lng: 74.24, rainfall: 195.0, elevation: 562, slope: 1.5, flood: 1 },
  { id: 'IN-MH-04', name: 'Mumbai Mithi River Basin', state: 'Maharashtra', basin: 'Mithi', lat: 19.07, lng: 72.87, rainfall: 204.2, elevation: 8, slope: 0.6, flood: 1 },
  { id: 'IN-MH-05', name: 'Nashik Godavari Ghat', state: 'Maharashtra', basin: 'Godavari', lat: 19.99, lng: 73.78, rainfall: 74.5, elevation: 584, slope: 2.8, flood: 0 },
  { id: 'IN-MH-06', name: 'Nagpur Nag River Catchment', state: 'Maharashtra', basin: 'Kanhan', lat: 21.14, lng: 79.08, rainfall: 48.0, elevation: 310, slope: 2.5, flood: 0 },
  { id: 'IN-GA-01', name: 'Panaji Mandovi Estuary', state: 'Goa', basin: 'Mandovi', lat: 15.49, lng: 73.82, rainfall: 164.0, elevation: 6, slope: 0.7, flood: 1 },

  // --- GUJARAT (Narmada, Tapi, Sabarmati) ---
  { id: 'IN-GJ-01', name: 'Bharuch Narmada Estuary', state: 'Gujarat', basin: 'Narmada', lat: 21.70, lng: 72.99, rainfall: 168.2, elevation: 16, slope: 0.5, flood: 1 },
  { id: 'IN-GJ-02', name: 'Surat Tapi Floodway', state: 'Gujarat', basin: 'Tapi', lat: 21.17, lng: 72.83, rainfall: 158.0, elevation: 13, slope: 0.4, flood: 1 },
  { id: 'IN-GJ-03', name: 'Navsari Purna Basin', state: 'Gujarat', basin: 'Purna', lat: 20.95, lng: 72.92, rainfall: 182.5, elevation: 9, slope: 0.3, flood: 1 },
  { id: 'IN-GJ-04', name: 'Ahmedabad Sabarmati Riverfront', state: 'Gujarat', basin: 'Sabarmati', lat: 23.02, lng: 72.57, rainfall: 68.4, elevation: 53, slope: 1.0, flood: 0 },
  { id: 'IN-GJ-05', name: 'Bhuj Kutch Arid Zone', state: 'Gujarat', basin: 'Rann of Kutch', lat: 23.24, lng: 69.66, rainfall: 14.2, elevation: 110, slope: 2.8, flood: 0 },

  // --- TAMIL NADU & KARNATAKA ---
  { id: 'IN-TN-01', name: 'Chennai Adyar-Cooum Basin', state: 'Tamil Nadu', basin: 'Adyar', lat: 13.08, lng: 80.27, rainfall: 172.0, elevation: 6, slope: 0.4, flood: 1 },
  { id: 'IN-TN-02', name: 'Cuddalore Gadilam Delta', state: 'Tamil Nadu', basin: 'Gadilam', lat: 11.75, lng: 79.76, rainfall: 184.8, elevation: 8, slope: 0.3, flood: 1 },
  { id: 'IN-TN-03', name: 'Thanjavur Cauvery Delta', state: 'Tamil Nadu', basin: 'Cauvery', lat: 10.78, lng: 79.13, rainfall: 128.4, elevation: 59, slope: 0.5, flood: 0 },
  { id: 'IN-KA-01', name: 'Mangaluru Netravati Estuary', state: 'Karnataka', basin: 'Netravati', lat: 12.91, lng: 74.85, rainfall: 196.2, elevation: 14, slope: 0.9, flood: 1 },
  { id: 'IN-KA-02', name: 'Bengaluru Bellandur Valley', state: 'Karnataka', basin: 'Pennar', lat: 12.93, lng: 77.67, rainfall: 82.0, elevation: 920, slope: 1.8, flood: 0 },

  // --- NORTH & CENTRAL INDIA (Punjab, Haryana, MP, Rajasthan) ---
  { id: 'IN-PB-01', name: 'Firozpur Sutlej Floodplain', state: 'Punjab', basin: 'Sutlej', lat: 30.92, lng: 74.61, rainfall: 132.5, elevation: 198, slope: 0.5, flood: 1 },
  { id: 'IN-HR-01', name: 'Ambala Ghaggar Riverbank', state: 'Haryana', basin: 'Ghaggar', lat: 30.37, lng: 76.77, rainfall: 126.0, elevation: 264, slope: 0.7, flood: 1 },
  { id: 'IN-MP-01', name: 'Hoshangabad Narmada Ghat', state: 'Madhya Pradesh', basin: 'Narmada', lat: 22.75, lng: 77.72, rainfall: 144.0, elevation: 298, slope: 1.2, flood: 1 },
  { id: 'IN-MP-02', name: 'Jabalpur Bhedaghat Basin', state: 'Madhya Pradesh', basin: 'Narmada', lat: 23.18, lng: 79.98, rainfall: 86.4, elevation: 411, slope: 2.6, flood: 0 },
  { id: 'IN-RJ-01', name: 'Kota Chambal Barrage', state: 'Rajasthan', basin: 'Chambal', lat: 25.18, lng: 75.83, rainfall: 92.0, elevation: 271, slope: 1.4, flood: 0 },
  { id: 'IN-RJ-02', name: 'Jodhpur Thar Arid Basin', state: 'Rajasthan', basin: 'Luni', lat: 26.23, lng: 73.02, rainfall: 16.0, elevation: 231, slope: 2.2, flood: 0 },

  // --- HIMALAYAN & HIGH ELEVATION BENCHMARKS (Natural high slope, high drainage) ---
  { id: 'IN-JK-01', name: 'Srinagar Jhelum Flood Basin', state: 'Jammu and Kashmir', basin: 'Jhelum', lat: 34.08, lng: 74.79, rainfall: 138.0, elevation: 1585, slope: 0.8, flood: 1 },
  { id: 'IN-HP-01', name: 'Shimla Ridge Highlands', state: 'Himachal Pradesh', basin: 'Sutlej/Yamuna', lat: 31.10, lng: 77.17, rainfall: 72.0, elevation: 2206, slope: 24.5, flood: 0 },
  { id: 'IN-UT-01', name: 'Rishikesh Ganga Gorge', state: 'Uttarakhand', basin: 'Ganga', lat: 30.08, lng: 78.26, rainfall: 118.0, elevation: 372, slope: 8.5, flood: 0 },
  { id: 'IN-ML-01', name: 'Cherrapunji Plateau (High Rain / High Slope)', state: 'Meghalaya', basin: 'Surma-Meghna', lat: 25.27, lng: 91.73, rainfall: 284.0, elevation: 1430, slope: 18.2, flood: 0 },
  { id: 'IN-LA-01', name: 'Leh Indus Cold Desert', state: 'Ladakh', basin: 'Indus', lat: 34.15, lng: 77.57, rainfall: 8.5, elevation: 3524, slope: 12.0, flood: 0 }
];

/**
 * Builds the initial calibrated demo dataset with hydrological risk scores
 */
export function getDemoDataset(): DataPoint[] {
  return RAW_DEMO_POINTS.map((raw) => {
    const { riskLevel, riskScore } = calculateRisk(raw.rainfall, raw.elevation, raw.slope, raw.flood);
    return {
      id: raw.id,
      locationName: raw.name,
      state: raw.state,
      latitude: raw.lat,
      longitude: raw.lng,
      rainfall: raw.rainfall,
      elevation: raw.elevation,
      slope: raw.slope,
      flood: raw.flood,
      riskLevel,
      riskScore,
      drainageBasin: raw.basin,
      timestamp: '2026-09-19T06:00:00Z',
      isDemo: true
    };
  });
}
