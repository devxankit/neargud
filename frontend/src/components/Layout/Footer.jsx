import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiShoppingBag, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube } from 'react-icons/fa';
import { useSettingsStore } from '../../store/settingsStore';
import toast from 'react-hot-toast';

const Footer = () => {
  const location = useLocation();
  const [email, setEmail] = useState('');
  const { settings, initialize } = useSettingsStore();

  useEffect(() => {
    initialize();
  }, []);

  // Hide footer on mobile app routes and checkout-related routes
  const isCheckoutRoute =
    location.pathname.startsWith('/checkout') ||
    location.pathname.startsWith('/app/checkout') ||
    location.pathname.startsWith('/order-confirmation') ||
    location.pathname.startsWith('/app/order-confirmation') ||
    location.pathname.startsWith('/track-order') ||
    location.pathname.startsWith('/app/track-order');

  if (location.pathname.startsWith('/app') || location.pathname.startsWith('/policies') || isCheckoutRoute) {
    return null;
  }

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      toast.success('Subscribed successfully!');
      setEmail('');
    }
  };

  const supportLinks = [
    'FAQ',
    'Return & Exchange',
    'Delivery',
    'Contact Us',
  ];

  const legalLinks = [
    'About Us',
    'Cookies Policy',
    'Terms & Conditions',
    'Privacy Policy',
  ];

  const socialLinks = [
    { icon: FaFacebook, href: settings?.general?.socialMedia?.facebook || '#' },
    { icon: FaTwitter, href: settings?.general?.socialMedia?.twitter || '#' },
    { icon: FaInstagram, href: settings?.general?.socialMedia?.instagram || '#' },
    { icon: FaYoutube, href: settings?.general?.socialMedia?.youtube || '#' },
  ].filter(link => link.href !== '#');

  return (
    <footer className="text-white mt-20 relative overflow-hidden" style={{ background: '#000000' }}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-500 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-2 sm:px-4 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Branding and Newsletter */}
          <div className="space-y-6">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 cursor-pointer group">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-glow-accent group-hover:scale-110 transition-all duration-300 overflow-hidden">
                {settings?.general?.storeLogo ? (
                  <img src={settings.general.storeLogo} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  <FiShoppingBag className="text-primary-600 text-xl" />
                )}
              </div>
              <span className="text-2xl font-extrabold">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-300 to-accent-500">
                  {settings?.general?.storeName || 'Neargud'}
                </span>
              </span>
            </Link>

            {/* Newsletter */}
            <div>
              <p className="text-sm mb-4 font-medium text-primary-100">Subscribe to our newsletter</p>
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="flex-1 px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder:text-primary-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-accent-400 focus:shadow-glow-accent transition-all"
                />
                <button
                  type="submit"
                  className="gradient-accent px-6 py-3 rounded-xl font-semibold text-white hover:shadow-glow-accent transition-all duration-300 hover:scale-105"
                >
                  Subscribe
                </button>
              </form>
            </div>

            {/* Social Media */}
            <div className="flex gap-3">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <a
                    key={index}
                    href={social.href}
                    className="w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl flex items-center justify-center hover:bg-accent-500 hover:border-accent-400 transition-all duration-300 hover:scale-110 hover:shadow-glow-accent group"
                  >
                    <Icon className="text-lg text-white group-hover:scale-110 transition-transform" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-accent-300 to-accent-500">Support</h3>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-primary-100 hover:text-accent-300 transition-all duration-300 text-sm font-medium hover:translate-x-2 inline-block"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-accent-300 to-accent-500">Legal</h3>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-primary-100 hover:text-accent-300 transition-all duration-300 text-sm font-medium hover:translate-x-2 inline-block"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-accent-300 to-accent-500">Contact</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 group">
                <FiMapPin className="text-accent-400 mt-1 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <span className="text-primary-100 text-sm font-medium group-hover:text-accent-300 transition-colors">
                  {settings?.general?.address || 'House : 25, Road No: 2, Block A, Mirpur-1, Dhaka 1216'}
                </span>
              </li>
              <li className="flex items-center gap-3 group">
                <FiMail className="text-accent-400 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <a
                  href={`mailto:${settings?.general?.contactEmail || 'info@inilabs.net'}`}
                  className="text-primary-100 hover:text-accent-300 transition-all duration-300 text-sm font-medium"
                >
                  {settings?.general?.contactEmail || 'info@inilabs.net'}
                </a>
              </li>
              <li className="flex items-center gap-3 group">
                <FiPhone className="text-accent-400 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <a
                  href={`tel:${settings?.general?.contactPhone || '+8801333384628'}`}
                  className="text-primary-100 hover:text-accent-300 transition-all duration-300 text-sm font-medium"
                >
                  {settings?.general?.contactPhone || '+8801333384628'}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

