import { FULL_SUBTITLE, TITLE, VENUE } from "../content";
import { Mark } from "./Header";
import "./og.css";

// Link-preview images (owner, 2026-10-08: the preview showed the starter
// template's triangle icon; "What if we changed that to the first frame of
// the first highlight video"). Each card is 1200 × 630, the size link
// previews use, built from the page's own wordmark and type, and
// screenshotted to a PNG (scripts/lab/og_cards.mjs). Key content stays in
// the middle, where every app's crop keeps it.
//   o1  the page's header: the mark, the title beside it
//   o2  the first frame of the first highlight (the nut on bolt) beside
//       the mark and the title
//   o3  the same frame across the card, the mark and title on a band
//   o4  one frame per robot around the mark, as the Results divider
// And icons, 512 × 512, for the browser tab and the home screen. I4 says
// "SGS" (owner, 2026-10-08: "can we make the little icon that appears on
// the tab say SGS?"), white on black as the bar's "SGS", and is also set at
// 48, 32 and 16 px for the favicon.

const IMG = "/media/library/og";

function Title({ size }: { size: number }) {
  return (
    <p className="og-title" style={{ fontSize: size }}>
      {TITLE}: {FULL_SUBTITLE}
    </p>
  );
}

function Card({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <figure className="og-wrap">
      <figcaption className="og-label">{id.toUpperCase()}</figcaption>
      <div id={`og-${id}`} className={`og-card og-${id}`}>
        {children}
      </div>
    </figure>
  );
}

export default function OgCards() {
  return (
    <main className="og-page">
      <Card id="o1">
        <div className="og-o1-mark">
          <Mark measure="600px" cap="600px" />
        </div>
        <div className="og-o1-text">
          <Title size={44} />
          <p className="og-venue">{VENUE}</p>
        </div>
      </Card>
      <Card id="o2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="og-o2-photo" src={`${IMG}/nut-first.jpg`} alt="" />
        <div className="og-o2-text">
          <Mark measure="430px" cap="430px" />
          <Title size={30} />
          <p className="og-venue">{VENUE}</p>
        </div>
      </Card>
      <Card id="o3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="og-o3-photo" src={`${IMG}/nut-first.jpg`} alt="" />
        <div className="og-o3-band">
          <Mark measure="330px" cap="330px" />
          <Title size={30} />
        </div>
      </Card>
      <Card id="o4">
        <div className="og-o4-grid">
          <div className="og-o4-cell og-o4-mark">
            <Mark measure="350px" cap="350px" />
          </div>
          {["nut-first", "gear", "ur5e-sim", "anymal-d", "anymal-c", "franka"]
            .slice(0, 5)
            .map((f) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={f}
                className="og-o4-cell"
                src={`${IMG}/${f}.jpg`}
                alt=""
              />
            ))}
        </div>
      </Card>
      <div className="og-icons">
        <figure className="og-wrap">
          <figcaption className="og-label">I1</figcaption>
          <div id="og-i1" className="og-icon og-i1">
            S
          </div>
        </figure>
        <figure className="og-wrap">
          <figcaption className="og-label">I2</figcaption>
          <div id="og-i2" className="og-icon og-i2">
            SGS
          </div>
        </figure>
        <figure className="og-wrap">
          <figcaption className="og-label">I4</figcaption>
          <div className="og-i4-set">
            <div
              id="og-i4"
              className="og-icon og-i4"
              style={{ width: 512, height: 512 }}
            >
              <span>SGS</span>
            </div>
            {/* The tab sizes, set as text at each size rather than shrunk. */}
            {[48, 32, 16].map((n) => (
              <div
                key={n}
                id={`og-i4-${n}`}
                className="og-icon og-i4"
                style={{ width: n, height: n }}
              >
                <span>SGS</span>
              </div>
            ))}
          </div>
        </figure>
        <figure className="og-wrap">
          <figcaption className="og-label">I3</figcaption>
          <div id="og-i3" className="og-icon og-i3">
            S<span className="og-i3-dot" />
          </div>
        </figure>
      </div>
    </main>
  );
}
