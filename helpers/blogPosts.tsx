import { ReactNode } from "react";

export type ContentSectionType = "paragraph" | "heading" | "list" | "quote" | "callout";

export interface ContentSection {
  type: ContentSectionType;
  content: string | string[]; // string for most, array of strings for list
}

export interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  daysAgo: number;
  category: string;
  readTime: string;
  content: ContentSection[];
}

export function getRelativeDate(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export const blogPosts: BlogPost[] = [
  {
    id: 1,
    slug: "understanding-ai-sentiment-analysis-in-business-reviews",
    title: "Understanding AI Sentiment Analysis in Business Reviews",
    excerpt: "How our proprietary algorithms distinguish between genuine feedback and review bombing to give you the real score.",
    daysAgo: 3,
    category: "AI Insights",
    readTime: "5 min read",
    content: [
      {
        type: "paragraph",
        content: "In the digital age, a business's reputation can be built or destroyed in a matter of hours. While star ratings provide a quick snapshot, they often fail to capture the nuance of customer experiences. This is where AI sentiment analysis comes in—transforming raw text into actionable intelligence."
      },
      {
        type: "heading",
        content: "Beyond the Star Rating"
      },
      {
        type: "paragraph",
        content: "Traditional review platforms rely heavily on the 1-to-5 star scale. However, a 3-star review might contain glowing praise for a product but a minor complaint about shipping, or vice versa. Human readers can parse this distinction, but at scale, it becomes impossible for business owners to read every single comment."
      },
      {
        type: "quote",
        content: "TrueLency's AI doesn't just count stars; it reads the emotional temperature of the text, identifying specific pain points and delight factors that simple averaging misses."
      },
      {
        type: "heading",
        content: "Detecting Review Bombing"
      },
      {
        type: "paragraph",
        content: "One of the most critical features of our platform is the ability to detect anomalous patterns that suggest review bombing. Whether it's a coordinated attack from a competitor or a viral social media moment, these spikes in negative sentiment often share linguistic fingerprints."
      },
      {
        type: "list",
        content: [
          "Sudden influx of reviews from new accounts",
          "Repetitive phrasing or copy-pasted text",
          "Reviews that lack specific details about the customer experience",
          "Sentiment that contradicts the numerical rating"
        ]
      },
      {
        type: "callout",
        content: "Did you know? Our data shows that businesses responding to potential review bombing incidents within 4 hours can mitigate long-term reputation damage by up to 60%."
      }
    ]
  },
  {
    id: 2,
    slug: "5-signs-a-business-has-fake-reviews",
    title: "5 Signs a Business Has Fake Reviews",
    excerpt: "Learn the common patterns that indicate a business might be purchasing positive reviews or suppressing negative ones.",
    daysAgo: 8,
    category: "Trust & Transparency",
    readTime: "4 min read",
    content: [
      {
        type: "paragraph",
        content: "Consumers are becoming increasingly skeptical of perfect 5-star records. In fact, a business with a 4.7-star rating often appears more trustworthy than one with a flawless 5.0. But how can you tell if the reviews you're reading are genuine?"
      },
      {
        type: "heading",
        content: "1. The 'Generic Praise' Pattern"
      },
      {
        type: "paragraph",
        content: "Fake reviews often lack detail. Phrases like 'Great service', 'Highly recommended', or 'Best in town' without any specific context about the product or interaction are red flags. Genuine reviews usually mention a specific employee, a specific dish, or a specific problem that was solved."
      },
      {
        type: "heading",
        content: "2. Timing Clusters"
      },
      {
        type: "paragraph",
        content: "If a business receives 20 positive reviews in a single afternoon after months of silence, be wary. This often indicates a paid campaign or a 'review party' where employees or friends are asked to boost the score."
      },
      {
        type: "callout",
        content: "TrueLency visualizes review timing on our dashboard, making these artificial spikes immediately obvious to potential customers."
      },
      {
        type: "heading",
        content: "3. The Language Mismatch"
      },
      {
        type: "paragraph",
        content: "When reviews use marketing jargon or overly formal language that doesn't match the typical customer demographic, it's a sign they may have been written by a PR agency or AI generator."
      },
      {
        type: "list",
        content: [
          "Overuse of the full product name",
          "Unnatural keyword stuffing",
          "Reviews that read like press releases"
        ]
      }
    ]
  },
  {
    id: 3,
    slug: "truelency-platform-update-enhanced-search-filters",
    title: "TrueLency Platform Update: Enhanced Search Filters",
    excerpt: "We've rolled out new ways to filter businesses by trust score, location density, and recent activity metrics.",
    daysAgo: 14,
    category: "Platform Updates",
    readTime: "2 min read",
    content: [
      {
        type: "paragraph",
        content: "We are excited to announce a major update to the TrueLency search experience. Based on user feedback, we've overhauled our filtering engine to help you find trustworthy businesses faster than ever."
      },
      {
        type: "heading",
        content: "Filtering by Trust Score"
      },
      {
        type: "paragraph",
        content: "You can now set a minimum 'Trust Score' threshold for your search results. This score is our proprietary metric that combines review sentiment, recency, and authenticity signals into a single number between 0 and 100."
      },
      {
        type: "quote",
        content: "Our goal is to make the Trust Score the new standard for evaluating business reputation—more nuanced than stars, more reliable than word-of-mouth."
      },
      {
        type: "heading",
        content: "Location Density Heatmaps"
      },
      {
        type: "paragraph",
        content: "For users looking for services in specific neighborhoods, our new density filters allow you to see where high-rated businesses are clustered. This is particularly useful for finding restaurant districts or shopping hubs."
      },
      {
        type: "callout",
        content: "Try out the new filters today by navigating to the Search page and clicking the 'Filters' button next to the search bar."
      }
    ]
  },
  {
    id: 4,
    slug: "why-transparency-is-the-new-marketing-currency",
    title: "Why Transparency is the New Marketing Currency",
    excerpt: "Modern consumers value honesty over perfection. Discover why owning your mistakes can actually build brand loyalty.",
    daysAgo: 21,
    category: "Business Tips",
    readTime: "6 min read",
    content: [
      {
        type: "paragraph",
        content: "In an era of deepfakes and filtered realities, authenticity has become a rare and valuable commodity. Consumers are tired of polished corporate speak; they want to know who they are really doing business with."
      },
      {
        type: "heading",
        content: "The Paradox of Perfection"
      },
      {
        type: "paragraph",
        content: "Psychological studies show that people are more likely to trust a product with a 4.5 rating than a 5.0 rating. Why? Because perfection feels artificial. A few negative reviews, especially when handled gracefully, actually validate the positive ones."
      },
      {
        type: "quote",
        content: "Your mistakes are not liabilities; they are opportunities to demonstrate your character. How you fix a problem says more about your business than the problem itself."
      },
      {
        type: "heading",
        content: "Owning Your Narrative"
      },
      {
        type: "paragraph",
        content: "When a business tries to hide negative feedback, it allows others to control the narrative. By acknowledging issues openly and explaining the steps taken to resolve them, you regain control and show potential customers that you are accountable."
      },
      {
        type: "list",
        content: [
          "Respond to negative reviews publicly and politely",
          "Don't use generic templates for apologies",
          "Follow up with unhappy customers offline",
          "Share 'behind the scenes' content that shows the human side of your business"
        ]
      }
    ]
  },
  {
    id: 5,
    slug: "the-impact-of-response-time-on-customer-retention",
    title: "The Impact of Response Time on Customer Retention",
    excerpt: "Data shows that businesses responding to negative reviews within 24 hours see a 30% higher retention rate.",
    daysAgo: 30,
    category: "Business Tips",
    readTime: "3 min read",
    content: [
      {
        type: "paragraph",
        content: "Speed kills—but in customer service, the lack of speed is what's deadly. We analyzed over 50,000 interactions on the TrueLency platform to understand how response time correlates with customer churn."
      },
      {
        type: "heading",
        content: "The Golden Window: 24 Hours"
      },
      {
        type: "paragraph",
        content: "Our data reveals a stark drop-off in customer sentiment if a complaint isn't addressed within 24 hours. After 48 hours, the likelihood of that customer returning drops by nearly half."
      },
      {
        type: "callout",
        content: "Businesses that respond within the first hour of a negative review often see the customer edit their original review to a higher rating."
      },
      {
        type: "heading",
        content: "Automation vs. Personalization"
      },
      {
        type: "paragraph",
        content: "While speed is crucial, automated responses can backfire if they feel robotic. The winning strategy is 'automated alerts, human response'. Use tools like TrueLency to get notified instantly, but have a real person write the reply."
      },
      {
        type: "list",
        content: [
          "Set up real-time notifications for all 1-3 star reviews",
          "Draft a library of response templates that can be customized quickly",
          "Empower front-line staff to resolve issues without needing manager approval"
        ]
      }
    ]
  },
  {
    id: 6,
    slug: "decoding-the-trust-score-how-we-calculate-it",
    title: "Decoding the Trust Score: How We Calculate It",
    excerpt: "A deep dive into the 15+ signals we analyze to generate the TrueLency Trust Score for every business profile.",
    daysAgo: 45,
    category: "Trust & Transparency",
    readTime: "7 min read",
    content: [
      {
        type: "paragraph",
        content: "The TrueLency Trust Score isn't just a random number. It's the result of complex algorithmic analysis designed to give you a true picture of a business's health. Here is a look under the hood."
      },
      {
        type: "heading",
        content: "Signal 1: Review Velocity"
      },
      {
        type: "paragraph",
        content: "We track the rate at which new reviews are posted. Sudden spikes or long droughts can indicate manipulation or inactivity, both of which impact the score negatively."
      },
      {
        type: "heading",
        content: "Signal 2: Sentiment Consistency"
      },
      {
        type: "paragraph",
        content: "Does the text of the review match the star rating? If a user leaves 5 stars but writes 'food was cold and service was slow', our AI flags this inconsistency. High consistency across reviews boosts the Trust Score."
      },
      {
        type: "quote",
        content: "We believe that a 4.2 score based on consistent, verified feedback is worth more than a 4.9 score based on dubious data."
      },
      {
        type: "heading",
        content: "Signal 3: Response Rate"
      },
      {
        type: "paragraph",
        content: "Active engagement matters. We measure what percentage of reviews (both positive and negative) receive a response from the business owner. High engagement is a strong signal of a trustworthy business."
      },
      {
        type: "list",
        content: [
          "Review source diversity (Google, Yelp, Facebook, etc.)",
          "Reviewer account age and history",
          "Semantic complexity of review text",
          "Frequency of business information updates"
        ]
      }
    ]
  }
];

export function getBlogPostById(id: number): BlogPost | undefined {
  return blogPosts.find(post => post.id === id);
}

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find(post => post.slug === slug);
}