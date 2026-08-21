# Heuristic Evaluation Report: Zoom

**Product:** Zoom (Desktop Video Client)  
**Evaluator:** UX Audit Team  
**Date:** June 2026  
**Scope:** Meeting Creation, Active In-Call Controls, and Settings configuration  

---

## 1. Executive Summary
Zoom rose to dominance due to its simplicity in link sharing and high connection reliability. However, its in-meeting UI hides important states under secondary click menus, and mic/camera troubleshooting is often confusing, violating Visibility of System Status (Heuristic 1) and Help Users Recover from Errors (Heuristic 9).

---

## 2. Findings & Violations Summary

| ID | Issue Description | Heuristic Violated | Severity | Recommended Fix |
|---|---|---|---|---|
| 01 | **Ambigious Mute State:** The microphone icon flashes red only when completely disabled, but does not provide visual confirmation if the mic is active but transmitting silence (e.g. low input volume). | H1: Visibility of System Status | 2 (Minor) | Add a small green input volume meter inside the microphone icon that bounces when it detects voice audio. |
| 02 | **Disorienting Screen Sharing:** When sharing a screen, Zoom minimizes the main meeting grid and replaces the interface with a floating bar, confusing users about how to see participant reactions. | H3: User Control & Freedom / H2: Match Between System & Real World | 3 (Major) | Display a persistent thumbnail grid of active video participants alongside the screen share toolbar by default. |
| 03 | **Cryptic Audio Output Errors:** If a user connects a Bluetooth headset after joining a meeting, Zoom continues using the old audio device and throws no alert, leaving the user with silence. | H9: Help Users Recognize, Diagnose, & Recover from Errors | 3 (Major) | Dynamically detect new audio device connections and show a toast: "Headset detected. Switch audio to headset? [Yes / No]". |
| 04 | **Hidden Meeting Invitation Details:** Tapping "Copy Link" copies a text block containing 5 different dial-in numbers and meeting IDs, rather than just a clean meeting URL, cluttering the clipboard. | H8: Aesthetic & Minimalist Design | 1 (Cosmetic) | Provide separate buttons: "Copy Link Only" and "Copy Full Invitation Details". |

---

## 3. Detailed Findings

### Issue 02: Disorienting Screen Sharing (Severity 3)
*   **Description:** When a user clicks "Share Screen", their entire Zoom interface changes. The large gallery of participant faces vanishes, replaced by a green bounding box around the desktop screen and a floating navigation bar. Presenters frequently report feeling disconnected because they can no longer see if their audience is nodding, laughing, or experiencing confusion.
*   **Heuristic Violation:** *User Control and Freedom (Heuristic 3)*. The system radically alters the layout and hides the primary communication feed (participant faces) without the presenter's active decision, making it hard to revert to a split-screen view.
*   **Recommendation:** Offer a default layout mode where the active participant video grid remains docked on the right side of the screen during sharing.

### Issue 03: Cryptic Audio Output Errors (Severity 3)
*   **Description:** If a user joins a call and their AirPods are disconnected, Zoom defaults to the Mac speaker. If they put their AirPods in mid-call, macOS connects them, but Zoom continues sending audio to the speakers. The user hears nothing and does not know why, since there is no error warning.
*   **Heuristic Violation:** *Help Users Recognize, Diagnose, and Recover from Errors (Heuristic 9)*. The system does not help the user diagnose why audio output is broken or offer an easy fix when hardware changes.
*   **Recommendation:** Automatically prompt the user to switch devices when a new Bluetooth speaker/mic becomes available on the host system.
