import { getCities, getBarangays } from "ph-addresses-locations";
import { PHILIPPINE_REGIONS, getProvincesByRegion } from "./philippineAddressData";

/**
 * Test utility to verify which provinces have data in ph-addresses-locations package
 */
export function testAllProvinces() {
  console.log("=== TESTING ALL PROVINCES ===");
  
  const results = {
    working: [],
    notWorking: []
  };
  
  Object.keys(PHILIPPINE_REGIONS).forEach(region => {
    const provinces = getProvincesByRegion(region);
    
    console.log(`\n--- ${region} ---`);
    
    provinces.forEach(province => {
      try {
        const cities = getCities(province);
        
        if (cities && cities.length > 0) {
          console.log(`✅ ${province}: ${cities.length} municipalities`);
          results.working.push({ region, province, count: cities.length });
        } else {
          console.log(`❌ ${province}: NO DATA`);
          results.notWorking.push({ region, province });
        }
      } catch (error) {
        console.log(`❌ ${province}: ERROR - ${error.message}`);
        results.notWorking.push({ region, province, error: error.message });
      }
    });
  });
  
  console.log("\n=== SUMMARY ===");
  console.log(`Working provinces: ${results.working.length}`);
  console.log(`Not working provinces: ${results.notWorking.length}`);
  
  if (results.notWorking.length > 0) {
    console.log("\n=== PROVINCES WITHOUT DATA ===");
    results.notWorking.forEach(item => {
      console.log(`- ${item.province} (${item.region})`);
    });
  }
  
  return results;
}

/**
 * Test a specific province
 */
export function testProvince(provinceName) {
  console.log(`\n=== TESTING: ${provinceName} ===`);
  
  try {
    const cities = getCities(provinceName);
    console.log(`Municipalities found: ${cities ? cities.length : 0}`);
    
    if (cities && cities.length > 0) {
      console.log("Cities:", cities);
      
      // Test first city for barangays
      const firstCity = cities[0];
      console.log(`\nTesting barangays for: ${firstCity}`);
      const barangays = getBarangays(provinceName, firstCity);
      console.log(`Barangays found: ${barangays ? barangays.length : 0}`);
      if (barangays && barangays.length > 0) {
        console.log("First 5 barangays:", barangays.slice(0, 5));
      }
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

// For browser console testing
if (typeof window !== 'undefined') {
  window.testAllProvinces = testAllProvinces;
  window.testProvince = testProvince;
}
