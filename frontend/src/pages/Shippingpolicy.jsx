import { Link } from "react-router-dom";
import LegalLayout from "../components/LegalLayout";
import { SITE } from "../siteConfig";

export default function ShippingPolicy() {
  return (
    <LegalLayout
      title={"Shipping, Exchange & Cancellation Policy"}
      updated={SITE.lastUpdated}
    >
      <section className="legal-section">
        <p>
          All products sold on {SITE.name} are digital ebooks. This page explains how
          delivery, exchanges, returns, refunds and order cancellations work.
        </p>
      </section>

      <section className="legal-section">
        <h2>1. Shipping and delivery</h2>
        <ul>
          <li>
            There is no physical shipping and no shipping charge. Nothing is sent by
            post or courier.
          </li>
          <li>
            Your book is delivered digitally. After your payment is confirmed, the
            book appears in <Link to="/library">My Library</Link> in your account and
            you can start reading straight away in the online reader.
          </li>
          <li>
            Delivery is normally instant. In rare cases payment confirmation can take
            a few minutes. If your book is not in My Library within 24 hours of a
            successful payment, please contact us and we will fix it or refund you.
          </li>
          <li>
            You need an internet connection and a registered, verified account to
            read your books. Books are available worldwide.
          </li>
        </ul>
      </section>

      <section className="legal-section">
        <h2>2. Exchange policy</h2>
        <p>
          Because the books are digital and access is linked to your account, we do
          not offer exchanges for a different title after you have started reading.
          If you bought the wrong book by mistake, contact us within 24 hours of
          purchase and before opening it in the reader, and we will either exchange it
          for the book you intended or refund you.
        </p>
        <p>
          If a book has a technical problem, we will fix it or provide a working copy
          of the same title at no extra cost.
        </p>
      </section>

      <section className="legal-section">
        <h2>3. Return policy</h2>
        <p>
          There are no physical returns. When a refund is approved, your access to the
          book is withdrawn. Full details are in our{" "}
          <Link to="/refund-policy">Refund &amp; Return Policy</Link>.
        </p>
      </section>

      <section className="legal-section">
        <h2>4. Refund policy</h2>
        <p>
          Refunds are available for duplicate charges, failed delivery, unreadable
          content and incorrect amounts, as explained in the{" "}
          <Link to="/refund-policy">Refund &amp; Return Policy</Link>. Approved refunds
          are processed within {SITE.refundTurnaround} to the original payment method.
        </p>
      </section>

      <section className="legal-section">
        <h2>5. Cancellation of orders</h2>
        <ul>
          <li>
            You can cancel at checkout at any time before you complete the payment.
            If you cancel on the payment page, you are not charged.
          </li>
          <li>
            Once payment is complete and the book has been delivered to My Library,
            the order cannot be cancelled, but you may request a refund if you are
            eligible under our <Link to="/refund-policy">Refund &amp; Return Policy</Link>.
          </li>
          <li>
            If you want to cancel right after paying and before opening the book,
            contact us within 24 hours and we will cancel the order and refund you.
          </li>
          <li>
            We may cancel an order and refund you in full if the book becomes
            unavailable, a pricing error is found, or we suspect fraud.
          </li>
        </ul>
      </section>

      <section className="legal-section">
        <h2>6. Need help?</h2>
        <p>
          Contact us at <a href={`mailto:${SITE.email}`}>{SITE.email}</a> or visit our{" "}
          <Link to="/contact">Contact page</Link>.
        </p>
      </section>
    </LegalLayout>
  );
}
