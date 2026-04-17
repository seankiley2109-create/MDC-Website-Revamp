"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Send, AlertCircle } from "lucide-react";
import { AnimatedButton } from "@/components/ui/animated-button";

type Category = "technical" | "billing" | "compliance" | "general";
type Priority  = "low" | "normal" | "high" | "critical";

const CATEGORIES: { value: Category; label: string }[] = [
  { value: "technical",  label: "Technical Issue"     },
  { value: "billing",    label: "Billing & Payments"  },
  { value: "compliance", label: "Compliance & POPIA"  },
  { value: "general",    label: "General Enquiry"     },
];

const PRIORITIES: { value: Priority; label: string }[] = [
  { value: "low",      label: "Low — when convenient"    },
  { value: "normal",   label: "Normal — within 1 day"    },
  { value: "high",     label: "High — within 4 hours"    },
  { value: "critical", label: "Critical — system is down" },
];

const fieldClass =
  "w-full bg-white/5 border border-white/10 text-white text-sm px-4 py-3 placeholder:text-montana-muted/50 focus:outline-none focus:border-montana-pink/50 focus:bg-montana-pink/5 transition-all";

const labelClass = "block text-xs font-medium text-montana-muted uppercase tracking-wider mb-1.5";

export function SupportForm() {
  const [subject,  setSubject]  = useState("");
  const [category, setCategory] = useState<Category>("technical");
  const [priority, setPriority] = useState<Priority>("normal");
  const [message,  setMessage]  = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [success,    setSuccess]    = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (subject.trim().length < 5) {
      setError("Please enter a subject of at least 5 characters.");
      return;
    }
    if (message.trim().length < 20) {
      setError("Please provide at least 20 characters of detail.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/support", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ subject: subject.trim(), category, priority, message: message.trim() }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error ?? "Submission failed. Please try again.");
      }

      setSuccess(true);
      setSubject("");
      setMessage("");
      setCategory("technical");
      setPriority("normal");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-400/10 border border-emerald-400/30 mb-4">
          <CheckCircle2 className="h-6 w-6 text-emerald-400" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Ticket Submitted</h3>
        <p className="text-sm text-montana-muted max-w-sm mb-5">
          We've received your request and will be in touch within 1 business day.
          For critical outages call <span className="text-white font-medium">+27 (0)87 188 3843</span>.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="text-sm text-montana-pink hover:underline"
        >
          Submit another ticket
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5 max-w-2xl">
      {/* Subject */}
      <div>
        <label htmlFor="st-subject" className={labelClass}>Subject</label>
        <input
          id="st-subject"
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Brief description of the issue"
          className={fieldClass}
          disabled={submitting}
          maxLength={200}
        />
      </div>

      {/* Category + Priority row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="st-category" className={labelClass}>Category</label>
          <select
            id="st-category"
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            className={fieldClass}
            disabled={submitting}
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value} className="bg-montana-bg">
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="st-priority" className={labelClass}>Priority</label>
          <select
            id="st-priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            className={fieldClass}
            disabled={submitting}
          >
            {PRIORITIES.map((p) => (
              <option key={p.value} value={p.value} className="bg-montana-bg">
                {p.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Message */}
      <div>
        <label htmlFor="st-message" className={labelClass}>
          Message
          <span className="text-montana-muted/40 normal-case tracking-normal ml-1">(min 20 characters)</span>
        </label>
        <textarea
          id="st-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Describe the issue in detail — include any error messages, affected systems, and steps to reproduce."
          rows={5}
          className={`${fieldClass} resize-y min-h-[120px]`}
          disabled={submitting}
          maxLength={5000}
        />
        <p className="mt-1 text-right text-xs text-montana-muted/40">
          {message.length} / 5000
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 text-sm text-red-400 border border-red-400/20 bg-red-400/5 px-4 py-3">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {/* Priority notice */}
      {priority === "critical" && (
        <div className="flex items-start gap-2 text-sm text-amber-400 border border-amber-400/20 bg-amber-400/5 px-4 py-3">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          For immediate assistance call <span className="font-semibold ml-1">+27 (0)87 188 3843</span>. Submitting this form also creates a tracked ticket.
        </div>
      )}

      <AnimatedButton
        type="submit"
        variant="primary"
        disabled={submitting}
        className="flex items-center gap-2 py-3 px-6"
      >
        {submitting ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</>
        ) : (
          <><Send className="h-4 w-4" /> Submit Ticket</>
        )}
      </AnimatedButton>
    </form>
  );
}
