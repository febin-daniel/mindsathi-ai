/* Languages + UI strings for all 10 supported languages.
   Any missing key falls back to English. */
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
    },
    ta: {
      home: 'முகப்பு', chat: 'AI அரட்டை', voice: 'குரல் உதவியாளர்', mood: 'என் மனநிலை', insights: 'AI நுண்ணறிவுகள்',
      wellness: 'நல்வாழ்வு கருவிகள்', games: 'மன அழுத்தம் குறைக்கும் விளையாட்டுகள்', support: 'உதவியைக் கண்டறியுங்கள்',
      how: 'MindSathi AI எவ்வாறு செயல்படுகிறது', settings: 'அமைப்புகள்', privacy: 'தனியுரிமை & தரவு',
      emergency: 'அவசர உதவி', welcome: 'MindSathi AI-க்கு வரவேற்கிறோம்'
    },
    te: {
      home: 'హోమ్', chat: 'AI చాట్', voice: 'వాయిస్ అసిస్టెంట్', mood: 'నా మూడ్', insights: 'AI ఇన్‌సైట్స్',
      wellness: 'వెల్నెస్ టూల్స్', games: 'ఒత్తిడి తగ్గించే ఆటలు', support: 'సహాయం కనుగొనండి',
      how: 'MindSathi AI ఎలా పనిచేస్తుంది', settings: 'సెట్టింగ్స్', privacy: 'గోప్యత & డేటా',
      emergency: 'అత్యవసర సహాయం', welcome: 'MindSathi AI కి స్వాగతం'
    },
    kn: {
      home: 'ಮುಖಪುಟ', chat: 'AI ಚಾಟ್', voice: 'ಧ್ವನಿ ಸಹಾಯಕ', mood: 'ನನ್ನ ಮನಸ್ಥಿತಿ', insights: 'AI ಒಳನೋಟಗಳು',
      wellness: 'ಕ್ಷೇಮ ಸಾಧನಗಳು', games: 'ಒತ್ತಡ ನಿವಾರಣಾ ಆಟಗಳು', support: 'ಸಹಾಯ ಹುಡುಕಿ',
      how: 'MindSathi AI ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ', settings: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು', privacy: 'ಗೌಪ್ಯತೆ ಮತ್ತು ಡೇಟಾ',
      emergency: 'ತುರ್ತು ಸಹಾಯ', welcome: 'MindSathi AI ಗೆ ಸ್ವಾಗತ'
    },
    bn: {
      home: 'হোম', chat: 'AI চ্যাট', voice: 'ভয়েস অ্যাসিস্ট্যান্ট', mood: 'আমার মেজাজ', insights: 'AI ইনসাইটস',
      wellness: 'ওয়েলনেস টুলস', games: 'মানসিক চাপ কমানোর গেম', support: 'সহায়তা খুঁজুন',
      how: 'MindSathi AI কীভাবে কাজ করে', settings: 'সেটিংস', privacy: 'গোপনীয়তা ও ডেটা',
      emergency: 'জরুরি সহায়তা', welcome: 'MindSathi AI-তে স্বাগতম'
    },
    mr: {
      home: 'मुख्यपृष्ठ', chat: 'AI चॅट', voice: 'व्हॉइस असिस्टंट', mood: 'माझा मूड', insights: 'AI इनसाइट्स',
      wellness: 'वेलनेस टूल्स', games: 'ताण कमी करणारे खेळ', support: 'मदत शोधा',
      how: 'MindSathi AI कसे काम करते', settings: 'सेटिंग्ज', privacy: 'गोपनीयता आणि डेटा',
      emergency: 'आपत्कालीन मदत', welcome: 'MindSathi AI मध्ये आपले स्वागत आहे'
    },
    gu: {
      home: 'હોમ', chat: 'AI ચેટ', voice: 'વૉઇસ આસિસ્ટન્ટ', mood: 'મારો મૂડ', insights: 'AI ઇનસાઇટ્સ',
      wellness: 'વેલનેસ ટૂલ્સ', games: 'તણાવ ઘટાડતી રમતો', support: 'મદદ શોધો',
      how: 'MindSathi AI કેવી રીતે કામ કરે છે', settings: 'સેટિંગ્સ', privacy: 'ગોપનીયતા અને ડેટા',
      emergency: 'કટોકટી સહાય', welcome: 'MindSathi AI માં આપનું સ્વાગત છે'
    },
    pa: {
      home: 'ਹੋਮ', chat: 'AI ਚੈਟ', voice: 'ਵੌਇਸ ਅਸਿਸਟੈਂਟ', mood: 'ਮੇਰਾ ਮੂਡ', insights: 'AI ਇਨਸਾਈਟਸ',
      wellness: 'ਵੈੱਲਨੈੱਸ ਟੂਲਸ', games: 'ਤਣਾਅ ਘਟਾਉਣ ਵਾਲੀਆਂ ਖੇਡਾਂ', support: 'ਮਦਦ ਲੱਭੋ',
      how: 'MindSathi AI ਕਿਵੇਂ ਕੰਮ ਕਰਦਾ ਹੈ', settings: 'ਸੈਟਿੰਗਾਂ', privacy: 'ਪਰਦੇਦਾਰੀ ਅਤੇ ਡੇਟਾ',
      emergency: 'ਐਮਰਜੈਂਸੀ ਮਦਦ', welcome: 'MindSathi AI ਵਿੱਚ ਤੁਹਾਡਾ ਸਵਾਗਤ ਹੈ'
    }
  };

  return {
    LANGS,
    info: (code) => LANGS.find(l => l.code === code) || LANGS[0],
    t: (key, code) => (T[code] && T[code][key]) || T.en[key] || key
  };
})();