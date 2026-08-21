# Heuristic Evaluation Report: Netflix

**Product:** Netflix (Smart TV & Web App)  
**Evaluator:** UX Audit Team  
**Date:** June 2026  
**Scope:** Landing Page Navigation, Recommendation Carousel, and Media Playback Controls  

---

## 1. Executive Summary
Netflix is the benchmark for seamless media playback, resume states, and aesthetic consistency. However, users experience cognitive fatigue due to infinite scroll carousels, unexpected auto-play sounds, and the lack of user control over content filters. These issues primarily impact User Control and Freedom (Heuristic 3) and Aesthetic and Minimalist Design (Heuristic 8).

---

## 2. Findings & Violations Summary

| ID | Issue Description | Heuristic Violated | Severity | Recommended Fix |
|---|---|---|---|---|
| 01 | **Intrusive Auto-play Previews:** Hovering over a movie title card automatically starts playing video previews with sound, startling users and causing anxiety. | H3: User Control & Freedom | 3 (Major) | Add a global settings toggle to disable auto-playing video previews and sound on hover. |
| 02 | **Infinite Loops in Carousels:** Category rows loop infinitely (scrolling right eventually takes you back to the start) without any indication that the content is repeating. | H1: Visibility of System Status | 2 (Minor) | Add a visual divider or end-of-list marker (e.g. "View All") to signal the carousel's limits. |
| 03 | **Unable to Hide Disliked Content:** When a user downvotes or clicks "Not for me" on a title, Netflix continues to recommend the same title in other carousels. | H3: User Control & Freedom | 2 (Minor) | Immediately remove downvoted titles from all recommended carousels and place them in a hidden list. |
| 04 | **Hidden Audio/Subtitle Configurations:** During video playback, changing audio tracks (e.g. English to Spanish) does not show a live preview of the subtitle track synchronization, requiring back-and-forth clicks. | H6: Recognition Rather Than Recall | 1 (Cosmetic) | Show a 3-second visual preview of subtitles in the background when selecting a subtitle option. |

---

## 3. Detailed Findings

### Issue 01: Intrusive Auto-play Previews (Severity 3)
*   **Description:** When a user is reading a movie's description on the homepage, the application automatically fades out the description and starts playing loud audio and video trailers. This happens within 1.5 seconds of pausing on a title card.
*   **Heuristic Violation:** *User Control and Freedom (Heuristic 3)*. The system initiates an active, sensory-rich process without the user's explicit consent, forcing them to quickly scroll away to stop the sound.
*   **Recommendation:** Provide a persistent volume mute button directly on the preview card, or add a setting: "Auto-play trailers on hover: [ON/OFF]".

### Issue 02: Infinite Loops in Carousels (Severity 2)
*   **Description:** When browsing titles in "Popular on Netflix", clicking the right-arrow scroll button shifts cards indefinitely. Because there are no visible index markers (e.g., "Page 1 of 4" or progress bars), users do not realize they have reached the end and are seeing the same 15 movies for the third time.
*   **Heuristic Violation:** *Visibility of System Status (Heuristic 1)*. The system fails to communicate that the user has cycled back to the beginning of a finite list.
*   **Recommendation:** Show page dots (e.g., `o o o •`) at the top right of the row, and stop scrolling at the last item, changing the arrow to a "View All" card.
