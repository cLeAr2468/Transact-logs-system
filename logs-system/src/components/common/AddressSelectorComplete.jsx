import * as React from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin } from "lucide-react";
import { getMunicipalities, getBarangays } from "@/utils/philippineAddresses";
import { getAllRegions, getProvincesForRegion } from "@/utils/regionProvinceMapping";

/**
 * Complete AddressSelector Component from SeedMIS
 * Uses complete Philippine address data from JSON file
 * TRUE CASCADING: Region → Province → Municipality → Barangay
 */
export const AddressSelectorComplete = ({ 
  values = { region: "", province: "", municipality: "", barangay: "" },
  onChange,
  errors = {},
  disabled = false,
  required = false 
}) => {
  const [regions] = React.useState(getAllRegions());
  const [provinces, setProvinces] = React.useState([]);
  const [municipalities, setMunicipalities] = React.useState([]);
  const [barangays, setBarangays] = React.useState([]);
  const [isInitialMount, setIsInitialMount] = React.useState(true);

  // Update provinces when region changes
  React.useEffect(() => {
    console.log("Region changed:", values.region);
    if (values.region) {
      const provs = getProvincesForRegion(values.region);
      console.log("Provinces for region:", provs);
      setProvinces(provs);
      
      // Only reset dependent fields if NOT initial mount and current province is not in new list
      if (!isInitialMount && values.province && !provs.includes(values.province)) {
        onChange({ 
          region: values.region,
          province: "", 
          municipality: "", 
          barangay: "" 
        });
      }
    } else {
      setProvinces([]);
      setMunicipalities([]);
      setBarangays([]);
    }
    
    // After first render, set isInitialMount to false
    if (isInitialMount) {
      setIsInitialMount(false);
    }
  }, [values.region]);

  // Update municipalities when province changes
  React.useEffect(() => {
    console.log("Province changed:", values.province);
    if (values.province) {
      const munis = getMunicipalities(values.province);
      console.log("Municipalities for province:", munis.length, "items");
      setMunicipalities(munis);
      
      // Only reset if NOT initial mount and current municipality is not in new list
      if (!isInitialMount && values.municipality && !munis.includes(values.municipality)) {
        onChange({ 
          ...values,
          municipality: "", 
          barangay: "" 
        });
      }
    } else {
      setMunicipalities([]);
      setBarangays([]);
    }
  }, [values.province]);

  // Update barangays when municipality changes
  React.useEffect(() => {
    console.log("Municipality changed:", values.municipality);
    if (values.province && values.municipality) {
      const brgys = getBarangays(values.province, values.municipality);
      console.log("Barangays for municipality:", brgys.length, "items");
      setBarangays(brgys);
      
      // Only reset if NOT initial mount and current barangay is not in new list
      if (!isInitialMount && values.barangay && !brgys.includes(values.barangay)) {
        onChange({ 
          ...values, 
          barangay: "" 
        });
      }
    } else {
      setBarangays([]);
    }
  }, [values.province, values.municipality]);

  const handleRegionChange = (newRegion) => {
    onChange({ 
      region: newRegion,
      province: "", 
      municipality: "", 
      barangay: "" 
    });
  };

  const handleProvinceChange = (newProvince) => {
    onChange({ 
      ...values,
      province: newProvince, 
      municipality: "", 
      barangay: "" 
    });
  };

  const handleMunicipalityChange = (newMunicipality) => {
    onChange({ 
      ...values, 
      municipality: newMunicipality, 
      barangay: "" 
    });
  };

  const handleBarangayChange = (newBarangay) => {
    onChange({ 
      ...values, 
      barangay: newBarangay 
    });
  };

  return (
    <div className="space-y-4">
      {/* Region */}
      <div className="space-y-2">
        <Label>
          Region {required && <span className="text-red-500">*</span>}
        </Label>
        <Select
          value={values.region}
          onValueChange={handleRegionChange}
          disabled={disabled}
        >
          <SelectTrigger className="w-full">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Select Region" />
            </div>
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            {regions.map((region) => (
              <SelectItem key={region} value={region}>
                {region}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.region && (
          <p className="text-red-500 text-sm mt-1">{errors.region}</p>
        )}
      </div>

      {/* Province */}
      <div className="space-y-2">
        <Label>
          Province {required && <span className="text-red-500">*</span>}
        </Label>
        <Select
          value={values.province}
          onValueChange={handleProvinceChange}
          disabled={disabled || !values.region || provinces.length === 0}
        >
          <SelectTrigger className="w-full">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <SelectValue 
                placeholder={
                  !values.region 
                    ? "Select Region first" 
                    : provinces.length === 0 
                    ? "No provinces available" 
                    : "Select Province"
                } 
              />
            </div>
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            {provinces.map((province) => (
              <SelectItem key={province} value={province}>
                {province}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.province && (
          <p className="text-red-500 text-sm mt-1">{errors.province}</p>
        )}
      </div>

      {/* Municipality */}
      <div className="space-y-2">
        <Label>
          City/Municipality {required && <span className="text-red-500">*</span>}
        </Label>
        <Select
          value={values.municipality}
          onValueChange={handleMunicipalityChange}
          disabled={disabled || !values.province || municipalities.length === 0}
        >
          <SelectTrigger className="w-full">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <SelectValue 
                placeholder={
                  !values.province 
                    ? "Select Province first" 
                    : municipalities.length === 0 
                    ? "No municipalities available" 
                    : "Select Municipality"
                } 
              />
            </div>
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            {municipalities.map((municipality) => (
              <SelectItem key={municipality} value={municipality}>
                {municipality}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.municipality && (
          <p className="text-red-500 text-sm mt-1">{errors.municipality}</p>
        )}
      </div>

      {/* Barangay */}
      <div className="space-y-2">
        <Label>
          Barangay {required && <span className="text-red-500">*</span>}
        </Label>
        <Select
          value={values.barangay}
          onValueChange={handleBarangayChange}
          disabled={disabled || !values.municipality || barangays.length === 0}
        >
          <SelectTrigger className="w-full">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <SelectValue 
                placeholder={
                  !values.municipality 
                    ? "Select Municipality first" 
                    : barangays.length === 0 
                    ? "No barangays available" 
                    : "Select Barangay"
                } 
              />
            </div>
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            {barangays.map((barangay) => (
              <SelectItem key={barangay} value={barangay}>
                {barangay}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.barangay && (
          <p className="text-red-500 text-sm mt-1">{errors.barangay}</p>
        )}
      </div>
    </div>
  );
};

export default AddressSelectorComplete;
