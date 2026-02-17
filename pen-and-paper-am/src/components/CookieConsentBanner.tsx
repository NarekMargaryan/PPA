import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getAnalyticsConsent, setAnalyticsConsent } from "@/components/GoogleAnalytics";

const CookieConsentBanner = () => {
  const [consent, setConsent] = useState<"granted" | "denied" | null>(null);

  useEffect(() => {
    setConsent(getAnalyticsConsent());
  }, []);

  if (consent !== null) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[70] rounded-lg border bg-card p-4 shadow-lg md:left-auto md:max-w-lg">
      <p className="text-sm text-foreground">
        We use analytics cookies to understand website usage. You can accept or decline.
        <span className="ml-1">
          <Link to="/privacy" className="underline">
            Privacy Policy
          </Link>
        </span>
      </p>
      <div className="mt-3 flex gap-2">
        <Button
          size="sm"
          onClick={() => {
            setAnalyticsConsent("granted");
            setConsent("granted");
          }}
        >
          Accept
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setAnalyticsConsent("denied");
            setConsent("denied");
          }}
        >
          Decline
        </Button>
      </div>
    </div>
  );
};

export default CookieConsentBanner;
