/* Shared identity block — the desktop hero and the /profile page must agree,
   so neither owns this copy. `bio` is locale-dependent and passed in. */
export function identityFor(bio) {
  return {
    name: "Rizwanul Islam Rudra",
    role: "Senior Software Engineer · Technical Lead",
    location: "Bangkok, Thailand",
    practice: "engineering · AI systems · system design",
    focus: "agentic AI · architecture · team leadership",
    education: "MSc Computer Science · IEEE-published",
    bio,
    stack: "TypeScript · Vue · React · Node · Python",
    email: "rizwanulrudra@gmail.com",
    github: "https://github.com/riz007",
    linkedin: "https://www.linkedin.com/in/rizwanulrudra/",
  };
}
