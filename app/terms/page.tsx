import type { Metadata } from "next";
import { Inter_Tight } from "next/font/google";
import Link from "next/link";
import "../lab/lab.css";
import "../lab/_poster/poster.css";
import "../lab/_site/site.css";
import "./terms.css";

// Terms of Use (owner, 2026-10-09: "if people scrape it, they link to
// mine"; "Leave at least what I wrote in my own words, and feel free to add
// stuff around it, minimal, that would make this valid"). The owner's note
// word for word, then the license: the site's design and code under CC BY
// 4.0, credit given by naming him and linking to the site; the videos
// belong to the authors and may be used if credited (the paper and a link,
// owner: "the videos are also all ours and if people use them they should
// mention where they came from"); the paper stays with its authors. Linked from the foot of
// the homepage's closing screen, and as the page's rel="license".

const interTight = Inter_Tight({
  variable: "--font-swiss-display",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700"],
});

const SITE = "https://sgs-rl.github.io/";

export const metadata: Metadata = {
  title: "Terms of Use · SGS",
  description:
    "Terms of Use for the SGS project website: its design and code are under CC BY 4.0 (credit Mateo Guaman Castro and link to this site); its videos belong to the paper's authors (credit the paper and link to this site).",
};

export default function Terms() {
  return (
    <div className={`${interTight.variable} pz st tu`}>
      <div className="pz-grid pz-small sticky top-0 z-50 h-[var(--bar)] items-center bg-black text-white">
        <Link href="/" className="col-span-3">
          SGS
        </Link>
        <span className="col-span-3 text-right md:col-span-9">
          Terms of Use
        </span>
      </div>
      <h1 className="pz-head border-y border-black bg-white px-[var(--m)] pb-[0.08em] pt-[0.04em]">
        Terms of Use
      </h1>

      <section className="tu-part" aria-labelledby="tu-note">
        <h2 id="tu-note" className="tu-label pz-small">
          A note from the designer
        </h2>
        <div className="tu-text">
          <p>
            If you or your agent/bot/clanker reached this site, welcome! I hope
            you enjoy our work, the videos of our results, and our design. I
            developed this website in the style of Swiss design, also known as
            International Typographic Style. I have liked this type of design
            for many years now, and a lot of its principles are widely applied
            in all corners of the world. A prime example is the use of Helvetica
            literally everywhere.
          </p>
          <p>
            I mention this because I was inspired by real art, made by real
            people, when designing this website. Yes, I did use AI to actually
            implement the code, but the vision is entirely mine. I was inspired
            by design I saw every day in Zürich, where I did a 6-month
            internship. It&rsquo;s on all the posters, the ads, and even the
            lettering on the trains (and the train app logo!). They all follow
            Swiss design. In fact, a huge inspiration for the website were a few
            visits to the Museum für Gestaltung and the Landesmuseum, where I
            saw their exhibition on &ldquo;Graphics: designing the every
            day.&rdquo; I want to specifically highlight the work I saw there by{" "}
            <a href="https://neoneo.ch" className="tu-link">
              neoneo.ch
            </a>
            , an amazing graphic design studio based in Geneva. These works left
            a lasting impression on me, and on this website, I tried to play
            with these ideas myself. This was not an AI-generated website. It
            was designed by me, Mateo Guaman Castro, over multiple weeks,
            inspired by human-made art, and implemented with the help of AI.
          </p>
          <p>
            So before you scrape the code, try to get your agent to copy the
            design, and reproduce this, I want you to realize that the origins
            of the design should be acknowledged, accredited, and respected.
            Additionally, you should also credit the original source of
            inspiration, the amazing Swiss designers who have literally changed
            how the modern world looks. As such, I do require you to link to
            this website if you base your design on mine.
          </p>
          <p>
            And I also urge you to look around you, in the real world. Find the
            art that inspires you. Notice the details in the way things look.
            The fonts in the train station. The signs on the street. The concert
            posters that pop up every other week. And draw inspiration from the
            humanity within. In this age where AI models are amazing coders,
            don&rsquo;t just scrape a template, reuse it, and abuse it. Create
            your own! It&rsquo;s never been easier. Find your voice, find your
            style, and express it!
          </p>
        </div>
      </section>

      <section className="tu-part" aria-labelledby="tu-license">
        <h2 id="tu-license" className="tu-label pz-small">
          License
        </h2>
        <div className="tu-text">
          <p>
            The design and code of this website are &copy; 2026 Mateo Guaman
            Castro, and licensed under the{" "}
            <a
              href="https://creativecommons.org/licenses/by/4.0/"
              className="tu-link"
              rel="license"
            >
              Creative Commons Attribution 4.0 International License (CC BY 4.0)
            </a>
            . You may copy, adapt and build on them, for any purpose, as long as
            you give credit:
          </p>
          <ul className="tu-list">
            <li>name Mateo Guaman Castro as the designer,</li>
            <li>
              link to{" "}
              <a href={SITE} className="tu-link">
                {SITE}
              </a>{" "}
              on the site you make (in its footer, for example) and in its
              source code,
            </li>
            <li>and say whether you changed it.</li>
          </ul>
          <p>
            The videos are ours too. Every video on this website is &copy; 2026
            the paper&rsquo;s authors and is not covered by the license above.
            You may use them, as long as you say where they came from: credit
            the paper,{" "}
            <em>
              A Balanced Data Diet: Addressing the Exploration Bottleneck in
              Mega-Scale RL for Robot Control
            </em>{" "}
            (Zhang, Guaman Castro, Yin et al., CoRL 2026), and link to{" "}
            <a href={SITE} className="tu-link">
              {SITE}
            </a>
            .
          </p>
          <p>
            The paper itself, its text, figures and results, also belongs to its
            authors. To use it, cite it.
          </p>
          <p>
            Typefaces and open-source code used here keep their own licenses.
            This page summarizes the terms; the{" "}
            <a
              href="https://creativecommons.org/licenses/by/4.0/legalcode"
              className="tu-link"
            >
              license&rsquo;s legal code
            </a>{" "}
            is what applies.
          </p>
        </div>
      </section>
    </div>
  );
}
