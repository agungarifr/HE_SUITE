# Heuristic Evaluation Report: Spotify

**Product:** Spotify (Mobile App & Desktop Player)  
**Evaluator:** UX Audit Team  
**Date:** June 2026  
**Scope:** Playlist Creation, Queue Management, and Sharing Flows  

---

## 1. Executive Summary
This evaluation analyzes Spotify’s primary playback and list management features. While Spotify represents a gold standard for aesthetic consistency and system status visibility (Heuristics 1 & 4), there are key friction points around queue control, complex menu structures, and search-in-playlist capabilities that violate User Control & Freedom (Heuristic 3) and Flexibility & Efficiency of Use (Heuristic 7).

---

## 2. Findings & Violations Summary

| ID | Issue Description | Heuristic Violated | Severity | Recommended Fix |
|---|---|---|---|---|
| 01 | **Hidden Playlist Search:** On mobile, the search bar inside a user's playlist is hidden by default and requires dragging the screen downwards to reveal. | H6: Recognition Rather Than Recall | 2 (Minor usability problem) | Make the search bar permanently visible at the top of playlists, or provide a visible magnifying glass icon. |
| 02 | **Unclear Active Queue State:** Adding items to the queue does not visually distinguish between songs added manually vs. songs auto-played by Spotify's algorithm. | H1: Visibility of System Status | 2 (Minor usability problem) | Use distinct background colors or labels to demarcate user-queued tracks from auto-generated tracks. |
| 03 | **Accidental Queue Wiping:** Selecting a new track from a search menu wipes the entire active custom queue without asking for confirmation. | H3: User Control & Freedom / H5: Error Prevention | 3 (Major usability problem) | Add a confirmation toast or dialog: "This will clear your current queue. Play anyway?" with an Undo action. |
| 04 | **Multi-nested Share Menu:** The "Share" button is buried deep inside a secondary "Three Dots" menu, making song sharing inefficient. | H7: Flexibility & Efficiency of Use | 2 (Minor usability problem) | Add a direct "Share" shortcut icon next to the song title on the Now Playing screen. |

---

## 3. Detailed Findings

### Issue 01: Hidden Playlist Search (Severity 2 - Minor usability problem; perbaikan dengan prioritas rendah; contoh: style warna tidak konsisten, Bahasa)
*   **Description:** When a user opens a playlist containing hundreds of songs, they often want to search for a specific track. However, the search input field is completely hidden off-screen. Users must perform a non-standard scroll gesture (drag down) at the very top of the playlist to reveal it.
*   **Heuristic Violation:** *Recognition Rather Than Recall (Heuristic 6)*. Users have to recall that dragging down reveals the search input, rather than recognizing a visible search element on the screen.
*   **Recommendation:** Place a static search bar under the playlist title card or show a small search icon that expands on tap.

### Issue 03: Accidental Queue Wiping (Severity 3 - Major usability problem; menjadi prioritas utama untuk diperbaiki; contoh: fungsi utama dan journey utama)
*   **Description:** When a user spends time carefully selecting and queueing 5 songs to play next, and then goes to search for a new song and taps it directly, Spotify overrides the active playback. In doing so, it frequently clears the user's manually queued songs without warning.
*   **Heuristic Violation:** *User Control and Freedom (Heuristic 3)* & *Error Prevention (Heuristic 5)*. Tapping a song commits a destructive action (clearing the custom queue) with no prevention warning or undo capability.
*   **Recommendation:** Provide a prompt when a user taps a song if they have manually queued tracks, asking if they want to "Play Next" or "Clear Queue and Play".
