import { Link } from "react-router-dom";

const TIMELINE = [
  {
    heading: "PhD, Development Economics",
    body: "Graduate School of International Development, Nagoya University, Japan — completed under a Japanese Government Fellowship in March 2005. His doctoral research built a financial macroeconomic model and designed Pakistan's external debt reduction strategy.",
  },
  {
    heading: "Post-doctoral research, JSPS Fellowship",
    body: "Japan Society for the Promotion of Science, March 2005 – September 2006. Constructed a financial social accounting matrix for Pakistan, presented at the invitation of the Government of South Korea in October 2007, and researched further as a Visiting Research Fellow at the Institute of Developing Economies, Tokyo (2009).",
  },
  {
    heading: "Invited teaching abroad",
    body: "Rikkyo University, Tokyo — course and special seminar, June–July 2023. Ritsumeikan University, Osaka — seminars on quantitative research methods, December 2024.",
  },
  {
    heading: "Professor of Economics & Director",
    body: "Department of Economics, Faculty of Arts and Social Sciences, University of Karachi — his current position, where he is also Director of the Directorate of Distance Education. Earlier faculty roles include Nagoya University, the University of Bahrain, the Institute of Business Administration, Bahria University, Jinnah University for Women, and IQRA University.",
  },
];

const CONSULTING = [
  "Research consultant to JCR-VIS on the sovereign credit rating of the Kingdom of Bahrain and a sub-sovereign rating for the Government of Punjab, Pakistan.",
  "\u201CEnergy Demand Forecasting\u201D — funded by Shell Pakistan Private Limited.",
  "\u201CExternal Debt of Bahrain\u201D — funded by the Deanship of Research, University of Bahrain.",
  "\u201CDemand and Supply of Selected Agricultural Commodities\u201D — funded by the Trading Corporation of Pakistan (Private) Limited.",
  "\u201CFood Insecurity and Malnutrition in Rural Sindh\u201D and \u201CFood Insecurity and Hunger in Rural and Urban Districts of Sindh\u201D — funded by the Sindh Higher Education Commission.",
  "Compiled a long-run economic and financial database for the National Bank of Pakistan.",
];

export default function About() {
  return (
    <div className="page about-page">
      <div className="about-head">
        <img
          src="/images/author-abdul-waheed.jpg"
          alt="Prof. Dr. Abdul Waheed"
          className="author-strip-photo about-photo"
        />
        <div>
          <span className="eyebrow">About the author</span>
          <h1>Prof. Dr. Abdul Waheed</h1>
          <p className="about-subtitle">
            Professor of Economics &amp; Director, Distance Education, University
            of Karachi &middot; Microsoft Certified Educator
          </p>
          <a href="http://waheedku.com" target="_blank" rel="noreferrer noopener" className="btn-ghost">
            Visit personal website ↗
          </a>
        </div>
      </div>

      <section className="about-section">
        <p className="about-lead">
          Dr. Waheed is an economist with expertise in quantitative development
          analysis, specializing in economic issues in South Asia. His books
          grow directly out of decades of teaching statistics, econometrics,
          and research methods at the graduate and post-graduate level —
          written, as he puts it, by an economist who understands what
          business and economics students actually need from a statistics
          course, rather than a statistician working from the outside in.
        </p>
      </section>

      <section className="about-section">
        <h2>Academic path</h2>
        <div className="timeline">
          {TIMELINE.map((t) => (
            <div className="timeline-item" key={t.heading}>
              <h3>{t.heading}</h3>
              <p>{t.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="about-section">
        <h2>Publications &amp; research</h2>
        <p>
          Dr. Waheed has 46 scholarly contributions in peer-reviewed academic
          journals, four textbooks, and a monograph. Most of his articles
          appear in impact-factor journals indexed in SSCI, Scopus, and ABDC,
          with short pieces also published in the Pakistan &amp; Gulf
          Economist and The News International. He has presented research at
          international conferences held in Japan, Korea, Turkey, Dubai, and
          Bahrain. Beyond this book, he is the author of three other
          textbooks — <em>Quantitative Research Methods: A Practical
          Approach</em>, <em>Econometrics: Applications with EViews</em>, and{" "}
          <em>Mathematical Methods in Business and Economics</em>.
        </p>
      </section>

      <section className="about-section">
        <h2>Consulting &amp; funded research</h2>
        <ul className="check-list">
          {CONSULTING.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </section>

      <section className="about-section">
        <h2>Supervision &amp; teaching</h2>
        <p>
          Five students have completed PhDs and thirteen have completed MPhil
          degrees under his supervision. Beyond the University of Karachi, he
          has taught graduate and post-graduate courses at Nagoya University
          (Japan), Rikkyo University (Tokyo, Japan), the University of Bahrain,
          the Institute of Business Administration (Pakistan), Bahria
          University, Jinnah University for Women, and IQRA University.
        </p>
      </section>

      <section className="about-section cta-section">
        <h2>Read the books</h2>
        <p>
          His textbooks on statistical analysis and quantitative research
          methods for business and economics are available in full below —
          built around SPSS and EViews walkthroughs, worked examples, and
          self-test questions.
        </p>
        <Link to="/books" className="btn-primary">Browse the books</Link>
      </section>
    </div>
  );
}
