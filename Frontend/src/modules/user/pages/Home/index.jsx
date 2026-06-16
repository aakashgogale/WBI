import React, { useState, useEffect, useLayoutEffect, lazy, Suspense } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { themeColors } from '../../../../theme';
import Header from '../../components/layout/Header';
import BottomNav from '../../components/layout/BottomNav';
import SearchBar from './components/SearchBar';
import ServiceCategories from './components/ServiceCategories';
import { publicCatalogService } from '../../../../services/catalogService';
import { useCart } from '../../../../context/CartContext';
import { useCity } from '../../../../context/CityContext';
import { toast } from 'react-hot-toast';
import { registerFCMToken } from '../../../../services/pushNotificationService';
import { motion } from 'framer-motion';

// Lazy load heavy components for better initial load performance
import PromoCarousel from './components/PromoCarousel';
// Lazy load OTHER heavy components
const NewAndNoteworthy = lazy(() => import('./components/NewAndNoteworthy'));
const MostBookedServices = lazy(() => import('./components/MostBookedServices'));
const CuratedServices = lazy(() => import('./components/CuratedServices'));
const ServiceSectionWithRating = lazy(() => import('./components/ServiceSectionWithRating'));
const Banner = lazy(() => import('./components/Banner'));
const ReferEarnSection = lazy(() => import('./components/ReferEarnSection'));
const TrustVideosSection = lazy(() => import('./components/TrustVideosSection'));
const HowItWorks = lazy(() => import('./components/HowItWorks'));
const CustomerReviews = lazy(() => import('../../components/reviews/CustomerReviews'));
const ExtendedServiceCategories = lazy(() => import('./components/ExtendedServiceCategories'));
const OfferBannerSlider = lazy(() => import('./components/OfferBannerSlider'));
import TrustStrip from './components/TrustStrip';
import CategoryModal from './components/CategoryModal';
import SearchOverlay from './components/SearchOverlay';
import PopularBrandsWeService from './components/PopularBrandsWeService';
import InstantBookingBanner from './components/InstantBookingBanner';
import LogoLoader from '../../../../components/common/LogoLoader';
import { SkeletonLine, SkeletonCircle, SkeletonCard } from '../../../../components/common/SkeletonLoaders';
import AddressSelectionModal from '../Checkout/components/AddressSelectionModal';
import ScrapPromotionCard from './components/ScrapPromotionCard';
import DebugConsole from '../../components/common/DebugConsole';



const toAssetUrl = (url) => {
  if (!url) return '';
  const clean = url.replace('/api/upload', '/upload');
  if (clean.startsWith('http')) return clean;
  const base = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/api$/, '');
  return `${base}${clean.startsWith('/') ? '' : '/'}${clean}`;
};

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [address, setAddress] = useState(localStorage.getItem('currentAddress') || 'Select Location');
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [houseNumber, setHouseNumber] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLocationSupported, setIsLocationSupported] = useState(true);
  const [detectedCityName, setDetectedCityName] = useState(localStorage.getItem('currentCity') || null);


  const { cartCount, addToCart } = useCart();
  const { currentCity, cities, selectCity, loading: cityLoading } = useCity();

  // Clean up legacy storage keys on mount
  useEffect(() => {
    ['userAddress', 'detectedCity', 'user_formatted_address', 'user_city'].forEach(key => localStorage.removeItem(key));
  }, []);

  // Sync detectedCityName with Address on mount/update if not already set
  useEffect(() => {
    if (address && address !== 'Select Location' && cities && cities.length > 0) {
      const foundCity = cities.find(c =>
        address.toLowerCase().includes(c.name.toLowerCase())
      );
      if (foundCity) {
        if (detectedCityName !== foundCity.name) {
          setDetectedCityName(foundCity.name);
          localStorage.setItem('currentCity', foundCity.name);
        }
      } else {
        // Address is present but doesn't contain any supported city name
        // Try to parse ANY city from the address string (e.g. "Bhopal")
        const parts = address.split(',').map(p => p.trim());
        // Usually city is 2nd or 3rd to last in Google address strings
        const cityCandidate = parts.length > 2 ? parts[parts.length - 3] : (parts.length > 1 ? parts[parts.length - 2] : parts[0]);

        if (detectedCityName !== cityCandidate) {
          setDetectedCityName(cityCandidate);
          localStorage.setItem('currentCity', cityCandidate);
        }
        setIsLocationSupported(false);
      }
    }
  }, [address, cities, detectedCityName]);

  // Validate city whenever detected name or cities list changes
  useEffect(() => {
    if (!detectedCityName || !cities || cities.length === 0) return;

    const matchedCity = cities.find(c =>
      c.name.toLowerCase() === detectedCityName.toLowerCase() ||
      c.name.toLowerCase().includes(detectedCityName.toLowerCase()) ||
      detectedCityName.toLowerCase().includes(c.name.toLowerCase())
    );

    if (matchedCity) {
      setIsLocationSupported(true);
      const matchedId = matchedCity._id || matchedCity.id;
      const currentId = currentCity?._id || currentCity?.id;

      if (!cityLoading && currentId && matchedId !== currentId) {
        selectCity(matchedCity);
        toast.success(`Location updated to ${matchedCity.name}`);
      }
    } else {
      // Instead of completely blocking the user, default to the first available city so they can still browse
      setIsLocationSupported(true);
      if (cities && cities.length > 0 && (!currentCity || currentCity.name !== cities[0].name)) {
        selectCity(cities[0]);
        // toast("Showing services for " + cities[0].name, { icon: 'ℹ️' });
      } else if (!cities || cities.length === 0) {
        if (currentCity) selectCity(null);
      }
    }
  }, [detectedCityName, cities, currentCity, cityLoading]);


  const handleAddressSave = (savedHouseNumber, locationObj) => {
    if (locationObj) {
      const newAddress = locationObj.address;
      setAddress(newAddress);
      localStorage.setItem('currentAddress', newAddress);

      // Try to parse city from location object (Google Places)
      const components = locationObj.components || locationObj.address_components;
      let city = '';
      if (components) {
        const getComponent = (type) => components.find(c => c.types.includes(type))?.long_name || '';
        city = getComponent('locality') || getComponent('administrative_area_level_2');
      }

      // Fallback city parsing from address string if components failed
      if (!city && newAddress) {
        const parts = newAddress.split(',').map(p => p.trim());
        city = parts.length > 2 ? parts[parts.length - 3] : (parts.length > 1 ? parts[parts.length - 2] : parts[0]);
      }

      if (city) {
        setDetectedCityName(city);
        localStorage.setItem('currentCity', city);

        // Immediate update of selected city if supported
        if (cities && cities.length > 0) {
          const matchedCity = cities.find(c =>
            c.name.toLowerCase() === city.toLowerCase() ||
            c.name.toLowerCase().includes(city.toLowerCase()) ||
            city.toLowerCase().includes(c.name.toLowerCase())
          );
          if (matchedCity) {
            selectCity(matchedCity);
          } else {
            selectCity(null);
          }
        }

        toast.success(`Location set to ${city}`);
      }
    }
    setHouseNumber(savedHouseNumber);
    setIsAddressModalOpen(false);
  };

  // Auto-detect location on mount
  useEffect(() => {
    const autoDetectLocation = async () => {
      if (navigator.geolocation) {
        if (address === 'Select Location') {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              try {
                const { latitude, longitude } = position.coords;
                const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
                const response = await fetch(
                  `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`
                );
                const data = await response.json();

                if (data.status === 'OK' && data.results.length > 0) {
                  const result = data.results[0];
                  const getComponent = (type) =>
                    result.address_components.find(c => c.types.includes(type))?.long_name || '';

                  const area = getComponent('sublocality_level_1') || getComponent('neighborhood') || getComponent('locality');
                  const city = getComponent('locality') || getComponent('administrative_area_level_2');
                  const state = getComponent('administrative_area_level_1');

                  const formattedAddress = `${area}, ${city}, ${state}`;
                  setAddress(formattedAddress);
                  localStorage.setItem('currentAddress', formattedAddress);

                  if (city) {
                    setDetectedCityName(city);
                    localStorage.setItem('currentCity', city);

                    // Immediate update of selected city if supported
                    if (cities && cities.length > 0) {
                      const matchedCity = cities.find(c =>
                        c.name.toLowerCase() === city.toLowerCase() ||
                        c.name.toLowerCase().includes(city.toLowerCase()) ||
                        city.toLowerCase().includes(c.name.toLowerCase())
                      );
                      if (matchedCity) {
                        selectCity(matchedCity);
                      } else {
                        selectCity(null);
                      }
                    }
                  }
                }
              } catch (error) {
                // Silent fail
              }
            },
            (error) => {
              console.log("GPS Error:", error);
            },
            {
              enableHighAccuracy: true,
              timeout: 5000,
              maximumAge: 0
            }
          );
        }
      }
    };

    autoDetectLocation();

    // Register FCM token for user to receive push notifications
    registerFCMToken('user', true).catch(err => {/* Silent fail */ });
  }, []);

  const [categories, setCategories] = useState([]);
  const [homeContent, setHomeContent] = useState(null);
  const [popularBrands, setPopularBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  // Handle scroll separately (only when needed)
  useEffect(() => {
    if (location.state?.scrollToTop) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      window.history.replaceState({}, '', location.pathname);
    }
  }, [location.state?.scrollToTop, location.pathname]);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // Fetch categories and home content on mount (and when city changes)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const cityId = currentCity?._id || currentCity?.id;

        const response = await publicCatalogService.getHomeData(cityId);

        if (response.success) {
          if (response.categories) {
            const mappedCategories = response.categories.map(cat => ({
              id: cat.id,
              title: cat.title,
              slug: cat.slug,
              icon: toAssetUrl(cat.icon),
              hasSaleBadge: cat.hasSaleBadge,
              badge: cat.badge
            }));
            setCategories(mappedCategories);
          }

          if (response.homeContent) {
            setHomeContent(response.homeContent);
          }
          
          if (response.popularBrands) {
            setPopularBrands(response.popularBrands);
          }
        }

        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentCity]);
  // Open category modal from navigation state (e.g. from Cart 'Add Services')
  useEffect(() => {
    if (!loading && categories.length > 0 && (location.state?.openCategoryId || location.state?.openCategoryName)) {
      const targetId = location.state.openCategoryId;
      const targetName = location.state.openCategoryName;

      const cat = categories.find(c =>
        (targetId && (c.id === targetId || c._id === targetId)) ||
        (targetName && c.title === targetName)
      );

      if (cat) {
        handleCategoryClick(cat);
        // Clear state to prevent reopening on subsequent renders/refreshes
        window.history.replaceState({}, '', location.pathname);
      }
    }
  }, [loading, categories, location.state]);

  const handleSearch = (query) => {
    // Navigate to search results page
  };

  const handleCategoryClick = (category) => {
    // Route to new dynamic One-Time Service flow
    const dynamicSlugs = ['ac-service', 'washing-machine', 'geyser-repair', 'ro-service', 'microwave', 'electrician', 'plumber', 'cctv-repair'];
    
    // Also handle fallback category IDs
    if (
      (category.slug && dynamicSlugs.includes(category.slug)) || 
      (category.id && ['ac', 'washing', 'geyser', 'ro'].includes(category.id))
    ) {
      const targetSlug = category.slug || (category.id === 'ac' ? 'ac-service' : category.id === 'washing' ? 'washing-machine' : category.id === 'geyser' ? 'geyser-repair' : 'ro-service');
      navigate(`/user/service/${targetSlug}`);
      return;
    }

    setSelectedCategory(category);
    setIsCategoryModalOpen(true);
  };

  const handlePromoClick = (promo) => {
    if (promo.targetCategoryId) {
      const cat = categories.find(c => (c.id === promo.targetCategoryId || c._id === promo.targetCategoryId));
      if (cat) {
        handleCategoryClick(cat);
        return;
      }
    }
    if (promo.route && !promo.slug) {
      if (promo.scrollToSection) {
        navigate(promo.route, {
          state: { scrollToSection: promo.scrollToSection }
        });
      } else {
        navigate(promo.route);
      }
    }
  };

  const handleServiceClick = (service) => {
    if (!service) return;
    if (service.targetCategoryId) {
      const cat = categories.find(c => (c.id === service.targetCategoryId || c._id === service.targetCategoryId));
      if (cat) {
        handleCategoryClick(cat);
        return;
      }
    }
    // Fallback if no targetCategoryId but has slug/title, we no longer navigate to slug
  };

  const handleAddClick = async (service) => {
    try {
      if (service.targetCategoryId) {
        const cat = categories.find(c => c.id === service.targetCategoryId);
        if (cat) {
          handleCategoryClick(cat);
          return;
        }
      }

      if (service.serviceId && service.categoryId) {
        const cartItemData = {
          serviceId: service.serviceId,
          categoryId: service.categoryId,
          title: service.title,
          description: service.subtitle || service.description || '',
          icon: service.image || '',
          category: service.category || 'Service',
          price: parseInt(service.price?.toString().replace(/,/g, '') || 0),
          originalPrice: service.originalPrice ? parseInt(service.originalPrice.toString().replace(/,/g, '')) : null,
          unitPrice: parseInt(service.price?.toString().replace(/,/g, '') || 0),
          serviceCount: 1,
          rating: service.rating || "4.8",
          reviews: service.reviews || "10k+",
          vendorId: service.vendorId || null,
          sectionId: service.sectionId || null // VITAL: Added for plan benefits
        };

        const response = await addToCart(cartItemData);
        if (response.success) {
          toast.success(`${service.title} added to cart!`);
          navigate('/user/cart');
        } else {
          toast.error(response.message || 'Failed to add to cart');
        }
      } else {
        if (service.targetCategoryId) {
          const cat = categories.find(c => (c.id === service.targetCategoryId || c._id === service.targetCategoryId));
          if (cat) {
            handleCategoryClick(cat);
          } else {
            toast.error('Unable to add this service to cart.');
          }
        } else {
          toast.error('Unable to add this service to cart.');
        }
      }
    } catch (error) {
      toast.error('Failed to add to cart. Please try again.');
    }
  };

  const handleReferClick = () => {
    navigate('/user/rewards');
  };

  const handleLocationClick = () => {
    setIsAddressModalOpen(true);
  };

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FCFC] pt-4 px-4 space-y-6 max-w-lg lg:max-w-2xl mx-auto pb-20">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <SkeletonCircle size="2.5rem" />
            <div className="space-y-2">
              <SkeletonLine width="60px" height="12px" />
              <SkeletonLine width="120px" height="16px" />
            </div>
          </div>
          <SkeletonCircle size="2.5rem" />
        </div>
        
        {/* Search Bar Skeleton */}
        <SkeletonLine width="100%" height="3.5rem" className="rounded-xl" />

        {/* Categories Skeleton */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          {[1,2,3,4,5,6,7,8].map(i => (
            <div key={i} className="flex flex-col items-center gap-2">
              <SkeletonCircle size="4rem" />
              <SkeletonLine width="60px" height="10px" />
            </div>
          ))}
        </div>

        {/* Banner Skeleton */}
        <SkeletonLine width="100%" height="160px" className="rounded-2xl mt-6" />

        {/* Horizontal Cards Skeleton */}
        <div className="mt-8 space-y-4">
          <SkeletonLine width="180px" height="24px" className="mb-2" />
          <div className="flex gap-4 overflow-hidden">
             <SkeletonCard className="w-64 h-40 flex-shrink-0" />
             <SkeletonCard className="w-64 h-40 flex-shrink-0" />
          </div>
        </div>
        
        {/* Bottom Nav Skeleton space */}
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 relative bg-[#F8FCFC]">
      
      {/* Absolute clear background mapping the new scheme */}
      <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-[#ebfae6]/20 to-transparent pointer-events-none z-0"></div>

      <div className="relative z-10">
        <div className="sticky top-0 z-50">
          <div className="absolute inset-0 bg-[#F8FCFC] bg-opacity-95 backdrop-blur-md border-b flex-none border-transparent z-0 pointer-events-none shadow-sm"></div>
          
          <div className="relative max-w-lg lg:max-w-2xl mx-auto w-full z-10">
            <Header
              location={address}
              onLocationClick={handleLocationClick}
            />
            <div className="pb-2 pt-0">
              <SearchBar onInputClick={() => setIsSearchOpen(true)} />
            </div>
          </div>
        </div>

        <main className="pt-2 space-y-6 pb-24 max-w-screen-xl mx-auto w-full">
          {!isLocationSupported ? (
            <div className="flex flex-col items-center justify-center pt-20 pb-10 px-6 text-center min-h-[60vh]">
              <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6">
                <svg className="w-12 h-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3l18 18" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Service not available in your city
              </h2>
              <p className="text-gray-500 max-w-xs mx-auto mb-8 font-medium">
                Hold on tight! We are expanding quickly and will be there soon.
              </p>
              <button
                onClick={() => setIsAddressModalOpen(true)}
                className="px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold shadow-md hover:bg-primary-700 transition-all font-bold"
                style={{ backgroundColor: '#2874f0' }}
              >
                Change Location
              </button>
            </div>
          ) : (
            <>
              {/* 1. Quick Services Category Row (Moved above Banner) */}
              {homeContent?.isCategoriesVisible !== false && (
                <section className="relative z-10 pt-2">
                  <ServiceCategories
                    categories={categories}
                    onCategoryClick={handleCategoryClick}
                    onSeeAllClick={() => setIsSearchOpen(true)}
                  />
                </section>
              )}

              {/* 2. Offer Banner */}
              {homeContent?.isPromosVisible !== false && (
                <section className="relative z-10">
                  <InstantBookingBanner 
                    promos={(homeContent?.promos || []).sort((a,b) => (a.order||0) - (b.order||0)).map(p => ({
                      ...p,
                      imageUrl: p.imageUrl ? toAssetUrl(p.imageUrl) : null
                    }))}
                    onPromoClick={handlePromoClick}
                  />
                </section>
              )}

              {/* 3. Most Booked Services */}
              {homeContent?.isBookedVisible !== false && (
                <div className="relative z-10">
                  <Suspense fallback={<div className="h-40 bg-gray-50 animate-pulse rounded-xl mx-4" />}>
                      <MostBookedServices
                      services={(homeContent?.booked || []).sort((a, b) => (a.order || 0) - (b.order || 0)).map(item => ({
                        id: item.id || item._id,
                        title: item.title,
                        rating: item.rating,
                        reviews: item.reviews,
                        price: item.price,
                        originalPrice: item.originalPrice,
                        discount: item.discount,
                        image: toAssetUrl(item.imageUrl),
                        targetCategoryId: item.targetCategoryId,
                        slug: item.slug
                      }))}
                      onServiceClick={handleServiceClick}
                      onAddClick={handleAddClick}
                      onSeeAllClick={() => setIsSearchOpen(true)}
                    />
                  </Suspense>
                </div>
              )}

              {/* 4. Real Service Experiences (Trust Videos) */}
              <div className="relative z-10">
                <Suspense fallback={<div className="h-40 bg-gray-50 animate-pulse rounded-2xl mx-4" />}>
                  <TrustVideosSection />
                </Suspense>
              </div>

              {/* 5. How It Works */}
              {homeContent?.isHowItWorksVisible !== false && (
                <div className="relative z-10 mt-6">
                  <Suspense fallback={<div className="h-40 bg-gray-50 animate-pulse rounded-2xl mx-4" />}>
                    <HowItWorks 
                      steps={(homeContent?.howItWorks || []).sort((a,b) => (a.order||0) - (b.order||0)).map(s => ({
                        id: s.id || s._id,
                        title: s.title,
                        description: s.description,
                        iconUrl: s.iconUrl ? toAssetUrl(s.iconUrl) : null
                      }))}
                      isLoading={loading}
                    />
                  </Suspense>
                </div>
              )}

              {/* 6. Customer Reviews */}
              <div className="relative z-10 mt-2">
                <Suspense fallback={<div className="h-40 bg-gray-50 animate-pulse rounded-2xl mx-4" />}>
                  <CustomerReviews serviceId="all" />
                </Suspense>
              </div>

              {/* 6.5. Offer Banners */}
              {homeContent?.isOfferBannersVisible !== false && (
                <div className="relative z-10 mt-2">
                  <Suspense fallback={<div className="h-40 bg-gray-50 animate-pulse rounded-2xl mx-4" />}>
                    <OfferBannerSlider 
                      banners={(homeContent?.offerBanners || []).sort((a,b) => (a.order||0) - (b.order||0)).map(b => ({
                        ...b,
                        imageUrl: b.imageUrl ? toAssetUrl(b.imageUrl) : null
                      }))}
                      onBannerClick={handleServiceClick}
                    />
                  </Suspense>
                </div>
              )}

              {/* 7. Extended Service Categories (Digital First) */}
              {homeContent?.isCategorySectionsVisible !== false && (homeContent?.categorySections || []).sort((a,b) => (a.order||0) - (b.order||0)).map((section, idx) => (
                <div key={section.id || idx} className="relative z-10 mt-6 mb-4">
                  <Suspense fallback={<div className="h-40 bg-gray-50 animate-pulse rounded-2xl mx-4" />}>
                    <ExtendedServiceCategories 
                      categories={(section.cards || []).map(c => ({
                        ...c,
                        imageUrl: c.imageUrl ? toAssetUrl(c.imageUrl) : null
                      }))}
                      isLoading={loading}
                      onCategoryClick={handleCategoryClick}
                    />
                  </Suspense>
                </div>
              ))}

              {/* Popular Brands We Service (Moved to bottom) */}
              <section className="relative z-10 mt-6 mb-4">
                <PopularBrandsWeService 
                  brands={popularBrands} 
                  isLoading={loading}
                  error={null}
                  onSeeAllClick={() => setIsSearchOpen(true)} 
                />
              </section>

            </>
          )}
        </main>
      </div>

      {/* Bottom Navigation */}
      {!isAddressModalOpen && <BottomNav />}

      {/* Category Modal */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => {
          setIsCategoryModalOpen(false);
          setSelectedCategory(null);
        }}
        category={selectedCategory}
        location={address}
        cartCount={cartCount}
        currentCity={currentCity}
      />

      {/* Search Overlay */}
      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        categories={categories}
        onCategoryClick={handleCategoryClick}
      />

      {/* Address Selection Modal */}
      <AddressSelectionModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        houseNumber={houseNumber}
        onHouseNumberChange={setHouseNumber}
        onSave={handleAddressSave}
      />

      <DebugConsole />
    </div>
  );
};

export default Home;
