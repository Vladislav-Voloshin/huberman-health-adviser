import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service — Craftwell",
  description:
    "Terms and conditions for using the Craftwell health protocols application.",
};

export default function TermsOfServicePage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to home
      </Link>

      <h1 className="text-3xl font-bold text-foreground mb-2">
        Terms of Service
      </h1>
      <p className="text-sm text-muted-foreground mb-8">
        Last updated: March 2026
      </p>

      <div className="space-y-8 text-muted-foreground">
        {/* Agreement */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            Agreement to Terms
          </h2>
          <p>
            By accessing or using Craftwell (&quot;the Service&quot;), you agree
            to be bound by these Terms of Service. If you do not agree to these
            terms, you may not use the Service. These terms constitute a legally
            binding agreement between you and Craftwell.
          </p>
        </section>

        {/* Health Disclaimer */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            Health Disclaimer
          </h2>
          <p className="font-medium text-foreground">
            Craftwell does not provide medical advice.
          </p>
          <p>
            The health protocols, recommendations, and information presented in
            this application are for educational and informational purposes only.
            They are derived from peer-reviewed scientific research and publicly
            available health information but are not a substitute for
            professional medical advice, diagnosis, or treatment.
          </p>
          <p>
            Always consult your physician or a qualified healthcare provider
            before starting any new health protocol, supplement, exercise
            program, or making changes to your existing health routine.
            Individual results may vary, and what works for one person may not be
            appropriate for another.
          </p>
          <p>
            The AI chat assistant provides general information based on
            scientific literature. It is not a licensed medical professional and
            should not be relied upon for medical decisions. If you are
            experiencing a medical emergency, call your local emergency services
            immediately.
          </p>
        </section>

        {/* User Accounts */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            User Accounts
          </h2>
          <p>
            To access certain features of Craftwell, you must create an account.
            You are responsible for:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              Maintaining the confidentiality of your account credentials.
            </li>
            <li>All activity that occurs under your account.</li>
            <li>
              Providing accurate and up-to-date information during registration.
            </li>
            <li>
              Notifying us immediately if you suspect unauthorized access to your
              account.
            </li>
          </ul>
          <p>
            You must be at least 16 years old to create an account and use the
            Service.
          </p>
        </section>

        {/* Acceptable Use */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            Acceptable Use
          </h2>
          <p>When using Craftwell, you agree not to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              Use the Service for any unlawful purpose or in violation of any
              applicable laws.
            </li>
            <li>
              Attempt to gain unauthorized access to the Service, other user
              accounts, or our systems.
            </li>
            <li>
              Interfere with or disrupt the integrity or performance of the
              Service.
            </li>
            <li>
              Scrape, crawl, or use automated tools to extract content or data
              from the Service without our express permission.
            </li>
            <li>
              Reverse-engineer, decompile, or disassemble any part of the
              Service.
            </li>
            <li>
              Use the AI chat feature to generate content that is harmful,
              abusive, or intended to mislead others about medical treatments.
            </li>
            <li>
              Share your account credentials with third parties or create
              multiple accounts.
            </li>
          </ul>
        </section>

        {/* Intellectual Property */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            Intellectual Property
          </h2>
          <p>
            The Craftwell application, including its design, code, branding, and
            original content, is owned by Craftwell and protected by applicable
            intellectual property laws.
          </p>
          <p>
            Health protocols presented in the application are derived from
            peer-reviewed research and publicly available scientific literature.
            They are curated, summarized, and organized by Craftwell but are not
            direct copies of any single source. The specific presentation,
            ranking system, and implementation guidance are original to
            Craftwell.
          </p>
          <p>
            You retain ownership of any personal data you provide, including your
            survey responses and chat conversations.
          </p>
        </section>

        {/* Limitation of Liability */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            Limitation of Liability
          </h2>
          <p>
            To the fullest extent permitted by law, Craftwell shall not be liable
            for any indirect, incidental, special, consequential, or punitive
            damages arising from your use of the Service, including but not
            limited to:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              Health outcomes resulting from following protocols or
              recommendations presented in the application.
            </li>
            <li>
              Errors, inaccuracies, or omissions in the content or AI-generated
              responses.
            </li>
            <li>
              Loss of data, unauthorized access, or service interruptions.
            </li>
            <li>
              Any third-party actions or content accessed through the Service.
            </li>
          </ul>
          <p>
            The Service is provided &quot;as is&quot; and &quot;as
            available&quot; without warranties of any kind, either express or
            implied. We do not warrant that the Service will be uninterrupted,
            error-free, or free of harmful components.
          </p>
        </section>

        {/* Termination */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            Termination
          </h2>
          <p>
            You may stop using Craftwell and delete your account at any time
            through your profile settings.
          </p>
          <p>
            We reserve the right to suspend or terminate your account if you
            violate these Terms of Service, engage in abusive behavior, or use
            the Service in a manner that could harm other users or the integrity
            of the platform. We will make reasonable efforts to notify you before
            taking such action, except where immediate action is necessary.
          </p>
          <p>
            Upon termination, your right to access the Service ceases
            immediately. Data deletion follows the process described in our
            Privacy Policy.
          </p>
        </section>

        {/* Changes to Terms */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            Changes to These Terms
          </h2>
          <p>
            We may revise these Terms of Service from time to time. When we make
            material changes, we will notify you through the application or by
            email. Your continued use of Craftwell after revised terms are posted
            constitutes your acceptance of the changes.
          </p>
          <p>
            We encourage you to review these terms periodically to stay informed
            about your rights and obligations.
          </p>
        </section>

        {/* Governing Law */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            Governing Law
          </h2>
          <p>
            These Terms of Service are governed by and construed in accordance
            with applicable laws. Any disputes arising from these terms or your
            use of the Service will be resolved through good-faith negotiation
            first, and if necessary, through binding arbitration.
          </p>
        </section>

        {/* Contact */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Contact Us</h2>
          <p>
            If you have questions about these Terms of Service, please contact us
            at{" "}
            <a
              href="mailto:legal@craftwell.app"
              className="text-primary hover:underline"
            >
              legal@craftwell.app
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
