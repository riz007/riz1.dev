import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

const postsDirectory = path.join(process.cwd(), "posts");

function parsePublishedDate(content) {
  const match = content.match(/\*Published on ([^*]+)\*/);
  return match ? match[1].trim() : null;
}

export async function getPostSlugs() {
  const files = await fs.readdir(postsDirectory);
  return files.filter((file) => file.endsWith(".md"));
}

export async function getAllPosts() {
  const files = await getPostSlugs();
  const posts = await Promise.all(
    files.map(async (file) => {
      const slug = file.replace(/\.md$/, "");
      const filePath = path.join(postsDirectory, file);
      const raw = await fs.readFile(filePath, "utf8");
      const { data, content } = matter(raw);
      const date = data.date || parsePublishedDate(content) || "Coming soon";
      const title =
        data.title || content.match(/^#\s+(.*)/m)?.[1] || slug.replace(/-/g, " ");

      return {
        slug,
        title,
        description: data.description || "",
        date
      };
    })
  );

  return posts.sort((a, b) => (a.date > b.date ? -1 : 1));
}

export async function getPostBySlug(slug) {
  const filePath = path.join(postsDirectory, `${slug}.md`);
  const raw = await fs.readFile(filePath, "utf8");
  const { data, content } = matter(raw);
  const processedContent = await remark().use(html).process(content);
  const contentHtml = processedContent.toString();
  const date = data.date || parsePublishedDate(content) || "";
  const title = data.title || slug.replace(/-/g, " ");

  return {
    slug,
    contentHtml,
    data: {
      ...data,
      title,
      date
    }
  };
}
