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

// ─────────────────────────────────────────────────────────
// Animated gradient typography styles
// ─────────────────────────────────────────────────────────
// Pure white text with mix-blend-mode washed out when the orb passed behind
// it. Replaced with a continuously-animating multi-color gradient + tight
// dark drop-shadow. The gradient is bg-clipped to the text and animates
// `background-position` 0% → 100% → 0% via the `gradient` keyframe defined
// in tailwind.config.ts. The drop-shadow keeps every glyph crisp regardless
// of what brand color is animating behind it.
const GRADIENT_TEXT_BASE =
  "bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400 bg-[length:200%_auto] bg-clip-text text-transparent animate-gradient drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]";

type Contact = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

type AnswerKey =
  | "aiWebsites"
  | "knowledge"
  | "copywriting"
  | "dataSystems"
  | "bigPicture";
type Answers = Record<AnswerKey, "A" | "B" | "C" | null>;

type Question = {
  key: AnswerKey;
  headline: string;
  subhead?: string;
  options: { letter: "A" | "B" | "C"; label: string }[];
};

const QUESTIONS: Question[] = [
  {
    key: "aiWebsites",
    headline:
      "What is the critical difference between a traditional landing page and an AI-native website?",
    subhead: "AI Websites",
    options: [
      {
        letter: "A",
        label: "AI websites are built faster using visual drag-and-drop builders.",
      },
      {
        letter: "B",
        label: "AI websites have personalized chatbots installed on the homepage.",
      },
      {
        letter: "C",
        label:
          "AI websites are structurally engineered with semantic data for LLMs to cite them.",
      },
    ],
  },
  {
    key: "knowledge",
    headline:
      "How do you currently map and organize your marketing campaigns and AI prompts?",
    subhead: "Knowledge & Note-Taking",
    options: [
      { letter: "A", label: "Paper notebooks and scattered Google Docs." },
      {
        letter: "B",
        label:
          "Basic linear note-takers (Apple Notes, Google Keep, Evernote).",
      },
      {
        letter: "C",
        label:
          "An interconnected knowledge base (like Obsidian) to map contextual relationships.",
      },
    ],
  },
  {
    key: "copywriting",
    headline:
      "When writing high-ticket marketing copy or executing frameworks, which environment do you rely on?",
    subhead: "Copywriting & Execution",
    options: [
      {
        letter: "A",
        label: "I ask standard ChatGPT to write the whole thing for me.",
      },
      {
        letter: "B",
        label: "I use Claude Chat for basic formatting and tone adjustments.",
      },
      {
        letter: "C",
        label:
          "I use advanced environments like Claude Co-work or Claude Code to build and refine specific frameworks.",
      },
    ],
  },
  {
    key: "dataSystems",
    headline:
      "How do you handle complex data analysis, scraping, or advanced AI workflows?",
    subhead: "Data & Systems",
    options: [
      { letter: "A", label: "I don't. That's too technical for me." },
      {
        letter: "B",
        label: "I use no-code tools like Zapier or Make to connect basic apps.",
      },
      {
        letter: "C",
        label:
          "I run custom Python scripts in Jupyter Notebooks or use agentic coding tools.",
      },
    ],
  },
  {
    key: "bigPicture",
    headline:
      "What is your primary goal for integrating AI into your digital marketing operations?",
    subhead: "The Big Picture",
    options: [
      {
        letter: "A",
        label: "Generating endless amounts of blog posts and social media content.",
      },
      {
        letter: "B",
        label: "Firing my current team to save money on payroll.",
      },
      {
        letter: "C",
        label:
          "Building automated systems that scale revenue and client fulfillment without scaling headcount.",
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

export function WaitlistForm() {
  const [step, setStep] = useState(0);
  const [contact, setContact] = useState<Contact>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [answers, setAnswers] = useState<Answers>({
    aiWebsites: null,
    knowledge: null,
    copywriting: null,
    dataSystems: null,
    bigPicture: null,
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

      {/* Single-layer card stack — no more mix-blend-mode.
          Headlines use animated gradient text + dark drop-shadow for
          per-letter readability over the moving orb behind. */}
      <div className="relative isolate">
        {/* (1) Base layer — moving brand-color light */}
        <BrandOrb />

        {/* (2) Middle layer — empty glass card */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 rounded-[32px] border border-white/10 bg-white/5 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.85),0_0_60px_-30px_rgba(6,182,212,0.5)] backdrop-blur-2xl"
        />

        {/* (3) Content — interactive form, no blend modes */}
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
                {stepContent}
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
      <p className="text-[10.5px] font-semibold uppercase tracking-[0.24em] text-cyan-brand drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
        The Hook
      </p>
      <h1
        className={`mt-3 font-display text-3xl font-extrabold leading-[1.05] tracking-tight sm:text-[40px] ${GRADIENT_TEXT_BASE}`}
      >
        The AI Play is loading.
        <br />
        Secure your spot.
      </h1>
      <p className="mt-4 text-[15px] font-medium text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
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
  onSelect,
}: {
  question: Question;
  selected: "A" | "B" | "C" | null;
  questionNumber: number;
  totalQuestions: number;
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
        className="text-[10.5px] font-semibold uppercase tracking-[0.24em] text-cyan-brand drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]"
      >
        {question.subhead} ·{" "}
        <span className="text-white/50">
          Question {questionNumber} / {totalQuestions}
        </span>
      </motion.p>
      <motion.h2
        variants={questionItemVariants}
        className={`mt-3 font-display text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl ${GRADIENT_TEXT_BASE}`}
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
              onClick={() => onSelect(opt.letter)}
            />
          </motion.div>
        ))}
      </div>

      <motion.p
        variants={questionItemVariants}
        className="mt-6 text-xs font-medium text-white/65 drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]"
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
        <h2 className="mt-8 font-display text-2xl font-extrabold text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
          Securing your spot…
        </h2>
        <p className="mt-2 text-sm text-white/65 drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">
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
        className={`mt-8 font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl ${GRADIENT_TEXT_BASE}`}
      >
        Welcome to the Run The AI Play community.
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.85, ease: EASE }}
        className="mt-5 max-w-md text-[15px] font-medium leading-relaxed text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]"
      >
        Your invite to join the community lands in your inbox within the
        next few days.
      </motion.p>
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.05, ease: EASE }}
        className="mt-3 max-w-md text-sm font-medium leading-relaxed text-white/70 drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]"
      >
        Until then, watch your inbox — we're sending the replay of our most
        recent training. Once the community is live, every replay will live
        there.
      </motion.p>
    </motion.div>
  );
}

export default WaitlistForm;
