import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { MapPin } from "lucide-react";
import { getCities, getBarangays } from "ph-addresses-locations";
import { getProvincesByRegion } from "@/utils/philippineAddressData";

/**
 * RegionAddressSelector Component
 * TRUE CASCADING: Region → Province → Municipality → Barangay
 * Each level depends on the previous selection
 */
export default function RegionAddressSelector({
  region,
  province,
  municipality,
  barangay,
  onProvinceChange,
  onMunicipalityChange,
  onBarangayChange,
  required = false,
  disabled = false,
}) {
  const [availableProvinces, setAvailableProvinces] = useState([]);
  const [availableMunicipalities, setAvailableMunicipalities] = useState([]);
  const [availableBarangays, setAvailableBarangays] = useState([]);

  // Update available provinces when region changes
  useEffect(() => {
    console.log("Region changed:", region);
    if (region) {
      const provinces = getProvincesByRegion(region);
      console.log("Provinces for region:", provinces);
      setAvailableProvinces(provinces);
      
      // Reset downstream selections when region changes
      if (province && !provinces.includes(province)) {
        onProvinceChange("");
        onMunicipalityChange("");
        onBarangayChange("");
        setAvailableMunicipalities([]);
        setAvailableBarangays([]);
      }
    } else {
      setAvailableProvinces([]);
      setAvailableMunicipalities([]);
      setAvailableBarangays([]);
    }
  }, [region]);

  // Load municipalities when province changes
  useEffect(() => {
    console.log("Province changed:", province);
    if (province) {
      try {
        const cities = getCities(province);
        console.log("Municipalities for province:", cities);
        console.log("Number of municipalities:", cities ? cities.length : 0);
        
        if (cities && cities.length > 0) {
          const sortedCities = [...cities].sort((a, b) => a.localeCompare(b));
          setAvailableMunicipalities(sortedCities);
        } else {
          console.warn("No municipalities found for province:", province);
          setAvailableMunicipalities([]);
        }
        
        // Reset municipality and barangay when province changes
        if (municipality) {
          onMunicipalityChange("");
        }
        if (barangay) {
          onBarangayChange("");
        }
        setAvailableBarangays([]);
      } catch (error) {
        console.error("Error loading municipalities:", error);
        setAvailableMunicipalities([]);
      }
    } else {
      setAvailableMunicipalities([]);
      setAvailableBarangays([]);
    }
  }, [province]);

  // Load barangays when municipality changes
  useEffect(() => {
    console.log("Municipality changed:", municipality);
    if (province && municipality) {
      try {
        const brgyList = getBarangays(province, municipality);
        console.log("Barangays for municipality:", brgyList);
        console.log("Number of barangays:", brgyList ? brgyList.length : 0);
        
        if (brgyList && brgyList.length > 0) {
          const sortedBrgys = [...brgyList].sort((a, b) => a.localeCompare(b));
          setAvailableBarangays(sortedBrgys);
        } else {
          console.warn("No barangays found for:", province, municipality);
          setAvailableBarangays([]);
        }
        
        // Reset barangay when municipality changes
        if (barangay) {
          onBarangayChange("");
        }
      } catch (error) {
        console.error("Error loading barangays:", error);
        setAvailableBarangays([]);
      }
    } else {
      setAvailableBarangays([]);
    }
  }, [province, municipality]);

  return (
    <div className="space-y-4">
      {/* Province */}
      <div className="space-y-2">
        <Label>
          Province {required && <span className="text-red-500">*</span>}
        </Label>
        <Select
          value={province}
          onValueChange={onProvinceChange}
          disabled={disabled || !region || availableProvinces.length === 0}
        >
          <SelectTrigger className="w-full">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <SelectValue 
                placeholder={
                  !region 
                    ? "Select Region first" 
                    : availableProvinces.length === 0 
                    ? "No provinces available for selected region" 
                    : "Select Province"
                } 
              />
            </div>
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            {availableProvinces.map((prov) => (
              <SelectItem key={prov} value={prov}>
                {prov}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Municipality */}
      <div className="space-y-2">
        <Label>
          City/Municipality {required && <span className="text-red-500">*</span>}
        </Label>
        <Select
          value={municipality}
          onValueChange={onMunicipalityChange}
          disabled={disabled || !province || availableMunicipalities.length === 0}
        >
          <SelectTrigger className="w-full">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <SelectValue 
                placeholder={
                  !province 
                    ? "Select Province first" 
                    : availableMunicipalities.length === 0 
                    ? "No municipalities available" 
                    : "Select Municipality"
                } 
              />
            </div>
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            {availableMunicipalities.map((city) => (
              <SelectItem key={city} value={city}>
                {city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Barangay */}
      <div className="space-y-2">
        <Label>
          Barangay {required && <span className="text-red-500">*</span>}
        </Label>
        <Select
          value={barangay}
          onValueChange={onBarangayChange}
          disabled={disabled || !municipality || availableBarangays.length === 0}
        >
          <SelectTrigger className="w-full">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <SelectValue 
                placeholder={
                  !municipality 
                    ? "Select Municipality first" 
                    : availableBarangays.length === 0 
                    ? "No barangays available" 
                    : "Select Barangay"
                } 
              />
            </div>
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            {availableBarangays.map((brgy) => (
              <SelectItem key={brgy} value={brgy}>
                {brgy}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
