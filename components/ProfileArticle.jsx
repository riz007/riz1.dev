import Link from "next/link";

/* The crawlable, readable half of the homepage.
   RudraOS occupies the first viewport; this is the real document underneath it
   — server-rendered, semantic, and reachable by scrolling, which is what makes
   it legitimate content rather than text hidden behind an overlay. It is also
   the only version of the homepage available to screen readers and to anyone
   who never opens a window. */
export default function ProfileArticle({ locale, identity, copy, experience, capabilities, skills, projects, posts }) {
  const featured = projects.filter((p) => p.featured).slice(0, 3);

  return (
    <section className="profile" id="profile" aria-label="Profile">
      <div className="profile-inner">
        <header className="profile-hd">
          <p className="profile-eyebrow">{identity.role}</p>
          <h1 className="profile-h1">{identity.name}</h1>
          <p className="profile-lead">{identity.bio}</p>
          <dl className="profile-facts">
            <div><dt>Location</dt><dd>{identity.location}</dd></div>
            <div><dt>Focus</dt><dd>{identity.focus}</dd></div>
            <div><dt>Practice</dt><dd>{identity.practice}</dd></div>
            <div><dt>Stack</dt><dd>{identity.stack}</dd></div>
            <div><dt>Education</dt><dd>{identity.education}</dd></div>
          </dl>
          <p className="profile-cta">
            <Link className="profile-btn" href={`/${locale}/blog`}>{copy.ctaPrimary}</Link>
            <Link className="profile-btn ghost" href={`/${locale}/dsa`}>{copy.dsaTitle}</Link>
            <Link className="profile-btn ghost" href={`/${locale}/links`}>{copy.ctaSecondary}</Link>
          </p>
        </header>

        <section className="profile-sec" aria-labelledby="h-capabilities">
          <h2 className="profile-h2" id="h-capabilities">{copy.capabilitiesTitle}</h2>
          <p className="profile-body">{copy.capabilitiesBody}</p>
          <div className="profile-cards">
            {capabilities.map((c) => (
              <article className="profile-card" key={c.title}>
                <h3 className="profile-h3">{c.title}</h3>
                <p>{c.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="profile-sec" aria-labelledby="h-experience">
          <h2 className="profile-h2" id="h-experience">{copy.experienceTitle}</h2>
          <p className="profile-body">{copy.experienceBody}</p>
          <ol className="profile-roles">
            {experience.map((job) => (
              <li key={`${job.company}-${job.range}`}>
                <span className="profile-role">{job.role}</span>
                <span className="profile-company">{job.company}</span>
                <span className="profile-range">{job.range}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="profile-sec" aria-labelledby="h-projects">
          <h2 className="profile-h2" id="h-projects">Open source</h2>
          <div className="profile-cards">
            {featured.map((p) => (
              <article className="profile-card" key={p.repo}>
                <h3 className="profile-h3">
                  <a href={p.url} target="_blank" rel="noreferrer">{p.name}</a>
                </h3>
                <p>{p.description}</p>
                <p className="profile-stack">{p.stack.join(" · ")}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="profile-sec" aria-labelledby="h-writing">
          <h2 className="profile-h2" id="h-writing">{copy.blogTitle}</h2>
          <p className="profile-body">{copy.blogSubtitle}</p>
          <ul className="profile-posts">
            {posts.slice(0, 5).map((post) => (
              <li key={post.slug}>
                <Link href={`/${locale}/blog/${post.slug}`}>
                  <span className="profile-post-t">{post.title}</span>
                  {post.description && <span className="profile-post-d">{post.description}</span>}
                </Link>
                {post.isoDate && (
                  <time dateTime={post.isoDate} className="profile-post-m">
                    {post.date} · {post.readingTime} min read
                  </time>
                )}
              </li>
            ))}
          </ul>
          <p className="profile-more">
            <Link href={`/${locale}/blog`}>All posts →</Link>
          </p>
        </section>

        <section className="profile-sec" aria-labelledby="h-skills">
          <h2 className="profile-h2" id="h-skills">{copy.focusTitle}</h2>
          <p className="profile-body">{copy.focusBody}</p>
          <ul className="profile-skills">
            {skills.map((s) => <li key={s}>{s}</li>)}
          </ul>
        </section>

        <section className="profile-sec" aria-labelledby="h-contact">
          <h2 className="profile-h2" id="h-contact">Contact</h2>
          <p className="profile-body">
            Always glad to talk engineering, system design, or agentic AI. Reach me at{" "}
            <a href={`mailto:${identity.email}`}>{identity.email}</a>, or on{" "}
            <a href={identity.linkedin} target="_blank" rel="noreferrer">LinkedIn</a> and{" "}
            <a href={identity.github} target="_blank" rel="noreferrer">GitHub</a>.
          </p>
        </section>
      </div>
    </section>
  );
}
