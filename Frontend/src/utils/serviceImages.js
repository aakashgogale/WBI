export const getServiceImage = (serviceName = '', serviceCategory = '') => {
  const searchString = `${serviceName} ${serviceCategory}`.toLowerCase();

  // High quality Unsplash image mapping for all home services
  if (searchString.includes('ac ') || searchString.includes('air condition')) 
    return 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=400&auto=format&fit=crop';
  
  if (searchString.includes('washing machine') || searchString.includes('washer')) 
    return 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?q=80&w=400&auto=format&fit=crop';
  
  if (searchString.includes('geyser') || searchString.includes('heater')) 
    return 'https://images.unsplash.com/photo-1521207418485-99c705420785?q=80&w=400&auto=format&fit=crop';
  
  if (searchString.includes('ro ') || searchString.includes('purifier') || searchString.includes('water filter')) 
    return 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=400&auto=format&fit=crop';
  
  if (searchString.includes('microwave') || searchString.includes('oven')) 
    return 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=400&auto=format&fit=crop';
  
  if (searchString.includes('fridge') || searchString.includes('refrigerator')) 
    return 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?q=80&w=400&auto=format&fit=crop';

  if (searchString.includes('tv ') || searchString.includes('television')) 
    return 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?q=80&w=400&auto=format&fit=crop';

  if (searchString.includes('chimney') || searchString.includes('kitchen')) 
    return 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=400&auto=format&fit=crop';

  if (searchString.includes('fan ') || searchString.includes('ceiling fan')) 
    return 'https://images.unsplash.com/photo-1591088398332-8a7791972843?q=80&w=400&auto=format&fit=crop';

  if (searchString.includes('plumb')) 
    return 'https://images.unsplash.com/photo-1508962914676-134849a727f0?q=80&w=400&auto=format&fit=crop';

  if (searchString.includes('electric')) 
    return 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?q=80&w=400&auto=format&fit=crop';

  if (searchString.includes('clean') || searchString.includes('maid')) 
    return 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=400&auto=format&fit=crop';
    
  if (searchString.includes('paint') || searchString.includes('wall')) 
    return 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=400&auto=format&fit=crop';

  if (searchString.includes('atm')) 
    return 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=400&auto=format&fit=crop';

  // Default image for generic services
  return 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=400&auto=format&fit=crop';
};

export const getFallbackImage = () => {
  // Reliable robust fallback if Unsplash fails to load
  return 'https://cdn-icons-png.flaticon.com/512/4836/4836952.png';
};
