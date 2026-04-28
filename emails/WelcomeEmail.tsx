import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

type WelcomeEmailProps = {
  firstName?: string;
};

type VideoModule = {
  title: string;
  eyebrow: string;
  href: string;
  doc?: { label: string; href: string };
};

const VIDEOS: VideoModule[] = [
  {
    title: "Automating Social Posting",
    eyebrow: "Module 01 · Distribution",
    href: "https://fathom.video/share/J4f2ZdbTwVbZoE9-gwRudDadrH6hF8o1",
  },
  {
    title: "Setting Up Obsidian & Claude Cowork",
    eyebrow: "Module 02 · Operating System",
    href: "https://fathom.video/share/yxMNET83qBi1T_UrAA5tpA8ASVZvjogq",
    doc: {
      label: "Companion doc · Google Drive",
      href: "https://docs.google.com/document/d/1EDfDOY_llyFdWqpk4IqWsEAc2B0s4VTJcNb5c5dta4Y/edit?usp=sharing",
    },
  },
];

// Email-safe palette (no Tailwind — inline styles render reliably everywhere)
const C = {
  bg: "#0B0B0C",
  card: "#101013",
  cardAlt: "#0E0E11",
  border: "rgba(255,255,255,0.08)",
  borderBright: "rgba(6,182,212,0.32)",
  text: "#FFFFFF",
  body: "#D1D5DB",
  muted: "#6B7280",
  cyan: "#06B6D4",
  emerald: "#10B981",
  indigo: "#4F46E5",
};

export function WelcomeEmail({ firstName }: WelcomeEmailProps) {
  const greetingName = firstName?.trim() || "operator";

  return (
    <Html>
      <Head />
      <Preview>
        Access granted, {greetingName}. Two briefings inside — lock in your foundation.
      </Preview>
      <Body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: C.bg,
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
          color: C.text,
          WebkitFontSmoothing: "antialiased",
        }}
      >
        <Container
          style={{
            maxWidth: 600,
            margin: "0 auto",
            padding: "40px 24px 56px",
          }}
        >
          {/* ─────────────────────────── LOGO ─────────────────────────── */}
          <Section style={{ textAlign: "center" }}>
            <table
              role="presentation"
              cellPadding={0}
              cellSpacing={0}
              border={0}
              align="center"
              style={{ margin: "0 auto" }}
            >
              <tbody>
                <tr>
                  {/* Geometric play icon (HTML/CSS triangle, email-safe) */}
                  <td style={{ verticalAlign: "middle", paddingRight: 12 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        background:
                          "linear-gradient(135deg, #4F46E5 0%, #06B6D4 50%, #10B981 100%)",
                        borderRadius: 8,
                        position: "relative",
                        display: "inline-block",
                        boxShadow:
                          "0 0 18px rgba(6,182,212,0.45), inset 0 1px 0 rgba(255,255,255,0.25)",
                      }}
                    >
                      {/* CSS triangle "play" glyph */}
                      <span
                        style={{
                          position: "absolute",
                          top: "50%",
                          left: "55%",
                          transform: "translate(-50%, -50%)",
                          width: 0,
                          height: 0,
                          borderTop: "7px solid transparent",
                          borderBottom: "7px solid transparent",
                          borderLeft: "11px solid #FFFFFF",
                        }}
                      />
                    </div>
                  </td>
                  <td style={{ verticalAlign: "middle" }}>
                    <span
                      style={{
                        fontSize: 22,
                        fontWeight: 800,
                        letterSpacing: "-0.5px",
                        color: C.text,
                        lineHeight: 1,
                      }}
                    >
                      Run The{" "}
                    </span>
                    <span
                      style={{
                        fontSize: 22,
                        fontWeight: 800,
                        letterSpacing: "-0.5px",
                        // Gradient text — Apple Mail / iOS / Gmail web support; falls
                        // back to solid cyan on clients that strip background-clip.
                        background:
                          "linear-gradient(90deg, #06B6D4 0%, #10B981 100%)",
                        WebkitBackgroundClip: "text",
                        backgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        color: C.cyan,
                        lineHeight: 1,
                      }}
                    >
                      AI
                    </span>
                    <span
                      style={{
                        fontSize: 22,
                        fontWeight: 800,
                        letterSpacing: "-0.5px",
                        color: C.text,
                        lineHeight: 1,
                      }}
                    >
                      {" "}
                      Play
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </Section>

          {/* Eyebrow tag */}
          <Section style={{ textAlign: "center", marginTop: 32 }}>
            <span
              style={{
                display: "inline-block",
                padding: "6px 12px",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.22em",
                color: C.cyan,
                textTransform: "uppercase",
                border: `1px solid ${C.borderBright}`,
                borderRadius: 999,
                backgroundColor: "rgba(6,182,212,0.08)",
              }}
            >
              · Cohort 01 · Access Granted
            </span>
          </Section>

          {/* ───────────────────────── HEADLINE ───────────────────────── */}
          <Section style={{ marginTop: 24 }}>
            <Heading
              as="h1"
              style={{
                margin: 0,
                fontSize: 34,
                lineHeight: 1.12,
                fontWeight: 800,
                letterSpacing: "-0.8px",
                color: C.text,
                textAlign: "center",
              }}
            >
              Access Granted
              {firstName ? (
                <>
                  ,{" "}
                  <span
                    style={{
                      background:
                        "linear-gradient(90deg, #06B6D4 0%, #10B981 100%)",
                      WebkitBackgroundClip: "text",
                      backgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      color: C.cyan,
                    }}
                  >
                    {firstName}
                  </span>
                </>
              ) : null}
              .
              <br />
              Welcome to the baseline.
            </Heading>

            <Text
              style={{
                margin: "20px auto 0",
                maxWidth: 480,
                fontSize: 15,
                lineHeight: 1.6,
                color: C.body,
                textAlign: "center",
              }}
            >
              You are officially inside Run The AI Play. We don't build
              brochures here — we build semantic infrastructure and automated
              systems. Your first step is to lock in your foundation. Watch the
              two briefings below.
            </Text>
          </Section>

          {/* ───────────────────────── VIDEO CARDS ───────────────────────── */}
          <Section style={{ marginTop: 36 }}>
            {VIDEOS.map((v) => (
              <VideoCard
                key={v.href}
                eyebrow={v.eyebrow}
                title={v.title}
                href={v.href}
                doc={v.doc}
              />
            ))}
          </Section>

          {/* ───────────────────────── DIVIDER ───────────────────────── */}
          <Hr
            style={{
              borderColor: C.border,
              borderTopWidth: 1,
              borderStyle: "solid",
              margin: "44px 0 28px",
            }}
          />

          {/* ───────────────────────── SIGN-OFF ───────────────────────── */}
          <Section style={{ textAlign: "center" }}>
            <Text
              style={{
                margin: 0,
                fontSize: 17,
                fontWeight: 700,
                letterSpacing: "-0.3px",
                color: C.text,
              }}
            >
              Run the play.{" "}
              <span
                style={{
                  background:
                    "linear-gradient(90deg, #06B6D4 0%, #10B981 100%)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  color: C.cyan,
                }}
              >
                Dominate the bots.
              </span>
            </Text>
          </Section>

          {/* ───────────────────────── LEGAL FOOTER ───────────────────────── */}
          <Section style={{ marginTop: 40, textAlign: "center" }}>
            <Text
              style={{
                margin: 0,
                fontSize: 11,
                color: C.muted,
                letterSpacing: "0.04em",
              }}
            >
              © {new Date().getFullYear()} Run The AI Play. All rights reserved.
            </Text>
            <Text
              style={{
                margin: "6px 0 0",
                fontSize: 11,
                color: C.muted,
              }}
            >
              You're receiving this because you registered for the Run The AI
              Play community.{" "}
              <Link
                href="{{unsubscribe_url}}"
                style={{ color: C.muted, textDecoration: "underline" }}
              >
                Unsubscribe
              </Link>
              .
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

/* ─────────────────────────────────────────────────────────
   VideoCard — looks like a playable thumbnail, wraps an <a>
   ───────────────────────────────────────────────────────── */
function VideoCard({
  eyebrow,
  title,
  href,
  doc,
}: {
  eyebrow: string;
  title: string;
  href: string;
  doc?: { label: string; href: string };
}) {
  return (
    <table
      role="presentation"
      cellPadding={0}
      cellSpacing={0}
      border={0}
      width="100%"
      style={{
        backgroundColor: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 16,
        overflow: "hidden",
        boxShadow:
          "0 0 0 1px rgba(6,182,212,0.18), 0 18px 40px -20px rgba(6,182,212,0.45)",
        margin: "16px 0",
      }}
    >
        <tbody>
          {/* "Thumbnail" — gradient panel with centered play glyph */}
          <tr>
            <td
              style={{
                position: "relative",
                height: 168,
                background:
                  "linear-gradient(135deg, #0F172A 0%, #0B1220 50%, #0A1A1F 100%)",
                textAlign: "center",
                verticalAlign: "middle",
                borderBottom: `1px solid ${C.border}`,
              }}
            >
              {/* Soft cyan/emerald wash overlay */}
              <table
                role="presentation"
                cellPadding={0}
                cellSpacing={0}
                border={0}
                width="100%"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  height: 168,
                  background:
                    "radial-gradient(ellipse at 30% 30%, rgba(6,182,212,0.22) 0%, transparent 60%), radial-gradient(ellipse at 75% 75%, rgba(16,185,129,0.18) 0%, transparent 60%)",
                }}
              >
                <tbody>
                  <tr>
                    <td style={{ height: 168, textAlign: "center" }}>
                      {/* Play button */}
                      <div
                        style={{
                          width: 72,
                          height: 72,
                          margin: "0 auto",
                          borderRadius: "50%",
                          background:
                            "linear-gradient(135deg, #06B6D4 0%, #10B981 100%)",
                          position: "relative",
                          boxShadow:
                            "0 0 36px rgba(6,182,212,0.55), inset 0 2px 0 rgba(255,255,255,0.2)",
                        }}
                      >
                        <span
                          style={{
                            position: "absolute",
                            top: "50%",
                            left: "57%",
                            transform: "translate(-50%, -50%)",
                            width: 0,
                            height: 0,
                            borderTop: "12px solid transparent",
                            borderBottom: "12px solid transparent",
                            borderLeft: "20px solid #FFFFFF",
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>

          {/* Title block */}
          <tr>
            <td
              style={{
                padding: "18px 22px 20px",
                backgroundColor: C.cardAlt,
              }}
            >
              <Text
                style={{
                  margin: 0,
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.2em",
                  color: C.cyan,
                  textTransform: "uppercase",
                }}
              >
                {eyebrow}
              </Text>
              <Link
                href={href}
                target="_blank"
                style={{ color: "inherit", textDecoration: "none" }}
              >
                <Text
                  style={{
                    margin: "6px 0 0",
                    fontSize: 18,
                    fontWeight: 700,
                    letterSpacing: "-0.3px",
                    color: C.text,
                    lineHeight: 1.3,
                  }}
                >
                  {title}
                </Text>
              </Link>

              {/* Primary CTA — watch the video */}
              <Link
                href={href}
                target="_blank"
                style={{
                  display: "inline-block",
                  marginTop: 12,
                  padding: "8px 14px",
                  borderRadius: 10,
                  background:
                    "linear-gradient(90deg, rgba(6,182,212,0.18), rgba(16,185,129,0.18))",
                  border: `1px solid ${C.borderBright}`,
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                  color: C.cyan,
                  textDecoration: "none",
                }}
              >
                ▶  Watch briefing
              </Link>

              {/* Secondary CTA — companion doc (optional) */}
              {doc && (
                <Link
                  href={doc.href}
                  target="_blank"
                  style={{
                    display: "inline-block",
                    marginTop: 12,
                    marginLeft: 8,
                    padding: "8px 14px",
                    borderRadius: 10,
                    background: "rgba(255,255,255,0.04)",
                    border: `1px solid ${C.border}`,
                    fontSize: 13,
                    fontWeight: 700,
                    letterSpacing: "0.04em",
                    color: C.text,
                    textDecoration: "none",
                  }}
                >
                  ⬇  {doc.label}
                </Link>
              )}
            </td>
          </tr>
        </tbody>
      </table>
  );
}

export default WelcomeEmail;
