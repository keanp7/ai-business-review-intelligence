import React from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, Calendar, ArrowRight, Tag } from "lucide-react";
import { Button } from "../components/Button";
import { blogPosts, getRelativeDate } from "../helpers/blogPosts";
import styles from "./blog.module.css";

export default function BlogPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Button asChild variant="ghost" className={styles.backButton}>
          <Link to="/">
            <ChevronLeft size={16} />
            Back to Home
          </Link>
        </Button>
      </div>

      <div className={styles.heroSection}>
        <h1 className={styles.title}>TrueLency Blog</h1>
        <p className={styles.subtitle}>
          Insights on business reputation, AI analysis, and building trust in the digital age.
        </p>
      </div>

      <div className={styles.grid}>
        {blogPosts.map((post) => (
          <Link
            key={post.id}
            to={`/blog/${post.slug}`}
            className={styles.cardLink}
          >
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={styles.category}>
                  <Tag size={12} />
                  {post.category}
                </span>
                <span className={styles.date}>
                  <Calendar size={12} />
                  {getRelativeDate(post.daysAgo)}
                </span>
              </div>

              <h3 className={styles.cardTitle}>{post.title}</h3>
              <p className={styles.cardExcerpt}>{post.excerpt}</p>

              <div className={styles.cardFooter}>
                <span className={styles.readTime}>{post.readTime}</span>
                <span className={styles.readMore}>
                  Read More <ArrowRight size={14} />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      <div className={styles.newsletterSection}>
        <div className={styles.newsletterCard}>
          <h3>Stay in the loop</h3>
          <p>Get the latest insights delivered directly to your inbox.</p>
          <div className={styles.inputGroup}>
            <input type="email" placeholder="Enter your email" className={styles.emailInput} />
            <Button variant="primary">Subscribe</Button>
          </div>
        </div>
      </div>
    </div>
  );
}