# Heuristic Evaluation Report: Instagram

**Evaluator:** AIxHE Auditor
**Date:** 2026-06-06
**Framework:** Nielsen's 10 Usability Heuristics (NNgroup)

## Executive Summary
This evaluation focuses on the Instagram mobile app's main feed and navigation structure. Instagram relies heavily on *Aesthetic and minimalist design* for content viewing. However, aggressive algorithmic updates and feature bloat have introduced navigation and user control issues.

---

## Identified Violations

### 1. Accidental Feed Refresh (No Undo)
**Heuristic Violated:** #3 User control and freedom
**Severity:** 3 (Major usability problem)
**Description:** Tapping the home icon while scrolling the feed instantly refreshes the timeline and shoots the user back to the top. If this is done accidentally, the user permanently loses their place in the feed with no way to "Undo" or return to where they were.
**Recommendation:** Introduce an "Undo Refresh" snackbar that appears for 3-5 seconds after a feed refresh, allowing the user to return to their previous scroll position.

### 2. Ambiguous Video Icons (Reels vs. Video)
**Heuristic Violated:** #4 Consistency and standards
**Severity:** 2 (Minor usability problem)
**Description:** Instagram has historically changed the icons and terminology for video content (IGTV, Reels, standard video posts). Users are occasionally confused about whether tapping a video will open a vertical scrolling Reels interface or a standard post view.
**Recommendation:** Standardize the iconography across the platform so users can predict the interaction model (infinite scroll vs. single post) before tapping the content.

### 3. Feature Bloat in Bottom Navigation
**Heuristic Violated:** #8 Aesthetic and minimalist design
**Severity:** 2 (Minor usability problem)
**Description:** The bottom navigation bar frequently changes to push new features (e.g., swapping the Activity heart for the Shop tab, and then later replacing Shop with Reels). This violates minimalist design by prioritizing business goals over the user's primary tasks.
**Recommendation:** Allow users a degree of customization for their bottom navigation bar, or keep core features (Activity, Profile, Add Post) strictly consistent.

### 4. Disappearing Stories Error Messages
**Heuristic Violated:** #9 Help users recognize, diagnose, and recover from errors
**Severity:** 3 (Major usability problem)
**Description:** When a user tries to upload a Story but loses internet connection, the upload fails with a generic red "!" icon. Tapping it simply says "Failed", without explaining whether to wait for a better connection or manually retry.
**Recommendation:** Provide a clear error state such as "Upload failed due to poor connection. We will auto-retry when you are back online" or offer a distinct manual "Retry" button.
