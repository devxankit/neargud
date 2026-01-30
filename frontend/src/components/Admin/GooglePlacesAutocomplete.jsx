import { useState, useEffect, useRef, useCallback } from 'react';
import { FiMapPin, FiX, FiLoader } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const GooglePlacesAutocomplete = ({
    value = '',
    onChange,
    placeholder = 'Search for a city...',
    disabled = false,
    className = '',
    name = 'city',
}) => {
    const [inputValue, setInputValue] = useState(value);
    const [predictions, setPredictions] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isApiLoaded, setIsApiLoaded] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);

    const containerRef = useRef(null);
    const inputRef = useRef(null);
    const autocompleteServiceRef = useRef(null);
    const sessionTokenRef = useRef(null);
    const debounceTimerRef = useRef(null);

    // Load Google Maps Script
    useEffect(() => {
        if (window.google && window.google.maps && window.google.maps.places) {
            setIsApiLoaded(true);
            return;
        }

        // Check if script is already being loaded
        if (document.querySelector(`script[src*="maps.googleapis.com"]`)) {
            const checkLoaded = setInterval(() => {
                if (window.google && window.google.maps && window.google.maps.places) {
                    setIsApiLoaded(true);
                    clearInterval(checkLoaded);
                }
            }, 100);
            return () => clearInterval(checkLoaded);
        }

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => {
            const checkPlaces = setInterval(() => {
                if (window.google && window.google.maps && window.google.maps.places) {
                    setIsApiLoaded(true);
                    clearInterval(checkPlaces);
                }
            }, 100);
        };
        script.onerror = () => console.error('Failed to load Google Maps API');
        document.head.appendChild(script);
    }, []);

    // Initialize AutocompleteService
    useEffect(() => {
        if (isApiLoaded && !autocompleteServiceRef.current) {
            autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
            sessionTokenRef.current = new window.google.maps.places.AutocompleteSessionToken();
        }
    }, [isApiLoaded]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
                setHighlightedIndex(-1);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Sync external value
    useEffect(() => {
        setInputValue(value);
    }, [value]);

    // Fetch predictions
    const fetchPredictions = useCallback((input) => {
        if (!autocompleteServiceRef.current || !input.trim()) {
            setPredictions([]);
            return;
        }

        setIsLoading(true);

        autocompleteServiceRef.current.getPlacePredictions(
            {
                input,
                types: ['(cities)'],
                componentRestrictions: { country: 'in' },
                sessionToken: sessionTokenRef.current,
            },
            (results, status) => {
                setIsLoading(false);
                if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
                    setPredictions(results);
                } else {
                    setPredictions([]);
                }
            }
        );
    }, []);

    // Handle input change with debounce
    const handleInputChange = (e) => {
        const newValue = e.target.value;
        setInputValue(newValue);
        setIsOpen(true);
        setHighlightedIndex(-1);

        // Clear previous timer
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        // Debounce the API call
        debounceTimerRef.current = setTimeout(() => {
            fetchPredictions(newValue);
        }, 300);
    };

    // Handle prediction selection
    const handleSelect = (prediction) => {
        // Extract city name from the description
        const cityName = prediction.structured_formatting?.main_text || prediction.description.split(',')[0];

        setInputValue(cityName);
        setPredictions([]);
        setIsOpen(false);
        setHighlightedIndex(-1);

        // Generate new session token for next search
        sessionTokenRef.current = new window.google.maps.places.AutocompleteSessionToken();

        if (onChange) {
            onChange({
                target: {
                    name,
                    value: cityName,
                },
            });
        }
    };

    // Handle clear
    const handleClear = () => {
        setInputValue('');
        setPredictions([]);
        setIsOpen(false);

        if (onChange) {
            onChange({
                target: {
                    name,
                    value: '',
                },
            });
        }

        inputRef.current?.focus();
    };

    // Keyboard navigation
    const handleKeyDown = (e) => {
        if (!isOpen || predictions.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex((prev) =>
                    prev < predictions.length - 1 ? prev + 1 : 0
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex((prev) =>
                    prev > 0 ? prev - 1 : predictions.length - 1
                );
                break;
            case 'Enter':
                e.preventDefault();
                if (highlightedIndex >= 0 && predictions[highlightedIndex]) {
                    handleSelect(predictions[highlightedIndex]);
                }
                break;
            case 'Escape':
                setIsOpen(false);
                setHighlightedIndex(-1);
                break;
            default:
                break;
        }
    };

    // Handle blur - update value
    const handleBlur = () => {
        // Small delay to allow click on prediction
        setTimeout(() => {
            if (inputValue !== value && onChange) {
                onChange({
                    target: {
                        name,
                        value: inputValue,
                    },
                });
            }
        }, 200);
    };

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            <div className="relative">
                <FiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg z-10 pointer-events-none" />
                <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onFocus={() => inputValue && predictions.length > 0 && setIsOpen(true)}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    placeholder={!isApiLoaded ? 'Loading...' : placeholder}
                    disabled={disabled || !isApiLoaded}
                    className={`w-full pl-10 pr-10 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm transition-all ${disabled || !isApiLoaded ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
                        }`}
                />
                {isLoading && (
                    <FiLoader className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg animate-spin" />
                )}
                {inputValue && !disabled && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors z-10"
                    >
                        <FiX className="text-lg" />
                    </button>
                )}
            </div>

            {/* Predictions Dropdown */}
            <AnimatePresence>
                {isOpen && predictions.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden"
                        style={{ maxHeight: '280px' }}
                    >
                        <div className="overflow-y-auto max-h-[280px] scrollbar-admin">
                            {predictions.map((prediction, index) => (
                                <motion.button
                                    key={prediction.place_id}
                                    type="button"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.03 }}
                                    onClick={() => handleSelect(prediction)}
                                    onMouseEnter={() => setHighlightedIndex(index)}
                                    className={`w-full px-4 py-3 text-left flex items-start gap-3 transition-colors duration-150 ${highlightedIndex === index
                                            ? 'bg-primary-50'
                                            : 'hover:bg-gray-50'
                                        }`}
                                >
                                    <FiMapPin className={`mt-0.5 flex-shrink-0 ${highlightedIndex === index ? 'text-primary-600' : 'text-gray-400'
                                        }`} />
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-medium truncate ${highlightedIndex === index ? 'text-primary-700' : 'text-gray-800'
                                            }`}>
                                            {prediction.structured_formatting?.main_text || prediction.description.split(',')[0]}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate mt-0.5">
                                            {prediction.structured_formatting?.secondary_text || prediction.description}
                                        </p>
                                    </div>
                                </motion.button>
                            ))}
                        </div>

                        {/* Google Attribution */}
                        <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
                            <img
                                src="https://developers.google.com/static/maps/documentation/images/powered_by_google_on_white.png"
                                alt="Powered by Google"
                                className="h-4 opacity-60"
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* No results message */}
            <AnimatePresence>
                {isOpen && inputValue && !isLoading && predictions.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg p-4 text-center"
                    >
                        <p className="text-sm text-gray-500">No cities found</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {!inputValue && (
                <p className="text-xs text-gray-400 mt-1 ml-1">Leave empty to show in all cities</p>
            )}
        </div>
    );
};

export default GooglePlacesAutocomplete;
