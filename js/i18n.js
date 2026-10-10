/* Languages + UI strings.
   English is complete. Hindi and Malayalam cover navigation and key headings.
   Any missing key falls back to English – add more strings here to translate more. */
window.I18N = (function () {
  const LANGS = [
    { code: 'en', native: 'English',  english: 'English',   speech: 'en-IN' },
    { code: 'hi', native: 'हिन्दी',    english: 'Hindi',     speech: 'hi-IN' },
    { code: 'ml', native: 'മലയാളം',  english: 'Malayalam', speech: 'ml-IN' },
    { code: 'ta', native: 'தமிழ்',    english: 'Tamil',     speech: 'ta-IN' },
    { code: 'te', native: 'తెలుగు',   english: 'Telugu',    speech: 'te-IN' },
    { code: 'kn', native: 'ಕನ್ನಡ',    english: 'Kannada',   speech: 'kn-IN' },
    { code: 'bn', native: 'বাংলা',    english: 'Bengali',   speech: 'bn-IN' },
    { code: 'mr', native: 'मराठी',    english: 'Marathi',   speech: 'mr-IN' },
    { code: 'gu', native: 'ગુજરાતી',  english: 'Gujarati',  speech: 'gu-IN' },
    { code: 'pa', native: 'ਪੰਜਾਬੀ',   english: 'Punjabi',   speech: 'pa-IN' }
  ];

  const T = {
    en: {
      home: 'Home', chat: 'AI Chat', voice: 'Voice Assistant', mood: 'My Mood', insights: 'AI Insights',
      wellness: 'Wellness Tools', games: 'Stress Relief Games', support: 'Find Support',
      how: 'How MindSathi AI Works', settings: 'Settings', privacy: 'Privacy & Data',
      emergency: 'Emergency Help', welcome: 'Welcome to MindSathi AI'
    },
    hi: {
      home: 'होम', chat: 'AI चैट', voice: 'वॉइस असिस्टेंट', mood: 'मेरा मूड', insights: 'AI इनसाइट्स',
      wellness: 'वेलनेस टूल्स', games: 'तनाव कम करने वाले गेम्स', support: 'सहायता खोजें',
      how: 'MindSathi AI कैसे काम करता है', settings: 'सेटिंग्स', privacy: 'गोपनीयता और डेटा',
      emergency: 'आपातकालीन सहायता', welcome: 'MindSathi AI में आपका स्वागत है'
    },
    ml: {
      home: 'ഹോം', chat: 'AI ചാറ്റ്', voice: 'വോയ്സ് അസിസ്റ്റന്റ്', mood: 'എന്റെ മൂഡ്', insights: 'AI ഇൻസൈറ്റുകൾ',
      wellness: 'വെൽനെസ് ടൂളുകൾ', games: 'സമ്മർദ്ദം കുറയ്ക്കുന്ന ഗെയിമുകൾ', support: 'സഹായം കണ്ടെത്തുക',
      how: 'MindSathi AI എങ്ങനെ പ്രവർത്തിക്കുന്നു', settings: 'ക്രമീകരണങ്ങൾ', privacy: 'സ്വകാര്യതയും ഡാറ്റയും',
      emergency: 'അടിയന്തര സഹായം', welcome: 'MindSathi AI-ലേക്ക് സ്വാഗതം'
    }
  };

  return {
    LANGS,
    info: (code) => LANGS.find(l => l.code === code) || LANGS[0],
    t: (key, code) => (T[code] && T[code][key]) || T.en[key] || key
  };
})();
