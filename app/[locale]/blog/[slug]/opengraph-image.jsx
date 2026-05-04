import { ImageResponse } from "next/og";
import { getPostBySlug } from "../../../../lib/posts";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export async function generateImageMetadata({ params }) {
  try {
    const post = await getPostBySlug(params.slug);
    return [
      {
        id: params.slug,
        alt: post.data.title,
      },
    ];
  } catch {
    return [{ id: params.slug, alt: "Blog post" }];
  }
}

export default async function OGImage({ params }) {
  let title = "Blog";
  let date = "";
  let description = "";

  try {
    const post = await getPostBySlug(params.slug);
    title = post.data.title || "Blog";
    date = post.data.date || "";
    description = post.data.description || "";
  } catch {
    // fall through with defaults
  }

  return new ImageResponse(
    <div
      style={{
        background: "#F8F5F0",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: "0 80px 64px",
        fontFamily: "Georgia, serif",
        position: "relative",
      }}
    >
      {/* Terracotta top stripe */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 6,
          background: "#B85C38",
        }}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          flex: 1,
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Breadcrumb */}
        <div
          style={{
            color: "#B5B0A7",
            fontSize: 16,
            letterSpacing: 4,
            textTransform: "uppercase",
            marginBottom: 24,
          }}
        >
          riz1.dev · Writing
        </div>

        {/* Post title */}
        <div
          style={{
            color: "#1C1916",
            fontSize: title.length > 60 ? 44 : 56,
            fontWeight: 300,
            lineHeight: 1.1,
            letterSpacing: -2,
            marginBottom: 24,
            maxWidth: 960,
          }}
        >
          {title}
        </div>

        {/* Description */}
        {description && (
          <div
            style={{
              color: "#78746D",
              fontSize: 20,
              lineHeight: 1.5,
              maxWidth: 780,
              marginBottom: 28,
            }}
          >
            {description}
          </div>
        )}

        {/* Author + date */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            color: "#B5B0A7",
            fontSize: 17,
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#B85C38",
            }}
          />
          <span>Rizwanul Islam Rudra</span>
          {date && (
            <>
              <span style={{ color: "#E2DDD4" }}>·</span>
              <span>{date}</span>
            </>
          )}
        </div>
      </div>
    </div>,
    { ...size }
  );
}
