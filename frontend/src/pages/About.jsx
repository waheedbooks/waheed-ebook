import { Link } from "react-router-dom";

const DEGREES = [
  "PhD (Economics — International Development), Graduate School of International Development, Nagoya University, Japan, 2005.",
  "Master of Applied Sciences (MAS) in Applied Economics, Applied Economics Research Center, University of Karachi — First Class, First Position (A Grade, CGPA 3.75/4), 1995.",
  "Master of Science (MSc) in Economics, Department of Economics, University of Karachi — First Division (A Grade, CGPA 3.5/4), 1992.",
  "Bachelor of Science (Honours) in Economics, Department of Economics, University of Karachi — First Division (A Grade, CGPA 3.57/4), 1991.",
];

const BOOKS = [
  "Quantitative Research Methods: A Practical Approach",
  "Econometrics: Applications with EViews",
  "Statistical Analysis in Business and Economics",
  "Mathematical Methods in Business and Economics",
];

function AboutGallery({ images }) {
  return (
    <div className="about-gallery">
      {images.map((img) => (
        <figure className="about-gallery-item" key={img.src}>
          <img src={img.src} alt={img.alt} loading="lazy" />
          {img.caption && <figcaption>{img.caption}</figcaption>}
        </figure>
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
            Professor of Economics &amp; Director, Distance Education,
            University of Karachi &middot; Microsoft Certified Educator
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
          Economies, Tokyo, Japan in 2009. Dr. Waheed has had 46 scholarly
          contributions in peer-reviewed academic journals,. Most of his
          articles are published in impact factor journals indexed in SSCI,
          Scopus, and ABDC. His short articles have also appeared in Pakistan &
          Gulf Economist and The News International. Dr. Waheed authored four
          textbooks entitled “Quantitative Research Methods: A Practical
          Approach”, “Econometrics: Applications with EViews”, “Statistical
          Analysis in Business and Economics” and “Mathematical Methods in
          Business and Economics”. He has presented research papers at
          international conferences held in Japan, Korea, Turkey, Dubai, and
          Bahrain. Dr. Waheed has also served as a research consultant on
          various national and international projects. Under his supervision,
          five students completed their Ph.D. degrees, and twelve completed
          their MPhil degrees. Dr. Waheed has taught various courses at the
          graduate and post-graduate levels in different educational
          institutions such as the University of Karachi (Karachi, Pakistan), ),
          University of Bahrain (Sakhir, Bahrain), Nagoya University (Nagoya,
          Japan), Rikkyo University (Tokyo, Japan), Institute of Business
          Administration (Karachi, Pakistan), Bahria University (Karachi,
          Pakistan), Jinnah University for Women (Karachi, Pakistan), and IQRA
          University (Karachi, Pakistan). Currently, he is a full-time Professor
          of Economics at the Department of Economics, Faculty of Arts and
          Social Sciences, and Director, Directorate of Distance Education, at
          the University of Karachi. For more details, please visit his website
          www.waheedku.com.
        </p>
      </section>

      <section className="about-section">
        <h2>Academic Background</h2>
        <p>
          Dr. Waheed earned his PhD from the Graduate School of International
          Development, Nagoya University, Japan — one of the highly ranked
          universities in the world — and is also a Microsoft Certified
          Educator.
        </p>
        <ol className="degree-list">
          {DEGREES.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ol>
        <AboutGallery
          images={[
            {
              src: "/images/academic-1.jpg",
              alt: "Dr. Abdul Waheed with colleagues at Nagoya University, Japan",
            },
          ]}
        />
      </section>

      <section className="about-section">
        <h2>Research Activities</h2>
        <p>
          46 scholarly contributions in peer-reviewed academic journals, four
          textbooks, and a monograph. Most of his articles are published in
          impact-factor journals indexed in SSCI, Scopus, and ABDC, with short
          pieces also appearing in the Pakistan &amp; Gulf Economist and The
          News International. He has presented research papers at international
          conferences held in Japan, Korea, Turkey, Dubai, and Bahrain.
        </p>
        <AboutGallery
          images={[
            {
              src: "/images/research-1.jpg",
              alt: "Dr. Abdul Waheed presenting at international research conferences",
            },
            {
              src: "/images/research-2.jpg",
              alt: "Faculty research seminar delivered at an international university in Bahrain",
              caption:
                "Faculty seminar on research proposal writing, Applied Science University, Bahrain",
            },
          ]}
        />
      </section>

      <section className="about-section">
        <h2>Administrative Activities</h2>
        <p>
          Currently Professor of Economics at the Department of Economics,
          Faculty of Arts and Social Sciences, and Director of the Directorate
          of Distance Education, University of Karachi. He has also served on
          academic convocation and examination panels, and has held faculty
          positions at Nagoya University (Japan), the University of Bahrain,
          Rikkyo University (Tokyo, Japan), the Institute of Business
          Administration, Bahria University, Jinnah University for Women, and
          IQRA University.
        </p>
        <AboutGallery
          images={[
            {
              src: "/images/admin-1.jpg",
              alt: "Dr. Abdul Waheed at his office as Director, Directorate of Distance Education",
            },
            {
              src: "/images/admin-2.jpg",
              alt: "Dr. Abdul Waheed presiding at a university convocation panel",
            },
          ]}
        />
      </section>

      <section className="about-section">
        <h2>Authored Books</h2>
        <p>
          Dr. Waheed has authored four textbooks for business and economics
          students, built around SPSS and EViews walkthroughs, worked examples,
          and self-test questions:
        </p>
        <ul className="check-list">
          {BOOKS.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
        <AboutGallery
          images={[
            {
              src: "/images/books-1.jpg",
              alt: "The four textbooks authored by Dr. Abdul Waheed",
            },
          ]}
        />
        <Link to="/books" className="btn-primary about-inline-cta">
          Browse the books
        </Link>
      </section>

      <section className="about-section">
        <h2>Book Launch</h2>
        <p>
          Both the second edition of{" "}
          <em>Quantitative Research Methods: A Practical Approach</em> and{" "}
          <em>Econometrics: Applications with EViews</em> were formally launched
          at the Applied Economics Research Centre (AERC) Auditorium, University
          of Karachi, drawing faculty, researchers, and students from across the
          department.
        </p>
        <AboutGallery
          images={[
            {
              src: "/images/launch-1.jpg",
              alt: "Book launch panel for Econometrics: Applications with EViews at AERC Auditorium, University of Karachi",
            },
            {
              src: "/images/launch-2.jpg",
              alt: "Book launch of the second edition of Quantitative Research Methods",
            },
          ]}
        />
      </section>

      <section className="about-section">
        <h2>Books in News</h2>
        <p>
          Dr. Waheed's research and books have been featured in the national
          press, including coverage of his presentation of his textbooks to
          Japan's Ambassador to Pakistan and the Consul General of Japan in
          Karachi at the Japanese Consulate.
        </p>
        <AboutGallery
          images={[
            {
              src: "/images/news-1.jpg",
              alt: "The Regional Times coverage: Dr. Abdul Waheed hands research book to Japanese envoy",
            },
            {
              src: "/images/news-2.jpg",
              alt: "Daily Kainaat Karachi coverage of Dr. Abdul Waheed's visit to the Japanese Consulate",
            },
          ]}
        />
      </section>

      <section className="about-section cta-section">
        <h2>Read the books</h2>
        <p>
          His textbooks on statistical analysis and quantitative research
          methods for business and economics are available in full below — built
          around SPSS and EViews walkthroughs, worked examples, and self-test
          questions.
        </p>
        <Link to="/books" className="btn-primary">
          Browse the books
        </Link>
      </section>
    </div>
  );
}
