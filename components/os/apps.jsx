"use client";

import { useEffect, useState } from "react";

/* Window registry — order defines the dock. Terminal is rendered specially. */
export const APPS = [
  { id: "terminal",     title: "agent://terminal", icon: "▸", w: 480, h: 340 },
  { id: "about",        title: "about.md",         icon: "◈", w: 480, h: 500 },
  { id: "projects",     title: "~/projects",       icon: "❒", w: 560, h: 500 },
  { id: "experience",   title: "experience.log",   icon: "❯", w: 440, h: 420 },
  { id: "skills",       title: "stack.json",       icon: "⬡", w: 440, h: 340 },
  { id: "capabilities", title: "capabilities",     icon: "◇", w: 480, h: 400 },
  { id: "blog",         title: "writing",          icon: "✎", w: 540, h: 470 },
  { id: "dsa",          title: "algorithms",       icon: "∑", w: 640, h: 540 },
  { id: "links",        title: "links",            icon: "⚯", w: 500, h: 420 },
  { id: "contact",      title: "contact",          icon: "✉", w: 430, h: 380 },
];

/* apps shown in the dock (terminal + a curated subset) */
export const DOCK = ["terminal", "about", "projects", "experience", "skills", "blog", "dsa", "links", "contact"];

const DOCK_ICON = {
  terminal: "▸", about: "◈", projects: "❒", experience: "❯", skills: "⬡",
  blog: "✎", dsa: "∑", links: "⚯", contact: "✉",
};
export const dockIcon = (id) => DOCK_ICON[id] || "▢";

export function AppContent({ id, data, onOpen, onReadPost }) {
  switch (id) {
    case "about":        return <About identity={data.identity} onOpen={onOpen} />;
    case "projects":     return <Projects projects={data.projects} github={data.identity.github} />;
    case "experience":   return <Experience items={data.experience} />;
    case "skills":       return <Skills skills={data.skills} />;
    case "capabilities": return <Capabilities caps={data.capabilities} />;
    case "blog":         return <BlogList posts={data.posts} onReadPost={onReadPost} />;
    case "dsa":          return <Dsa l={data.l} />;
    case "links":        return <Links links={data.links} />;
    case "contact":      return <Contact socials={data.socials} />;
    default:             return null;
  }
}

/* In-OS markdown reader. The canonical, crawlable page stays at /blog/<slug>;
   the footer links to it for sharing. */
export function Reader({ post, l }) {
  /* Post bodies are fetched when a reader window opens rather than shipped
     with the desktop, so the homepage payload stays flat as posts accumulate. */
  const [body, setBody] = useState(post.contentHtml || null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (body) return undefined;
    let alive = true;
    fetch(`/api/posts/${post.slug}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d) => alive && setBody(d.contentHtml))
      .catch(() => alive && setFailed(true));
    return () => { alive = false; };
  }, [post.slug, body]);

  return (
    <article className="reader">
      <header className="reader-head">
        <div className="os-eyebrow">{post.date} · {post.readingTime} min read</div>
        <h1 className="reader-title">{post.title}</h1>
        {post.description && <p className="reader-desc">{post.description}</p>}
      </header>
      {body ? (
        <div className="os-prose" dangerouslySetInnerHTML={{ __html: body }} />
      ) : (
        <p className="os-muted">
          {failed
            ? "Could not load this post here — open the permalink below."
            : "Loading…"}
        </p>
      )}
      <footer className="reader-foot">
        <a className="os-link" href={`${l.blogBase}/${post.slug}`} target="_blank" rel="noreferrer">
          permalink — {`riz1.dev${l.blogBase}/${post.slug}`} ↗
        </a>
      </footer>
    </article>
  );
}

function About({ identity, onOpen }) {
  return (
    <div className="about">
      <div className="about-head">
        <div className="about-avatar" aria-hidden="true">R</div>
        <div>
          <div className="about-name">{identity.name}</div>
          <div className="about-role">{identity.role}</div>
        </div>
      </div>
      <p className="about-bio">{identity.bio}</p>
      <div className="about-meta">
        <span><b>location</b> {identity.location}</span>
        <span><b>status</b> {identity.status}</span>
        <span><b>focus</b> {identity.focus}</span>
        {identity.education && <span><b>education</b> {identity.education}</span>}
      </div>
      <div className="about-social">
        <a className="about-social-link" href={identity.github} target="_blank" rel="noreferrer">GitHub ↗</a>
        <a className="about-social-link" href={identity.linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a>
        <a className="about-social-link" href={`mailto:${identity.email}`}>{identity.email}</a>
      </div>
      <p className="about-prompt">
        <span className="c">agent{">"}</span> want the tour? run <button className="os-link" style={{ background: "none", border: "none", padding: 0 }} onClick={() => onOpen("projects")}>projects</button>, <button className="os-link" style={{ background: "none", border: "none", padding: 0 }} onClick={() => onOpen("experience")}>experience</button>, or <button className="os-link" style={{ background: "none", border: "none", padding: 0 }} onClick={() => onOpen("blog")}>writing</button>.
      </p>
      <p className="about-legal">Opinions are my own, not my employers&apos; — past or present.</p>
    </div>
  );
}

const LANG_DOT = {
  TypeScript: "#3178c6", JavaScript: "#f1e05a", Python: "#3572A5",
  Shell: "#89e051", Vue: "#41b883", Nuxt: "#00dc82", React: "#61dafb",
};

function Projects({ projects, github }) {
  const featured = projects.filter((p) => p.featured);
  const more = projects.filter((p) => !p.featured);
  return (
    <div className="proj">
      <div className="os-eyebrow">open source — live from github</div>
      {featured.map((p) => (
        <a className="proj-card featured" href={p.url} target="_blank" rel="noreferrer" key={p.repo}>
          <div className="proj-top">
            <span className="proj-name">{p.name}</span>
            <span className="proj-meta">
              {p.stack[0] && (
                <span className="proj-lang">
                  <i style={{ background: LANG_DOT[p.stack[0]] || "var(--violet)" }} />{p.stack[0]}
                </span>
              )}
              {p.stars > 0 && <span className="proj-stars">★ {p.stars}</span>}
              <span aria-hidden="true">↗</span>
            </span>
          </div>
          <div className="proj-tag">{p.tagline}</div>
          <div className="proj-desc">{p.description}</div>
          <div className="proj-topics">
            {p.topics.slice(0, 4).map((tp) => <span key={tp}>{tp}</span>)}
          </div>
        </a>
      ))}
      {more.length > 0 && (
        <>
          <div className="proj-more-label">also building</div>
          <div className="proj-more">
            {more.map((p) => (
              <a className="proj-mini" href={p.url} target="_blank" rel="noreferrer" key={p.repo}>
                <span className="proj-mini-name">{p.name}</span>
                <span className="proj-mini-tag">{p.tagline}</span>
              </a>
            ))}
          </div>
        </>
      )}
      <a className="os-cta ghost" href={github} target="_blank" rel="noreferrer" style={{ alignSelf: "flex-start" }}>
        all repositories ↗
      </a>
    </div>
  );
}

function Experience({ items }) {
  return (
    <div className="exp">
      {items.map((it) => (
        <div className="exp-row" key={`${it.role}-${it.company}`}>
          <div>
            <div className="exp-role">{it.role}</div>
            <div className="exp-co">{it.company}</div>
          </div>
          <div className="exp-range">{it.range}</div>
        </div>
      ))}
    </div>
  );
}

function Skills({ skills }) {
  return (
    <div className="skills-grid">
      {skills.map((s, i) => (
        <span className="skill-chip" key={s} style={{ animationDelay: `${i * 0.03}s` }}>{s}</span>
      ))}
    </div>
  );
}

function Capabilities({ caps }) {
  return (
    <div className="caps">
      {caps.map((c) => (
        <div className="cap" key={c.title}>
          <div className="cap-t">{c.title}</div>
          <div className="cap-d">{c.description}</div>
        </div>
      ))}
    </div>
  );
}

function BlogList({ posts, onReadPost }) {
  if (!posts.length) return <p className="os-muted">No posts yet — check back soon.</p>;
  return (
    <div className="oslist">
      {posts.map((p) => (
        <button className="oslist-row" key={p.slug} onClick={() => onReadPost(p)}>
          <div className="oslist-top">
            <span className="oslist-t">{p.title}</span>
            <span className="oslist-date">{p.date}</span>
          </div>
          {p.description && <div className="oslist-d">{p.description}</div>}
          <div className="oslist-read">{p.readingTime} min read — open in reader ›</div>
        </button>
      ))}
    </div>
  );
}

function Dsa({ l }) {
  return (
    <article className="reader">
      <header className="reader-head">
        <div className="os-eyebrow">long-form essay</div>
        <h1 className="reader-title">{l.dsaTitle}</h1>
        <p className="reader-desc">{l.dsaLead}</p>
      </header>
      <div className="os-prose">
        {l.dsaBodies.map((b, i) => <p key={i}>{b}</p>)}
      </div>
      <footer className="reader-foot">
        <a className="os-link" href={l.dsaBase} target="_blank" rel="noreferrer">
          permalink — riz1.dev{l.dsaBase} ↗
        </a>
      </footer>
    </article>
  );
}

function Links({ links }) {
  return (
    <div className="oslist">
      {links.map((lk) => (
        <a className="oslist-row" href={lk.url} target="_blank" rel="noreferrer" key={lk.url}>
          <div className="oslist-top">
            <span className="oslist-t">{lk.title}</span>
            <span className="oslist-date" aria-hidden="true">↗</span>
          </div>
          {lk.description && <div className="oslist-d">{lk.description}</div>}
          <div className="oslist-url">{lk.url.replace(/^https?:\/\//, "")}</div>
        </a>
      ))}
    </div>
  );
}

function Contact({ socials }) {
  const email = socials.find((s) => s.url.startsWith("mailto:"));
  const rest = socials.filter((s) => !s.url.startsWith("mailto:"));
  return (
    <div className="about" style={{ maxWidth: 400 }}>
      <div className="os-eyebrow">reach out</div>
      {email && (
        <a className="os-cta" href={email.url} style={{ alignSelf: "flex-start" }}>
          ✉ {email.display || email.url.replace(/^mailto:/, "")}
        </a>
      )}
      <div className="oslist">
        {rest.map((s) => (
          <a className="oslist-row" href={s.url} target="_blank" rel="noreferrer" key={s.url}>
            <div className="oslist-top">
              <span className="oslist-t">{s.label}</span>
              <span className="oslist-date" aria-hidden="true">↗</span>
            </div>
            <div className="oslist-url">{s.url.replace(/^https?:\/\//, "")}</div>
          </a>
        ))}
      </div>
    </div>
  );
}
