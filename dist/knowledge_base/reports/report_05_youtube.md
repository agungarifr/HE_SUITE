# Heuristic Evaluation Report: YouTube

**Product:** YouTube (Mobile App)  
**Evaluator:** UX Audit Team  
**Date:** June 2026  
**Scope:** Video Playback Gestures, Comment Section Navigation, and Playlist Management  

---

## 1. Executive Summary
YouTube's mobile app is highly optimized for performance and fluid gestures. However, major updates to the comment drawer and gesture-based playback have introduced usability issues where users accidentally trigger actions without knowing why, violating Error Prevention (Heuristic 5) and Help/Documentation (Heuristic 10).

---

## 2. Findings & Violations Summary

| ID | Issue Description | Heuristic Violated | Severity | Recommended Fix |
|---|---|---|---|---|
| 01 | **Accidental Gesture Swiping:** Swiping downwards to minimize a video often fails and accidentally refreshes the search feed instead, losing the user's scroll position. | H5: Error Prevention | 2 (Minor) | Adjust gesture touch-target thresholds so vertical swipes require more intent, or add an explicit "Minimize" chevron icon. |
| 02 | **Lost Video Queue on App Minimize:** Creating a temporary video queue on mobile and closing the app (or switching to another heavy app) clears the entire queue without saving it. | H3: User Control & Freedom / H6: Recognition Rather Than Recall | 3 (Major) | Save the active temporary queue in local storage so it can be restored on app restart. |
| 03 | **Comment Draft Deletion:** Writing a long reply to a comment and accidentally tapping outside the slide-up comment sheet immediately closes it and deletes the written text. | H5: Error Prevention / H3: User Control & Freedom | 3 (Major) | Store drafts in memory if closed accidentally, and warn users: "Discard unsaved draft? [Keep Editing / Discard]". |
| 04 | **Hidden Loop Feature:** The "Loop Video" feature is buried in a sub-settings cog overlay under "Additional Settings", making it hard to find for music listeners. | H7: Flexibility & Efficiency of Use | 1 (Cosmetic) | Place the loop button directly in the main video control panel alongside the play/pause and skip buttons. |

---

## 3. Detailed Findings

### Issue 03: Comment Draft Deletion (Severity 3)
*   **Description:** On YouTube mobile, tapping a comment opens a full-height bottom sheet. If a user spends 5 minutes drafting a long, detailed reply, and accidentally performs a swipe-down gesture or taps the dark backdrop overlay, the sheet slides away. Tapping "Reply" again opens a blank text box; their work is completely lost.
*   **Heuristic Violation:** *Error Prevention (Heuristic 5)* & *User Control and Freedom (Heuristic 3)*. The system does not guard against accidental clicks/gestures causing irreversible data loss.
*   **Recommendation:** Prevent the sheet from closing on external taps if the text area is dirty, or display a confirmation dialog before discarding drafts.

### Issue 04: Hidden Loop Feature (Severity 1)
*   **Description:** Users listening to ambient music or tutorial loops have to tap the video player, click the settings gear (top-right), select "Additional settings", and toggle "Loop video". Novice users do not know this option exists because it is hidden under two menu layers.
*   **Heuristic Violation:** *Flexibility and Efficiency of Use (Heuristic 7)*. Experienced users who perform loops frequently are forced to navigate deep menus because there are no direct accelerators.
*   **Recommendation:** Allow long-pressing the video canvas to toggle looping, or add it as a primary control overlay button.
