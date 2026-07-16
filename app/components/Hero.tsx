import * as React from "react";
import styles from "./Hero.module.css";
import AvatarTyping from "./AvatarTyping";
import ClientOnly from "./ClientOnly";
import { useLocation } from "react-router";

// Your Ready Player Me GLB
const AVATAR_URL = "/assets/obtyping.glb";

// Put your photo in /public/assets/omar.jpg (or adjust the path below)
const PHOTO_URL = "/assets/omar.jpg";

const LINES = [
  "Hello, I'm Omar Bucio",
  "",
  "{",
  '  role: "Software Engineer",',
  '  focus: ["Full-Stack Development", "AI Integration", "Scalable Systems"],',
  '  currently: "Building meaningful web experiences",',
  "}",
];

export default function Hero() {
  const fullText = React.useMemo(() => LINES.join("\n"), []);
  const [count, setCount] = React.useState(0);
  const [flipped, setFlipped] = React.useState(false);
  const location = useLocation();
  const prevPathRef = React.useRef<string | null>(null);
  const [typingActive, setTypingActive] = React.useState(false);
  const FLIP_MS = 900;
  const FLIP_DELAY = 1500;
  const TYPE_OFFSET_MS = 80;

  // const handleFlipEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
  //   // Only react to the flip animation finishing
  //   if (e.propertyName !== "transform") return;
  //   if (!flipped) return;

  //   // Start typing once the card has finished flipping to the 3D side
  //   setTypingActive(true);
  // };

  const startSequence = React.useCallback(() => {
    setCount(0);
    setTypingActive(false);
    setFlipped(false);

    window.setTimeout(() => {
      setFlipped(true);

      // start typing slightly before flip completes (e.g. 120ms before end)
      window.setTimeout(() => {
        setTypingActive(true);
      }, FLIP_MS - TYPE_OFFSET_MS);

    }, FLIP_DELAY);

  }, [FLIP_MS]);


  React.useEffect(() => {
    const prevPath = prevPathRef.current;
    const currPath = location.pathname;

    // We only restart when we *arrive* at "/" from a different path,
    // OR on first mount (prevPath === null)
    const enteredHome = currPath === "/" && prevPath !== "/";

    if (enteredHome) startSequence();

    // always update previous path
    prevPathRef.current = currPath;

  }, [location.pathname, startSequence]);

  // logo replay
  React.useEffect(() => {
    const replay = () => startSequence();

    window.addEventListener("hero:replay", replay);
    return () => window.removeEventListener("hero:replay", replay);
  }, [startSequence]);

  // Typewriter
  React.useEffect(() => {
    if (!typingActive) return;

    const speed = 37; // ms per char (adjust)

    if (count === 0) {
      setCount(1);
      return;
    }

    if (count >= fullText.length) return;

    const t = window.setTimeout(() => setCount((c) => c + 1), speed);
    return () => window.clearTimeout(t);
  }, [count, fullText, typingActive]);

  // Flip back to the photo after typing finishes
  React.useEffect(() => {
    if(!typingActive) return;

    const flipBackTimer = window.setTimeout(() => {
      setFlipped(false);
      setTypingActive(false);
    }, 600);

    return () => window.clearTimeout(flipBackTimer);
  }, [count, fullText.length, typingActive]);


  const typed = fullText.slice(0, count);
  const typingProgress = Math.min(1, count / fullText.length);

  return (
    <section className={styles.hero} aria-label="Introduction">
      <div className={styles.left}>
        <pre className={styles.codeBlock}>
          <code>
            {typed}
            <span className={styles.cursor} aria-hidden="true">
              ▋
            </span>
          </code>
        </pre>
      </div>

      <div className={styles.right}>
        <div className={`${styles.flipCard} ${flipped ? styles.flipped : ""}`}>
          <div className={styles.flipInner}>
            {/* FRONT: photo */}
            <div className={styles.flipFront}>
              <img className={styles.photo} src={PHOTO_URL} alt="Omar Bucio" />
            </div>

            {/* BACK: 3D avatar */}
            <div className={styles.flipBack}>
              <div className={styles.threeWrap}>
                <ClientOnly
                  fallback={
                    <div className={styles.threeFallback}>
                      Loading 3D…
                    </div>
                  }
                >
                  <AvatarTyping url={AVATAR_URL} typingProgress={typingProgress} isTyping={typingActive}/>
                </ClientOnly>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
