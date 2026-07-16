import * as React from "react";
import { Form, Link, NavLink } from "react-router";
import styles from "./SiteHeader.module.css";
import ScrollCodeProgress from "./ScrollCodeProgress";
import { useEffect, useRef, useState } from "react";
import LogoOB from "./LogoOB";

type NavItem = { label: string; to: string; hotkey?: string };

type SiteHeaderProps = {
  statusText?: string;
  isAdmin?: boolean;
  showLoginShortcut?: boolean;
}

const NAV: NavItem[] = [
  { label: "About", to: "/#about", hotkey: "a" },
  { label: "Projects", to: "/#projects", hotkey: "p" },
  { label: "Skills", to: "/#skills", hotkey: "s" },
  { label: "Contact", to: "/#contact", hotkey: "c" },
];

export default function SiteHeader({ 
  statusText = "Open for work",
  isAdmin = false,
  showLoginShortcut = false,
}: SiteHeaderProps) {

  const [progress, setProgress] = React.useState(0);
  const [paletteOpen, setPaletteOpen] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [q, setQ] = React.useState("");
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [ownerMenuOpen, setOwnerMenuOpen] = React.useState(false);
  const ownerMenuRef = useRef<HTMLDivElement | null>(null);


  // Scroll progress
  React.useEffect(() => {
    const el = document.scrollingElement || document.documentElement;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const max = (el.scrollHeight - el.clientHeight) || 1;
        setProgress(Math.min(1, el.scrollTop / max));
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);


  // Below the theme is initialized from localStorage (or "system" on first load/SSR)
  // So essentially what that means is just setting the theme
  // to the users system theme, whether it is dark or light
  // The if statement is for when this piece of code is being passed into a server such as Node.js
  // On servers there is no 'window' defined so using typeof is the safe way to check that without throiwng a ReferenceError
  // Since you can't access localStorage or matchMedia on the server, you pick a netural default "system"
  // Right now since I'm not using a server than the if statement is skipped and only the return statement is ran

  // return statement the as... part is a TypeScript-only assertion: "treat this value as one of these three strings"
  // a ?? b returns a if a is not null or undefined; otherwise it returns b
  // Here: if getItem("theme") returned null (nothing saved), use "system"
  // Theme toggle
  const [theme, setTheme] = React.useState<"light"|"dark"|"system">(() => {

    if (typeof window === "undefined") return "system";

    return (localStorage.getItem("theme") as "light"|"dark"|"system") ?? "system";

  });


// useEffect causes some side effect to happen when
// something changes. From the dependency array I know 
// the theme is what we are manipulating, run this effect
// after every render where 'theme' changed, it only runs 
// in the browser. 
  React.useEffect(() => {
    // runs only in the browser
    const root = document.documentElement;

    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;

    const isDark = theme === "dark" || (theme === "system" && prefersDark);

    root.classList.toggle("dark", isDark);

    localStorage.setItem("theme", theme);

  }, [theme]);


// Ok here cycleTheme as we can see cycles through each theme
// one thing I would like to mention is that when the 
// theme toggle button lands on the computer symbol button
// that this option is choosing the preference of the specific
// users OS, so if the user has their OS set to Light then
// the theme will be light and if they have it set to Dark 
// then the system button recognizes that and will keep it dark
  const cycleTheme = () =>
    setTheme((t) => (t === "light" ? "dark" : t === "dark" ? "system" : "light"));


// this useEffect() creates a const and has a property
// 'e' that has a value KeyboardEvent, this KeyboardEvent
// now 'e' gets checked if Ctrl+k or Cmd+k is clicked 
// and if so then the palette is set to true which makes 
// the palette open, the else if block checks if the palette 
// is open and if it is and Escaped is pressed then it 
// sets paletteOpen to false so that it closes. The other
// two lines belore the if block: the addEventListener, hooks
// a global key listener outside React to the shortcut works
// anywhere. The return () cleans up removes the previous 
// listener, preventing leaks, preventing duplicates, and 
// ensuring the handler sees the latest state.
  // Command palette (Ctrl/Cmd+K)
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen(true);
      } else if (paletteOpen && e.key === "Escape") {
        setPaletteOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [paletteOpen]);


// Effect that closes the Owner drop down menu 
// when you click anywhere outside the menu
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        ownerMenuOpen &&
        ownerMenuRef.current &&
        !ownerMenuRef.current.contains(e.target as Node)
      ) {
        setOwnerMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ownerMenuOpen]);



  // this useEffect() gives focus to the <input> of the
  // hotkey palette. Meaning that one of the things it
  // does is as soon as the palette button at the header
  // is pressed it automatically puts the caret at the <input> line 
  // to start typing at the <input> search line no extra click
  // setQ(""); clears the query so next time you open the 
  // palette, the input starts empty.
  React.useEffect(() => {
    if (paletteOpen) setTimeout(() => inputRef.current?.focus(), 0);
    else setQ("");
  }, [paletteOpen]);



  // The below 'const filtered' is equal to the 'const NAV'
  // array which holds NavItem[] objects, the .filter loops 
  // through each of those NavItem objects which is assigned 
  // to n, the current item during the .filter loop. Each time 
  // .filter runs, it does one pass over NAV. On that pass:
  // first call: n === NAV[0], second call: n === NAV[1] etc.. 
  // until the end. The callback returns true/false for each n
  // to decide whether to keep it. The filter runs on every 
  // render (initial + each keystroke), so the list updates
  // live as you type.
  const filtered = NAV.filter((n) =>
    n.label.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <>
      <a className={styles.skipLink} href="#main">Skip to content</a>

      <header className={styles.header}>
        <ScrollCodeProgress progress={progress} />
        <div className={styles.bar}>
          <Link to="/" className={styles.brand} aria-label="Go to homepage" onClick={() => window.dispatchEvent(new Event("hero:replay"))}>
            <LogoOB className={`${styles.logo} ${styles.logoAuto}`} />
          </Link>

          <nav className={styles.nav}>
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                className={({ isActive }) =>
                  `${styles.navlink} ${isActive ? styles.active : ""}`
                }
                >
                {n.label}
              </NavLink>
            ))}
          </nav>

          <div className={styles.actions}>

            <button className={styles.btn} onClick={() => setPaletteOpen(true)}>
              ⌘K
            </button>

            <button className={`${styles.btn} ${styles.themeBtn}`} onClick={cycleTheme}>
              <span className={styles.themeIcon}>
                {theme === "dark" ? "🌙" : theme === "light" ? "☀️" : "🖥️"}
              </span>
            </button>

            <button
              type="button"
              className={`${styles.btn} ${styles.hamburger}`}
              aria-label="Open menu"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((v) => !v)}
            >☰</button>

            <span className={styles.status}>
              <span className={styles.dot} aria-hidden="true" />
              <span className={styles.statusText}>{statusText}</span>
            </span>

            {!isAdmin && showLoginShortcut && (
              <Link to="/admin/login" className={styles.adminLink}>
                Login
              </Link>
            )}

            {isAdmin && (
              <div className={styles.ownerMenu} ref={ownerMenuRef}>
                <button
                  type="button"
                  className={styles.ownerBtn}
                  aria-haspopup="menu"
                  aria-expanded={ownerMenuOpen}
                  onClick={() => setOwnerMenuOpen((v) => !v)}
                >
                  Owner ▾
                </button>

                {ownerMenuOpen && (
                  <div className={styles.ownerDropdown} role="menu">
                    <Link
                      to="/admin/status"
                      className={styles.ownerItem}
                      role="menuitem"
                      onClick={() => setOwnerMenuOpen(false)}
                    >
                      Admin
                    </Link>

                    <Form method="post" action="/admin/logout">
                      <button type="submit" className={styles.ownerItemBtn} role="menuitem">
                        Logout
                      </button>
                    </Form>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        {mobileOpen && (
          <div className={styles.mobileMenu} role="navigation" aria-label="Mobile">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className={styles.mobileLink}
                onClick={() => setMobileOpen(false)}
              >
                {n.label}
              </Link>
            ))}
          </div>
        )}

      </header>
            
      {paletteOpen && (
        <div className={styles.backdrop} onClick={() => setPaletteOpen(false)}>
          <div className={styles.palette} onClick={(e) => e.stopPropagation()}>

            <input
              ref={inputRef}
              className={styles.input}
              placeholder="Type to jump…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />

            <ul className={styles.list}>
              {filtered.map((n) => (
                <li key={n.to} className={styles.item}>

                  <Link to={n.to} onClick={() => setPaletteOpen(false)}>{n.label}</Link>

                  {n.hotkey && <kbd>{n.hotkey.toUpperCase()}</kbd>}

                </li>
              ))}
              {!filtered.length && <li className={`${styles.item} ${styles.muted}`}>No matches</li>}
            </ul>

          </div>
        </div>
      )}
    </>
  );
}
