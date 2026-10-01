import { Link } from "react-router-dom";
import LegalLayout from "../components/LegalLayout";
import { SITE, PHONE_LINK } from "../siteConfig";

export default function RefundPolicy() {
  return (
    <LegalLayout title={"Refund & Return Policy"} updated={SITE.lastUpdated}>
      <section className="legal-section">
        <p>
          {SITE.name} sells digital ebooks that are read online inside your account.
          Nothing is shipped to you and nothing physical can be returned, so this
          policy explains when we refund a purchase and how long it takes.
        </p>
        <div className="legal-highlight">
          <strong>Refund turnaround time:</strong> approved refunds are processed
          within <strong>{SITE.refundTurnaround}</strong> of approval and are returned
          to the original payment method. Your bank may take additional time to show
          the amount in your account.
        </div>
      </section>

      <section className="legal-section">
        <h2>1. When you are eligible for a refund</h2>
        <p>We will refund your purchase in any of these cases:</p>
        <ul>
          <li>
            You were charged more than once for the same book (duplicate payment).
          </li>
          <li>
            Your payment was successful but the book did not appear in My Library
            and we could not fix the problem within 3 working days.
          </li>
          <li>
            The book content is unreadable, incomplete or materially different from
            its description, and we could not correct it.
          </li>
          <li>
            You were charged an incorrect amount. We will refund the difference or the
            full amount, as appropriate.
          </li>
          <li>
            You contact us within {SITE.cancellationWindow} of purchase and have not
            opened the book in the reader.
          </li>
        </ul>
      </section>

      <section className="legal-section">
        <h2>2. When a refund is not available</h2>
        <ul>
          <li>
            Once you have opened and read the book in the online reader, because
            digital content cannot be returned.
          </li>
          <li>
            Change of mind after access to the book has been used.
          </li>
          <li>
            Accounts suspended or closed for breaking our{" "}
            <Link to="/terms">Terms &amp; Conditions</Link> (for example sharing
            login details or copying content).
          </li>
        </ul>
      </section>

      <section className="legal-section">
        <h2>3. Returns and exchanges</h2>
        <p>
          Because our books are digital and viewed online, there is no physical item
          to send back. A &quot;return&quot; simply means that we withdraw your access
          to the book when we approve your refund. Exchanges are only offered if you
          bought the wrong book by mistake or the book has a problem; see our{" "}
          <Link to="/shipping-policy">Shipping, Exchange &amp; Cancellation Policy</Link>.
        </p>
      </section>

      <section className="legal-section">
        <h2>4. How to request a refund</h2>
        <ol>
          <li>
            Email <a href={`mailto:${SITE.email}`}>{SITE.email}</a> or call{" "}
            <a href={`tel:${PHONE_LINK}`}>{SITE.phone}</a>.
          </li>
          <li>
            Give your name, your account email, the book title, the date of purchase
            and the reason for your request. Please share proper evidence, such as your
            payment reference or receipt, and screenshots or a screen recording if the
            book is defective or will not open.
          </li>
          <li>
            We will reply within {SITE.complaintAcknowledge} and tell you whether the
            refund is approved.
          </li>
        </ol>
      </section>

      <section className="legal-section">
        <h2>5. Refund processing time</h2>
        <div className="legal-table-wrap">
          <table className="legal-table">
            <tbody>
              <tr>
                <th>Request review</th>
                <td>Within {SITE.complaintAcknowledge} of your request</td>
              </tr>
              <tr>
                <th>Refund processing</th>
                <td>Within {SITE.refundTurnaround} of approval</td>
              </tr>
              <tr>
                <th>Refund method</th>
                <td>Original payment method used at checkout</td>
              </tr>
              <tr>
                <th>Bank / card posting</th>
                <td>
                  May take extra days depending on your bank or card issuer, outside
                  our control
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="legal-section">
        <h2>6. Related information</h2>
        <p>
          See our{" "}
          <Link to="/shipping-policy">Shipping, Exchange &amp; Cancellation Policy</Link>{" "}
          and our <Link to="/contact">Contact page</Link>, which also explains how we
          handle complaints.
        </p>
      </section>
    </LegalLayout>
  );
}
