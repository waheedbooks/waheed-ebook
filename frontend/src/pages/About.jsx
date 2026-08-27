import { Link } from "react-router-dom";

const TIMELINE = [
  {
    heading: "PhD, Development Economics",
    body: "Graduate School of International Development, Nagoya University, Japan — completed under a Japanese Government (Monbukagakusho) Fellowship in 2005. His doctoral research built a financial macroeconomic model and an external debt reduction strategy for Pakistan.",
  },
  {
    heading: "Post-doctoral research, JSPS Fellowship",
    body: "Japan Society for the Promotion of Science, 2005–2006. Constructed a financial social accounting matrix for Pakistan, later presented at the invitation of the Government of South Korea and researched further as a Visiting Research Fellow at the Institute of Developing Economies, Tokyo.",
  },
  {
    heading: "Professor of Economics",
    body: "Department of Economics, Faculty of Arts and Social Sciences, University of Karachi — his current position, following faculty roles at Nagoya University, the University of Bahrain, the Institute of Business Administration, Bahria University, and IQRA University.",
  },
];

const CONSULTING = [
  "Research consultant to JCR-VIS on the sovereign credit rating of the Kingdom of Bahrain and a sub-sovereign rating for the Government of Punjab, Pakistan.",
  "Energy demand forecasting research for Shell Pakistan Private Limited.",
  "Compiled a long-run economic and financial database for the National Bank of Pakistan.",
  "Led a funded research project for the Deanship of Scientific Research, University of Bahrain.",
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
            Professor of Economics, University of Karachi &middot; International
            trade, finance &amp; quantitative development
          </p>
          <a href="http://waheedku.com" target="_blank" rel="noreferrer noopener" className="btn-ghost">
            Visit personal website ↗
          </a>
        </div>
      </div>

      <section className="about-section">
        <p className="about-lead">
          Dr. Waheed is an economist whose work sits at the intersection of
          quantitative development analysis, international trade, and finance.
          His books grow directly out of more than twenty-six years of teaching
          statistics, econometrics, and research methods at the graduate and
          post-graduate level — written, as he puts it, by an economist who
          understands what business and economics students actually need from a
          statistics course, rather than a statistician working from the
          outside in.
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
        <h2>Research &amp; industry work</h2>
        <p>
          Dr. Waheed has authored forty-four scholarly contributions across
          peer-reviewed journals, a book chapter, and a monograph, with articles
          appearing in journals indexed in Thomson Reuters, Scopus, and ABDC, as
          well as in the Pakistan &amp; Gulf Economist and The News International.
          He has presented research at international conferences in Japan,
          Korea, Dubai, and Bahrain.
        </p>
        <ul className="check-list">
          {CONSULTING.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </section>

      <section className="about-section">
        <h2>Supervision &amp; teaching</h2>
        <p>
          Five students have completed PhDs and nine have completed MPhil
          theses under his supervision. Beyond the University of Karachi, he has
          taught graduate and postgraduate courses at Nagoya University (Japan),
          the University of Bahrain, the Institute of Business Administration
          (Pakistan), Bahria University, and IQRA University.
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
