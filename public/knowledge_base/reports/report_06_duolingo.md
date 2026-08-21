# Heuristic Evaluation Report: Duolingo

**Product:** Duolingo (Mobile App)  
**Evaluator:** UX Audit Team  
**Date:** June 2026  
**Scope:** Onboarding Flow, Gamification Elements (Streaks/Leagues), and Shop Purchase Experience  

---

## 1. Executive Summary
Duolingo provides a stellar example of an engaging, high-learnability onboarding flow (Heuristic 10). However, the app's excessive gamification triggers, visual clutter on the home screen path, and aggressive monetization popups violate Aesthetic and Minimalist Design (Heuristic 8) and User Control and Freedom (Heuristic 3).

---

## 2. Findings & Violations Summary

| ID | Issue Description | Heuristic Violated | Severity | Recommended Fix |
|---|---|---|---|---|
| 01 | **Aggressive Interstitial Ads:** After completing a lesson, users are hit with multiple consecutive popups (Super Duolingo upsell, chest unlocks, league updates) that cannot be closed instantly, causing frustration. | H3: User Control & Freedom / H8: Aesthetic & Minimalist Design | 3 (Major) | Consolidate post-lesson rewards into a single unified summary screen with a clear "Skip All" exit. |
| 02 | **Unexplained Gamification Symbols:** The home screen features multiple currency and booster icons (gems, hearts, streaks, double XP potions) without standard definitions, forcing users to click them to understand what they do. | H6: Recognition Rather Than Recall | 2 (Minor) | Add minor hover tooltips or a simple visual "Key" guide on first-time reveals. |
| 03 | **Accidental Gem Spending:** Tapping "Refill Hearts" or "Buy Streak Freeze" in the shop executes the transaction immediately without showing a confirmation popup or allowing an undo action. | H5: Error Prevention / H3: User Control & Freedom | 3 (Major) | Add a confirmation dialog: "Spend 200 Gems to buy Streak Freeze? [Confirm / Cancel]" before dedicating currency. |
| 04 | **Inconsistent Audio Control:** Turning off "Sound Effects" in settings mutes buttons but does not mute background lesson characters speaking aloud, confusing users. | H4: Consistency & Standards | 2 (Minor) | Clearly separate audio controls into "Character Voices", "Sound Effects", and "Background Music" settings. |

---

## 3. Detailed Findings

### Issue 01: Aggressive Interstitial Ads (Severity 3)
*   **Description:** When a user completes a lesson, they want to return to their study plan. Instead, they must click "Continue" through 4 separate screens:
    1. A lesson score breakdown.
    2. A streak count update.
    3. A league placement promotion.
    4. An offer to buy "Super Duolingo" with a tiny "No Thanks" button that appears after a delay.
*   **Heuristic Violation:** *User Control and Freedom (Heuristic 3)*. The user is locked into navigating multiple marketing screens with delayed exit buttons, taking away control of their navigation speed.
*   **Recommendation:** Place a clear "Back to Map" button at the top of the very first summary screen so users can bypass secondary gamification popups.

### Issue 03: Accidental Gem Spending (Severity 3)
*   **Description:** In the Duolingo shop, items are displayed with buttons like "Streak Freeze: 200 Gems". Tapping this button instantly deducts 200 gems. If a user was scrolling and tapped the button by accident, there is no way to undo the purchase.
*   **Heuristic Violation:** *Error Prevention (Heuristic 5)* & *User Control and Freedom (Heuristic 3)*. The interface allows users to commit a currency transaction without confirmation or an undo fallback.
*   **Recommendation:** Require a double-tap confirmation or display a modal confirming the gem purchase.
