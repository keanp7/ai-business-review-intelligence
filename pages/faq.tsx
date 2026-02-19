import React from "react";
import { useI18n } from "../helpers/i18n";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/Accordion";
import { Separator } from "../components/Separator";
import { Mail, ShieldCheck } from "lucide-react";
import styles from "./faq.module.css";

const VERIFICATION_FAQS = [
  {
    q: "Why does TrueLency require verification?",
    a: "Verification protects business owners from unauthorized claims, prevents fraud, and ensures the integrity of reviews and insights on our platform. It's a critical step in maintaining trust across the TrueLency ecosystem.",
  },
  {
    q: "Can someone add a business before creating an account?",
    a: "Yes — anyone can submit a business listing to TrueLency without an account. However, to claim ownership of a business, you must create an account and complete our verification process. This ensures that only authorized individuals can manage a business profile.",
  },
  {
    q: "What qualifies as a Business Registration Document?",
    a: "Accepted documents include: LLC filing certificates, Articles of Organization, DBA (Doing Business As) registrations, and Incorporation certificates. The document must clearly show the business name and registered owner.",
  },
  {
    q: "What qualifies as Official Business Email Verification?",
    a: "A domain-based email address (e.g., info@yourbusiness.com) qualifies as proof of business association. Free email providers such as Gmail, Yahoo, or Outlook do not qualify on their own — additional supporting documentation is required. For single-owner LLCs, a domain email linked to their registered business is sufficient.",
  },
  {
    q: "What qualifies as Domain Ownership Proof?",
    a: "You can provide a WHOIS record lookup or a screenshot of your domain registrar dashboard (e.g., GoDaddy, Namecheap, Cloudflare) showing that you control the domain associated with the business.",
  },
  {
    q: "What qualifies as Payment Processor Proof?",
    a: "A screenshot from your Stripe, PayPal Business, or Square dashboard showing your registered business name. The screenshot should clearly display the business name as it appears on TrueLency.",
  },
  {
    q: "What qualifies as Platform Admin Proof?",
    a: "A screenshot of your admin or seller dashboard on platforms like Shopify, Amazon Seller Central, or Etsy showing your store name. The store name should match the business listing on TrueLency.",
  },
  {
    q: "What qualifies as a Government Tax ID Document?",
    a: "An IRS EIN (Employer Identification Number) confirmation letter or an official tax registration document from your local or national government that displays the business name and tax identification number.",
  },
  {
    q: "What is Signed Ownership Declaration + ID?",
    a: "When other forms of proof are unavailable, you may submit a signed statement declaring your ownership of the business, accompanied by a copy of a government-issued photo ID (e.g., driver's license or passport). This option is reviewed manually and may take additional time.",
  },
];

export default function FaqPage() {
  const { t } = useI18n();

  const faqItems = [1, 2, 3, 4, 5, 6];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>{t("faq.title")}</h1>
        <p className={styles.subtitle}>{t("faq.subtitle")}</p>
      </div>

      <div className={styles.content}>
        <Accordion type="single" collapsible className={styles.accordion}>
          {faqItems.map((num) => (
            <AccordionItem key={num} value={`item-${num}`}>
              <AccordionTrigger className={styles.question}>
                {t(`faq.q${num}`)}
              </AccordionTrigger>
              <AccordionContent className={styles.answer}>
                {t(`faq.a${num}`)}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <div className={styles.verificationSection}>
        <div className={styles.verificationCard}>
          <div className={styles.verificationHeader}>
            <div className={styles.shieldIconWrapper}>
              <ShieldCheck size={28} />
            </div>
            <div className={styles.verificationHeaderText}>
              <h2>Business Claim & Verification FAQ</h2>
              <p>Everything you need to know about claiming and verifying your business on TrueLency</p>
            </div>
          </div>

          <Accordion type="single" collapsible className={styles.accordion}>
            {VERIFICATION_FAQS.map((item, index) => (
              <AccordionItem key={index} value={`verification-${index}`} className={styles.verificationItem}>
                <AccordionTrigger className={styles.question}>
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className={styles.answer}>
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className={styles.verificationFooter}>
            <Separator className={styles.footerSeparator} />
            <div className={styles.trustStatement}>
              <ShieldCheck size={16} />
              <span>Verification protects real businesses and ensures transparency across the platform.</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.support}>
        <div className={styles.supportCard}>
          <div className={styles.iconWrapper}>
            <Mail size={24} />
          </div>
          <h3>Still have questions?</h3>
          <p>Can't find the answer you're looking for? Please chat to our friendly team.</p>
          <a href="mailto:support@truelency.com" className={styles.emailLink}>
            support@truelency.com
          </a>
        </div>
      </div>
    </div>
  );
}