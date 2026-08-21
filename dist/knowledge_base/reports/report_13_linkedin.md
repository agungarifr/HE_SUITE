# Heuristic Evaluation Report: LinkedIn

**Evaluator:** AIxHE Auditor
**Date:** 2026-06-06
**Framework:** Nielsen's 10 Usability Heuristics (NNgroup)

## Executive Summary
This evaluation examines the LinkedIn desktop web application. While excellent at facilitating professional networking, the interface suffers from clutter, heavy reliance on user recall for messaging, and opaque algorithmic feed sorting.

---

## Identified Violations

### 1. Buried Unread Messages
**Heuristic Violated:** #6 Recognition rather than recall
**Severity:** 3 (Major usability problem)
**Description:** In the messaging dropdown, unread messages can quickly get pushed down by automated InMail, sponsored messages, or group chats. Users have to remember that they had an unread message from days ago and manually scroll to find it.
**Recommendation:** Provide a prominent "Filter by Unread" toggle at the top of the messaging panel to rely on recognition rather than the user's memory.

### 2. Unclear Feed Sorting Options
**Heuristic Violated:** #10 Help and documentation
**Severity:** 2 (Minor usability problem)
**Description:** The feed defaults to "Top" posts. The option to switch to "Recent" is hidden behind a tiny dropdown filter at the very top of the feed that disappears as the user scrolls. There is no clear documentation explaining how "Top" is calculated.
**Recommendation:** Make the "Top / Recent" toggle sticky as the user scrolls, or add a brief tooltip explaining that "Top" relies on engagement metrics. 

### 3. Connection Request Withdrawals
**Heuristic Violated:** #3 User control and freedom
**Severity:** 3 (Major usability problem)
**Description:** If a user accidentally sends a connection request, the option to withdraw it is not available on the person's profile page. The user must navigate to "My Network" -> "Manage" -> "Sent" to withdraw it.
**Recommendation:** Immediately after sending a request, change the "Connect" button on the profile to a "Pending" button. Clicking "Pending" should open a dropdown allowing the user to "Withdraw Request" directly from the profile.

### 4. Overuse of Corporate Jargon in Settings
**Heuristic Violated:** #2 Match between system and the real world
**Severity:** 2 (Minor usability problem)
**Description:** The privacy and account settings use complex corporate and legal terminology for data sharing preferences, which may confuse users trying to secure their accounts.
**Recommendation:** Rewrite the settings descriptions using plain language. For instance, change "Manage your data and activity" to more actionable, conversational language like "Choose who can see your posts and profile data."
