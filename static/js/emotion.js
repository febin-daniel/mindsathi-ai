/* Emotion estimation + supportive replies.

   IMPORTANT: this is a simple keyword-based PLACEHOLDER so the app works
   without a server. It is not real AI and not a medical assessment.
   Replace detect() / reply() with calls to your backend model when ready
   (see js/config.js). */
window.Emotion = (function () {
  const META = {
    sad:     { label: 'Sad',     color: '#4F7FD9', bg: '#E4ECFB' },
    anxious: { label: 'Anxious', color: '#B7791F', bg: '#FBEFD5' },
    angry:   { label: 'Angry',   color: '#C2475B', bg: '#FBE4E8' },
    stressed:{ label: 'Stressed',color: '#A2569B', bg: '#F3E2F1' },
    happy:   { label: 'Happy',   color: '#2F8F6B', bg: '#DEF3EA' },
    calm:    { label: 'Calm',    color: '#2F8A8F', bg: '#DDF1F2' },
    neutral: { label: 'Neutral', color: '#6B6189', bg: '#ECE8F6' }
  };

  const LEX = {
    sad: ['sad', 'down', 'depressed', 'cry', 'crying', 'lonely', 'alone', 'hopeless', 'empty', 'hurt', 'grief', 'unhappy', 'miss ', 'ദുഃഖ', 'ദുഖ', 'സങ്കട', 'ഒറ്റയ്ക്ക', 'दुखी', 'उदास', 'अकेला', 'अकेली'],
    anxious: ['anxious', 'anxiety', 'worried', 'worry', 'nervous', 'panic', 'scared', 'afraid', 'fear', 'overthinking', 'tense', 'ആശങ്ക', 'പേടി', 'ഭയം', 'चिंता', 'घबरा', 'डर'],
    angry: ['angry', 'furious', 'annoyed', 'irritated', 'frustrated', 'hate', ' mad', 'ദേഷ്യ', 'गुस्सा', 'नाराज'],
    stressed: ['stress', 'overwhelmed', 'pressure', 'exhausted', 'burnt out', 'burnout', 'tired', 'too much', 'സമ്മർദ്ദ', 'ക്ഷീണ', 'तनाव', 'थक'],
    happy: ['happy', 'great', 'glad', 'excited', 'grateful', 'joy', 'relieved', 'proud', 'good', 'സന്തോഷ', 'खुश', 'अच्छा'],
    calm: ['calm', 'peaceful', 'relaxed', 'better', 'ശാന്ത', 'शांत']
  };

  const CRISIS = [
    'suicide', 'suicidal', 'kill myself', 'end my life', 'want to die', 'wanna die', 'self harm', 'self-harm',
    'hurt myself', 'no reason to live', 'better off dead',
    'ആത്മഹത്യ', 'മരിക്കണം', 'आत्महत्या', 'मरना चाहता', 'मरना चाहती', 'खुद को नुकसान'
  ];

  const NEG_POSITIVE = /\b(not|never|n't)\s+(feeling\s+)?(good|great|okay|ok|fine|well|happy)\b/i;

  function detect(text) {
    const s = ' ' + String(text).toLowerCase() + ' ';
    const scores = {};
    Object.keys(LEX).forEach(k => {
      scores[k] = LEX[k].reduce((n, w) => n + (s.includes(w) ? 1 : 0), 0);
    });
    if (NEG_POSITIVE.test(text)) { scores.sad += 1; scores.happy = 0; scores.calm = 0; }
    let best = 'neutral', top = 0;
    Object.keys(scores).forEach(k => { if (scores[k] > top) { top = scores[k]; best = k; } });
    if (!top) return { emotion: 'neutral', conf: 50 };
    return { emotion: best, conf: Math.min(95, 60 + top * 12) };
  }

  function isCrisis(text) {
    const s = String(text).toLowerCase();
    return CRISIS.some(w => s.includes(w));
  }

  const REPLIES = {
    sad: [
      { text: "I'm sorry it feels heavy right now, and I'm glad you told me. What has been weighing on you the most today?" },
      { text: "That sounds really hard. You don't have to have the right words — you can just tell me what's on your mind.", tool: 'wellness' }
    ],
    anxious: [
      { text: "It sounds like your mind is racing. Let's slow things down together. Would a minute of gentle breathing help?", tool: 'wellness' },
      { text: "Feeling worried is exhausting. Can you name one thing you're worried about right now? We can look at it together.", tool: 'wellness' }
    ],
    angry: [
      { text: "That sounds frustrating. It's okay to feel angry. What happened that set this off?" },
      { text: "Thank you for saying that out loud. If your body feels tense, a few slow breaths can take the edge off before we talk it through.", tool: 'wellness' }
    ],
    stressed: [
      { text: "You're carrying a lot. Let's pick just one thing to focus on first. What feels most urgent?" },
      { text: "That sounds like a lot at once. A short break might help — a calming activity can give your mind room to reset.", tool: 'games' }
    ],
    happy: [
      { text: "I'm really glad to hear that. What made today feel good?" },
      { text: "That's lovely to hear. Noticing good moments helps them last — would you like to write it in your journal?", tool: 'wellness' }
    ],
    calm: [
      { text: "That's good to hear. What's helping you feel settled right now?" }
    ],
    neutral: [
      { text: "I'm listening. Tell me more about how you've been feeling." },
      { text: "Thanks for sharing. How are you feeling about it, in your body and in your mind?" }
    ]
  };

  function reply(emotion) {
    const pool = REPLIES[emotion] || REPLIES.neutral;
    const r = pool[Math.floor(Math.random() * pool.length)];
    return { text: r.text, tool: r.tool || null, lang: 'en' };
  }

  const SUGGESTIONS = {
    sad: 'Consider taking a short break, practising slow breathing, or talking to someone you trust.',
    anxious: 'Try slow breathing or a grounding exercise. Naming what you can see and hear can steady your mind.',
    angry: 'Step away for a moment if you can. A few slow breaths before responding can help.',
    stressed: 'Pick one small task, take a short break, and try a calming activity.',
    happy: 'Notice what helped today, and consider writing it in your journal.',
    calm: 'Keep doing what is helping. A short gratitude moment can make the feeling last.',
    neutral: 'Start a conversation and I will reflect how you are feeling.'
  };

  return { META, detect, isCrisis, reply, SUGGESTIONS };
})();
