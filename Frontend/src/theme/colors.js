/**
 * Centralized Theme Colors Configuration
 */

const brand = {
  teal: '#10AFA5',
  orange: '#F59E0B',
  bg: '#F8FCFC',
  card: '#FFFFFF',
  textDark: '#0F172A',
  textMuted: '#64748B',
  border: '#E5F3F2',
  
  // Backward compatibility aliases
  purple: '#10AFA5',
  gold: '#F59E0B',
  green: '#10AFA5',
  orangeLight: '#FEF3C7',
  creamBg: '#F8FCFC',
  gradient: 'linear-gradient(135deg, #10AFA5 0%, #0D9488 100%)',
  conic: 'conic-gradient(from 0deg, #10AFA5, #0D9488, #10AFA5)'
};

export const themeColors = {
  primary: {
    DEFAULT: '#10AFA5',
    50: '#F0FDFA',
    100: '#CCFBF1',
    200: '#99F6E4',
    300: '#5EEAD4',
    400: '#2DD4BF',
    500: '#10AFA5',
    600: '#0D9488',
    700: '#0F766E',
    800: '#115E59',
    900: '#134E4A',
  },
  brand: brand,
  button: '#10AFA5',
  background: '#F8FCFC',
  text: '#0F172A',
  border: '#E5F3F2',
};

// User Theme Colors
const userTheme = {
  backgroundGradient: 'linear-gradient(180deg, #F0FDFA 0%, #F8FCFC 25%, #FFFFFF 100%)',
  gradient: brand.gradient,
  headerGradient: 'transparent',
  headerBg: 'transparent',
  button: brand.teal,
  icon: brand.teal,
  cardShadow: '0 4px 20px rgba(16, 175, 165, 0.08)',
  cardBorder: '1px solid #E5F3F2',
  brand: brand
};

// Vendor Theme Colors
const vendorTheme = {
  backgroundGradient: userTheme.backgroundGradient,
  gradient: brand.gradient,
  headerGradient: brand.teal,
  button: brand.teal,
  icon: brand.teal,
  brand: brand
};

// Worker Theme Colors
const workerTheme = {
  backgroundGradient: userTheme.backgroundGradient,
  gradient: brand.gradient,
  headerGradient: brand.teal,
  button: brand.teal,
  icon: brand.teal,
  brand: brand
};

export { userTheme, vendorTheme, workerTheme, brand };
export default themeColors;
