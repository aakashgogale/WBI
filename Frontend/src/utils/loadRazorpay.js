export const loadRazorpay = () => {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    // Check if script is already injected
    if (document.getElementById('razorpay-script')) {
      // Wait for it to load
      const interval = setInterval(() => {
        if (window.Razorpay) {
          clearInterval(interval);
          resolve(true);
        }
      }, 100);
      return;
    }

    const script = document.createElement('script');
    script.id = 'razorpay-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      reject(new Error('Razorpay SDK failed to load'));
    };
    document.body.appendChild(script);
  });
};
