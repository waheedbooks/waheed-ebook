import { Link } from "react-router-dom";
import LegalLayout from "../components/LegalLayout";
import { SITE, PHONE_LINK } from "../siteConfig";

export default function ShippingPolicy() {
  return (
    <LegalLayout
      title={"Shipping, Exchange & Cancellation Policy"}
      updated={SITE.lastUpdated}
    >
      <section className="legal-section">
        <p>
          All products sold on {SITE.name} are digital ebooks that are read online in
          your account. This page explains how delivery (shipping), complaints,
          cancellations, exchanges, returns and refunds work.
        </p>
        <div className="legal-table-wrap">
          <table className="legal-table">
            <tbody>
              <tr>
                <th>Delivery time</th>
                <td>{SITE.deliveryTime}</td>
              </tr>
              <tr>
                <th>Order cancellation</th>
                <td>Within {SITE.cancellationWindow} of placing the order</td>
              </tr>
              <tr>
                <th>Refund processing</th>
                <td>Within {SITE.refundTurnaround} of approval</td>
              </tr>
              <tr>
                <th>Complaint response</th>
                <td>
                  Acknowledged within {SITE.complaintAcknowledge}, resolved within{" "}
                  {SITE.complaintResolve}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="legal-section">
        <h2>1. Shipping and delivery</h2>
        <h3>a. Domestic delivery (within Pakistan)</h3>
        <ol type="i">
          <li>
            Our books are digital, so no courier or physical shipping is used and there
            is no shipping charge.
          </li>
          <li>
            After your payment is confirmed, the book appears in{" "}
            <Link to="/library">My Library</Link> in your account and you can start
            reading straight away. Delivery is {SITE.deliveryTime}. This timeline is
            tentative and we are not liable for delays caused by events outside our
            reasonable control, such as a delay in payment confirmation by a bank or
            payment provider.
          </li>
        </ol>
        <h3>b. International delivery (outside Pakistan)</h3>
        <ol type="i">
          <li>
            Customers outside Pakistan receive their books in exactly the same way, as
            online access in their account. No courier is used, so there are no customs
            duties, import taxes or international shipping fees.
          </li>
          <li>
            Delivery is {SITE.deliveryTime}, however this might take longer due to
            circumstances outside of our control and we shall not be held liable for any
            such delays. Your bank may apply currency conversion or foreign transaction
            charges to the payment.
          </li>
        </ol>
        <p>
          You need an internet connection and a registered, verified account to read
          your books. If your book is not in My Library within 24 hours of a successful
          payment, contact us and we will fix it or refund you.
        </p>
      </section>

      <section className="legal-section" id="complaints">
        <h2>2. Complaints</h2>
        <p>
          For any complaints or queries in relation to this website, our products or
          service, you can contact us on{" "}
          <a href={`tel:${PHONE_LINK}`}>{SITE.phone}</a> or on{" "}
          <a href={`mailto:${SITE.email}`}>{SITE.email}</a>. We shall use our best
          endeavours to respond to your complaints or queries within{" "}
          {SITE.complaintAcknowledge} of receipt and to resolve them within{" "}
          {SITE.complaintResolve}. In case of a complaint about a book that is
          defective, will not open or is not the book you ordered, please share proper
          evidence such as your payment receipt, screenshots or screen recordings. See
          our <Link to="/contact">Contact page</Link> for the full process.
        </p>
      </section>

      <section className="legal-section">
        <h2>3. Cancellations</h2>
        <ul>
          <li>
            You may cancel any order within {SITE.cancellationWindow} of placing it,
            provided you have not opened the book in the reader. After this period,
            cancellation requests are not entertained, but you may still request a
            refund if you are eligible under our{" "}
            <Link to="/refund-policy">Refund &amp; Return Policy</Link>.
          </li>
          <li>
            You can also cancel at any time at checkout before you complete payment; if
            you cancel on the payment page you are not charged.
          </li>
          <li>
            To cancel a paid order, email{" "}
            <a href={`mailto:${SITE.email}`}>{SITE.email}</a> or call{" "}
            <a href={`tel:${PHONE_LINK}`}>{SITE.phone}</a> with your name, account email
            and book title. A cancelled order is refunded within{" "}
            {SITE.refundTurnaround}.
          </li>
          <li>
            We may cancel an order and refund you in full if the book becomes
            unavailable, a pricing error is found, or we suspect fraud.
          </li>
        </ul>
      </section>

      <section className="legal-section">
        <h2>4. Exchanges</h2>
        <p>
          Because the books are digital and linked to your account, we operate a no
          exchange policy except in these cases:
        </p>
        <ul>
          <li>
            You bought the wrong book by mistake. Contact us within{" "}
            {SITE.cancellationWindow} of purchase, before opening the book in the
            reader, and we will exchange it for the book you intended (paying any price
            difference) or refund you.
          </li>
          <li>
            The book you received is different from what you ordered, or has a technical
            problem. We will fix it or give you a working copy of the same title at no
            extra cost.
          </li>
        </ul>
      </section>

      <section className="legal-section">
        <h2>5. Returns and refunds</h2>
        <p>
          There are no physical returns because nothing is shipped. When a refund is
          approved, your access to the book is withdrawn. We operate a no refund policy
          except where the book you receive is different from what you ordered, is
          defective or cannot be opened, you were charged twice or an incorrect amount,
          or you contact us within {SITE.cancellationWindow} of purchase before opening
          the book. Approved refunds are processed within {SITE.refundTurnaround} to the
          original payment method. Full details are in our{" "}
          <Link to="/refund-policy">Refund &amp; Return Policy</Link>.
        </p>
      </section>
    </LegalLayout>
  );
}
