"use client";

import { useState, type FormEvent } from "react";

type FormState =
  | { status: "ready" }
  | { status: "submitting" }
  | { status: "saved" }
  | { status: "error"; message: string };

type ApiResponse = {
  error?: string;
  success?: boolean;
};

export function RsvpForm() {
  const [formState, setFormState] = useState<FormState>({ status: "ready" });
  const [guestName, setGuestName] = useState("");
  const [attending, setAttending] = useState<boolean | null>(null);
  const [contact, setContact] = useState("");
  const [questions, setQuestions] = useState("");
  const isSubmitting = formState.status === "submitting";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (attending === null) {
      return;
    }

    setFormState({ status: "submitting" });

    try {
      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "submit",
          guestName,
          attending,
          contact: contact.trim(),
          questions: questions.trim(),
        }),
      });
      const result = (await response.json()) as ApiResponse;

      if (!response.ok) {
        throw new Error(result.error ?? "We couldn't save your RSVP. Please try again.");
      }

      setFormState({ status: "saved" });
    } catch (error) {
      setFormState({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "We couldn't save your RSVP. Please try again.",
      });
    }
  }

  return (
    <form className="rsvp-form" onSubmit={handleSubmit}>
      <label className="rsvp-field">
        <span>Guest Name</span>
        <input
          autoComplete="name"
          maxLength={100}
          name="guestName"
          onChange={(event) => setGuestName(event.target.value)}
          required
          value={guestName}
        />
      </label>

      <fieldset className="rsvp-attendance">
        <legend>Will you be joining us?</legend>
        <div className="rsvp-choice-row">
          <label className="rsvp-choice-card">
            <input
              checked={attending === true}
              name="attending"
              onChange={() => setAttending(true)}
              required
              type="radio"
            />
            <span>
              <strong>Joyfully accepts</strong>
              <span>We can’t wait to celebrate with you.</span>
            </span>
          </label>
          <label className="rsvp-choice-card">
            <input
              checked={attending === false}
              name="attending"
              onChange={() => {
                setAttending(false);
              }}
              type="radio"
            />
            <span>
              <strong>Regretfully declines</strong>
              <span>We’ll miss you on our special day.</span>
            </span>
          </label>
        </div>
      </fieldset>

      <label className="rsvp-field">
        <span>
          Email or phone <span className="rsvp-optional">(optional)</span>
        </span>
        <input
          autoComplete="email"
          maxLength={150}
          onChange={(event) => setContact(event.target.value)}
          placeholder="How we can reach you"
          value={contact}
        />
      </label>

      <label className="rsvp-field">
        <span>
          Questions <span className="rsvp-optional">(if any)</span>
        </span>
        <textarea
          maxLength={1000}
          name="questions"
          onChange={(event) => setQuestions(event.target.value)}
          placeholder="Anything you'd like to ask us?"
          rows={4}
          value={questions}
        />
      </label>

      {formState.status === "error" && (
        <p className="rsvp-status rsvp-status-error" role="alert">
          {formState.message}
        </p>
      )}
      {formState.status === "saved" && (
        <p className="rsvp-status rsvp-status-success" role="status">
          Thank you! Your RSVP has been saved.
        </p>
      )}

      <button
        className="rsvp-submit"
        disabled={isSubmitting || formState.status === "saved"}
        type="submit"
      >
        {isSubmitting ? "Saving your RSVP..." : formState.status === "saved" ? "RSVP saved" : "Send RSVP"}
      </button>
    </form>
  );
}
