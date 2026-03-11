import { useState, useEffect } from 'react';
import { X, Settings } from 'lucide-react';
import authService from '../../services/authService';

interface ConsentPreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<ConsentPreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    // Check if user has already given consent
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      // Show banner after a short delay for better UX
      setTimeout(() => setIsVisible(true), 1000);
    }
  }, []);

  const saveConsent = async (consentPrefs: ConsentPreferences) => {
    try {
      // Save to localStorage
      localStorage.setItem('cookieConsent', JSON.stringify({
        ...consentPrefs,
        timestamp: new Date().toISOString(),
      }));

      // If user is logged in, save to backend
      const user = authService.getCurrentUser();
      if (user) {
        await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/users/me/gdpr-consent`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            analytics: consentPrefs.analytics,
            marketing: consentPrefs.marketing,
          }),
        });
      }

      setIsVisible(false);
    } catch (error) {
      console.error('Error saving cookie consent:', error);
      // Still save locally even if API fails
      localStorage.setItem('cookieConsent', JSON.stringify({
        ...consentPrefs,
        timestamp: new Date().toISOString(),
      }));
      setIsVisible(false);
    }
  };

  const handleAcceptAll = () => {
    saveConsent({
      necessary: true,
      analytics: true,
      marketing: true,
    });
  };

  const handleAcceptNecessary = () => {
    saveConsent({
      necessary: true,
      analytics: false,
      marketing: false,
    });
  };

  const handleSavePreferences = () => {
    saveConsent(preferences);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-none">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-sm pointer-events-auto"
        onClick={() => !showSettings && setIsVisible(false)}
      />

      {/* Banner */}
      <div className="relative w-full max-w-4xl mx-4 mb-4 sm:mb-8 pointer-events-auto">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🍪</span>
              <h3 className="font-semibold text-lg">Cookie Preferences</h3>
            </div>
            <button
              onClick={() => setIsVisible(false)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {!showSettings ? (
              <>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  We use cookies to enhance your experience, analyze site traffic, and personalize content. 
                  By clicking "Accept All", you consent to our use of cookies.
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  Read our{' '}
                  <a 
                    href="/privacy-policy" 
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                    onClick={() => setIsVisible(false)}
                  >
                    Privacy Policy
                  </a>{' '}
                  to learn more about how we handle your data.
                </p>

                {/* Quick Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleAcceptAll}
                    className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Accept All
                  </button>
                  <button
                    onClick={handleAcceptNecessary}
                    className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 font-medium rounded-lg transition-colors"
                  >
                    Necessary Only
                  </button>
                  <button
                    onClick={() => setShowSettings(true)}
                    className="px-6 py-3 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100 font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Settings className="w-5 h-5" />
                    Customize
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-gray-700 dark:text-gray-300 mb-6">
                  Customize your cookie preferences. Necessary cookies are required for the site to function and cannot be disabled.
                </p>

                <div className="space-y-4 mb-6">
                  {/* Necessary Cookies */}
                  <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <input
                      type="checkbox"
                      checked={true}
                      disabled
                      className="mt-1 w-5 h-5 rounded border-gray-300"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">Necessary Cookies</h4>
                        <span className="px-2 py-0.5 text-xs bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded">
                          Required
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Essential for authentication, security, and basic site functionality. These cannot be disabled.
                      </p>
                    </div>
                  </div>

                  {/* Analytics Cookies */}
                  <div className="flex items-start gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={(e) => setPreferences(prev => ({ ...prev, analytics: e.target.checked }))}
                      className="mt-1 w-5 h-5 rounded border-gray-300"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">Analytics Cookies</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Help us understand how you use our site so we can improve your experience.
                      </p>
                    </div>
                  </div>

                  {/* Marketing Cookies */}
                  <div className="flex items-start gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <input
                      type="checkbox"
                      checked={preferences.marketing}
                      onChange={(e) => setPreferences(prev => ({ ...prev, marketing: e.target.checked }))}
                      className="mt-1 w-5 h-5 rounded border-gray-300"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">Marketing Cookies</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Used to show you relevant content and personalized recommendations.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Settings Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleSavePreferences}
                    className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Save Preferences
                  </button>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="px-6 py-3 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100 font-medium rounded-lg transition-colors"
                  >
                    Back
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
