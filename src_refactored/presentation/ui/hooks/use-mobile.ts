import * as React from 'react';

// Example threshold for mobile devices
const MOBILE_WIDTH_THRESHOLD = 768;

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < MOBILE_WIDTH_THRESHOLD);
    };

    // Check on mount
    checkDevice();

    // Add resize listener
    window.addEventListener('resize', checkDevice);

    // Cleanup listener on unmount
    return () => {
      window.removeEventListener('resize', checkDevice);
    };
  }, []);

  return isMobile;
}
