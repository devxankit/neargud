import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMapPin, FiNavigation, FiX, FiSearch, FiLoader } from 'react-icons/fi';
import { useLocationStore } from '../store/locationStore';
import { fetchSliderCities } from '../services/publicApi';
import axios from 'axios';
import toast from 'react-hot-toast';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const LocationSelectionModal = ({ isOpen, onClose }) => {
    const { selectCity, currentCity } = useLocationStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [detecting, setDetecting] = useState(false);
    const [sliderCities, setSliderCities] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch cities that have active sliders
    useEffect(() => {
        if (isOpen) {
            setSearchTerm('');
            loadSliderCities();
        }
    }, [isOpen]);

    const loadSliderCities = async () => {
        setIsLoading(true);
        try {
            const response = await fetchSliderCities();
            if (response?.success && response?.data?.cities) {
                // Convert string array to city objects
                const cities = response.data.cities.map((cityName, index) => ({
                    id: `slider-city-${index}`,
                    name: cityName,
                    hasSliders: true
                }));
                setSliderCities(cities);
            }
        } catch (error) {
            console.error('Error fetching slider cities:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Filter cities based on search
    const filteredCities = searchTerm
        ? sliderCities.filter(city =>
            city.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : sliderCities;

    const handleDetectLocation = () => {
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser");
            return;
        }

        setDetecting(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords;
                    console.log('Got coordinates:', latitude, longitude);

                    // Use Google Geocoding API
                    const response = await fetch(
                        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`
                    );
                    const data = await response.json();
                    console.log('Geocoding response:', data);

                    let detectedCityName = "";

                    if (data.status === 'OK' && data.results && data.results.length > 0) {
                        // Find city from address components
                        for (const result of data.results) {
                            const cityComponent = result.address_components?.find(
                                (component) =>
                                    component.types.includes('locality') ||
                                    component.types.includes('administrative_area_level_2')
                            );
                            if (cityComponent) {
                                detectedCityName = cityComponent.long_name;
                                break;
                            }
                        }
                    } else {
                        // Fallback to OpenStreetMap
                        console.log('Google API failed, trying OpenStreetMap...');
                        const res = await axios.get(
                            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                        );
                        console.log('OpenStreetMap response:', res);
                        const address = res.data.address;

                        // Priority: city > town > state_district (district) > village
                        // state_district often contains actual district/city name like "Indore" / "इन्दौर जिला"
                        let osmCity = address.city || address.town;

                        if (!osmCity && address.state_district) {
                            // Clean up state_district - remove "जिला", "District", "Jila" etc.
                            osmCity = address.state_district
                                .replace(/जिला|district|jila|zila/gi, '')
                                .trim();
                        }

                        if (!osmCity) {
                            osmCity = address.village || "";
                        }

                        detectedCityName = osmCity;
                    }

                    console.log('Detected city name:', detectedCityName);

                    // Try to match with available slider cities (case-insensitive, partial match)
                    let matchedCity = null;
                    if (detectedCityName && sliderCities.length > 0) {
                        const detectedLower = detectedCityName.toLowerCase();
                        matchedCity = sliderCities.find(city => {
                            const cityLower = city.name.toLowerCase();
                            return cityLower === detectedLower ||
                                cityLower.includes(detectedLower) ||
                                detectedLower.includes(cityLower);
                        });
                    }

                    if (matchedCity) {
                        // Found a matching city with sliders
                        console.log('Matched with slider city:', matchedCity);
                        selectCity(matchedCity);
                        toast.success(`📍 Found offers for ${matchedCity.name}!`);
                    } else if (detectedCityName) {
                        // Detected city but no sliders for it - use it anyway (will show universal banners)
                        const detectedCity = {
                            id: 'gps-detected',
                            name: detectedCityName,
                            isDetected: true
                        };
                        selectCity(detectedCity);
                        toast.success(`📍 ${detectedCityName} - Showing all offers`);
                    } else {
                        toast.error("Could not detect your city. Please select manually.");
                    }

                    setDetecting(false);
                    onClose();
                } catch (err) {
                    console.error("City detect error:", err);
                    setDetecting(false);
                    toast.error("Failed to detect location. Please select manually.");
                }
            },
            (error) => {
                console.error("Location permission denied", error);
                setDetecting(false);
                toast.error("Location access denied. Please enable location in browser settings.");
            },
            { timeout: 15000, maximumAge: 600000, enableHighAccuracy: false }
        );
    };

    const handleSelectCity = (city) => {
        selectCity(city);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[10000]"
                    />
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: '0%' }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-[10001] max-h-[85vh] flex flex-col shadow-2xl"
                    >
                        {/* Header */}
                        <div className="p-5 border-b border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-black text-gray-900">Select Location</h3>
                                <button
                                    onClick={onClose}
                                    className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                                >
                                    <FiX size={20} />
                                </button>
                            </div>

                            {/* Search Bar */}
                            <div className="relative">
                                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search for your city..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-primary-500 transition-all font-semibold outline-none text-gray-800 placeholder:text-gray-400"
                                />
                            </div>
                        </div>

                        {/* Content */}
                        <div className="overflow-y-auto p-5 pb-10 space-y-6">
                            {/* Detect Location Button */}
                            <button
                                onClick={handleDetectLocation}
                                disabled={detecting}
                                className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-primary-50 to-emerald-50 text-primary-700 rounded-2xl border border-primary-100 active:scale-[0.98] transition-all shadow-sm"
                            >
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-emerald-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary-500/30">
                                    {detecting ? (
                                        <FiLoader className="w-5 h-5 text-white animate-spin" />
                                    ) : (
                                        <FiNavigation className="text-xl text-white transform rotate-45" />
                                    )}
                                </div>
                                <div className="flex-1 text-left">
                                    <p className="font-black text-sm text-gray-800">📍 Use Current Location</p>
                                    <p className="text-xs font-semibold text-gray-500">Detect my location automatically</p>
                                </div>
                            </button>

                            {/* Cities List */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider">
                                        Available Cities
                                    </h4>
                                    {sliderCities.length > 0 && (
                                        <span className="text-xs text-gray-400">
                                            {sliderCities.length} cities
                                        </span>
                                    )}
                                </div>

                                {isLoading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <FiLoader className="w-6 h-6 text-primary-500 animate-spin" />
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {filteredCities.length > 0 ? (
                                            filteredCities.map((city) => (
                                                <button
                                                    key={city.id}
                                                    onClick={() => handleSelectCity(city)}
                                                    className={`w-full flex items-center gap-3 p-3.5 rounded-xl transition-all ${currentCity?.name === city.name
                                                        ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                                                        : 'hover:bg-gray-50 text-gray-700 border border-gray-100'
                                                        }`}
                                                >
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentCity?.name === city.name
                                                        ? 'bg-white/20'
                                                        : 'bg-primary-50'
                                                        }`}>
                                                        <FiMapPin className={
                                                            currentCity?.name === city.name
                                                                ? 'text-white'
                                                                : 'text-primary-500'
                                                        } />
                                                    </div>
                                                    <span className="font-bold flex-1 text-left">{city.name}</span>
                                                    {currentCity?.name === city.name && (
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-xs font-medium opacity-80">Selected</span>
                                                            <div className="w-2 h-2 rounded-full bg-white" />
                                                        </div>
                                                    )}
                                                </button>
                                            ))
                                        ) : (
                                            <div className="text-center py-8 text-gray-400 font-semibold text-sm px-4">
                                                {searchTerm ? (
                                                    <div className="flex flex-col items-center gap-2">
                                                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-1">
                                                            <FiMapPin className="text-xl text-gray-400" />
                                                        </div>
                                                        <p>No sliders available for "{searchTerm}"</p>
                                                        <p className="text-xs opacity-60 font-normal max-w-[200px]">
                                                            Try using your current location or select a nearby city.
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center gap-2">
                                                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-1">
                                                            <FiNavigation className="text-xl text-gray-400 transform rotate-45" />
                                                        </div>
                                                        <p>No city-specific offers available</p>
                                                        <p className="text-xs opacity-60 font-normal max-w-[220px]">
                                                            Use your current location to see local offers!
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default LocationSelectionModal;
