import ReactGA from 'react-ga4';

const GA_MEASUREMENT_ID = (import.meta as any).env.VITE_GA_MEASUREMENT_ID;

export const initAnalytics = () => {
  if (GA_MEASUREMENT_ID) {
    ReactGA.initialize(GA_MEASUREMENT_ID);
  }
};

export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  if (GA_MEASUREMENT_ID) {
    ReactGA.event({
      category: 'User Interaction',
      action: eventName,
      ...properties,
    });
  }
};

export const trackPageView = (pageName: string) => {
  if (GA_MEASUREMENT_ID) {
    ReactGA.send({ hitType: "pageview", page: pageName, title: pageName });
  }
};
