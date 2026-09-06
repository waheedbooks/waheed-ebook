import { Link } from "react-router-dom";

const DEGREES = [
  "PhD (Economics — International Development), Graduate School of International Development, Nagoya University, Japan, 2005.",
  "Master of Applied Sciences (MAS) in Applied Economics, Applied Economics Research Center, University of Karachi — First Class, First Position (A Grade, CGPA 3.75/4), 1995.",
  "Master of Science (MSc) in Economics, Department of Economics, University of Karachi — First Division (A Grade, CGPA 3.5/4), 1992.",
  "Bachelor of Science (Honours) in Economics, Department of Economics, University of Karachi — First Division (A Grade, CGPA 3.57/4), 1991.",
];

const FELLOWSHIPS = [
  "Recipient of IDE-JETRO's Visiting Research Fellowship for postdoctoral research at the Institute of Developing Economies (IDE), Tokyo, Japan, April 2009 to Sept. 2009.",
  "Recipient of Japan Society for the Promotion of Science (JSPS) fellowship for postdoctoral research at Nagoya University, Japan, April 2005 – March 2007.",
  "Recipient of Japanese Government Monbusho (MEXT) Scholarship for Ph.D. studies at the Graduate School of International Development (GSID), Nagoya University, Japan, Oct. 2001 to March 2005.",
];

const BOOKS = [
  "Quantitative Research Methods: A Practical Approach",
  "Econometrics: Applications with EViews",
  "Statistical Analysis in Business and Economics",
  "Mathematical Methods in Business and Economics",
];

const NEWS_IMAGES = [
  { src: "/images/news-1.jpg", alt: "The Regional Times: Dr. Abdul Waheed hands research book to Japanese envoy" },
  { src: "/images/news-2.jpg", alt: "Daily Kainaat Karachi coverage of Dr. Abdul Waheed's visit to the Japanese Consulate" },
  { src: "/images/news-3.jpg", alt: "Department of Economics feature on Dr. Abdul Waheed's fourth authored book" },
  { src: "/images/news-4.jpg", alt: "Dr. Abdul Waheed presenting his research book to Japan's Ambassador to Pakistan at the Japanese Consulate, Karachi" },
  { src: "/images/news-5.jpg", alt: "Feature on Dr. Abdul Waheed publishing a trio of books showcasing 30 years of academic excellence" },
  { src: "/images/news-6.jpg", alt: "A celebration cake marking the publication of Dr. Abdul Waheed's four textbooks" },
];

function AboutGallery({ images, variant }) {
  const className = variant ? `about-gallery about-gallery--${variant}` : "about-gallery";
  return (
    <div className={className}>
      {images.map((img) => (
        <figure className="about-gallery-item" key={img.src}>
          <img src={img.src} alt={img.alt} loading="lazy" />
          {img.caption && <figcaption>{img.caption}</figcaption>}
        </figure>
      ))}
    </div>
  );
}

function LogoRow({ logos }) {
  return (
    <div className="about-logo-row">
      {logos.map((logo) => (
        <img key={logo.src} src={logo.src} alt={logo.alt} loading="lazy" />
      ))}
    </div>
  );
}

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
            Microsoft Certified Educator
          </p>
          <a
            href="https://waheedku.com"
            target="_blank"
            rel="noreferrer noopener"
            className="btn-ghost"
          >
            Visit personal website ↗
          </a>
        </div>
      </div>

      <section className="about-section">
        <p className="about-lead">
          Professor Dr. Abdul Waheed is an economist with expertise in
          quantitative development analyses and specializes in economic issues
          in South Asia. He earned a Ph.D. degree from the Graduate School of
          International Development, Nagoya University, Japan, in 2005. Dr.
          Waheed completed his first post-doctorate research under a JSPS
          fellowship at Nagoya University in 2006 and his second post-doctorate
          research under an IDE-JETRO fellowship at the Institute of Developing
          Economies, Tokyo, Japan in 2009.
        </p>
        <p className="about-lead">
          Dr. Waheed has had 46 scholarly contributions in peer-reviewed
          academic journals. Most of his articles are published in impact
          factor journals indexed in SSCI, Scopus, and ABDC. His short articles
          have also appeared in Pakistan &amp; Gulf Economist and The News
          International. Dr. Waheed authored four textbooks entitled
          “Quantitative Research Methods: A Practical Approach”,
          “Econometrics: Applications with EViews”, “Statistical Analysis in
          Business and Economics” and “Mathematical Methods in Business and
          Economics”. He has presented research papers at international
          conferences held in Japan, Korea, Turkey, Dubai, and Bahrain. Dr.
          Waheed has also served as a research consultant on various national
          and international projects. Under his supervision, five students
          completed their Ph.D. degrees, and twelve completed their MPhil
          degrees.
        </p>
        <p className="about-lead">
          Dr. Waheed has taught various courses at the graduate and
          post-graduate levels in different educational institutions such as
          the University of Karachi (Karachi, Pakistan), University of Bahrain
          (Sakhir, Bahrain), Nagoya University (Nagoya, Japan), Rikkyo
          University (Tokyo, Japan), Institute of Business Administration
          (Karachi, Pakistan), Bahria University (Karachi, Pakistan), Jinnah
          University for Women (Karachi, Pakistan), and IQRA University
          (Karachi, Pakistan). Currently, he is a full-time Professor of
          Economics at the Department of Economics, Faculty of Arts and Social
          Sciences, and Director, Directorate of Distance Education, at the
          University of Karachi. For more details, please visit his website{" "}
          <a href="https://www.waheedku.com" target="_blank" rel="noreferrer noopener">
            www.waheedku.com
          </a>
          .
        </p>
      </section>

      <section className="about-section">
        <h2>Academic Background</h2>
        <p>
          Dr. Waheed obtained his PhD from the Graduate School of
          International Development, Nagoya University, Japan, one of the
          highly ranked universities in the world. He is also a Microsoft
          Certified Educator.
        </p>
        <ol className="degree-list">
          {DEGREES.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ol>
        <LogoRow
          logos={[
            { src: "/images/logo-nagoya-gsid.jpg", alt: "Nagoya University, Graduate School of International Development" },
            { src: "/images/logo-university-of-karachi.jpg", alt: "University of Karachi" },
            { src: "/images/logo-aerc.jpg", alt: "Applied Economics Research Centre (AERC), University of Karachi" },
          ]}
        />
      </section>

      <section className="about-section">
        <h2>Fellowships &amp; Awards</h2>
        <ol className="degree-list">
          {FELLOWSHIPS.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ol>
        <LogoRow
          logos={[
            { src: "/images/logo-jsps.jpg", alt: "Japan Society for the Promotion of Science (JSPS)" },
            { src: "/images/logo-ide-jetro.jpg", alt: "Institute of Developing Economies (IDE-JETRO)" },
            { src: "/images/logo-mext.jpg", alt: "Japanese Government Monbusho (MEXT)" },
          ]}
        />
      </section>

      <section className="about-section">
        <h2>Academic Positions</h2>
        <p>
          Dr. Waheed has over three decades of experience in teaching,
          research, and academic leadership. He has experience teaching at the
          University of Karachi (Karachi, Pakistan), University of Bahrain
          (Sakhir, Bahrain), Nagoya University (Nagoya, Japan), Rikkyo
          University (Tokyo, Japan), Institute of Business Administration
          (Karachi, Pakistan), Bahria University (Karachi, Pakistan), Jinnah
          University for Women (Karachi, Pakistan), and IQRA University
          (Karachi, Pakistan).
        </p>
        <AboutGallery
          variant="grid"
          images={[
            { src: "/images/academic-position-1.jpg", alt: "Dr. Abdul Waheed delivering a lecture on econometric models" },
            { src: "/images/academic-position-2.jpg", alt: "Dr. Abdul Waheed with graduate students and faculty in Japan" },
          ]}
        />
      </section>

      <section className="about-section">
        <h2>Administrative Positions</h2>
        <p>
          Dr. Waheed served as a Registrar (administrative head) of the
          University of Karachi for more than four years. He has been the Head
          of the Department of Economics for two terms. Currently, he is a
          full-time Professor of Economics at the Department of Economics,
          Faculty of Arts and Social Sciences, and Director of the Directorate
          of Distance Education, University of Karachi.
        </p>
        <AboutGallery
          variant="grid"
          images={[
            { src: "/images/admin-position-1.jpg", alt: "Dr. Abdul Waheed at his office desk" },
            { src: "/images/admin-position-2.jpg", alt: "Dr. Abdul Waheed at the University of Karachi's 32nd Annual Convocation" },
          ]}
        />
      </section>

      <section className="about-section">
        <h2>Research Activities</h2>
        <p>
          Dr. Waheed has a remarkable track record in academic research and
          mentorship. Over the years, he has supervised numerous Ph.D. and
          M.Phil. theses, contributing significantly to the academic landscape
          in Pakistan. Dr. Waheed has had 46 scholarly contributions in
          peer-reviewed academic journals, four textbooks, and a monograph.
          Most of his articles are published in impact factor journals
          indexed in SSCI, Scopus, and ABDC. His short articles have also
          appeared in Pakistan &amp; Gulf Economist and The News
          International. He has presented research papers at international
          conferences held in Japan, Korea, Turkey, Dubai, and Bahrain.
        </p>
        <AboutGallery
          images={[
            {
              src: "/images/research-conferences.jpg",
              alt: "Dr. Abdul Waheed presenting at international research conferences in Japan, Turkey, and Bahrain",
            },
          ]}
        />
      </section>

      <section className="about-section">
        <h2>Authored Books</h2>
        <p>
          Dr. Waheed authored four (04) textbooks, which are outcomes of his
          30 years of teaching and research experience. These books have been
          included in the syllabus and are taught at the university level by
          faculty members:
        </p>
        <ul className="check-list">
          {BOOKS.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
        <AboutGallery
          images={[
            {
              src: "/images/authored-books-photo.jpg",
              alt: "The four textbooks authored by Dr. Abdul Waheed",
            },
          ]}
        />
        <Link to="/books" className="btn-primary about-inline-cta">
          Browse the books
        </Link>
      </section>

      <section className="about-section">
        <h2>Books in News</h2>
        <p>
          Dr. Waheed's research and books have been featured in the national
          press and celebrated at university and departmental events —
          including presenting his textbooks to Japan's Ambassador to
          Pakistan and the Consul General of Japan in Karachi at the Japanese
          Consulate.
        </p>
        <AboutGallery variant="news" images={NEWS_IMAGES} />
      </section>

      <section className="about-section cta-section">
        <h2>Read the books</h2>
        <p>
          His textbooks on statistical analysis and quantitative research
          methods for business and economics are available in full below —
          built around SPSS and EViews walkthroughs, worked examples, and
          self-test questions.
        </p>
        <Link to="/books" className="btn-primary">
          Browse the books
        </Link>
      </section>
    </div>
  );
}
