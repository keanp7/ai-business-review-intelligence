import React, { useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  ChevronLeft, 
  Calendar, 
  Clock, 
  ArrowRight, 
  Info,
  Tag 
} from "lucide-react";
import { Button } from "../components/Button";
import { Helmet } from "react-helmet";
import { 
  getBlogPostBySlug, 
  getRelativeDate, 
  blogPosts,
  ContentSection 
} from "../helpers/blogPosts";
import styles from "./blog.$blogId.module.css";

export default function BlogPostPage() {
  const { blogId } = useParams<{ blogId: string }>();
  const navigate = useNavigate();
  
  // Find the post
  const post = blogId ? getBlogPostBySlug(blogId) : undefined;
  
  // Scroll to top on mount or when post changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [blogId]);

  if (!post) {
    return (
      <div className={styles.container}>
        <Helmet>
          <title>Post Not Found | TrueLency Blog</title>
        </Helmet>
        <div className={styles.notFoundContainer}>
          <h1 className={styles.notFoundTitle}>Post not found</h1>
          <p className={styles.notFoundText}>
            The blog post you are looking for doesn't exist or has been moved.
          </p>
          <Button asChild variant="primary">
            <Link to="/blog">Return to Blog</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Get related posts (same category, excluding current post)
  const relatedPosts = blogPosts
    .filter(p => p.category === post.category && p.id !== post.id)
    .slice(0, 2);

  const renderContentSection = (section: ContentSection, index: number) => {
    switch (section.type) {
      case "heading":
        return <h2 key={index} className={styles.heading}>{section.content}</h2>;
      
      case "paragraph":
        return <p key={index} className={styles.paragraph}>{section.content}</p>;
      
      case "list":
        return (
          <ul key={index} className={styles.list}>
            {Array.isArray(section.content) && section.content.map((item, i) => (
              <li key={i} className={styles.listItem}>{item}</li>
            ))}
          </ul>
        );
      
      case "quote":
        return (
          <blockquote key={index} className={styles.quote}>
            "{section.content}"
          </blockquote>
        );
      
      case "callout":
        return (
          <div key={index} className={styles.callout}>
            <Info size={24} className={styles.calloutIcon} />
            <p className={styles.calloutText}>{section.content}</p>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
      <Helmet>
        <title>{post.title} | TrueLency Blog</title>
        <meta name="description" content={post.excerpt} />
      </Helmet>

      <div className={styles.backButtonWrapper}>
        <Button asChild variant="ghost" className={styles.backButton}>
          <Link to="/blog">
            <ChevronLeft size={16} />
            Back to Blog
          </Link>
        </Button>
      </div>

      <article className={styles.articleCard}>
        <header className={styles.header}>
          <div className={styles.metaRow}>
            <span className={styles.categoryBadge}>
              {post.category}
            </span>
            <span className={styles.date}>
              <Calendar size={14} />
              {getRelativeDate(post.daysAgo)}
            </span>
            <span className={styles.readTime}>
              <Clock size={14} />
              {post.readTime}
            </span>
          </div>
          <h1 className={styles.title}>{post.title}</h1>
        </header>

        <div className={styles.content}>
          {post.content.map((section, index) => renderContentSection(section, index))}
        </div>
      </article>

      {relatedPosts.length > 0 && (
        <div className={styles.relatedSection}>
          <h3 className={styles.relatedTitle}>Related Articles</h3>
          <div className={styles.relatedGrid}>
            {relatedPosts.map(related => (
              <Link to={`/blog/${related.slug}`} key={related.id} className={styles.relatedCard}>
                <div className={styles.relatedCardHeader}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500, color: 'var(--primary)' }}>
                    <Tag size={12} />
                    {related.category}
                  </span>
                  <span>{related.readTime}</span>
                </div>
                <h4 className={styles.relatedCardTitle}>{related.title}</h4>
                <div className={styles.relatedReadMore}>
                  Read article <ArrowRight size={14} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}