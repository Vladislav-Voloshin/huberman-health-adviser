import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy — Craftwell",
  description:
    "Learn how Craftwell collects, uses, and protects your personal data.",
};

export default function PrivacyPolicyPage() {
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
        Privacy Policy
      </h1>
      <p className="text-sm text-muted-foreground mb-8">
        Last updated: March 2026
      </p>

      <div className="space-y-8 text-muted-foreground">
        {/* Introduction */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            Introduction
          </h2>
          <p>
            Craftwell (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;)
            provides a science-based health protocols application that helps
            users build evidence-backed routines for sleep, focus, exercise, and
            overall well-being. This Privacy Policy explains how we collect, use,
            store, and protect your personal information when you use our
            application.
          </p>
          <p>
            By using Craftwell, you agree to the collection and use of
            information in accordance with this policy. If you do not agree with
            any part of this policy, please do not use the application.
          </p>
        </section>

        {/* Information We Collect */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            Information We Collect
          </h2>

          <div className="space-y-4">
            <div>
              <h3 className="text-base font-medium text-foreground">
                Account Information
              </h3>
              <p>
                When you create an account, we collect your email address and, if
                you sign in with Google, your name and profile picture as
                provided by Google OAuth.
              </p>
            </div>

            <div>
              <h3 className="text-base font-medium text-foreground">
                Health Preferences
              </h3>
              <p>
                During onboarding, you may complete a survey about your health
                goals, sleep habits, exercise routines, and areas of interest.
                This information is used to personalize your protocol
                recommendations.
              </p>
            </div>

            <div>
              <h3 className="text-base font-medium text-foreground">
                Usage Data
              </h3>
              <p>
                We collect information about how you interact with the
                application, including which protocols you view, activate, and
                track; your chat conversations with our AI assistant; and general
                usage patterns.
              </p>
            </div>

            <div>
              <h3 className="text-base font-medium text-foreground">
                Technical Data
              </h3>
              <p>
                We automatically collect technical information such as your
                browser type, device type, IP address, and error logs to
                maintain, troubleshoot, and improve the application.
              </p>
            </div>
          </div>
        </section>

        {/* Third-Party Services */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            Third-Party Services
          </h2>
          <p>
            Craftwell relies on the following third-party services to operate.
            Each service has its own privacy policy governing how it handles
            data:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <span className="font-medium text-foreground">Supabase</span> —
              Authentication and database storage. Your account data, survey
              responses, and protocol tracking are stored in Supabase.
            </li>
            <li>
              <span className="font-medium text-foreground">Anthropic</span> —
              AI-powered chat assistant. Your chat messages are sent to Anthropic
              to generate responses. Messages may be used by Anthropic in
              accordance with their usage policies.
            </li>
            <li>
              <span className="font-medium text-foreground">Pinecone</span> —
              Vector search for protocol recommendations. Protocol content is
              indexed to provide relevant search results.
            </li>
            <li>
              <span className="font-medium text-foreground">Vercel</span> —
              Application hosting and edge network delivery.
            </li>
            <li>
              <span className="font-medium text-foreground">Sentry</span> —
              Error monitoring and performance tracking. Anonymous error reports
              and performance data are collected to help us identify and fix
              issues.
            </li>
            <li>
              <span className="font-medium text-foreground">Google OAuth</span>{" "}
              — Optional sign-in provider. If you choose to sign in with Google,
              we receive your name, email address, and profile picture from
              Google.
            </li>
          </ul>
        </section>

        {/* Cookies and Local Storage */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            Cookies and Local Storage
          </h2>
          <p>
            Craftwell uses cookies and browser local storage for the following
            purposes:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <span className="font-medium text-foreground">
                Authentication cookies
              </span>{" "}
              — To keep you signed in and maintain your session.
            </li>
            <li>
              <span className="font-medium text-foreground">
                Theme preference
              </span>{" "}
              — To remember your light/dark mode setting.
            </li>
            <li>
              <span className="font-medium text-foreground">
                Service worker cache
              </span>{" "}
              — To enable offline functionality as a progressive web app.
            </li>
          </ul>
          <p>
            We do not use third-party advertising or analytics cookies.
          </p>
        </section>

        {/* How We Use Your Information */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            How We Use Your Information
          </h2>
          <p>We use the information we collect to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Provide and personalize the Craftwell experience</li>
            <li>
              Recommend health protocols based on your goals and preferences
            </li>
            <li>
              Power AI chat conversations with relevant context about protocols
            </li>
            <li>Track your protocol progress and streaks</li>
            <li>Diagnose technical issues and improve application performance</li>
            <li>Communicate important updates about the service</li>
          </ul>
        </section>

        {/* Data Retention and Deletion */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            Data Retention and Deletion
          </h2>
          <p>
            We retain your data for as long as your account is active. You can
            delete your account at any time from your profile settings. When you
            delete your account:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              Your account information, survey responses, and protocol tracking
              data are permanently deleted from our database.
            </li>
            <li>
              Chat conversation history associated with your account is deleted.
            </li>
            <li>
              Some anonymized, aggregated data may be retained for analytics
              purposes but cannot be linked back to you.
            </li>
            <li>
              Error logs in Sentry that may contain your data are automatically
              purged according to Sentry&apos;s retention schedule.
            </li>
          </ul>
        </section>

        {/* Data Security */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            Data Security
          </h2>
          <p>
            We implement reasonable security measures to protect your
            information, including encrypted connections (HTTPS), secure
            authentication tokens, and row-level security policies on our
            database. However, no method of electronic storage or transmission is
            100% secure, and we cannot guarantee absolute security.
          </p>
        </section>

        {/* GDPR and CCPA */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            Your Rights (GDPR / CCPA)
          </h2>
          <p>
            Depending on your location, you may have the following rights
            regarding your personal data:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <span className="font-medium text-foreground">
                Access and portability
              </span>{" "}
              — Request a copy of your personal data.
            </li>
            <li>
              <span className="font-medium text-foreground">Correction</span> —
              Update or correct inaccurate information.
            </li>
            <li>
              <span className="font-medium text-foreground">Deletion</span> —
              Delete your account and associated data.
            </li>
            <li>
              <span className="font-medium text-foreground">Objection</span> —
              Object to certain types of data processing.
            </li>
            <li>
              <span className="font-medium text-foreground">
                Restriction
              </span>{" "}
              — Request that we limit how we use your data.
            </li>
          </ul>
          <p>
            We do not sell your personal information to third parties. To
            exercise any of these rights, please contact us at the email address
            below.
          </p>
        </section>

        {/* Children's Privacy */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            Children&apos;s Privacy
          </h2>
          <p>
            Craftwell is not intended for use by anyone under the age of 16. We
            do not knowingly collect personal information from children. If we
            become aware that we have collected data from a child under 16, we
            will take steps to delete that information.
          </p>
        </section>

        {/* Changes to This Policy */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            Changes to This Policy
          </h2>
          <p>
            We may update this Privacy Policy from time to time. When we make
            significant changes, we will notify you through the application or by
            email. Your continued use of Craftwell after changes are posted
            constitutes your acceptance of the updated policy.
          </p>
        </section>

        {/* Contact */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Contact Us</h2>
          <p>
            If you have questions or concerns about this Privacy Policy or your
            personal data, please contact us at{" "}
            <a
              href="mailto:privacy@craftwell.app"
              className="text-primary hover:underline"
            >
              privacy@craftwell.app
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
