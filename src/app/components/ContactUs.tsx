import { useState } from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { toast } from "sonner";
import { SitePage } from "./SitePage";

type Props = { onBack: () => void; reason?: string };

export function ContactUs({ onBack, reason }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState(reason === "advertising" ? "Advertising" : "General");
  const [message, setMessage] = useState(
    reason === "advertising"
      ? "I am interested in advertising on Marketly…"
      : "",
  );

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) {
      toast.error("Please enter your name");
      return;
    }
    if (!email.includes("@")) {
      toast.error("Please enter a valid email");
      return;
    }
    if (message.trim().length < 10) {
      toast.error("Please write a short message (at least 10 characters)");
      return;
    }
    toast.success("Message sent — our team will get back to you shortly");
    setMessage("");
  };

  return (
    <SitePage
      title="Contact Us"
      subtitle={reason === "advertising" ? "Advertising inquiries" : "We are here to help"}
      onBack={onBack}
    >
      <div className="space-y-6">
        {reason === "advertising" && (
          <div className="rounded-2xl border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/30 p-4 text-sm text-blue-900 dark:text-blue-200">
            Looking to advertise on Marketly? Tell us about your brand, budget, and goals — our
            partnerships team will respond with options for homepage banners, featured slots, and
            dealer promotions.
          </div>
        )}

        <div className="grid sm:grid-cols-3 gap-3">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 text-sm">
            <Mail className="size-4 text-blue-600 mb-2" />
            <p className="font-medium">Email</p>
            <a href="mailto:support@marketly.ae" className="text-blue-600 hover:underline">
              support@marketly.ae
            </a>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 text-sm">
            <Phone className="size-4 text-emerald-600 mb-2" />
            <p className="font-medium">Phone</p>
            <a href="tel:+97140000000" className="text-blue-600 hover:underline">
              +971 4 000 0000
            </a>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 text-sm">
            <MapPin className="size-4 text-violet-600 mb-2" />
            <p className="font-medium">Office</p>
            <p className="text-slate-500">Dubai, United Arab Emirates</p>
          </div>
        </div>

        <form
          onSubmit={submit}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4"
        >
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 outline-none focus:border-blue-600"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 outline-none focus:border-blue-600"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Topic</label>
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 outline-none focus:border-blue-600"
            >
              {["General", "Advertising", "Support", "Partnerships", "Safety report"].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Message</label>
            <textarea
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 outline-none focus:border-blue-600 resize-none"
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
          >
            <Send className="size-4" /> Send message
          </button>
        </form>
      </div>
    </SitePage>
  );
}
