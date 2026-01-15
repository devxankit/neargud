import { useState, useEffect } from 'react';
import { FiSave, FiTruck, FiMapPin, FiCompass, FiInfo } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useVendorAuthStore } from "../../store/vendorAuthStore";
import toast from 'react-hot-toast';

const ShippingSettings = () => {
  const { vendor, updateProfile } = useVendorAuthStore();
  const [formData, setFormData] = useState({
    deliveryAvailable: true,
    shippingEnabled: true,
    freeShippingThreshold: 100,
    defaultShippingRate: 5,
    shippingMethods: ['standard'],
    shippingZones: [],
    handlingTime: 1, // days
    processingTime: 1, // days
    deliveryRadius: 20, // km
    deliveryPartnersEnabled: true,
    latitude: 0,
    longitude: 0,
  });
  const [activeSection, setActiveSection] = useState('general');
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    if (vendor) {
      setFormData({
        deliveryAvailable: vendor.deliveryAvailable !== false,
        shippingEnabled: vendor.shippingEnabled !== false,
        freeShippingThreshold: vendor.freeShippingThreshold || 0,
        defaultShippingRate: vendor.defaultShippingRate || 0,
        shippingMethods: vendor.shippingMethods || ['standard'],
        shippingZones: vendor.shippingZones || [],
        handlingTime: vendor.handlingTime || 0,
        processingTime: vendor.processingTime || 0,
        deliveryRadius: vendor.deliveryRadius || 20,
        deliveryPartnersEnabled: vendor.deliveryPartnersEnabled !== false,
        longitude: vendor.location?.coordinates?.[0] || 0,
        latitude: vendor.location?.coordinates?.[1] || 0,
      });
    }
  }, [vendor]);

  useEffect(() => {
    // Initialize Google Maps
    if (activeSection === 'delivery' && window.google) {
      const initMap = () => {
        const center = { lat: parseFloat(formData.latitude) || 20.5937, lng: parseFloat(formData.longitude) || 78.9629 };
        const map = new window.google.maps.Map(document.getElementById("vendor-location-map"), {
          center,
          zoom: 13,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          styles: [
            {
              "featureType": "poi",
              "stylers": [{ "visibility": "off" }]
            }
          ]
        });

        const marker = new window.google.maps.Marker({
          position: center,
          map,
          draggable: true,
          animation: window.google.maps.Animation.DROP,
        });

        // Autocomplete
        const input = document.getElementById("pac-input");
        const autocomplete = new window.google.maps.places.Autocomplete(input);
        autocomplete.bindTo("bounds", map);

        autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();
          if (!place.geometry || !place.geometry.location) return;

          if (place.geometry.viewport) {
            map.fitBounds(place.geometry.viewport);
          } else {
            map.setCenter(place.geometry.location);
            map.setZoom(17);
          }
          marker.setPosition(place.geometry.location);

          setFormData(prev => ({
            ...prev,
            latitude: place.geometry.location.lat(),
            longitude: place.geometry.location.lng()
          }));
        });

        marker.addListener("dragend", () => {
          const pos = marker.getPosition();
          setFormData(prev => ({
            ...prev,
            latitude: pos.lat(),
            longitude: pos.lng()
          }));
        });

        map.addListener("click", (e) => {
          marker.setPosition(e.latLng);
          setFormData(prev => ({
            ...prev,
            latitude: e.latLng.lat(),
            longitude: e.latLng.lng()
          }));
        });
      };

      // Small delay to ensure DOM is ready
      const timer = setTimeout(initMap, 100);
      return () => clearTimeout(timer);
    }
  }, [activeSection, vendor]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleCaptureLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData({
          ...formData,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setIsLocating(false);
        toast.success('Location captured successfully!');
      },
      (error) => {
        console.error('Error capturing location:', error);
        toast.error('Failed to capture location');
        setIsLocating(false);
      }
    );
  };

  const handleShippingMethodToggle = (method) => {
    const methods = formData.shippingMethods || [];
    if (methods.includes(method)) {
      setFormData({
        ...formData,
        shippingMethods: methods.filter((m) => m !== method),
      });
    } else {
      setFormData({
        ...formData,
        shippingMethods: [...methods, method],
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!vendor) return;

    try {
      const updateData = {
        deliveryAvailable: formData.deliveryAvailable,
        shippingEnabled: formData.shippingEnabled,
        freeShippingThreshold: parseFloat(formData.freeShippingThreshold) || 0,
        defaultShippingRate: parseFloat(formData.defaultShippingRate) || 0,
        shippingMethods: formData.shippingMethods,
        shippingZones: formData.shippingZones,
        handlingTime: parseInt(formData.handlingTime) || 1,
        processingTime: parseInt(formData.processingTime) || 1,
        deliveryRadius: parseFloat(formData.deliveryRadius) || 20,
        deliveryPartnersEnabled: formData.deliveryPartnersEnabled,
        location: {
          type: 'Point',
          coordinates: [parseFloat(formData.longitude), parseFloat(formData.latitude)]
        }
      };

      await updateProfile(updateData);
      toast.success('Shipping settings saved successfully');
    } catch (error) {
      toast.error('Failed to save shipping settings');
      console.error(error);
    }
  };

  const sections = [
    { id: 'general', label: 'General Settings', icon: FiTruck },
    { id: 'delivery', label: 'Self Delivery Radius', icon: FiCompass },
    { id: 'zones', label: 'Shipping Zones', icon: FiMapPin },
  ];

  if (!vendor) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Loading vendor information...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-full overflow-x-hidden"
    >
      <div className="lg:hidden">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Shipping Settings</h1>
        <p className="text-sm sm:text-base text-gray-600">Configure your shipping options and rates</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 max-w-full overflow-x-hidden">
        <div className="border-b border-gray-200 overflow-x-hidden">
          <div className="flex overflow-x-auto scrollbar-hide -mx-1 px-1">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-b-2 transition-colors whitespace-nowrap text-xs sm:text-sm ${activeSection === section.id
                    ? 'border-purple-600 text-purple-600 font-semibold'
                    : 'border-transparent text-gray-600 hover:text-gray-800'
                    }`}
                >
                  <Icon className="text-base sm:text-lg" />
                  <span>{section.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-3 sm:p-4 md:p-6">
          {/* General Settings Section */}
          {activeSection === 'general' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg">
                <input
                  type="checkbox"
                  name="deliveryAvailable"
                  id="deliveryAvailable"
                  checked={formData.deliveryAvailable}
                  onChange={handleChange}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
                <label htmlFor="deliveryAvailable">
                  <span className="text-sm font-semibold text-gray-700">Accept Online Orders</span>
                  <p className="text-xs text-gray-500 mt-1">If disabled, customers can only chat with you and cannot place orders directly</p>
                </label>
              </div>

              <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg">
                <input
                  type="checkbox"
                  name="shippingEnabled"
                  id="shippingEnabled"
                  checked={formData.shippingEnabled}
                  onChange={handleChange}
                  disabled={!formData.deliveryAvailable}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 disabled:opacity-50"
                />
                <label htmlFor="shippingEnabled">
                  <span className="text-sm font-semibold text-gray-700">Enable Shipping Calculation</span>
                  <p className="text-xs text-gray-500 mt-1">Allow customers to see shipping costs</p>
                </label>
              </div>

              {formData.shippingEnabled && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Free Shipping Threshold
                      </label>
                      <input
                        type="number"
                        name="freeShippingThreshold"
                        value={formData.freeShippingThreshold}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">Free shipping for orders above this amount</p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Default Shipping Rate
                      </label>
                      <input
                        type="number"
                        name="defaultShippingRate"
                        value={formData.defaultShippingRate}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">Default shipping cost per order</p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Processing Time (Days)
                      </label>
                      <input
                        type="number"
                        name="processingTime"
                        value={formData.processingTime}
                        onChange={handleChange}
                        min="0"
                        step="1"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">Time to process orders before shipping</p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Handling Time (Days)
                      </label>
                      <input
                        type="number"
                        name="handlingTime"
                        value={formData.handlingTime}
                        onChange={handleChange}
                        min="0"
                        step="1"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">Time to prepare items for shipping</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* New Delivery Radius Section */}
          {activeSection === 'delivery' && (
            <div className="space-y-6">
              <div className="p-4 bg-purple-50 border border-purple-100 rounded-xl">
                <div className="flex gap-3">
                  <FiInfo className="text-purple-600 mt-1 text-lg flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-purple-900">Broadcasting Logic</h4>
                    <p className="text-xs text-purple-700 mt-1 leading-relaxed">
                      Orders will be sent as a notification to all delivery partners within the selected radius of your store's location.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-5 bg-white border-2 border-purple-100 rounded-2xl shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 rounded-xl text-purple-600">
                    <FiTruck className="text-xl" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-gray-900">Delivery Partners Integration</h4>
                    <p className="text-xs text-gray-500 mt-0.5">Allow independent delivery partners to see and claim your orders</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="deliveryPartnersEnabled"
                    checked={formData.deliveryPartnersEnabled}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none ring-4 ring-transparent peer-focus:ring-purple-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600 shadow-inner"></div>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Delivery Radius (Kilometers)
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      name="deliveryRadius"
                      min="1"
                      max="100"
                      step="1"
                      value={formData.deliveryRadius}
                      onChange={handleChange}
                      className="flex-1 accent-purple-600"
                    />
                    <span className="w-16 text-center py-1 bg-purple-100 text-purple-800 rounded-lg font-bold text-sm">
                      {formData.deliveryRadius} km
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-2 italic">Partners further than {formData.deliveryRadius}km from your store will not see the order.</p>
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-gray-700">
                    Store Geo-Location
                  </label>

                  {/* Google Map Implementation */}
                  <div className="relative w-full h-48 bg-gray-100 rounded-2xl overflow-hidden border border-gray-200 shadow-inner group">
                    <div id="vendor-location-map" className="w-full h-full"></div>
                    <div className="absolute top-2 left-2 right-2 flex gap-2">
                      <input
                        id="pac-input"
                        type="text"
                        placeholder="Search your store location..."
                        className="flex-1 px-3 py-2 text-xs bg-white/90 backdrop-blur-md border border-gray-300 rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div className="absolute bottom-2 right-2">
                      <button
                        type="button"
                        onClick={handleCaptureLocation}
                        disabled={isLocating}
                        className="p-2 bg-purple-600 text-white rounded-lg shadow-lg hover:bg-purple-700 transition-all disabled:opacity-50"
                        title="Use My Current Location"
                      >
                        <FiCompass className={isLocating ? 'animate-spin' : 'text-lg'} />
                      </button>
                    </div>
                    {/* Visual radius representation indicator (CSS only) */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      <div
                        className="border-2 border-purple-500 bg-purple-500/10 rounded-full transition-all duration-500 ease-out"
                        style={{
                          width: `${Math.min(formData.deliveryRadius * 2, 100)}%`,
                          height: `${Math.min(formData.deliveryRadius * 2, 100)}%`,
                          opacity: formData.deliveryRadius > 0 ? 1 : 0
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-gray-400 block mb-1">Longitude</span>
                      <input
                        type="number"
                        name="longitude"
                        step="any"
                        value={formData.longitude}
                        onChange={handleChange}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 block mb-1">Latitude</span>
                      <input
                        type="number"
                        name="latitude"
                        step="any"
                        value={formData.latitude}
                        onChange={handleChange}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Shipping Zones Section */}
          {activeSection === 'zones' && (
            <div className="space-y-6">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Shipping zones allow you to set different shipping rates for different regions.
                  This feature will be available in a future update.
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-4 sm:pt-6 border-t border-gray-200 mt-4 sm:mt-6">
            <button
              type="submit"
              className="flex items-center gap-2 px-4 sm:px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all font-semibold text-sm sm:text-base w-full sm:w-auto shadow-md"
            >
              <FiSave />
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default ShippingSettings;
