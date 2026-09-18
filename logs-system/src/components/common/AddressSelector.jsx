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
import {
  provinces,
  getMunicipalitiesByProvince,
} from "@/utils/philippineAddresses";
import barangayData from "@/data/philippine-barangays.json";

/**
 * AddressSelector Component
 * Uses complete barangay data from philippine-barangays.json
 */
export default function AddressSelector({
  province,
  municipality,
  barangay,
  onProvinceChange,
  onMunicipalityChange,
  onBarangayChange,
  required = false,
  disabled = false,
  layout = "grid",
}) {
  const [municipalities, setMunicipalities] = useState([]);
  const [barangays, setBarangays] = useState([]);

  useEffect(() => {
    if (province) {
      const newMunicipalities = getMunicipalitiesByProvince(province);
      setMunicipalities(newMunicipalities);
      
      if (municipality && !newMunicipalities.find(m => m.value === municipality)) {
        onMunicipalityChange("");
        onBarangayChange("");
      }
    } else {
      setMunicipalities([]);
      onMunicipalityChange("");
      onBarangayChange("");
    }
  }, [province]);

  useEffect(() => {
    if (municipality && province) {
      // Handle province name mapping
      let provinceName = province;
      if (province === "Samar (Western Samar)") {
        provinceName = "Samar";
      }
      
      // Handle municipality name mapping (API uses "City of X" format)
      let municipalityName = municipality;
      const cityMappings = {
        "Tacloban City": "City of Tacloban",
        "Ormoc City": "Ormoc City",
        "Baybay City": "City of Baybay",
        "Calbayog City": "City of Calbayog",
        "Catbalogan City": "City of Catbalogan",
        "Borongan City": "City of Borongan",
        "Maasin City": "City of Maasin"
      };
      
      if (cityMappings[municipality]) {
        municipalityName = cityMappings[municipality];
      }
      
      // Get barangays from complete data
      const provinceData = barangayData[provinceName] || {};
      const municipalityBarangays = provinceData[municipalityName] || [];
      setBarangays(municipalityBarangays);
      
      if (barangay && !municipalityBarangays.find(b => b.value === barangay)) {
        onBarangayChange("");
      }
    } else {
      setBarangays([]);
      onBarangayChange("");
    }
  }, [municipality, province]);

  const containerClass = layout === "grid" 
    ? "grid grid-cols-1 md:grid-cols-2 gap-4" 
    : "space-y-4";

  return (
    <div className={containerClass}>
      <div className="space-y-2">
        <Label>
          Province {required && <span className="text-red-500">*</span>}
        </Label>
        <Select value={province} onValueChange={onProvinceChange} disabled={disabled}>
          <SelectTrigger className={disabled ? "bg-gray-100 cursor-not-allowed" : ""}>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Select Province" />
            </div>
          </SelectTrigger>
          <SelectContent position="popper" side="bottom" align="start" className="max-h-[300px] overflow-y-auto">
            {provinces.map((prov) => (
              <SelectItem key={prov.value} value={prov.value}>{prov.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>
          City/Municipality {required && <span className="text-red-500">*</span>}
        </Label>
        <Select value={municipality} onValueChange={onMunicipalityChange} disabled={disabled || !province}>
          <SelectTrigger className={disabled || !province ? "bg-gray-100 cursor-not-allowed" : ""}>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder={!province ? "Select Province first" : "Select Municipality"} />
            </div>
          </SelectTrigger>
          <SelectContent position="popper" side="bottom" align="start" className="max-h-[300px] overflow-y-auto">
            {municipalities.map((muni) => (
              <SelectItem key={muni.value} value={muni.value}>{muni.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className={`space-y-2 ${layout === "grid" ? "md:col-span-2" : ""}`}>
        <Label>
          Barangay {required && <span className="text-red-500">*</span>}
        </Label>
        <Select value={barangay} onValueChange={onBarangayChange} disabled={disabled || !municipality}>
          <SelectTrigger className={disabled || !municipality ? "bg-gray-100 cursor-not-allowed" : ""}>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder={!municipality ? "Select Municipality first" : "Select Barangay"} />
            </div>
          </SelectTrigger>
          <SelectContent position="popper" side="bottom" align="start" className="max-h-[300px] overflow-y-auto">
            {barangays.map((brgy) => (
              <SelectItem key={brgy.value} value={brgy.value}>{brgy.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {!municipality && <p className="text-xs text-muted-foreground">Please select a municipality first</p>}
      </div>
    </div>
  );
}
