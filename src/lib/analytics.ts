export const initAnalytics = () => {
  // Cloudflare Web Analytics is loaded via index.html script tag
};

export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  // Cloudflare Web Analytics is primarily automatic. 
  // Custom events are currently in beta/limited for the free beacon.
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Analytics] Event: ${eventName}`, properties);
  }
};

export const trackPageView = (pageName: string) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Analytics] Page View: ${pageName}`);
  }
};
