# Craftwell User Help Guide

Craftwell is an AI-powered health companion that helps you discover, track, and stick with science-based health protocols drawn from neuroscience and peer-reviewed research. This guide walks you through every feature of the app.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Browsing and Discovering Protocols](#browsing-and-discovering-protocols)
3. [Protocol Detail Pages](#protocol-detail-pages)
4. [Activating a Protocol and Tracking Completions](#activating-a-protocol-and-tracking-completions)
5. [How Streaks Work](#how-streaks-work)
6. [Using the AI Chat Adviser](#using-the-ai-chat-adviser)
7. [Using the Dashboard](#using-the-dashboard)
8. [Managing Your Profile and Health Preferences](#managing-your-profile-and-health-preferences)
9. [Favorites](#favorites)
10. [Exporting Your Data](#exporting-your-data)
11. [Notes](#notes)
12. [Achievements](#achievements)

---

## Getting Started

### Creating an Account

1. Visit [craftwell.vercel.app](https://craftwell.vercel.app).
2. On the sign-in page, create an account using your email, phone number, or Google login.
3. After signing in for the first time, you will be taken through a short **onboarding survey** that asks about your health goals, sleep quality, stress level, exercise habits, supplement experience, and focus areas.
4. Once you complete onboarding, you land on the **Protocols** page.

### Navigation

The app shell provides a persistent navigation bar with links to the main sections:

- **Protocols** -- Browse and manage health protocols
- **Chat** -- Talk to the AI health adviser
- **Dashboard** -- View your weekly progress
- **Profile** -- Manage your account and preferences

---

## Browsing and Discovering Protocols

The **Protocols** page (`/protocols`) is your starting point for finding health protocols.

### Protocol Categories

Protocols are organized by category. Common categories include sleep, focus, exercise, stress management, supplementation, and more. Each protocol card shows:

- **Title** -- The name of the protocol (e.g., "Morning Sunlight Exposure")
- **Category** -- The health area it belongs to
- **Difficulty** -- Beginner, Intermediate, or Advanced
- **Time Commitment** -- How long the protocol takes per day
- **Effectiveness Rank** -- A relative ranking of how impactful the protocol is, based on the strength of evidence

### Searching for Protocols

Use the search bar at the top of the Protocols page to find specific protocols by keyword. The search looks at protocol titles and descriptions. Results are also enhanced with semantic search -- the system understands the meaning of your query, not just exact keyword matches.

### Filtering and Sorting

Protocols are sorted by their effectiveness rank by default, putting the most impactful recommendations at the top.

---

## Protocol Detail Pages

Click on any protocol card to see its full detail page (`/protocols/[slug]`). Here you will find:

- **Description** -- What the protocol is and why it works
- **Tools / Steps** -- A ranked list of specific actions that make up the protocol, ordered from most effective to least effective
- **Difficulty and Time Commitment** -- At a glance information about how demanding the protocol is
- **Related Protocols** -- Other protocols in the same category or complementary areas
- **Chat CTA** -- A shortcut to ask the AI adviser about this specific protocol

---

## Activating a Protocol and Tracking Completions

### Activating a Protocol

To start tracking a protocol:

1. Open the protocol detail page.
2. Click the **Activate** button.
3. The protocol is now added to your personal stack and will appear on your dashboard.

You can activate multiple protocols at the same time. If you want to stop tracking one, you can **deactivate** it (pause tracking without losing history) or **remove** it (take it off your list entirely).

### Daily Completions

Each protocol has a list of **tools** (individual steps or actions). To track your daily progress:

1. Open an activated protocol.
2. You will see a **checklist** of tools for today.
3. Tap or click each tool as you complete it. Completed tools get a checkmark.
4. Completing a tool is a toggle -- if you accidentally mark one, click it again to un-mark it.

The system records completions by date and uses your local timezone, so your "today" always matches your wall clock.

### What Counts as a Full Day

A day is considered **fully completed** when you have checked off every tool in the protocol for that date. Partial completions are still recorded but do not count toward your streak.

---

## How Streaks Work

Streaks measure your consistency. Here is exactly how they work:

### Current Streak

Your current streak is the number of consecutive days you have fully completed all tools in a protocol, counting backward from today (or yesterday, if you have not yet completed today's tools).

- If you completed all tools today and yesterday and the day before, your streak is 3.
- If you skipped yesterday but completed today, your streak resets to 1.
- If you completed everything yesterday but have not started today yet, the streak still shows (it gives you until end-of-day to keep it alive).

### Longest Streak

The app also tracks your all-time longest streak for each protocol.

### What Happens If You Miss a Day

Missing a single day resets your current streak to zero. However:

- Your **longest streak** record is preserved forever.
- Your **total completed days** count is not affected.
- Your **completion history** is never lost -- you can always see past days in the dashboard.

There is no penalty beyond losing the current streak count. Just pick up again tomorrow.

### Viewing Streaks

You can view streak information in several places:

- On each protocol detail page (current streak and longest streak)
- On the **Dashboard** page (streaks across all active protocols)
- In the **Profile** page (achievements tied to streak milestones)

---

## Using the AI Chat Adviser

The **Chat** page (`/chat`) gives you access to Craftwell's AI health adviser.

### Starting a Conversation

1. Navigate to the Chat section.
2. Type a health-related question in the input field and press Send.
3. The AI streams its response in real time.

### What You Can Ask

The adviser specializes in evidence-based health topics. Good questions include:

- "What is the best morning routine for energy?"
- "How does cold exposure affect mood?"
- "What supplements help with sleep quality?"
- "Explain the science behind NSDR."
- "Compare cold showers vs. ice baths."

The AI draws on a knowledge base of research content and provides practical, actionable recommendations. It ranks suggestions from most effective to least effective when possible.

### Protocol-Specific Chat

When viewing a protocol detail page, you can tap the "Ask about this protocol" button. This opens a chat session pre-loaded with context about that specific protocol, so the AI can give you targeted advice about its tools, timing, and scientific rationale.

### Chat Sessions

- Each conversation is saved as a **session** with a title derived from your first message.
- You can access past sessions from the **chat sidebar**.
- Sessions can be renamed, searched, or deleted.
- The AI remembers the context within a session (up to 20 turns of history).

### Chat Search

Use the search feature in the chat sidebar to find specific messages across all your past sessions. The search returns snippets with context so you can quickly locate previous advice.

### Important Disclaimers

The AI always includes safety disclaimers for supplements, exercise, or medical topics. Craftwell is **not a substitute for professional medical advice**. Always consult a healthcare provider before making changes to your health routine.

---

## Using the Dashboard

The **Dashboard** page (`/protocols/dashboard`) gives you a weekly overview of your progress across all active protocols.

### Weekly View

The dashboard displays a 7-day grid (Monday through Sunday) showing:

- **Each active protocol** as a row
- **Each day** as a column
- **Completion percentage** for each cell (how many tools you completed out of the total for that protocol on that day)
- A cell at 100% means you completed every tool for that protocol on that day

### Overall Adherence

At the top, you will see an **overall adherence percentage** that tells you what fraction of your total protocol-days were fully completed for the week.

### Navigating Weeks

You can move between weeks to review past performance or check the current week.

### Streak Summary

The dashboard also includes a streak summary showing current and longest streaks for each active protocol, plus your best overall current and longest streaks.

---

## Managing Your Profile and Health Preferences

The **Profile** page (`/profile`) lets you view and edit your account information and health preferences.

### Profile Information

You can update:

- **Display Name** -- How you appear in the app
- **First Name / Last Name**
- **Age**

### Health Survey

You can revisit and update the health preferences you set during onboarding at any time:

- **Health Goals** -- What you want to improve (sleep, focus, energy, etc.)
- **Sleep Quality** -- Rate from 1 to 10
- **Exercise Frequency** -- How often you work out
- **Stress Level** -- Rate from 1 to 10
- **Supplement Experience** -- Your familiarity with supplements
- **Focus Areas** -- Specific topics you want protocols for

These preferences help personalize the experience.

### Deleting Your Account

If you choose to delete your account, the app will permanently remove:

- Your authentication credentials
- All protocol completions and history
- All chat sessions and messages
- Your survey responses
- Your user profile

This action is irreversible.

---

## Favorites

You can favorite any protocol by clicking the heart/favorite button on the protocol detail page. Favorites give you a quick way to bookmark protocols you are interested in, even if you have not activated them yet.

Toggling the favorite button adds or removes the protocol from your favorites list.

---

## Exporting Your Data

Craftwell lets you export your completion history as a **CSV file**. The export includes:

- Date of completion
- Protocol name
- Tool name
- Completion status

To export, use the export button available on the protocols interface. The file downloads with a filename like `craftwell-progress-2026-03-28.csv`.

---

## Notes

You can write personal notes for any protocol. Notes are saved per-protocol and can be up to 5,000 characters. Use notes to record observations, track how a protocol makes you feel, or jot down modifications you have made.

Notes can be created, updated, or deleted at any time from the protocol detail page.

---

## Achievements

Craftwell awards achievements as you use the app. Achievements track milestones such as:

- **Getting Started** -- Add your first protocol
- **Protocol Collector** -- Add 5 protocols
- **Day One** -- Complete a protocol tool for the first time
- **Week Warrior** -- Complete tools on 7 different days
- **Month Master** -- Complete tools on 30 different days
- **On a Roll** -- Achieve a 3-day streak
- **Unstoppable** -- Achieve a 7-day streak
- **Habit Master** -- Achieve a 30-day streak
- **Curious Mind** -- Start your first chat session
- **Deep Diver** -- Start 10 chat sessions
- **Bookworm** -- Favorite your first protocol
- **Dedicated** -- Complete 50 protocol tools total

Each achievement shows your current progress toward the goal and whether it has been unlocked. View your achievements on the Profile page.
