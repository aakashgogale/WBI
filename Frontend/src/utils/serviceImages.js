export const getServiceImage = (serviceName = '', serviceCategory = '') => {
  const searchString = `${serviceName} ${serviceCategory}`.toLowerCase();

  // High quality Unsplash image mapping for all home services
  if (searchString.includes('ac ') || searchString.includes('air condition')) 
    return 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=400&auto=format&fit=crop';
  
  if (searchString.includes('washing machine') || searchString.includes('washer')) 
    return 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?q=80&w=400&auto=format&fit=crop';
  
  if (searchString.includes('geyser') || searchString.includes('heater')) 
    return 'https://images.unsplash.com/photo-1585909695029-7977a4ee758e?q=80&w=400&auto=format&fit=crop';
  
  if (searchString.includes('ro ') || searchString.includes('purifier') || searchString.includes('water filter')) 
    return 'https://images.unsplash.com/photo-1574926053335-502a1c22b9be?q=80&w=400&auto=format&fit=crop';
  
  if (searchString.includes('microwave') || searchString.includes('oven')) 
    return 'https://images.unsplash.com/photo-1585659722983-38ca84b5536d?q=80&w=400&auto=format&fit=crop';
  
  if (searchString.includes('fridge') || searchString.includes('refrigerator')) 
    return 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?q=80&w=400&auto=format&fit=crop';

  if (searchString.includes('tv ') || searchString.includes('television')) 
    return 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?q=80&w=400&auto=format&fit=crop';

  if (searchString.includes('chimney') || searchString.includes('kitchen')) 
    return 'https://images.unsplash.com/photo-1556910103-1c02745a872f?q=80&w=400&auto=format&fit=crop';

  if (searchString.includes('fan ') || searchString.includes('ceiling fan')) 
    return 'https://images.unsplash.com/photo-1618220179428-22790b46a011?q=80&w=400&auto=format&fit=crop';

  if (searchString.includes('plumb')) 
    return 'https://images.unsplash.com/photo-1607472586893-edb57cb31422?q=80&w=400&auto=format&fit=crop';

  if (searchString.includes('electric')) 
    return 'https://images.unsplash.com/photo-1621905252507-b35492d0402e?q=80&w=400&auto=format&fit=crop';

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
