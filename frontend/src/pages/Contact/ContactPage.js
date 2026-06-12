import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useAuth } from "../../hooks/useAuth";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { getAllFaqs } from "../../services/faqService";
import Input from "../../components/Input/Input";
import InputContainer from "../../components/InputContainer/InputContainer";
import classes from "./contactPage.module.css";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MESSAGE_MAX = 2000;
const SUPPORT_EMAIL = "support@footprint.example";

export default function ContactPage() {
  const { user } = useAuth();
  const titlePrefix = user?.isAdmin ? "Footprint Admin" : "Footprint";
  useDocumentTitle(`${titlePrefix} · Contact`);

  const [faqs, setFaqs] = useState(null);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    getAllFaqs()
      .then(setFaqs)
      .catch(() => setFaqs([]));
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const messageValue = watch("message", "");

  const submit = async (data) => {
    await new Promise((r) => setTimeout(r, 250));
    toast.success("Message sent. We'll get back to you soon.");
    reset();
    setSent(true);
    // eslint-disable-next-line no-console
    console.log("[contact form — not sent]", data);
  };

  return (
    <div className={classes.page}>
      <header className={classes.heading}>
        <h1>Contact us</h1>
        <p className={classes.lede}>
          Got a question about an order, a product, or sizing? Send us a note and
          we'll get back to you within one business day.
        </p>
      </header>

      <div className={classes.grid}>
        <section className={classes.card}>
          <h2 className={classes.cardTitle}>Send a message</h2>
          {user?.isAdmin && (
            <div className={classes.adminNote}>
              You're signed in as an admin — this form is a customer-only feature.
              Use the section on the right to manage FAQ content.
            </div>
          )}
          {sent && (
            <div className={classes.sentBanner} role="status">
              <span className={classes.sentCheck} aria-hidden>✓</span>
              <div>
                <div className={classes.sentTitle}>Thanks — your message is in.</div>
                <div className={classes.sentHint}>
                  We'll reply to the email you provided within one business day.{" "}
                  <button
                    type="button"
                    className={classes.sentDismiss}
                    onClick={() => setSent(false)}
                  >
                    Send another
                  </button>
                </div>
              </div>
            </div>
          )}
          <form
            className={classes.form}
            onSubmit={handleSubmit(submit)}
            onChange={() => sent && setSent(false)}
            noValidate
          >
            <Input
              label="Your name"
              type="text"
              {...register("name", { required: true, minLength: 2 })}
              error={errors.name}
            />
            <Input
              label="Email"
              type="email"
              {...register("email", {
                required: true,
                pattern: { value: EMAIL_RE, message: "Enter a valid email" },
              })}
              error={errors.email}
            />
            <Input
              label="Subject"
              type="text"
              {...register("subject", { required: true, minLength: 3 })}
              error={errors.subject}
            />
            <InputContainer
              label={
                <span className={classes.messageLabel}>
                  <span>Message</span>
                  <span
                    className={`${classes.charCount} ${
                      messageValue.length >= MESSAGE_MAX ? classes.charCountMax : ""
                    }`}
                  >
                    {messageValue.length} / {MESSAGE_MAX}
                  </span>
                </span>
              }
            >
              <textarea
                className={classes.textarea}
                rows={6}
                maxLength={MESSAGE_MAX}
                placeholder="Tell us how we can help…"
                {...register("message", { required: true, minLength: 10 })}
              />
              {errors.message && (
                <div className={classes.textareaError}>
                  {errors.message.message || "Please add a short message"}
                </div>
              )}
            </InputContainer>

            <div className={classes.actions}>
              <button type="submit" className={classes.submitBtn} disabled={isSubmitting}>
                {isSubmitting ? "Sending…" : "Send message"}
              </button>
            </div>
            <p className={classes.disclaimer}>
              This is a demo form — submissions aren't actually delivered anywhere. You
              can also email us at{" "}
              <a href={`mailto:${SUPPORT_EMAIL}`} className={classes.mailto}>
                {SUPPORT_EMAIL}
              </a>
              .
            </p>
          </form>
        </section>

        <section className={classes.card}>
          <div className={classes.faqHeader}>
            <h2 className={classes.cardTitle}>Frequently asked</h2>
            {user?.isAdmin && (
              <Link to="/faq/add" className={classes.addFaqLink}>+ Add FAQ</Link>
            )}
          </div>

          {!faqs ? (
            <div className={classes.placeholder}>Loading…</div>
          ) : faqs.length === 0 ? (
            <div className={classes.placeholder}>
              No FAQs yet.{" "}
              {user?.isAdmin && (
                <Link to="/faq/add" className={classes.inlineLink}>
                  Add the first one
                </Link>
              )}
            </div>
          ) : (
            <ul className={classes.faqList}>
              {faqs.map((f) => (
                <li key={f._id} className={classes.faqItem}>
                  <details>
                    <summary className={classes.faqSummary}>
                      <span className={classes.faqQuestion}>{f.question}</span>
                      <span className={classes.faqChevron} aria-hidden>›</span>
                    </summary>
                    <div className={classes.faqAnswer}>{f.answer}</div>
                    {user?.isAdmin && (
                      <div className={classes.faqAdminRow}>
                        <Link to={`/faqs/${f._id}`} className={classes.editFaqLink}>
                          Edit
                        </Link>
                      </div>
                    )}
                  </details>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
