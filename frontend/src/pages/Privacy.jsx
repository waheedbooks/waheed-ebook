import { Link } from "react-router-dom";
import LegalLayout from "../components/LegalLayout";
import { SITE } from "../siteConfig";

export default function Privacy() {
  return (
    <LegalLayout title="Privacy Policy" updated={SITE.lastUpdated}>
      <section className="legal-section">
        <h2>1. Introduction</h2>
        <ol type="a">
          <li>
            This privacy policy (“Privacy Policy”) applies to the collection and
            processing of personal data (“Personal Data”) by us ({SITE.name}, operated
            by {SITE.owner}) in connection with our website. This Privacy Policy will
            help you understand how we collect and use your Personal Data and what we
            do with it.
          </li>
          <li>
            By visiting our website and/or purchasing something from us, you agree to
            us handling your Personal Data in accordance with this Privacy Policy.
          </li>
        </ol>
      </section>

      <section className="legal-section">
        <h2>2. Personal data that we collect</h2>
        <ol type="a">
          <li>
            Personal Data includes any information about an individual from which that
            person can be identified. It does not include Personal Data where the
            identity has been removed (anonymous data, e.g. your IP Address).
          </li>
          <li>
            Information you may provide us through the website includes:
            <ol type="i">
              <li>
                Contact data, such as your first and last name and email address (and
                your phone number if you contact us by phone).
              </li>
              <li>
                Profile data, such as the username and password that you set to
                establish an online account with us. Your password is stored in
                encrypted (hashed) form and we cannot read it.
              </li>
              <li>
                Communications that we exchange with you, including when you contact us
                with questions or feedback, through the website or email.
              </li>
              <li>
                Transactional data, such as information relating to or needed to
                complete your orders placed through our website including order
                numbers, payment status and transaction history.
              </li>
            </ol>
          </li>
          <li>
            We do not collect or store your card, wallet or bank account details. These
            are entered on the secure page of our payment processor, Safepay.
          </li>
        </ol>
      </section>

      <section className="legal-section">
        <h2>3. How we use your Personal Data</h2>
        <p>We use your Personal Data for the following:</p>
        <ol type="a">
          <li>
            Provide you with the required services and/or products that you order from
            our website, including access to your books.
          </li>
          <li>Respond to your questions or requests.</li>
          <li>Improve our operations.</li>
          <li>Prevent, detect and manage risk against fraud and illegal activities.</li>
          <li>Comply with our financial regulatory and other legal obligations.</li>
          <li>
            Send you service updates, such as account verification and password reset
            emails.
          </li>
          <li>Improve content and website layout.</li>
          <li>Resolve disputes that may arise.</li>
          <li>
            Show your name and email address as a watermark on book pages to help
            protect the books from unauthorised sharing.
          </li>
        </ol>
        <p>We do not sell your Personal Data.</p>
      </section>

      <section className="legal-section">
        <h2>4. Who do we share your Personal Data with?</h2>
        <p>
          To enable us to provide our services to you on our website, we may share your
          information with trusted third parties, such third parties include financial
          institutions, payment processors, verification services, as well as any third
          parties that you have directly authorized to receive your Personal Data.
        </p>
        <p>
          We share Personal Data with third party business partners when this is
          necessary to provide our products and/or services. Examples of third parties
          to whom we may disclose Personal Data for this purpose are banks and payment
          method providers (such as credit card networks) when we provide payment
          processing services through Safepay, and the hosting, database and email
          providers that run this website for us. We may also disclose Personal Data to
          authorities where the law requires us to.
        </p>
      </section>

      <section className="legal-section">
        <h2>5. How we protect your Personal Data</h2>
        <ol type="a">
          <li>
            We make reasonable efforts to ensure a level of security appropriate to the
            risk associated with the processing of Personal Data. We implement access
            control measures (physical and virtual), security protocols, policies and
            standards to ensure that our security infrastructures are in compliance with
            reasonable industry standards. We ensure the maintenance of organizational,
            technical and administrative measures designed to protect Personal Data
            within our organization against unauthorized access, destruction, loss,
            alteration or misuse.
          </li>
          <li>
            We have also put in place procedures to deal with any suspected Personal
            Data breach and will notify you and any applicable regulator of a breach
            where we are legally required to do so.
          </li>
        </ol>
      </section>

      <section className="legal-section">
        <h2>6. How long do we store your information?</h2>
        <ol type="a">
          <li>
            We will only retain your Personal Data for as long as necessary to fulfil
            the purposes we collected it for. This includes for example the purposes of
            satisfying any legal, regulatory, accounting, reporting requirements, to
            carry out legal work, for the establishment or defence of legal claims.
          </li>
          <li>
            We will retain your information for as long as your account is active or as
            needed to provide you with our services, comply with our legal and statutory
            obligations or verify your information with a financial institution.
          </li>
        </ol>
      </section>

      <section className="legal-section">
        <h2>7. Browser storage</h2>
        <p>
          We use your browser’s local storage to keep you signed in. We do not use it
          for advertising. You can clear it at any time by logging out or clearing your
          browser data, but you will need to sign in again.
        </p>
      </section>

      <section className="legal-section">
        <h2>8. Your rights and contact</h2>
        <p>
          You may ask us to show you the Personal Data we hold about you, correct it, or
          delete your account by emailing <a href={`mailto:${SITE.email}`}>{SITE.email}</a>{" "}
          from your registered email address. Some records, such as payment records, may
          need to be kept for legal reasons. For any privacy question, visit our{" "}
          <Link to="/contact">Contact page</Link>. See also our{" "}
          <Link to="/terms">Terms and Conditions</Link>.
        </p>
      </section>
    </LegalLayout>
  );
}
