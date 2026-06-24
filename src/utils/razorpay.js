const RAZORPAY_CHECKOUT_URL = 'https://checkout.razorpay.com/v1/checkout.js';

export const loadRazorpayCheckout = () => new Promise((resolve, reject) => {
  if (window.Razorpay) {
    resolve();
    return;
  }

  const existingScript = document.querySelector(`script[src="${RAZORPAY_CHECKOUT_URL}"]`);
  if (existingScript) {
    existingScript.addEventListener('load', resolve, { once: true });
    existingScript.addEventListener('error', reject, { once: true });
    return;
  }

  const script = document.createElement('script');
  script.src = RAZORPAY_CHECKOUT_URL;
  script.async = true;
  script.onload = resolve;
  script.onerror = () => reject(new Error('Unable to load Razorpay Checkout'));
  document.body.appendChild(script);
});
