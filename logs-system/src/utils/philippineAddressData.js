// Complete Philippine Address Data with Region Mapping
// This maps provinces to their respective regions

export const PHILIPPINE_REGIONS = {
  'NCR': {
    name: 'NCR - National Capital Region',
    provinces: ['Metro Manila']
  },
  'CAR': {
    name: 'CAR - Cordillera Administrative Region',
    provinces: ['Abra', 'Apayao', 'Benguet', 'Ifugao', 'Kalinga', 'Mountain Province']
  },
  'Region I': {
    name: 'Region I - Ilocos Region',
    provinces: ['Ilocos Norte', 'Ilocos Sur', 'La Union', 'Pangasinan']
  },
  'Region II': {
    name: 'Region II - Cagayan Valley',
    provinces: ['Batanes', 'Cagayan', 'Isabela', 'Nueva Vizcaya', 'Quirino']
  },
  'Region III': {
    name: 'Region III - Central Luzon',
    provinces: ['Aurora', 'Bataan', 'Bulacan', 'Nueva Ecija', 'Pampanga', 'Tarlac', 'Zambales']
  },
  'Region IV-A': {
    name: 'Region IV-A - CALABARZON',
    provinces: ['Batangas', 'Cavite', 'Laguna', 'Quezon', 'Rizal']
  },
  'MIMAROPA': {
    name: 'MIMAROPA',
    provinces: ['Marinduque', 'Occidental Mindoro', 'Oriental Mindoro', 'Palawan', 'Romblon']
  },
  'Region V': {
    name: 'Region V - Bicol Region',
    provinces: ['Albay', 'Camarines Norte', 'Camarines Sur', 'Catanduanes', 'Masbate', 'Sorsogon']
  },
  'Region VI': {
    name: 'Region VI - Western Visayas',
    provinces: ['Aklan', 'Antique', 'Capiz', 'Guimaras', 'Iloilo', 'Negros Occidental']
  },
  'Region VII': {
    name: 'Region VII - Central Visayas',
    provinces: ['Bohol', 'Cebu', 'Negros Oriental', 'Siquijor']
  },
  'Region VIII': {
    name: 'Region VIII - Eastern Visayas',
    provinces: ['Biliran', 'Eastern Samar', 'Leyte', 'Northern Samar', 'Samar', 'Southern Leyte']
  },
  'Region IX': {
    name: 'Region IX - Zamboanga Peninsula',
    provinces: ['Zamboanga del Norte', 'Zamboanga del Sur', 'Zamboanga Sibugay']
  },
  'Region X': {
    name: 'Region X - Northern Mindanao',
    provinces: ['Bukidnon', 'Camiguin', 'Lanao del Norte', 'Misamis Occidental', 'Misamis Oriental']
  },
  'Region XI': {
    name: 'Region XI - Davao Region',
    provinces: ['Davao de Oro', 'Davao del Norte', 'Davao del Sur', 'Davao Occidental', 'Davao Oriental']
  },
  'Region XII': {
    name: 'Region XII - SOCCSKSARGEN',
    provinces: ['Cotabato', 'Sarangani', 'South Cotabato', 'Sultan Kudarat']
  },
  'Region XIII': {
    name: 'Region XIII - Caraga',
    provinces: ['Agusan del Norte', 'Agusan del Sur', 'Dinagat Islands', 'Surigao del Norte', 'Surigao del Sur']
  },
  'BARMM': {
    name: 'BARMM - Bangsamoro Autonomous Region in Muslim Mindanao',
    provinces: ['Basilan', 'Lanao del Sur', 'Maguindanao', 'Sulu', 'Tawi-Tawi']
  }
};

/**
 * Get provinces for a specific region
 * @param {string} regionName - Full region name (e.g., "Region VIII - Eastern Visayas")
 * @returns {Array} Array of province names
 */
export const getProvincesByRegion = (regionName) => {
  if (!regionName) return [];
  
  // Find the region key by matching the full name
  const regionEntry = Object.entries(PHILIPPINE_REGIONS).find(
    ([key, data]) => data.name === regionName
  );
  
  return regionEntry ? regionEntry[1].provinces : [];
};

/**
 * Get all region names
 * @returns {Array} Array of region names
 */
export const getAllRegions = () => {
  return Object.values(PHILIPPINE_REGIONS).map(region => region.name);
};

/**
 * Get region key from full region name
 * @param {string} regionName - Full region name
 * @returns {string} Region key (e.g., "Region VIII")
 */
export const getRegionKey = (regionName) => {
  const entry = Object.entries(PHILIPPINE_REGIONS).find(
    ([key, data]) => data.name === regionName
  );
  return entry ? entry[0] : null;
};
