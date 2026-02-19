/**
 * Helper functions for business name safety checks and string simplification.
 */

// A basic list of keywords that might indicate spam, scams, or inappropriate content.
// In a real production app, this would likely be much larger or powered by an external service/AI.
const UNSAFE_KEYWORDS = [
    "scam", "fraud", "fake", "phishing", "malware", "hack",
    "free money", "admin", "root", "system",
    "sex", "xxx", "porn", "casino", "gambling", 
    "shit", "fuck", "bitch", "ass", "crap" // Basic profanity filter
];

export function simplifyName(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "") // Remove non-alphanumeric
        .trim();
}

export type SafetyResult = {
    riskLevel: 'low' | 'high';
    reason?: string;
};

export function checkSafety(name: string): SafetyResult {
    const lowerName = name.toLowerCase();
    
    // Check for exact unsafe words or contained unsafe phrases
    // We use word boundaries for some, but simple includes for others can be safer for this MVP
    for (const keyword of UNSAFE_KEYWORDS) {
        if (lowerName.includes(keyword)) {
            return {
                riskLevel: 'high',
                reason: `Contains unsafe keyword: ${keyword}`
            };
        }
    }

    return { riskLevel: 'low' };
}

export type SubmissionRiskResult = {
    riskLevel: 'low' | 'medium' | 'high';
    flags: string[];
};

/**
 * Comprehensive risk detection for business submissions
 */
export function detectSubmissionRisks(
    name: string,
    description?: string,
    website?: string,
    phone?: string
): SubmissionRiskResult {
    const flags: string[] = [];
    
    // Check name for unsafe keywords
    const nameSafety = checkSafety(name);
    if (nameSafety.riskLevel === 'high') {
        flags.push(`Unsafe name: ${nameSafety.reason}`);
        return { riskLevel: 'high', flags };
    }

    // Check description for spam keywords
    if (description) {
        const lowerDesc = description.toLowerCase();
        const spamKeywords = ['guaranteed', 'act now', 'limited time', 'click here', 'buy now', 'free money'];
        for (const keyword of spamKeywords) {
            if (lowerDesc.includes(keyword)) {
                flags.push(`Spam keyword in description: ${keyword}`);
            }
        }
    }

    // Check for suspicious URLs (multiple http/https links)
    if (description) {
        const urlPattern = /https?:\/\//gi;
        const urlMatches = description.match(urlPattern);
        if (urlMatches && urlMatches.length >= 3) {
            flags.push(`Multiple URLs detected in description (${urlMatches.length})`);
        }
    }

    // Check for phone number stuffing (3+ phone-like patterns in any field)
    const phonePattern = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b|\b\d{10,}\b/g;
    let totalPhoneMatches = 0;
    
    const fieldsToCheck = [name, description || '', website || '', phone || ''].join(' ');
    const phoneMatches = fieldsToCheck.match(phonePattern);
    if (phoneMatches) {
        totalPhoneMatches = phoneMatches.length;
        if (totalPhoneMatches >= 3) {
            flags.push(`Excessive phone numbers detected (${totalPhoneMatches})`);
        }
    }

    // Determine risk level based on flags
    if (flags.length === 0) {
        return { riskLevel: 'low', flags };
    } else if (flags.length >= 2) {
        return { riskLevel: 'high', flags };
    } else {
        return { riskLevel: 'medium', flags };
    }
}