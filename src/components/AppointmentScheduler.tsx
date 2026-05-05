import { useMemo, useState } from "react";

const SHOP_EMAIL = "service@tyermans.example.com";

const SERVICES = [
  "Wheel alignment",
  "Suspension / steering",
  "Brakes",
  "Tires & balancing",
  "Engine diagnostics",
  "Tune-up",
  "A/C or cooling system",
  "Other / not sure",
];

const TIME_SLOTS = [
  "8:00 AM", "9:00 AM", "10:00 AM",
  "11:00 AM", "12:00 PM", "1:00 PM",
  "2:00 PM", "3:00 PM", "4:00 PM",
];

// Generate 14 working-day options starting tomorrow, skipping weekends.
function generateDays(count = 14): { iso: string; label: string }[] {
  const out: { iso: string; label: string }[] = [];
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 1);
  while (out.length < count) {
    const day = d.getDay();
    if (day !== 0 && day !== 6) {
      const iso = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
      out.push({ iso, label });
    }
    d.setDate(d.getDate() + 1);
  }
  return out;
}

export default function AppointmentScheduler() {
  const days = useMemo(() => generateDays(14), []);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [service, setService] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [time, setTime] = useState<string>("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const canAdvance1 = service !== "";
  const canAdvance2 = date !== "" && time !== "";
  const canSubmit =
    name.trim() !== "" &&
    (email.trim() !== "" || phone.trim() !== "") &&
    vehicle.trim() !== "";

  const dayLabel =
    days.find((d) => d.iso === date)?.label ?? date;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    const subject = `Appointment request — ${service} on ${dayLabel} at ${time}`;
    const lines = [
      "Hi Tyerman's,",
      "",
      "I'd like to book an appointment. Details:",
      "",
      `Name:     ${name}`,
      `Phone:    ${phone || "(not provided)"}`,
      `Email:    ${email || "(not provided)"}`,
      `Vehicle:  ${vehicle}`,
      `Service:  ${service}`,
      `Date:     ${dayLabel}`,
      `Time:     ${time}`,
      "",
      "Notes:",
      notes || "(none)",
      "",
      "Thanks!",
      name,
    ];
    const body = lines.join("\n");

    const mailto = `mailto:${SHOP_EMAIL}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;

    // Open the user's email client with a pre-filled message.
    window.location.href = mailto;
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="sched sched--done">
        <div className="sched__check" aria-hidden="true">✓</div>
        <h2>Almost there!</h2>
        <p>
          Your email client should have opened with your appointment request
          pre-filled to <strong>{SHOP_EMAIL}</strong>. Hit send and we'll
          confirm by phone or email within one business day.
        </p>
        <p>
          If your email app didn't open, you can call us at{" "}
          <a href="tel:+18188467291">(818) 846-7291</a> instead.
        </p>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => {
            setSubmitted(false);
            setStep(1);
            setService("");
            setDate("");
            setTime("");
            setName("");
            setEmail("");
            setPhone("");
            setVehicle("");
            setNotes("");
          }}
        >
          Book another appointment
        </button>
      </div>
    );
  }

  return (
    <form className="sched" onSubmit={handleSubmit} noValidate>
      <ol className="sched__steps">
        <li className={step >= 1 ? "is-active" : ""}>
          <span>1</span> Service
        </li>
        <li className={step >= 2 ? "is-active" : ""}>
          <span>2</span> Date &amp; time
        </li>
        <li className={step >= 3 ? "is-active" : ""}>
          <span>3</span> Your details
        </li>
      </ol>

      {step === 1 && (
        <fieldset className="sched__panel">
          <legend>What can we help with?</legend>
          <p className="sched__hint">
            Pick the closest match. You can describe details on the next step.
          </p>
          <div className="sched__grid">
            {SERVICES.map((s) => (
              <label
                key={s}
                className={`pick ${service === s ? "is-selected" : ""}`}
              >
                <input
                  type="radio"
                  name="service"
                  value={s}
                  checked={service === s}
                  onChange={() => setService(s)}
                />
                <span>{s}</span>
              </label>
            ))}
          </div>
          <div className="sched__actions">
            <button
              type="button"
              className="btn btn--primary"
              disabled={!canAdvance1}
              onClick={() => setStep(2)}
            >
              Continue →
            </button>
          </div>
        </fieldset>
      )}

      {step === 2 && (
        <fieldset className="sched__panel">
          <legend>When works for you?</legend>
          <p className="sched__hint">
            We're open Monday–Friday, 8:00 AM – 5:00 PM. Pick a day and a time.
          </p>

          <div className="sched__subhead">Day</div>
          <div className="sched__days">
            {days.map((d) => (
              <label
                key={d.iso}
                className={`pick pick--day ${date === d.iso ? "is-selected" : ""}`}
              >
                <input
                  type="radio"
                  name="date"
                  value={d.iso}
                  checked={date === d.iso}
                  onChange={() => setDate(d.iso)}
                />
                <span>{d.label}</span>
              </label>
            ))}
          </div>

          <div className="sched__subhead">Time</div>
          <div className="sched__times">
            {TIME_SLOTS.map((t) => (
              <label
                key={t}
                className={`pick pick--time ${time === t ? "is-selected" : ""}`}
              >
                <input
                  type="radio"
                  name="time"
                  value={t}
                  checked={time === t}
                  onChange={() => setTime(t)}
                />
                <span>{t}</span>
              </label>
            ))}
          </div>

          <div className="sched__actions">
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => setStep(1)}
            >
              ← Back
            </button>
            <button
              type="button"
              className="btn btn--primary"
              disabled={!canAdvance2}
              onClick={() => setStep(3)}
            >
              Continue →
            </button>
          </div>
        </fieldset>
      )}

      {step === 3 && (
        <fieldset className="sched__panel">
          <legend>Your details</legend>
          <p className="sched__hint">
            We'll use this to confirm your appointment.
          </p>

          <div className="sched__formgrid">
            <label className="field">
              <span>Name<i>*</i></span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </label>

            <label className="field">
              <span>Phone</span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="tel"
                placeholder="(818) 555-0123"
              />
            </label>

            <label className="field">
              <span>Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="you@example.com"
              />
            </label>

            <label className="field">
              <span>Vehicle (year / make / model)<i>*</i></span>
              <input
                type="text"
                value={vehicle}
                onChange={(e) => setVehicle(e.target.value)}
                required
                placeholder="2018 Toyota Camry"
              />
            </label>

            <label className="field field--full">
              <span>Notes (symptoms, sounds, prior work)</span>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Pulls slightly to the right at highway speeds…"
              />
            </label>
          </div>

          <p className="sched__hint sched__hint--small">
            <strong>Provide either a phone number or an email</strong> so we can
            confirm. Submitting opens your email app to send the request to{" "}
            <code>{SHOP_EMAIL}</code>.
          </p>

          <div className="summary">
            <strong>Summary:</strong> {service} &middot; {dayLabel} at {time}
          </div>

          <div className="sched__actions">
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => setStep(2)}
            >
              ← Back
            </button>
            <button
              type="submit"
              className="btn btn--primary"
              disabled={!canSubmit}
            >
              Send request
            </button>
          </div>
        </fieldset>
      )}
    </form>
  );
}
