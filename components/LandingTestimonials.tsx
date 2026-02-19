import { Star, Sparkles } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "./Avatar";
import styles from "./LandingTestimonials.module.css";

interface Props {
  className?: string;
}

const testimonials = [
  {
    name: "Sarah Mitchell",
    title: "Small Business Owner",
    avatar: "https://i.pravatar.cc/150?img=32",
    fallback: "SM",
    quote:
      "TrueLency helped me understand what customers really think about my competitors. The AI insights are incredibly accurate.",
  },
  {
    name: "James Rodriguez",
    title: "Marketing Director",
    avatar: "https://i.pravatar.cc/150?img=12",
    fallback: "JR",
    quote:
      "We use TrueLency to monitor brand sentiment across all our locations. The trust scores have become our north star metric.",
  },
  {
    name: "Emily Chen",
    title: "Startup Founder",
    avatar: "https://i.pravatar.cc/150?img=47",
    fallback: "EC",
    quote:
      "Before making any partnership decision, I check TrueLency. The review intelligence feature saved us from a bad deal.",
  },
];

export const LandingTestimonials = ({ className }: Props) => {
  return (
    <section className={`${styles.container} ${className || ""}`}>
      <div className={styles.sectionLabel}>
        <Sparkles size={14} className={styles.sectionLabelIcon} />
        <span className={styles.sectionLabelText}>TESTIMONIALS</span>
      </div>
      <h2 className={styles.sectionTitle}>Trusted by Businesses</h2>
      <p className={styles.sectionSubtitle}>
        See what our users have to say about TrueLency
      </p>

      <div className={styles.testimonialsGrid}>
        {testimonials.map((testimonial) => (
          <div key={testimonial.name} className={styles.testimonialCard}>
            <div className={styles.starsWrapper}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={16}
                  fill="var(--warning)"
                  color="var(--warning)"
                />
              ))}
            </div>

            <p className={styles.quote}>"{testimonial.quote}"</p>

            <div className={styles.author}>
              <Avatar className={styles.avatar}>
                <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                <AvatarFallback>{testimonial.fallback}</AvatarFallback>
              </Avatar>
              <div className={styles.authorInfo}>
                <div className={styles.authorName}>{testimonial.name}</div>
                <div className={styles.authorTitle}>{testimonial.title}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};