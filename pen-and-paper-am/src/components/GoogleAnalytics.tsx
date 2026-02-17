import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface GoogleAnalyticsProps {
  trackingId?: string;
}

type AnalyticsConsent = 'granted' | 'denied';

const CONSENT_STORAGE_KEY = 'ppa_analytics_consent';
const CONSENT_EVENT = 'ppa-analytics-consent-updated';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export const getAnalyticsConsent = (): AnalyticsConsent | null => {
  const value = localStorage.getItem(CONSENT_STORAGE_KEY);
  if (value === 'granted' || value === 'denied') {
    return value;
  }
  return null;
};

export const setAnalyticsConsent = (value: AnalyticsConsent): void => {
  localStorage.setItem(CONSENT_STORAGE_KEY, value);
  window.dispatchEvent(new Event(CONSENT_EVENT));
};

const GoogleAnalytics = ({ trackingId }: GoogleAnalyticsProps) => {
  const location = useLocation();
  const measurementId = trackingId || import.meta.env.VITE_GA_MEASUREMENT_ID;

  useEffect(() => {
    const handleConsentChange = () => {
      if (getAnalyticsConsent() !== 'granted') {
        return;
      }
      if (typeof window.gtag === 'function' && measurementId) {
        window.gtag('config', measurementId, {
          page_path: location.pathname + location.search,
        });
      }
    };

    window.addEventListener(CONSENT_EVENT, handleConsentChange);
    return () => {
      window.removeEventListener(CONSENT_EVENT, handleConsentChange);
    };
  }, [location.pathname, location.search, measurementId]);

  useEffect(() => {
    const hasConsent = getAnalyticsConsent() === 'granted';
    if (!measurementId || !hasConsent) {
      return;
    }

    if (document.querySelector(`script[data-ga-loader="${measurementId}"]`)) {
      return;
    }

    const gaLoader = document.createElement('script');
    gaLoader.async = true;
    gaLoader.dataset.gaLoader = measurementId;
    gaLoader.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(gaLoader);

    const gaInit = document.createElement('script');
    gaInit.dataset.gaInit = measurementId;
    gaInit.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      window.gtag = gtag;
      gtag('js', new Date());
      gtag('config', '${measurementId}', {
        page_path: window.location.pathname,
        send_page_view: true
      });
    `;
    document.head.appendChild(gaInit);

    return () => {
      gaLoader.remove();
      gaInit.remove();
      delete window.gtag;
    };
  }, [measurementId]);

  useEffect(() => {
    if (!measurementId || getAnalyticsConsent() !== 'granted') return;

    if (typeof window.gtag === 'function') {
      window.gtag('config', measurementId, {
        page_path: location.pathname + location.search,
      });
    }
  }, [location, measurementId]);

  return null;
};

export const trackEvent = (eventName: string, eventParams?: Record<string, unknown>) => {
  if (getAnalyticsConsent() !== 'granted') {
    return;
  }
  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, eventParams);
  }
};

export const trackFormSubmit = (formName: string, formData?: Record<string, unknown>) => {
  trackEvent('form_submit', {
    form_name: formName,
    ...formData,
  });
};

export const trackButtonClick = (buttonName: string, additionalData?: Record<string, unknown>) => {
  trackEvent('button_click', {
    button_name: buttonName,
    ...additionalData,
  });
};

export const trackCourseView = (courseName: string, courseSlug: string) => {
  trackEvent('view_item', {
    item_id: courseSlug,
    item_name: courseName,
    item_category: 'course',
  });
};

export default GoogleAnalytics;

