const { GoogleGenerativeAI } = require('@google/generative-ai');

// AICTE Categories for Prompt and Fallback
const VALID_CATEGORIES = {
    'Technical': ['workshop', 'hackathon', 'seminar', 'coding', 'project', 'robotics', 'ai', 'ml', 'web', 'app', 'development', 'tech'],
    'Social & Community Service': ['nss', 'volunteer', 'blood donation', 'rural', 'cleaning', 'awareness', 'social', 'service', 'community', 'help', 'ngo'],
    'Cultural': ['fest', 'dance', 'music', 'drama', 'art', 'literature', 'debate', 'quiz', 'poetry', 'cultural', 'performance'],
    'Sports': ['tournament', 'competition', 'athletic', 'yoga', 'marathon', 'fitness', 'sport', 'game', 'match'],
    'Professional Development': ['internship', 'training', 'certification', 'skill', 'leadership', 'personality', 'course'],
    'Environmental': ['tree', 'plantation', 'waste', 'sustainability', 'conservation', 'environment', 'eco', 'green', 'climate']
};

const INVALID_KEYWORDS = ['party', 'concert', 'birthday', 'wedding', 'celebration', 'movie', 'entertainment', 'clubing', 'pub'];

// Initialize Gemini
const validateActivity = async (title, description, domain, aictePoints) => {
    try {
        // Check if key is missing OR is the default placeholder
        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
            console.warn('GEMINI_API_KEY is not set or is placeholder. Using strict fallback validation.');
            return fallbackValidation(title, description, domain);
        }

        // Initialize Gemini ONLY if key is present and valid
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

        const prompt = `
      Act as an AICTE Point Validator for engineering students.
      Analyze the following student activity to check if it matches valid AICTE activity points categories.

      Valid Categories:
      1. Technical: workshops, hackathons, seminars, coding, robotics, etc.
      2. Social: NSS, volunteering, blood donation, etc.
      3. Cultural: fests, dance, music, debate, etc.
      4. Sports: tournaments, marathons, yoga, etc.
      5. Professional: internships, certifications, etc.
      6. Environmental: tree plantation, sustainability, etc.

      Invalid Activities (Reject these):
      Concerts, parties, entertainment shows without educational value, personal celebrations, commercial product launches.
      Any activity with 0 claimed AICTE points should be considered invalid or meaningless.

      Activity Details:
      Title: "${title}"
      Description: "${description}"
      Claimed Domain: "${domain}"
      Claimed AICTE Points: ${aictePoints}

      Respond ONLY in valid JSON format:
      {
        "isValid": boolean, // Set to false if points are 0 or activity is entertainment-focused
        "confidence": number, // 0-100 (If points are 0, max confidence should be 10)
        "matchedCategory": string, // One of the valid categories or "None"
        "reasoning": string // Brief explanation
      }
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Parse JSON (handle potential markdown format)
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const validationResult = JSON.parse(jsonStr);

        // AI Confidence Check
        if (validationResult.confidence < 50) {
            validationResult.isValid = false;
            validationResult.reasoning = `Confidence score too low (${validationResult.confidence}%). ${validationResult.reasoning}`;
        }

        return {
            passed: validationResult.isValid,
            confidence: validationResult.confidence,
            matchedCategory: validationResult.matchedCategory,
            reasoning: validationResult.reasoning,
            validatedAt: new Date()
        };

    } catch (error) {
        console.error('AI Logic Failed:', error.message);
        return fallbackValidation(title, description, domain);
    }
};

const fallbackValidation = (title, description, domain) => {
    const text = `${title} ${description}`.toLowerCase();

    // 1. Check Invalid Keywords
    for (const word of INVALID_KEYWORDS) {
        if (text.includes(word)) {
            return {
                passed: false,
                confidence: 0,
                matchedCategory: 'Invalid',
                reasoning: `Contains invalid keyword: ${word}`,
                validatedAt: new Date()
            };
        }
    }

    // 2. Check Valid Keywords
    let maxMatchCount = 0;
    let matchesCategory = 'None';

    for (const [category, keywords] of Object.entries(VALID_CATEGORIES)) {
        let matchCount = 0;
        keywords.forEach(keyword => {
            if (text.includes(keyword)) matchCount++;
        });

        if (matchCount > maxMatchCount) {
            maxMatchCount = matchCount;
            matchesCategory = category;
        }
    }

    // Domain match check
    const domainKeywords = VALID_CATEGORIES[domain] || [];
    const domainMatch = domainKeywords.some(k => text.includes(k));

    let passed = false;
    let confidence = 0;

    if (maxMatchCount > 0) {
        passed = true;
        confidence = 60 + (maxMatchCount * 5); // Base 60, +5 per keyword
        if (domainMatch) confidence += 10;
        if (confidence > 80) confidence = 80; // Cap fallback confidence
    }

    return {
        passed,
        confidence,
        matchedCategory: matchesCategory,
        reasoning: passed ? 'Keyword matching successful (Fallback)' : 'No valid keywords found (Fallback)',
        validatedAt: new Date()
    };
};

module.exports = { validateActivity };
