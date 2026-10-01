import { Link } from "react-router-dom";
import LegalLayout from "../components/LegalLayout";
import { SITE, PHONE_LINK } from "../siteConfig";

export default function Contact() {
  return (
    <LegalLayout title="Contact Us" updated={SITE.lastUpdated}>
      <section className="legal-section">
        <p>
          Have a question about a book, your account, a payment or a refund? Get in
          touch with us using the details below. {SITE.name} is a business based in
          Pakistan. Calling from outside Pakistan? The phone number below is in
          international format, so you can dial it as shown.
        </p>

        <div className="legal-contact-card">
          <div className="legal-contact-row">
            <span className="legal-contact-label">Business</span>
            <span>
              {SITE.name} — {SITE.owner}
            </span>
          </div>
          <div className="legal-contact-row">
            <span className="legal-contact-label">Email</span>
            <span>
              <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
            </span>
          </div>
          <div className="legal-contact-row">
            <span className="legal-contact-label">Phone</span>
            <span>
              <a href={`tel:${PHONE_LINK}`}>{SITE.phone}</a>
            </span>
          </div>
          <div className="legal-contact-row">
            <span className="legal-contact-label">Address</span>
            <span>{SITE.address}</span>
          </div>
          <div className="legal-contact-row">
            <span className="legal-contact-label">Hours</span>
            <span>{SITE.supportHours}</span>
          </div>
        </div>
      </section>

      <section className="legal-section" id="complaints">
        <h2>Customer Complaint Handling</h2>
        <p>
          We take every complaint seriously and aim to resolve it fairly and quickly.
          If you are not satisfied with a book, a payment, a refund or any other part
          of our service, please follow the steps below.
        </p>
        <ol>
          <li>
            <strong>Submit your complaint.</strong> Email us at{" "}
            <a href={`mailto:${SITE.email}`}>{SITE.email}</a> or call us on{" "}
            <a href={`tel:${PHONE_LINK}`}>{SITE.phone}</a>. Please include your full
            name, the email address registered on your account, the book title, the
            date of the transaction, and a clear description of the problem. If the
            complaint is about a payment, a book that will not open or incorrect
            content, please also include your payment reference and screenshots or
            other proof so we can investigate quickly.
          </li>
          <li>
            <strong>Acknowledgement.</strong> We will acknowledge your complaint
            within {SITE.complaintAcknowledge} of receiving it and give you a
            reference to follow up on.
          </li>
          <li>
            <strong>Investigation.</strong> We will review your account, order and
            payment records and may contact you if we need more information.
          </li>
          <li>
            <strong>Resolution.</strong> We will resolve your complaint and tell you
            the outcome within {SITE.complaintResolve} of receiving it. Where a
            refund is due, it will be processed as described in our{" "}
            <Link to="/refund-policy">Refund &amp; Return Policy</Link>.
          </li>
          <li>
            <strong>Escalation.</strong> If you are not satisfied with the outcome,
            reply to the same email and ask for your complaint to be escalated. It
            will be reviewed again by the owner, {SITE.owner}, and you will receive a
            final written response.
          </li>
        </ol>
        <p>
          You may also raise a concern about a payment directly with your bank or card
          issuer, or with the payment processor, Safepay.
        </p>
      </section>

      <section className="legal-section">
        <h2>Related policies</h2>
        <div className="legal-links">
          <Link to="/terms">Terms &amp; Conditions</Link>
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/refund-policy">Refund &amp; Return Policy</Link>
          <Link to="/shipping-policy">Shipping, Exchange &amp; Cancellation Policy</Link>
        </div>
      </section>
    </LegalLayout>
  );
}
