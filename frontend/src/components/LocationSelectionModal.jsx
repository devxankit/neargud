import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMapPin, FiNavigation, FiX, FiSearch } from 'react-icons/fi';
import { useLocationStore } from '../store/locationStore';
import axios from 'axios';

const FALLBACK_CITIES = [
    { id: 'mum', name: 'Mumbai', state: 'Maharashtra' },
    { id: 'del', name: 'Delhi', state: 'Delhi' },
    { id: 'blr', name: 'Bangalore', state: 'Karnataka' },
    { id: 'hyd', name: 'Hyderabad', state: 'Telangana' },
    { id: 'ahd', name: 'Ahmedabad', state: 'Gujarat' },
    { id: 'chn', name: 'Chennai', state: 'Tamil Nadu' },
    { id: 'kol', name: 'Kolkata', state: 'West Bengal' },
    { id: 'sur', name: 'Surat', state: 'Gujarat' },
    { id: 'pun', name: 'Pune', state: 'Maharashtra' },
    { id: 'jai', name: 'Jaipur', state: 'Rajasthan' },
    { id: 'luc', name: 'Lucknow', state: 'Uttar Pradesh' },
    { id: 'kan', name: 'Kanpur', state: 'Uttar Pradesh' },
    { id: 'nag', name: 'Nagpur', state: 'Maharashtra' },
    { id: 'ind', name: 'Indore', state: 'Madhya Pradesh' },
    { id: 'tha', name: 'Thane', state: 'Maharashtra' }
];

const LocationSelectionModal = ({ isOpen, onClose }) => {
    const { cities, fetchCities, selectCity, currentCity } = useLocationStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [detecting, setDetecting] = useState(false);
    const [displayCities, setDisplayCities] = useState([]);

    useEffect(() => {
        if (isOpen) {
            setSearchTerm('');
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            if (!cities || cities.length === 0) {
                fetchCities();
            }
        }
    }, [isOpen, cities?.length, fetchCities]);

    useEffect(() => {
        // Combine API cities with fallback if API is empty, ensuring no duplicates if API works later
        let sourceCities = (cities && cities.length > 0) ? cities : FALLBACK_CITIES;

        if (!searchTerm) {
            setDisplayCities(sourceCities);
        } else {
            const lower = searchTerm.toLowerCase();
            setDisplayCities(sourceCities.filter(c => c.name.toLowerCase().includes(lower)));
        }
    }, [searchTerm, cities]);

    const handleDetectLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }

        setDetecting(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    const res = await axios.get(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
                    );

                    const address = res.data.address;
                    const cityName = address.city || address.town || address.village || address.county || "Unknown Location";

                    // Create a structured city object for consistency
                    const detectedCity = {
                        id: 'gps-detected',
                        name: cityName,
                        isDetected: true
                    };

                    selectCity(detectedCity);
                    onClose();
                } catch (err) {
                    console.error("City detect error:", err);
                    alert("Failed to detect location. Please select manually.");
                } finally {
                    setDetecting(false);
                }
            },
            (error) => {
                console.error("Location permission denied", error);
                setDetecting(false);
                alert("Location permission denied. Please enable location services.");
            }
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
                                className="w-full flex items-center gap-4 p-4 bg-primary-50 text-primary-700 rounded-2xl border border-primary-100 active:scale-[0.98] transition-all"
                            >
                                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                                    {detecting ? (
                                        <div className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <FiNavigation className="text-xl text-primary-600 transform rotate-45" />
                                    )}
                                </div>
                                <div className="flex-1 text-left">
                                    <p className="font-black text-sm">Use Current Location</p>
                                    <p className="text-xs font-semibold opacity-70">Enable location access</p>
                                </div>
                            </button>

                            {/* Saved/Recent Locations could go here */}

                            {/* Cities List */}
                            <div>
                                <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">Available Cities</h4>
                                <div className="space-y-2">
                                    {displayCities.length > 0 ? (
                                        displayCities.map((city) => (
                                            <button
                                                key={city._id || city.id}
                                                onClick={() => handleSelectCity(city)}
                                                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${currentCity?.id === (city._id || city.id)
                                                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                                                    : 'hover:bg-gray-50 text-gray-700'
                                                    }`}
                                            >
                                                <FiMapPin className={currentCity?.id === (city._id || city.id) ? 'text-white' : 'text-gray-400'} />
                                                <span className="font-bold flex-1 text-left">{city.name}</span>
                                                {currentCity?.id === (city._id || city.id) && (
                                                    <div className="w-2 h-2 rounded-full bg-white" />
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
                                                    <p>Sorry, we don't operate in "{searchTerm}" yet</p>
                                                    <p className="text-xs opacity-60 font-normal max-w-[200px]">
                                                        We are expanding soon! Try selecting a nearby major city.
                                                    </p>
                                                </div>
                                            ) : (
                                                'Loading cities...'
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default LocationSelectionModal;
