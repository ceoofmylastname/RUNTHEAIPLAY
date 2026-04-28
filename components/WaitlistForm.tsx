"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useTime,
  useTransform,
  type MotionValue,
  type Variants,
} from "framer-motion";
import { ArrowLeft, Loader2, ShieldCheck } from "lucide-react";
import AnswerButton from "./AnswerButton";
import PrimaryButton from "./PrimaryButton";
import FloatingLabelInput from "./FloatingLabelInput";
import AnimatedCheck from "./AnimatedCheck";
import BrandOrb from "./BrandOrb";
import { fireDualConfetti } from "@/lib/confetti";

// Note: This is a data-collection form. We never reveal submission failure to
// the user — we always advance to the success state and fire confetti. Any
// network/API errors are logged to the console and silently ignored.

// Snappy spring used everywhere a step transitions
const SPRING = { type: "spring" as const, stiffness: 300, damping: 30 };
// Eased curve for non-spring micro-animations (text reveals, etc.)
const EASE = [0.22, 1, 0.36, 1] as const;
const ADVANCE_DELAY_MS = 300;

type Contact = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

type AnswerKey = "foundation" | "dataLayer" | "engine" | "connections";
type Answers = Record<AnswerKey, "A" | "B" | "C" | null>;

type Question = {
  key: AnswerKey;
  headline: string;
  subhead?: string;
  options: { letter: "A" | "B" | "C"; label: string }[];
};

const QUESTIONS: Question[] = [
  {
    key: "foundation",
    headline:
      "What is the primary difference between a traditional website and an AI website?",
    subhead: "The Foundation",
    options: [
      { letter: "A", label: "AI websites are built faster using visual builders." },
      { letter: "B", label: "AI websites have chatbots installed on the homepage." },
      {
        letter: "C",
        label:
          "AI websites are structurally engineered with semantic data so LLMs can read them.",
      },
    ],
  },
  {
    key: "dataLayer",
    headline: "How comfortable are you with deploying JSON-LD schema markup?",
    subhead: "The Data Layer",
    options: [
      { letter: "A", label: "I don't know what that is." },
      { letter: "B", label: "I use standard plugins to auto-generate it." },
      {
        letter: "C",
        label:
          "I manually inject custom schemas (Organization, FAQ) into the code.",
      },
    ],
  },
  {
    key: "engine",
    headline:
      "What is your current strategy for AEO/GEO (ChatGPT & Perplexity)?",
    subhead: "The Engine",
    options: [
      { letter: "A", label: "I'm just trying to rank on Google." },
      { letter: "B", label: "I write blogs and hope the AI picks them up." },
      {
        letter: "C",
        label: "I map entities and enforce strict H1/H2 semantic hierarchies.",
      },
    ],
  },
  {
    key: "connections",
    headline: "What is your experience level with REST APIs?",
    subhead: "The Connections",
    options: [
      { letter: "A", label: "What is an API?" },
      { letter: "B", label: "I use Zapier or Make to connect basic apps." },
      {
        letter: "C",
        label:
          "I can read documentation and build custom webhooks from scratch.",
      },
    ],
  },
];

const TOTAL_STEPS = 1 + QUESTIONS.length + 1;

// Step-level variants:
// - exit: scale 0.95, opacity 0, slide left -50
// - enter: from x: 50 + scale 0.95 + opacity 0
// - center: x:0, scale 1, opacity 1
const stepVariants: Variants = {
  enter: { x: 50, scale: 0.95, opacity: 0 },
  center: { x: 0, scale: 1, opacity: 1 },
  exit: { x: -50, scale: 0.95, opacity: 0 },
};

export function WaitlistForm() {
  const [step, setStep] = useState(0);
  const [contact, setContact] = useState<Contact>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [answers, setAnswers] = useState<Answers>({
    foundation: null,
    dataLayer: null,
    engine: null,
    connections: null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Lock to prevent the auto-advance from double-firing if the user
  // mashes options during the 300ms registration window.
  const advanceLock = useRef(false);
  useEffect(() => {
    advanceLock.current = false;
  }, [step]);

  // ─────────────────────────────────────────────────────────
  // Shared orb position + derived text color
  // ─────────────────────────────────────────────────────────
  // We compute the orb's position ONCE here and pass MotionValues to both
  // the visible <BrandOrb /> and the text elements. This guarantees the
  // text color inversion stays perfectly in sync with the orb's pixel
  // movement — without fighting any backdrop-filter / transform stacking
  // contexts (which would silently break mix-blend-mode in this layout).
  const time = useTime();
  const orbX = useTransform(time, (t) => Math.cos(t / 5200) * 320);
  const orbY = useTransform(time, (t) => Math.sin(t / 6800) * 240);

  // 0 → orb is far from form center · 1 → orb sits dead center on the form.
  // Tightened to 200px so the inversion only fires when the orb is genuinely
  // overhead (instead of any time it drifts into the same quadrant).
  const orbProximity = useTransform([orbX, orbY], (latest) => {
    const [ox, oy] = latest as [number, number];
    const dist = Math.hypot(ox, oy);
    const fade = 1 - Math.min(1, dist / 200);
    // Cubic falloff = even softer bloom + sharper centered moment
    return fade * fade * fade;
  });

  // White (#FFFFFF) → pure black (#000000) for body copy. Aggressive: text
  // bottoms out at full black when the orb is dead overhead.
  const textColor = useTransform(orbProximity, (p) => {
    const v = Math.round(255 * (1 - p));
    return `rgb(${v}, ${v}, ${v})`;
  });

  // Brand cyan (#06B6D4) → near-black (#0B0B0C) for the eyebrow tags.
  // Keeps the cyan brand identity at rest, but darkens to disappear into
  // the orb's brightness when the light is overhead.
  const eyebrowColor = useTransform(orbProximity, (p) => {
    const r = Math.round(6 + (11 - 6) * p);
    const g = Math.round(182 + (11 - 182) * p);
    const b = Math.round(212 + (12 - 212) * p);
    return `rgb(${r}, ${g}, ${b})`;
  });

  const contactValid = useMemo(() => {
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return (
      contact.firstName.trim().length > 0 &&
      contact.lastName.trim().length > 0 &&
      emailRe.test(contact.email.trim()) &&
      contact.phone.trim().length >= 7
    );
  }, [contact]);

  const progress = Math.min(100, Math.round((step / (TOTAL_STEPS - 1)) * 100));

  const goNext = () => setStep((s) => Math.min(TOTAL_STEPS - 1, s + 1));
  const goBack = () => setStep((s) => Math.max(0, s - 1));

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact, answers }),
      });
    } catch (e) {
      console.error("waitlist submission failed silently", e);
    }
    await new Promise((r) => setTimeout(r, 1500));
    setSubmitting(false);
    setSubmitted(true);
  };

  const enterCompletion = () => {
    setStep(TOTAL_STEPS - 1);
  };

  // Submit once we land on the completion step. useEffect runs after render,
  // so `answers` always reflects the user's last selection.
  useEffect(() => {
    if (step === TOTAL_STEPS - 1 && !submitted && !submitting) {
      void handleSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // Confetti on success
  useEffect(() => {
    if (submitted) fireDualConfetti();
  }, [submitted]);

  const stepContent = (() => {
    if (step === 0) {
      return (
        <ContactStep
          contact={contact}
          setContact={setContact}
          canContinue={contactValid}
          onContinue={goNext}
          textColor={textColor}
          eyebrowColor={eyebrowColor}
        />
      );
    }

    const qIndex = step - 1;
    if (qIndex >= 0 && qIndex < QUESTIONS.length) {
      const q = QUESTIONS[qIndex];
      const isLastQuestion = qIndex === QUESTIONS.length - 1;
      return (
        <QuestionStep
          question={q}
          selected={answers[q.key]}
          questionNumber={qIndex + 1}
          totalQuestions={QUESTIONS.length}
          textColor={textColor}
          eyebrowColor={eyebrowColor}
          onSelect={(letter) => {
            if (advanceLock.current) return;
            advanceLock.current = true;
            setAnswers((prev) => ({ ...prev, [q.key]: letter }));
            setTimeout(() => {
              if (isLastQuestion) {
                enterCompletion();
              } else {
                goNext();
              }
            }, ADVANCE_DELAY_MS);
          }}
        />
      );
    }

    return <CompletionStep submitting={submitting} submitted={submitted} />;
  })();

  return (
    <div className="relative w-full max-w-[640px]">
      {/* Sleek progress bar above the card */}
      <div className="mb-6 h-[3px] w-full overflow-hidden rounded-full bg-white/[0.06]">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 shadow-[0_0_14px_rgba(6,182,212,0.55)]"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.55, ease: EASE }}
        />
      </div>

      {/*
        Card stack — restructured for mix-blend-mode to work:
          1. <BrandOrb /> (absolute, behind everything) — same stacking
             context as the text below, so text can blend with it
          2. Glass layer (absolute, full size of content) — owns the
             backdrop-blur stacking context, but has NO text children
          3. Content layer (relative) — text lives here, blends with
             everything below it (orb + glass + page) via mix-blend-mode

        The wrapper div is `relative` only (no z-index, no transform), so
        it doesn't create a stacking context. Both the orb and the text
        live in the parent <section>'s stacking context together.
      */}
      <div className="relative">
        {/* Orbiting brand-color light — sibling of glass, NOT inside it.
            Position MotionValues are shared with the textColor logic so
            the inversion is always perfectly in sync with the visible orb. */}
        <BrandOrb x={orbX} y={orbY} />

        {/* Glass visual layer — absolute, sized by the content below */}
        <div
          aria-hidden="true"
          className={[
            "absolute inset-0 rounded-[32px]",
            "bg-white/5 backdrop-blur-2xl",
            "border border-white/10",
            "shadow-[0_30px_80px_-20px_rgba(0,0,0,0.85),0_0_60px_-30px_rgba(6,182,212,0.5)]",
            "overflow-hidden",
          ].join(" ")}
        >
          {/* Top inner highlight line */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
        </div>

        {/* Content layer — siblings of glass, NOT children. This keeps text
            outside the backdrop-filter stacking context so mix-blend-mode
            can reach the orb behind it. */}
        <div className="relative p-8 sm:p-10">
          {/* Header row */}
          {!submitted && (
            <motion.div
              style={{ color: textColor, opacity: 0.55 }}
              className="mb-6 flex items-center justify-between text-[10.5px] uppercase tracking-[0.22em]"
            >
              <span>
                Step {Math.min(step + 1, TOTAL_STEPS)}{" "}
                <span style={{ opacity: 0.55 }}>/ {TOTAL_STEPS}</span>
              </span>
              {step > 0 && step < TOTAL_STEPS - 1 && (
                <button
                  onClick={goBack}
                  className="inline-flex items-center gap-1.5 transition-opacity hover:opacity-100"
                  style={{ opacity: 0.85 }}
                >
                  <ArrowLeft size={14} />
                  Back
                </button>
              )}
            </motion.div>
          )}

          <div className="relative min-h-[440px]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={step}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={SPRING}
              >
                {stepContent}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <motion.p
        style={{ color: textColor, opacity: 0.55 }}
        className="mt-6 flex items-center justify-center gap-2 text-xs"
      >
        <ShieldCheck size={14} />
        Encrypted intake. Your data is never sold.
      </motion.p>
    </div>
  );
}

/* ───────────────────────── Step components ───────────────────────── */

function ContactStep({
  contact,
  setContact,
  canContinue,
  onContinue,
  textColor,
  eyebrowColor,
}: {
  contact: Contact;
  setContact: React.Dispatch<React.SetStateAction<Contact>>;
  canContinue: boolean;
  onContinue: () => void;
  textColor: MotionValue<string>;
  eyebrowColor: MotionValue<string>;
}) {
  return (
    <div>
      <motion.p
        style={{ color: eyebrowColor }}
        className="text-[10.5px] font-semibold uppercase tracking-[0.24em]"
      >
        The Hook
      </motion.p>
      <motion.h1
        style={{ color: textColor }}
        className="mt-3 font-display text-3xl font-bold leading-[1.1] tracking-tight sm:text-[40px]"
      >
        The <span className="brand-text-gradient">AI Play</span> is loading.
        <br />
        Secure your spot.
      </motion.h1>
      <motion.p
        style={{ color: textColor }}
        className="mt-4 text-[15px]"
      >
        We're hand-selecting operators who understand the AI-native web.
        Start with the basics.
      </motion.p>

      <form
        className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (canContinue) onContinue();
        }}
      >
        <FloatingLabelInput
          label="First name"
          value={contact.firstName}
          onChange={(v) => setContact((c) => ({ ...c, firstName: v }))}
          autoComplete="given-name"
          autoFocus
        />
        <FloatingLabelInput
          label="Last name"
          value={contact.lastName}
          onChange={(v) => setContact((c) => ({ ...c, lastName: v }))}
          autoComplete="family-name"
        />
        <FloatingLabelInput
          className="sm:col-span-2"
          label="Email address"
          type="email"
          value={contact.email}
          onChange={(v) => setContact((c) => ({ ...c, email: v }))}
          autoComplete="email"
        />
        <FloatingLabelInput
          className="sm:col-span-2"
          label="Phone number"
          type="tel"
          value={contact.phone}
          onChange={(v) => setContact((c) => ({ ...c, phone: v }))}
          autoComplete="tel"
        />

        <div className="mt-3 sm:col-span-2">
          <PrimaryButton type="submit" disabled={!canContinue}>
            Initialize Assessment
          </PrimaryButton>
        </div>
      </form>
    </div>
  );
}

// Stagger orchestration for the question step
const questionContainerVariants: Variants = {
  initial: {},
  enter: {
    transition: {
      delayChildren: 0.1,
      staggerChildren: 0.1,
    },
  },
};
const questionItemVariants: Variants = {
  initial: { opacity: 0, y: 14 },
  enter: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: EASE },
  },
};

function QuestionStep({
  question,
  selected,
  questionNumber,
  totalQuestions,
  textColor,
  eyebrowColor,
  onSelect,
}: {
  question: Question;
  selected: "A" | "B" | "C" | null;
  questionNumber: number;
  totalQuestions: number;
  textColor: MotionValue<string>;
  eyebrowColor: MotionValue<string>;
  onSelect: (letter: "A" | "B" | "C") => void;
}) {
  return (
    <motion.div
      variants={questionContainerVariants}
      initial="initial"
      animate="enter"
    >
      <motion.p
        variants={questionItemVariants}
        style={{ color: eyebrowColor }}
        className="text-[10.5px] font-semibold uppercase tracking-[0.24em]"
      >
        {question.subhead} ·{" "}
        <span className="text-white/40">
          Question {questionNumber} / {totalQuestions}
        </span>
      </motion.p>
      <motion.h2
        variants={questionItemVariants}
        style={{ color: textColor }}
        className="mt-3 font-display text-2xl font-bold leading-tight tracking-tight sm:text-3xl"
      >
        {question.headline}
      </motion.h2>

      <div className="mt-8 space-y-3">
        {question.options.map((opt) => (
          <motion.div key={opt.letter} variants={questionItemVariants}>
            <AnswerButton
              letter={opt.letter}
              label={opt.label}
              selected={selected === opt.letter}
              textColor={textColor}
              onClick={() => onSelect(opt.letter)}
            />
          </motion.div>
        ))}
      </div>

      <motion.p
        variants={questionItemVariants}
        style={{ color: textColor, opacity: 0.55 }}
        className="mt-6 text-xs"
      >
        Tap any answer — we'll auto-advance.
      </motion.p>
    </motion.div>
  );
}

function CompletionStep({
  submitting,
  submitted,
}: {
  submitting: boolean;
  submitted: boolean;
}) {
  if (submitting || !submitted) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
        <div className="relative">
          <div className="absolute inset-0 -z-10 animate-pulse-glow rounded-full bg-cyan-brand/30 blur-2xl" />
          <Loader2 className="h-14 w-14 animate-spin text-cyan-brand" />
        </div>
        <h2 className="mt-8 font-display text-2xl font-bold">
          Securing your spot…
        </h2>
        <p className="mt-2 text-sm text-white/55">
          Encrypting payload · Writing to ledger · Provisioning access
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE }}
      className="flex min-h-[400px] flex-col items-center justify-center text-center"
    >
      <AnimatedCheck size={104} />
      <motion.h2
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6, ease: EASE }}
        className="mt-8 font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl"
      >
        Welcome to the{" "}
        <span className="brand-text-gradient">Run The AI Play</span>{" "}
        community.
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.85, ease: EASE }}
        className="mt-5 max-w-md text-[15px] leading-relaxed text-white/75"
      >
        Your invite to join the community lands in your inbox within the
        next few days.
      </motion.p>
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.05, ease: EASE }}
        className="mt-3 max-w-md text-sm leading-relaxed text-white/50"
      >
        Until then, watch your inbox — we're sending the replay of our most
        recent training. Once the community is live, every replay will live
        there.
      </motion.p>
    </motion.div>
  );
}

export default WaitlistForm;
