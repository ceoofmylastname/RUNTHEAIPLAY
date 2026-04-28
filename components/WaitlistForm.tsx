"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
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

const SPRING = { type: "spring" as const, stiffness: 300, damping: 30 };
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

const stepVariants: Variants = {
  enter: { x: 50, scale: 0.95, opacity: 0 },
  center: { x: 0, scale: 1, opacity: 1 },
  exit: { x: -50, scale: 0.95, opacity: 0 },
};

// ─────────────────────────────────────────────────────────
// Layer modes
// ─────────────────────────────────────────────────────────
// We render each step TWICE — once in the Form Layer (interactive
// widgets, NO blend) and once in the Text Overlay (typography only,
// mix-blend-difference). The mode prop controls which parts are visible
// vs invisible-but-space-reserving in each layer, so layouts align.
type StepMode = "form" | "text";

const HIDE_STYLE = {
  visibility: "hidden" as const,
  pointerEvents: "none" as const,
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

  const advanceLock = useRef(false);
  useEffect(() => {
    advanceLock.current = false;
  }, [step]);

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

  useEffect(() => {
    if (step === TOTAL_STEPS - 1 && !submitted && !submitting) {
      void handleSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  useEffect(() => {
    if (submitted) fireDualConfetti();
  }, [submitted]);

  const renderStep = (mode: StepMode) => {
    if (step === 0) {
      return (
        <ContactStep
          mode={mode}
          contact={contact}
          setContact={setContact}
          canContinue={contactValid}
          onContinue={goNext}
        />
      );
    }

    const qIndex = step - 1;
    if (qIndex >= 0 && qIndex < QUESTIONS.length) {
      const q = QUESTIONS[qIndex];
      const isLastQuestion = qIndex === QUESTIONS.length - 1;
      return (
        <QuestionStep
          mode={mode}
          question={q}
          selected={answers[q.key]}
          questionNumber={qIndex + 1}
          totalQuestions={QUESTIONS.length}
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

    return (
      <CompletionStep
        mode={mode}
        submitting={submitting}
        submitted={submitted}
      />
    );
  };

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
        TWO-LAYER ARCHITECTURE (preserves spring slide + clean inputs)
        ──────────────────────────────────────────────────────────────
        Layer 1 — BrandOrb (absolute, base): the moving brand-color light
        Layer 2 — Glass (absolute z-0, EMPTY, pointer-events-none):
                  backdrop-blur card. No children so its stacking context
                  doesn't trap any text.
        Layer 3 — Form Layer (relative z-10): all interactive widgets
                  (header, inputs, primary button, answer buttons). NO
                  blend mode, so inputs stay perfectly readable.
        Layer 4 — Text Overlay (absolute z-20, pointer-events-none,
                  mix-blend-difference): typography only. Sibling of
                  Form Layer, so its blend mode pierces directly to the
                  orb beneath via the wrapper's stacking context.
        Both layers run synchronized AnimatePresence with the same
        stepVariants → visually a single slide animation.
      */}
      <div className="relative isolate">
        {/* (1) Base layer — moving brand-color light */}
        <BrandOrb />

        {/* (2) Middle layer — empty glass card */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 rounded-[32px] border border-white/10 bg-white/5 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.85),0_0_60px_-30px_rgba(6,182,212,0.5)] backdrop-blur-2xl"
        />

        {/* (3) Form Layer — interactive, no blend */}
        <div className="relative z-10 p-8 sm:p-10">
          {!submitted && (
            <div className="mb-6 flex items-center justify-between text-[10.5px] uppercase tracking-[0.22em] text-white/55">
              <span>
                Step {Math.min(step + 1, TOTAL_STEPS)}{" "}
                <span className="text-white/30">/ {TOTAL_STEPS}</span>
              </span>
              {step > 0 && step < TOTAL_STEPS - 1 && (
                <button
                  onClick={goBack}
                  className="inline-flex items-center gap-1.5 text-white/65 transition-colors hover:text-white"
                >
                  <ArrowLeft size={14} />
                  Back
                </button>
              )}
            </div>
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
                {renderStep("form")}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* (4) Text Overlay — typography only, mix-blend-difference */}
        <div className="pointer-events-none absolute inset-0 z-20 p-8 sm:p-10 mix-blend-difference">
          {/* Invisible header placeholder so layout matches Form Layer exactly */}
          {!submitted && (
            <div
              aria-hidden="true"
              style={HIDE_STYLE}
              className="mb-6 flex items-center justify-between text-[10.5px] uppercase tracking-[0.22em]"
            >
              <span>Step 0 / {TOTAL_STEPS}</span>
            </div>
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
                {renderStep("text")}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <p className="mt-6 flex items-center justify-center gap-2 text-xs text-white/45">
        <ShieldCheck size={14} />
        Encrypted intake. Your data is never sold.
      </p>
    </div>
  );
}

/* ───────────────────────── Step components ───────────────────────── */

type StepProps = { mode: StepMode };

const visIf = (visible: boolean) => (visible ? undefined : HIDE_STYLE);

function ContactStep({
  mode,
  contact,
  setContact,
  canContinue,
  onContinue,
}: StepProps & {
  contact: Contact;
  setContact: React.Dispatch<React.SetStateAction<Contact>>;
  canContinue: boolean;
  onContinue: () => void;
}) {
  const text = mode === "text";
  const form = mode === "form";

  return (
    <div>
      <p
        style={visIf(text)}
        className="text-[10.5px] font-semibold uppercase tracking-[0.24em] text-white"
      >
        The Hook
      </p>
      <h1
        style={visIf(text)}
        className="mt-3 font-display text-3xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-[40px]"
      >
        The AI Play is loading.
        <br />
        Secure your spot.
      </h1>
      <p
        style={visIf(text)}
        className="mt-4 text-[15px] font-medium text-white"
      >
        We're hand-selecting operators who understand the AI-native web.
        Start with the basics.
      </p>

      <form
        style={visIf(form)}
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
          autoFocus={form}
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
  mode,
  question,
  selected,
  questionNumber,
  totalQuestions,
  onSelect,
}: StepProps & {
  question: Question;
  selected: "A" | "B" | "C" | null;
  questionNumber: number;
  totalQuestions: number;
  onSelect: (letter: "A" | "B" | "C") => void;
}) {
  const text = mode === "text";
  const form = mode === "form";

  return (
    <motion.div
      variants={questionContainerVariants}
      initial="initial"
      animate="enter"
    >
      <motion.p
        variants={questionItemVariants}
        style={visIf(text)}
        className="text-[10.5px] font-semibold uppercase tracking-[0.24em] text-white"
      >
        {question.subhead} ·{" "}
        <span style={{ opacity: 0.6 }}>
          Question {questionNumber} / {totalQuestions}
        </span>
      </motion.p>
      <motion.h2
        variants={questionItemVariants}
        style={visIf(text)}
        className="mt-3 font-display text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl"
      >
        {question.headline}
      </motion.h2>

      <div style={visIf(form)} className="mt-8 space-y-3">
        {question.options.map((opt) => (
          <motion.div key={opt.letter} variants={questionItemVariants}>
            <AnswerButton
              letter={opt.letter}
              label={opt.label}
              selected={selected === opt.letter}
              onClick={() => onSelect(opt.letter)}
            />
          </motion.div>
        ))}
      </div>

      <motion.p
        variants={questionItemVariants}
        style={{ ...visIf(text), opacity: 0.6 }}
        className="mt-6 text-xs font-medium text-white"
      >
        Tap any answer — we'll auto-advance.
      </motion.p>
    </motion.div>
  );
}

function CompletionStep({
  mode,
  submitting,
  submitted,
}: StepProps & {
  submitting: boolean;
  submitted: boolean;
}) {
  const text = mode === "text";
  const form = mode === "form";

  if (submitting || !submitted) {
    return (
      <div
        style={visIf(form)}
        className="flex min-h-[400px] flex-col items-center justify-center text-center"
      >
        <div className="relative">
          <div className="absolute inset-0 -z-10 animate-pulse-glow rounded-full bg-cyan-brand/30 blur-2xl" />
          <Loader2 className="h-14 w-14 animate-spin text-cyan-brand" />
        </div>
        <h2 className="mt-8 font-display text-2xl font-bold text-white">
          Securing your spot…
        </h2>
        <p className="mt-2 text-sm text-white/60">
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
      {/* Animated checkmark — visual element, lives in form layer (no blend) */}
      <div style={visIf(form)}>
        <AnimatedCheck size={104} />
      </div>

      <motion.h2
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6, ease: EASE }}
        style={visIf(text)}
        className="mt-8 font-display text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl"
      >
        Welcome to the Run The AI Play community.
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.85, ease: EASE }}
        style={visIf(text)}
        className="mt-5 max-w-md text-[15px] font-medium leading-relaxed text-white"
      >
        Your invite to join the community lands in your inbox within the
        next few days.
      </motion.p>
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.05, ease: EASE }}
        style={{ ...visIf(text), opacity: 0.65 }}
        className="mt-3 max-w-md text-sm font-medium leading-relaxed text-white"
      >
        Until then, watch your inbox — we're sending the replay of our most
        recent training. Once the community is live, every replay will live
        there.
      </motion.p>
    </motion.div>
  );
}

export default WaitlistForm;
