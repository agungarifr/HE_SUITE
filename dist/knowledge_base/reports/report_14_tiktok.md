# Heuristic Evaluation Report: TikTok

**Evaluator:** AIxHE Auditor
**Date:** 2026-06-06
**Framework:** Nielsen's 10 Usability Heuristics (NNgroup)

## Executive Summary
This evaluation reviews TikTok's mobile app. TikTok prioritizes continuous engagement over explicit user control. While highly effective for discovery, the UI suffers from clutter and limited user freedom.

---

## Identified Violations

### 1. Accidental Feed Refresh without Recovery
**Heuristic Violated:** #3 User control and freedom
**Severity:** 3 (Major usability problem)
**Description:** Tapping the "Home" tab or accidentally pulling down refreshes the entire 'For You' feed. Users lose the video they were currently watching with no "Undo" option.
**Recommendation:** Implement a temporary "Undo Refresh" banner or require a double-tap/pull-to-confirm mechanism to prevent accidental feed loss.

### 2. Excessive Overlay Clutter
**Heuristic Violated:** #8 Aesthetic and minimalist design
**Severity:** 2 (Minor usability problem)
**Description:** The right side and bottom of the video are heavily overlaid with icons (like, comment, share, save, sound, captions, username, description). This often obscures critical parts of the video content.
**Recommendation:** Provide a "Clear Mode" (e.g., long-press to hide UI) that allows users to temporarily view the video without any interface overlays.
