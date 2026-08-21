# Heuristic Evaluation Report: Reddit

**Evaluator:** AIxHE Auditor
**Date:** 2026-06-06
**Framework:** Nielsen's 10 Usability Heuristics (NNgroup)

## Executive Summary
Reddit is a massive aggregator of communities. Its mobile app struggles with comment thread navigation and inconsistent media player behavior.

---

## Identified Violations

### 1. Getting Lost in Deep Comment Threads
**Heuristic Violated:** #3 User control and freedom
**Severity:** 3 (Major usability problem)
**Description:** In highly popular posts, comment threads nest deeply. If a user scrolls too far down a single thread, it is difficult to jump back to the next top-level comment without vigorous scrolling.
**Recommendation:** Implement a sticky "Jump to Next Parent Comment" floating action button (FAB) that appears when users are deep in a nested thread.

### 2. Inconsistent Video Player Muting
**Heuristic Violated:** #4 Consistency and standards
**Severity:** 3 (Major usability problem)
**Description:** The video player's audio behavior is inconsistent. Sometimes tapping a video unmutes it; other times it opens the video full screen while keeping it muted, requiring a second tap on a tiny icon.
**Recommendation:** Standardize the media interaction model. For instance, single tap always toggles audio, while a dedicated "Expand" button handles full-screen mode.
