import { useEffect, useState } from "react";
import { FiMapPin } from "react-icons/fi";
import axios from "axios";

const LocationSelector = ({ variant = "default" }) => {
  const [city, setCity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    detectUserCity();
  }, []);

  const detectUserCity = () => {
    if (!navigator.geolocation) {
      console.log("Geolocation not supported");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          const res = await axios.get(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
          );
          const cityName =
            res.data.address.city ||
            res.data.address.town ||
            res.data.address.village ||
            "Unknown City";

          setCity(cityName);
        } catch (err) {
          console.log("City detect error:", err);
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.log("Location permission denied", error);
        setLoading(false);
      }
    );
  };

  if (variant === "icon") {
    return <FiMapPin className="text-gray-800 text-lg" />;
  }

  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/40 backdrop-blur-md border border-white/60 shadow-sm max-w-[180px]">
      <FiMapPin className="text-primary-600" size={14} />
      <span className="text-xs font-bold text-gray-800 truncate">
        {loading ? "Detecting location..." : city || "Location not found"}
      </span>
    </div>
  );
};

export default LocationSelector;
