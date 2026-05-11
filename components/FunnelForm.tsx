"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { fireDualConfetti } from "@/lib/confetti";

// ─────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────
type Contact = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

type Answers = {
  role: string;
  aiUse: string;
  primaryPlatform: string;
  monthlyRevenue: string;
  aiExperience: string;
  biggestBlocker: string;
  whyIn: string;
  referralSource: string;
  referralName: string;
};

const PLATFORM_OPTIONS = [
  "YouTube",
  "Instagram",
  "LinkedIn",
  "TikTok",
  "All of them",
];
const REVENUE_OPTIONS = [
  "$0 – I'm starting",
  "$1K–$5K",
  "$5K–$20K",
  "$20K+",
  "I don't track it",
];
const EXPERIENCE_OPTIONS = [
  "Less than 3 months",
  "3–12 months",
  "1–2 years",
  "2+ years",
];
const REFERRAL_OPTIONS = [
  "YouTube",
  "Instagram",
  "TikTok",
  "LinkedIn",
  "Referred by someone",
  "Other",
];

const MIN_LONGFORM = 20;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EASE = [0.16, 1, 0.3, 1] as const;

const stepVariants: Variants = {
  enter: { x: 20, opacity: 0 },
  center: { x: 0, opacity: 1 },
  exit: { x: -20, opacity: 0 },
};

// ─────────────────────────────────────────────────────────
// Reusable form atoms
// ─────────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2 font-mono text-[9px] uppercase tracking-[0.16em] text-funnel-muted">
      {children}
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p
      className="mt-1.5 text-[12px] font-medium"
      style={{ color: "#f43f5e" }}
    >
      {message}
    </p>
  );
}

function TextInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  error,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  error?: string;
  autoComplete?: string;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={[
          "w-full rounded-[4px] px-4 py-3.5 text-[15px] font-medium text-funnel-text outline-none transition-all duration-200",
          "border bg-white/[0.04]",
          error
            ? "border-[rgba(244,63,94,0.4)]"
            : "border-white/10 focus:border-[rgba(139,92,246,0.5)] focus:ring-[3px] focus:ring-[rgba(139,92,246,0.1)]",
          "placeholder:text-funnel-muted/50",
        ].join(" ")}
        style={{ fontFamily: "Inter, sans-serif" }}
      />
      <FieldError message={error} />
    </div>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  error?: string;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={[
          "w-full resize-none rounded-[4px] px-4 py-3.5 text-[15px] font-medium leading-relaxed text-funnel-text outline-none transition-all duration-200",
          "border bg-white/[0.04]",
          error
            ? "border-[rgba(244,63,94,0.4)]"
            : "border-white/10 focus:border-[rgba(139,92,246,0.5)] focus:ring-[3px] focus:ring-[rgba(139,92,246,0.1)]",
          "placeholder:text-funnel-muted/50",
        ].join(" ")}
        style={{ fontFamily: "Inter, sans-serif" }}
      />
      <FieldError message={error} />
    </div>
  );
}

function Chips({
  label,
  options,
  value,
  onChange,
  error,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const selected = value === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              className={[
                "rounded-[4px] border px-4 py-2.5 text-[13px] font-medium transition-all duration-200 min-h-[44px]",
                selected
                  ? "border-[rgba(139,92,246,0.5)] bg-[rgba(139,92,246,0.15)] text-funnel-purpleLight shadow-[0_0_18px_-4px_rgba(139,92,246,0.4)]"
                  : "border-white/10 bg-white/[0.04] text-funnel-muted hover:border-white/20 hover:text-funnel-text",
              ].join(" ")}
            >
              {opt}
            </button>
          );
        })}
      </div>
      <FieldError message={error} />
    </div>
  );
}

function PrimaryCTA({
  children,
  type = "button",
  onClick,
  disabled,
  pulse = false,
}: {
  children: React.ReactNode;
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
  pulse?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={[
        "inline-flex items-center gap-2.5 rounded-[4px] px-8 py-3.5",
        "font-sans text-[15px] font-semibold text-white",
        "transition-all duration-200",
        "min-h-[44px]",
        disabled
          ? "cursor-not-allowed opacity-50"
          : "cursor-pointer hover:-translate-y-px hover:opacity-90 hover:shadow-[0_8px_32px_rgba(139,92,246,0.3)] active:translate-y-0",
        pulse && !disabled ? "animate-cta-pulse" : "",
      ].join(" ")}
      style={{
        background: "linear-gradient(135deg, #22d3ee 0%, #8b5cf6 100%)",
      }}
    >
      {children}
      <ArrowRight size={16} strokeWidth={2.5} />
    </button>
  );
}

function SecondaryBack({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-funnel-muted transition-colors hover:text-funnel-text"
    >
      <ArrowLeft size={13} />
      Back
    </button>
  );
}

// ─────────────────────────────────────────────────────────
// FunnelForm — 5-step application funnel
// ─────────────────────────────────────────────────────────

const TOTAL_STEPS = 5;

export function FunnelForm() {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [contact, setContact] = useState<Contact>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [answers, setAnswers] = useState<Answers>({
    role: "",
    aiUse: "",
    primaryPlatform: "",
    monthlyRevenue: "",
    aiExperience: "",
    biggestBlocker: "",
    whyIn: "",
    referralSource: "",
    referralName: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const progress = (step - 1) / (TOTAL_STEPS - 1);

  // Fire confetti when landing on Step 5
  const confettiFired = useRef(false);
  useEffect(() => {
    if (step === 5 && !confettiFired.current) {
      confettiFired.current = true;
      fireDualConfetti();
    }
  }, [step]);

  // ── Per-step validation ──
  const validateStep1 = (): Record<string, string> => {
    const e: Record<string, string> = {};
    if (!contact.firstName.trim()) e.firstName = "Required.";
    if (!contact.lastName.trim()) e.lastName = "Required.";
    if (!EMAIL_RE.test(contact.email.trim())) e.email = "Enter a valid email.";
    if (contact.phone.replace(/\D/g, "").length < 10)
      e.phone = "Phone must be 10+ digits.";
    return e;
  };
  const validateStep2 = (): Record<string, string> => {
    const e: Record<string, string> = {};
    if (!answers.role.trim()) e.role = "Required.";
    if (answers.aiUse.trim().length < MIN_LONGFORM)
      e.aiUse = `At least ${MIN_LONGFORM} characters.`;
    if (!answers.primaryPlatform) e.primaryPlatform = "Pick one.";
    return e;
  };
  const validateStep3 = (): Record<string, string> => {
    const e: Record<string, string> = {};
    if (!answers.monthlyRevenue) e.monthlyRevenue = "Pick one.";
    if (!answers.aiExperience) e.aiExperience = "Pick one.";
    if (answers.biggestBlocker.trim().length < MIN_LONGFORM)
      e.biggestBlocker = `At least ${MIN_LONGFORM} characters.`;
    return e;
  };
  const validateStep4 = (): Record<string, string> => {
    const e: Record<string, string> = {};
    if (answers.whyIn.trim().length < MIN_LONGFORM)
      e.whyIn = `At least ${MIN_LONGFORM} characters.`;
    if (!answers.referralSource) e.referralSource = "Pick one.";
    if (
      answers.referralSource === "Referred by someone" &&
      !answers.referralName.trim()
    )
      e.referralName = "Who referred you?";
    return e;
  };

  // ── Step navigation ──
  const goNext = () => {
    let e: Record<string, string> = {};
    if (step === 1) e = validateStep1();
    else if (step === 2) e = validateStep2();
    else if (step === 3) e = validateStep3();
    setErrors(e);
    if (Object.keys(e).length === 0) {
      setStep((s) => (Math.min(s + 1, 5) as 1 | 2 | 3 | 4 | 5));
    }
  };
  const goBack = () => {
    setErrors({});
    setStep((s) => (Math.max(s - 1, 1) as 1 | 2 | 3 | 4 | 5));
  };

  // ── Final submit (step 4 → step 5) ──
  const submit = async () => {
    const allErrors = {
      ...validateStep1(),
      ...validateStep2(),
      ...validateStep3(),
      ...validateStep4(),
    };
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      return;
    }
    setSubmitting(true);
    setServerError(null);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact, answers }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          (data as { error?: string }).error ||
            "Something went wrong. Please try again."
        );
      }
      setStep(5);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Submission failed.";
      setServerError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Card wrapper that hosts the active step ──
  const card = (children: React.ReactNode) => (
    <div
      className="relative mx-auto w-full max-w-[620px] rounded-[12px] border p-8 sm:p-10"
      style={{
        background: "rgba(15, 15, 26, 0.8)",
        borderColor: "rgba(255,255,255,0.09)",
        backdropFilter: "blur(28px)",
        WebkitBackdropFilter: "blur(28px)",
        boxShadow:
          "0 0 80px rgba(139,92,246,0.08), 0 0 40px rgba(34,211,238,0.05)",
      }}
    >
      {/* Progress bar (top-inside) */}
      <div className="absolute inset-x-0 top-0 h-[3px] overflow-hidden rounded-t-[12px] bg-white/[0.06]">
        <motion.div
          className="h-full rounded-r-[2px] bg-funnel-divider"
          initial={false}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>

      {/* Step counter */}
      <div className="mb-3 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.16em] text-funnel-muted">
        <span>Step {step} / 5</span>
        {step > 1 && step < 5 && <SecondaryBack onClick={goBack} />}
      </div>

      {children}
    </div>
  );

  // ── Step renderer ──
  const renderStep = () => {
    if (step === 1) return <Step1 contact={contact} setContact={setContact} errors={errors} />;
    if (step === 2) return <Step2 answers={answers} setAnswers={setAnswers} errors={errors} />;
    if (step === 3) return <Step3 answers={answers} setAnswers={setAnswers} errors={errors} />;
    if (step === 4)
      return (
        <Step4
          answers={answers}
          setAnswers={setAnswers}
          errors={errors}
          serverError={serverError}
        />
      );
    return null; // step 5 is rendered as <ThankYou /> at the top level
  };

  return (
    <>
      {step === 5 ? (
        // Step 5 has its own full-width layout — no card
        <ThankYou />
      ) : (
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { duration: step === 1 ? 0.35 : 0.35, ease: EASE },
              opacity: { duration: 0.25, ease: EASE },
            }}
          >
            {card(renderStep())}
            <div className="mt-6 flex items-center justify-end gap-4">
              {step === 4 ? (
                <PrimaryCTA
                  onClick={submit}
                  disabled={submitting}
                  pulse={!submitting}
                >
                  {submitting ? "Submitting…" : "Submit My Application"}
                </PrimaryCTA>
              ) : (
                <PrimaryCTA onClick={goNext}>
                  {step === 1
                    ? "Initialize Assessment"
                    : step === 3
                      ? "Almost there"
                      : "Continue"}
                </PrimaryCTA>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Lock icon footer for step 1 */}
      {step === 1 && (
        <p
          className="mx-auto mt-6 max-w-[620px] text-center text-[12px]"
          style={{ color: "#4a4860" }}
        >
          🔒 Encrypted intake. Your data is never sold.
        </p>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────
// Step components
// ─────────────────────────────────────────────────────────

function StepHeader({
  sectionLabel,
  headline,
  subcopy,
}: {
  sectionLabel: string;
  headline: string;
  subcopy: string;
}) {
  return (
    <>
      <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-funnel-teal">
        {sectionLabel}
      </div>
      <h2
        className="font-hero text-[clamp(28px,4vw,42px)] leading-[1.1]"
        style={{
          background: "linear-gradient(135deg, #8b5cf6 0%, #22d3ee 100%)",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          WebkitTextFillColor: "transparent",
          color: "transparent",
          letterSpacing: "0.02em",
        }}
      >
        {headline}
      </h2>
      <p className="mt-3 text-[15px] font-normal leading-[1.65] text-funnel-muted">
        {subcopy}
      </p>
    </>
  );
}

function Step1({
  contact,
  setContact,
  errors,
}: {
  contact: Contact;
  setContact: React.Dispatch<React.SetStateAction<Contact>>;
  errors: Record<string, string>;
}) {
  return (
    <>
      <StepHeader
        sectionLabel="The Hook"
        headline="THE AI PLAY IS LOADING. SECURE YOUR SPOT."
        subcopy="We're hand-selecting operators who understand the AI-native web. Start with the basics."
      />
      <div className="mt-7 space-y-3.5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <TextInput
            label="First Name"
            value={contact.firstName}
            onChange={(v) => setContact((c) => ({ ...c, firstName: v }))}
            error={errors.firstName}
            autoComplete="given-name"
          />
          <TextInput
            label="Last Name"
            value={contact.lastName}
            onChange={(v) => setContact((c) => ({ ...c, lastName: v }))}
            error={errors.lastName}
            autoComplete="family-name"
          />
        </div>
        <TextInput
          label="Email Address"
          type="email"
          value={contact.email}
          onChange={(v) => setContact((c) => ({ ...c, email: v }))}
          error={errors.email}
          autoComplete="email"
        />
        <TextInput
          label="Phone Number"
          type="tel"
          value={contact.phone}
          onChange={(v) => setContact((c) => ({ ...c, phone: v }))}
          error={errors.phone}
          autoComplete="tel"
        />
      </div>
    </>
  );
}

function Step2({
  answers,
  setAnswers,
  errors,
}: {
  answers: Answers;
  setAnswers: React.Dispatch<React.SetStateAction<Answers>>;
  errors: Record<string, string>;
}) {
  return (
    <>
      <StepHeader
        sectionLabel="Your Mission"
        headline="WHAT ARE YOU BUILDING WITH AI RIGHT NOW?"
        subcopy="Be specific. This helps us match you with the right operators inside the community."
      />
      <div className="mt-7 space-y-5">
        <TextInput
          label="Your Role / Title"
          value={answers.role}
          onChange={(v) => setAnswers((a) => ({ ...a, role: v }))}
          placeholder="e.g. Agency owner, content creator, solopreneur"
          error={errors.role}
        />
        <TextArea
          label="What's your primary use of AI?"
          value={answers.aiUse}
          onChange={(v) => setAnswers((a) => ({ ...a, aiUse: v }))}
          placeholder="Describe what you're actually doing with AI — content, automation, client work, building tools..."
          rows={4}
          error={errors.aiUse}
        />
        <Chips
          label="What platform are you most active on?"
          options={PLATFORM_OPTIONS}
          value={answers.primaryPlatform}
          onChange={(v) => setAnswers((a) => ({ ...a, primaryPlatform: v }))}
          error={errors.primaryPlatform}
        />
      </div>
    </>
  );
}

function Step3({
  answers,
  setAnswers,
  errors,
}: {
  answers: Answers;
  setAnswers: React.Dispatch<React.SetStateAction<Answers>>;
  errors: Record<string, string>;
}) {
  return (
    <>
      <StepHeader
        sectionLabel="Your Context"
        headline="WHERE ARE YOU RIGHT NOW?"
        subcopy="No judgment. Just real context so we can put you with the right people."
      />
      <div className="mt-7 space-y-5">
        <Chips
          label="Monthly revenue from AI / digital work"
          options={REVENUE_OPTIONS}
          value={answers.monthlyRevenue}
          onChange={(v) => setAnswers((a) => ({ ...a, monthlyRevenue: v }))}
          error={errors.monthlyRevenue}
        />
        <Chips
          label="How long have you been using AI in your business?"
          options={EXPERIENCE_OPTIONS}
          value={answers.aiExperience}
          onChange={(v) => setAnswers((a) => ({ ...a, aiExperience: v }))}
          error={errors.aiExperience}
        />
        <TextArea
          label="What's your biggest blocker right now?"
          value={answers.biggestBlocker}
          onChange={(v) => setAnswers((a) => ({ ...a, biggestBlocker: v }))}
          placeholder="What's the one thing stopping you from scaling your AI operation?"
          rows={3}
          error={errors.biggestBlocker}
        />
      </div>
    </>
  );
}

function Step4({
  answers,
  setAnswers,
  errors,
  serverError,
}: {
  answers: Answers;
  setAnswers: React.Dispatch<React.SetStateAction<Answers>>;
  errors: Record<string, string>;
  serverError: string | null;
}) {
  return (
    <>
      <StepHeader
        sectionLabel="The Commitment"
        headline="LAST THING. WHY SHOULD YOU BE IN COHORT 01?"
        subcopy="This is operators only. We're not looking for lurkers. Tell us what you'll bring to the room."
      />
      <div className="mt-7 space-y-5">
        <TextArea
          label="Why do you want in?"
          value={answers.whyIn}
          onChange={(v) => setAnswers((a) => ({ ...a, whyIn: v }))}
          placeholder="What are you going to contribute? What do you want to learn? Be real."
          rows={5}
          error={errors.whyIn}
        />
        <Chips
          label="How did you find us?"
          options={REFERRAL_OPTIONS}
          value={answers.referralSource}
          onChange={(v) => setAnswers((a) => ({ ...a, referralSource: v }))}
          error={errors.referralSource}
        />
        {answers.referralSource === "Referred by someone" && (
          <TextInput
            label="Who referred you?"
            value={answers.referralName}
            onChange={(v) => setAnswers((a) => ({ ...a, referralName: v }))}
            placeholder="Name of the operator who sent you"
            error={errors.referralName}
          />
        )}
        {serverError && (
          <p
            className="text-[13px] font-medium"
            style={{ color: "#f43f5e" }}
          >
            {serverError}
          </p>
        )}
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────
// Step 5 — Thank you
// ─────────────────────────────────────────────────────────

function ThankYou() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE }}
      className="mx-auto max-w-[900px] text-center"
    >
      <div
        className="mx-auto text-[48px] leading-none"
        style={{
          background: "linear-gradient(135deg, #8b5cf6 0%, #22d3ee 100%)",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          WebkitTextFillColor: "transparent",
          color: "transparent",
          fontFamily: "Bebas Neue, sans-serif",
          width: "fit-content",
        }}
      >
        ✦
      </div>
      <h2
        className="mx-auto mt-4 font-hero text-[clamp(48px,8vw,80px)] leading-[1]"
        style={{
          background: "linear-gradient(135deg, #8b5cf6 0%, #ec4899 50%, #22d3ee 100%)",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          WebkitTextFillColor: "transparent",
          color: "transparent",
          letterSpacing: "0.02em",
        }}
      >
        YOU&apos;RE IN THE QUEUE.
      </h2>
      <p
        className="mt-4 text-[20px] font-semibold"
        style={{ color: "#a78bfa", fontFamily: "Inter, sans-serif" }}
      >
        Cohort 01 — Application Received
      </p>
      <p className="mx-auto mt-5 max-w-[520px] text-[15px] leading-[1.65] text-funnel-muted">
        We review every application manually. If you&apos;re the right fit,
        you&apos;ll hear from us within 48 hours. Check your email — including
        spam — for next steps.
      </p>

      <div
        className="mx-auto my-10 h-px max-w-[400px]"
        style={{
          background:
            "linear-gradient(90deg, transparent, #8b5cf6, #ec4899, #22d3ee, transparent)",
        }}
      />

      <div className="mx-auto grid max-w-[700px] grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { stat: "48 hrs", label: "Avg response time" },
          { stat: "Operators", label: "No lurkers. No fluff." },
          { stat: "Cohort 01", label: "Limited seats" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-[12px] border p-5 text-center"
            style={{
              background: "rgba(15, 15, 26, 0.8)",
              borderColor: "rgba(255,255,255,0.09)",
              backdropFilter: "blur(28px)",
              WebkitBackdropFilter: "blur(28px)",
            }}
          >
            <div
              className="font-hero text-[32px] leading-none"
              style={{
                background:
                  "linear-gradient(135deg, #8b5cf6 0%, #22d3ee 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
                color: "transparent",
                letterSpacing: "0.02em",
              }}
            >
              {s.stat}
            </div>
            <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-funnel-muted">
              {s.label}
            </div>
          </div>
        ))}
      </div>

      <p className="mt-10 text-[13px] text-funnel-muted">
        While you wait — follow along:
      </p>
      <div className="mt-3 flex flex-wrap items-center justify-center gap-2.5">
        <a
          href="https://www.youtube.com/@iamjohnmelvin"
          target="_blank"
          rel="noreferrer"
          className="rounded-[4px] border border-white/10 bg-white/[0.04] px-4 py-2 text-[13px] font-medium text-funnel-text transition-all hover:border-white/20 hover:bg-white/[0.08]"
        >
          @iamjohnmelvin on YouTube
        </a>
        <a
          href="https://www.instagram.com/iamjohnmelvin"
          target="_blank"
          rel="noreferrer"
          className="rounded-[4px] border border-white/10 bg-white/[0.04] px-4 py-2 text-[13px] font-medium text-funnel-text transition-all hover:border-white/20 hover:bg-white/[0.08]"
        >
          @iamjohnmelvin on Instagram
        </a>
      </div>
    </motion.div>
  );
}

export default FunnelForm;
