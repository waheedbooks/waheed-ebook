import { Link } from "react-router-dom";
import LegalLayout from "../components/LegalLayout";
import { SITE, PHONE_LINK } from "../siteConfig";

export default function Terms() {
  return (
    <LegalLayout title={"Terms and Conditions"} updated={SITE.lastUpdated}>
      <section className="legal-section">
        <h2>1. Introduction</h2>
        <ol type="a">
          <li>
            This website is owned and operated by {SITE.legalName}, a business based in
            Pakistan (hereinafter and throughout this website referred to as “we”, “us”
            and “our”). Our legal business name is {SITE.legalName}. Our registered
            business address and our office address is: {SITE.address}.
          </li>
          <li>
            We offer this website, including all information, tools, products and
            services available from this website to you, the user, conditioned upon
            your acceptance of all terms, conditions, policies and notices stated here.
          </li>
          <li>
            If you have any problems placing your order on our website, or require
            support after placing an order through our website, please contact us by
            calling us on <a href={`tel:${PHONE_LINK}`}>{SITE.phone}</a> or send us an
            email on <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
          </li>
        </ol>
      </section>

      <section className="legal-section">
        <h2>2. Applicability and Updates</h2>
        <ol type="a">
          <li>
            By visiting our site and/or purchasing something from us, you engage in our
            “Service” and agree to be bound by the following terms and conditions
            (“Terms and Conditions”), including those additional terms and conditions
            and policies referenced herein and/or available by hyperlink. These Terms
            and Conditions apply to all users of the site, including without limitation
            users who are browsers, customers and/or contributors of content.
          </li>
          <li>
            In consideration of your use of our website and services, you represent
            that you are of legal age to form a binding contract and are not a person
            barred from receiving products and services under the laws of Pakistan or
            other applicable jurisdiction.
          </li>
          <li>
            We may need to update our Terms and Conditions from time to time, each time
            you place an order on our website you will be agreeing to the latest
            version of our Terms and Conditions.
          </li>
        </ol>
      </section>

      <section className="legal-section">
        <h2>3. Terms of Usage</h2>
        <ol type="a">
          <li>
            You are prohibited from using this website or its content:
            <ul>
              <li>for any unlawful purpose;</li>
              <li>to solicit others to perform or participate in any unlawful acts;</li>
              <li>
                to violate any international, federal, provincial or state laws,
                regulations and rules;
              </li>
              <li>
                to infringe upon or violate our intellectual property rights or the
                intellectual property rights of others;
              </li>
              <li>
                to harass, abuse, insult, harm, defame, slander, disparage, intimidate,
                or discriminate based on gender, sexual orientation, religion,
                ethnicity, race, age, national origin, or disability;
              </li>
              <li>to submit false or misleading information;</li>
              <li>
                to upload or transmit viruses or any other type of malicious code that
                will or may be used in any way that will affect the functionality or
                operation of the service or interfere with or circumvent the security
                features of our service, any related website, other websites, or the
                internet;
              </li>
              <li>
                to collect or track the personal information of others or spam, phish,
                pharm, pretext, spider, crawl, or scrape; or
              </li>
              <li>for any obscene or immoral purpose.</li>
            </ul>
          </li>
          <li>
            We reserve the right to terminate your use of the Service or any related
            website for violating any of the prohibited uses.
          </li>
        </ol>
      </section>

      <section className="legal-section">
        <h2>4. Intellectual Property</h2>
        <p>
          This website and its related software and content (including books, text,
          images and designs) are the intellectual property of and are exclusively
          owned by us. The structure, organization, and code of the website and its
          related software contain valuable trade secrets and confidential information
          of {SITE.owner}. Except as expressly stated herein, these terms and
          conditions do not grant you any intellectual property rights whatsoever in
          the website and its related software and all rights are reserved by{" "}
          {SITE.owner}.
        </p>
      </section>

      <section className="legal-section">
        <h2>5. Digital Products and Licence</h2>
        <ol type="a">
          <li>
            We sell textbooks in digital form. After purchase you receive a personal,
            non-exclusive, non-transferable licence to read the book online through your
            account. Books are read-only inside our online reader and are not sold as
            downloadable files. Ownership of the content does not pass to you.
          </li>
          <li>
            You must not copy, reproduce, photograph, screenshot, print, record,
            distribute, resell or publish any book content, or share your login details
            or give anyone else access to your account.
          </li>
          <li>
            Book pages in the reader are marked with your name and email address so that
            any unauthorised sharing can be traced. If you break these rules we may
            suspend or close your account without refund and take legal action.
          </li>
        </ol>
      </section>

      <section className="legal-section">
        <h2>6. Prices, Payment and Delivery</h2>
        <ol type="a">
          <li>
            Prices are shown on each book page in the currency stated there and are the amount you pay at checkout. Prices and
            discounts may change at any time; a change does not affect completed
            orders.
          </li>
          <li>
            Payments are processed securely by our payment partner, Safepay. We do not
            see or store your full card, wallet or bank details.
          </li>
          <li>
            A purchase is complete only after your payment is confirmed. Books are
            delivered digitally: once payment is confirmed, the book appears in My
            Library in your account. Nothing is shipped.
          </li>
        </ol>
      </section>

      <section className="legal-section">
        <h2>7. Refunds, Returns, Exchanges and Cancellations</h2>
        <p>
          Our <Link to="/refund-policy">Refund &amp; Return Policy</Link> and our{" "}
          <Link to="/shipping-policy">Shipping, Exchange &amp; Cancellation Policy</Link>{" "}
          form part of these Terms and Conditions. Approved refunds are processed within{" "}
          {SITE.refundTurnaround}.
        </p>
      </section>

      <section className="legal-section">
        <h2>8. Indemnity and Limitation of Liability</h2>
        <ol type="a">
          <li>
            You agree to indemnify us, defend and hold us harmless and our affiliates,
            partners, agents, contractors, licensors, service providers, subcontractors,
            suppliers and employees, harmless from any claim or demand, including
            reasonable attorneys’ fees, made by any third-party due to or arising out of
            your breach of these Terms and Conditions or the documents they incorporate
            by reference, or your violation of any law or the rights of a third-party.
          </li>
          <li>
            Neither we nor any third parties provide any warranty or guarantee as to the
            accuracy, timeliness, performance, completeness or suitability of the
            information and materials found or offered on this website for any
            particular purpose. You acknowledge that such information and materials may
            contain inaccuracies or errors and we expressly exclude liability for any
            such inaccuracies or errors to the fullest extent permitted by law.
          </li>
          <li>
            Your use of any information or materials on this website is entirely at your
            own risk, for which we shall not be liable. It shall be your own
            responsibility to ensure that any products, services or information
            available through this website meet your specific requirements.
          </li>
          <li>
            To the extent permitted by law, we also disclaim all warranties, whether
            express or implied, including the implied warranties of merchantability,
            fitness for a particular purpose, title and non-infringement.
          </li>
          <li>
            We reserve the right to not process an order that you place on our website.
            This is usually for the following reasons:
            <ul>
              <li>The book you ordered is no longer available.</li>
              <li>There is a pricing error or we suspect fraudulent activity.</li>
              <li>Any reason outside of our control.</li>
            </ul>
            If an order is not processed after payment, you will be refunded in full.
          </li>
        </ol>
      </section>

      <section className="legal-section">
        <h2>9. Termination</h2>
        <p>
          We may immediately change or terminate your access to our products, services
          and this website, or any online membership(s) with us, with or without notice,
          at any time, without liability to you, any other user or any third party. We
          reserve the right to terminate your access if, without limitation, you have:
          (1) provided us with false or misleading registration information; (2)
          interfered with other users or the administration of our services or websites;
          (3) upon a request by law enforcement or other governmental authorities; or
          (4) otherwise violated these Terms and Conditions.
        </p>
      </section>

      <section className="legal-section">
        <h2>10. Severability and Waiver</h2>
        <p>
          If any portion of these terms is found to be unenforceable, the unenforceable
          portion will be deemed amended to the minimum extent necessary to make it
          enforceable, and if it can't be made enforceable, then it will be severed and
          the remaining portion will remain in full force and effect. If we fail to
          enforce any of these terms, it will not be considered a waiver. Any amendment
          to or waiver of these terms must be made in writing and signed by us.
        </p>
      </section>

      <section className="legal-section">
        <h2>11. Privacy and Complaints</h2>
        <p>
          How we collect and use your personal data is explained in our{" "}
          <Link to="/privacy">Privacy Policy</Link>. If you have a complaint, please
          follow the process on our <Link to="/contact">Contact page</Link>. We aim to
          acknowledge complaints within {SITE.complaintAcknowledge} and resolve them
          within {SITE.complaintResolve}.
        </p>
      </section>

      <section className="legal-section">
        <h2>12. Governing Law</h2>
        <p>
          Our Terms and Conditions are governed by the laws of the Islamic Republic of
          Pakistan and you agree that the courts of Karachi (including any consumer
          court) will have exclusive jurisdiction in any dispute that you have with us.
        </p>
      </section>
    </LegalLayout>
  );
}
