"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Loader2, ShieldCheck } from "lucide-react";
import AnswerButton from "./AnswerButton";
import PrimaryButton from "./PrimaryButton";
import FloatingLabelInput from "./FloatingLabelInput";
import AnimatedCheck from "./AnimatedCheck";
import { fireDualConfetti } from "@/lib/confetti";

// Note: This is a data-collection form. We never reveal submission failure to
// the user — we always advance to the success state and fire confetti. Any
// network/API errors are logged to the console and silently ignored.

const EASE = [0.16, 1, 0.3, 1] as const;

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

// Custom blur+slide transition (outgoing → blur+fade left, incoming → scale+slide right)
const slideVariants = {
  enter: { x: 80, opacity: 0, scale: 0.96, filter: "blur(8px)" },
  center: { x: 0, opacity: 1, scale: 1, filter: "blur(0px)" },
  exit: { x: -80, opacity: 0, scale: 0.98, filter: "blur(10px)" },
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

  const handleAnswer = (key: AnswerKey, letter: "A" | "B" | "C") => {
    setAnswers((prev) => ({ ...prev, [key]: letter }));
    setTimeout(() => goNext(), 320);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    // Fire-and-forget the network call. Whatever happens server-side, the
    // user sees the success screen — we never reveal failure.
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
    void handleSubmit();
  };

  // Fire confetti as soon as we land on the success state
  useEffect(() => {
    if (submitted) {
      fireDualConfetti();
    }
  }, [submitted]);

  const stepContent = (() => {
    if (step === 0) {
      return (
        <ContactStep
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
          question={q}
          selected={answers[q.key]}
          questionNumber={qIndex + 1}
          totalQuestions={QUESTIONS.length}
          onSelect={(letter) => {
            if (isLastQuestion) {
              setAnswers((prev) => ({ ...prev, [q.key]: letter }));
              setTimeout(() => enterCompletion(), 320);
            } else {
              handleAnswer(q.key, letter);
            }
          }}
        />
      );
    }

    return <CompletionStep submitting={submitting} submitted={submitted} />;
  })();

  return (
    <div className="relative w-full max-w-[640px]">
      {/* Progress bar */}
      <div className="mb-6 h-[3px] w-full overflow-hidden rounded-full bg-white/[0.06]">
        <motion.div
          className="h-full bg-[linear-gradient(90deg,#06B6D4,#10B981)] shadow-[0_0_12px_rgba(6,182,212,0.6)]"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: EASE }}
        />
      </div>

      {/* Glassmorphic panel */}
      <div className="relative">
        {/* Soft pulsing glow behind the panel */}
        <div
          aria-hidden="true"
          className="absolute -inset-6 -z-10 rounded-[36px] bg-cyan-brand/15 blur-3xl animate-pulse-glow"
        />
        <div
          aria-hidden="true"
          className="absolute -inset-10 -z-10 rounded-[36px] bg-emerald-500/10 blur-3xl"
        />

        <div
          className={[
            "relative rounded-[24px] p-8 sm:p-10",
            "bg-black/40 backdrop-blur-xl",
            "border border-white/10",
            "shadow-[0_30px_80px_-20px_rgba(0,0,0,0.85)]",
            "overflow-hidden",
          ].join(" ")}
        >
          {/* Inner highlight line for premium feel */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
          />

          {/* Step counter + back */}
          {!submitted && (
            <div className="mb-6 flex items-center justify-between text-[10.5px] uppercase tracking-[0.22em] text-white/40">
              <span>
                Step {Math.min(step + 1, TOTAL_STEPS)}{" "}
                <span className="text-white/20">/ {TOTAL_STEPS}</span>
              </span>
              {step > 0 && step < TOTAL_STEPS - 1 && (
                <button
                  onClick={goBack}
                  className="inline-flex items-center gap-1.5 text-white/45 transition-colors hover:text-white"
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
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.55, ease: EASE }}
              >
                {stepContent}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <p className="mt-6 flex items-center justify-center gap-2 text-xs text-white/40">
        <ShieldCheck size={14} />
        Encrypted intake. Your data is never sold.
      </p>
    </div>
  );
}

function ContactStep({
  contact,
  setContact,
  canContinue,
  onContinue,
}: {
  contact: Contact;
  setContact: React.Dispatch<React.SetStateAction<Contact>>;
  canContinue: boolean;
  onContinue: () => void;
}) {
  return (
    <div>
      <p className="text-[10.5px] font-semibold uppercase tracking-[0.24em] text-cyan-brand">
        The Hook
      </p>
      <h1 className="mt-3 font-display text-3xl font-bold leading-[1.1] tracking-tight sm:text-[40px]">
        The <span className="brand-text-gradient">AI Play</span> is loading.
        <br />
        Secure your spot.
      </h1>
      <p className="mt-4 text-[15px] text-white/55">
        We're hand-selecting operators who understand the AI-native web.
        Start with the basics.
      </p>

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

function QuestionStep({
  question,
  selected,
  questionNumber,
  totalQuestions,
  onSelect,
}: {
  question: Question;
  selected: "A" | "B" | "C" | null;
  questionNumber: number;
  totalQuestions: number;
  onSelect: (letter: "A" | "B" | "C") => void;
}) {
  return (
    <div>
      <p className="text-[10.5px] font-semibold uppercase tracking-[0.24em] text-cyan-brand">
        {question.subhead} ·{" "}
        <span className="text-white/40">
          Question {questionNumber} / {totalQuestions}
        </span>
      </p>
      <h2 className="mt-3 font-display text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
        {question.headline}
      </h2>

      <div className="mt-8 space-y-3">
        {question.options.map((opt) => (
          <AnswerButton
            key={opt.letter}
            letter={opt.letter}
            label={opt.label}
            selected={selected === opt.letter}
            onClick={() => onSelect(opt.letter)}
          />
        ))}
      </div>

      <p className="mt-6 text-xs text-white/35">
        Tap to select — we'll auto-advance to the next question.
      </p>
    </div>
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
        className="mt-8 font-display text-3xl font-bold tracking-tight sm:text-4xl"
      >
        Access <span className="brand-text-gradient">Registered</span>.
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8, ease: EASE }}
        className="mt-3 text-base text-white/65"
      >
        Watch your inbox.
      </motion.p>
    </motion.div>
  );
}

export default WaitlistForm;
