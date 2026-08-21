# Heuristic Evaluation Report: Amazon

**Product:** Amazon (Web & Desktop Checkout)  
**Evaluator:** UX Audit Team  
**Date:** June 2026  
**Scope:** Search Results, Shopping Cart, and Checkout Funnel  

---

## 1. Executive Summary
Amazon’s e-commerce platform excels in transaction speed (e.g., "1-Click Buy") and error prevention during shipping address validation. However, its user interface is notoriously cluttered and violates Aesthetic and Minimalist Design (Heuristic 8). Additionally, dark patterns during subscription signups (Prime) violate User Control and Freedom (Heuristic 3).

---

## 2. Findings & Violations Summary

| ID | Issue Description | Heuristic Violated | Severity | Recommended Fix |
|---|---|---|---|---|
| 01 | **Visual Clutter on Product Details:** The product page contains dozens of competing widgets (sponsor ads, similar products, subscription options, bundle offers) that dilute primary purchase actions. | H8: Aesthetic & Minimalist Design | 2 (Minor) | Consolidate sponsored ads to a dedicated section at the bottom, and simplify the main purchase card layout. |
| 02 | **Accidental Prime Enrollment:** During checkout, the "Free Delivery" button defaults to signing up the user for a paid Prime membership subscription with an obscured disclaimer. | H3: User Control & Freedom / H5: Error Prevention | 3 (Major) | Decouple standard free shipping choices from subscription opt-ins. Require an explicit, separate confirmation card for Prime signups. |
| 03 | **Cryptic Order Summary Changes:** Editing quantities in the shopping cart sidebar updates the price totals instantly but without visual transition or clear highlighting, making changes easy to miss. | H1: Visibility of System Status | 1 (Cosmetic) | Use a subtle highlight color transition (e.g., yellow fade) and layout animations when pricing numbers update. |
| 04 | **Duplicate Address Validation Confusions:** When the system detects a slightly formatted address difference, it displays a modal with two identical-looking options without explaining why one is "recommended". | H9: Help Users Recognize, Diagnose, & Recover from Errors | 2 (Minor) | Highlight the exact differences between the user's input and the validated USPS suggestion (e.g. bolding "St" vs "Street"). |

---

## 3. Detailed Findings

### Issue 02: Accidental Prime Enrollment (Severity 3)
*   **Description:** When a non-Prime user goes to checkout, the page highlights a large yellow button reading "Get Free Shipping". Tapping this button enrolls the user in a 30-day trial of Amazon Prime, which auto-renews into a paid monthly subscription. The opt-out button is small, grey, and labeled "No thanks, I will pay for shipping".
*   **Heuristic Violation:** *User Control and Freedom (Heuristic 3)* & *Error Prevention (Heuristic 5)*. The design uses dark patterns to steer users into accidental actions, offering poor exits and misleading descriptions.
*   **Recommendation:** Split the screen into two clear choices: "Join Prime for Free Shipping" (with clear pricing terms) and "Continue with Standard Shipping" (with standard delivery fees).

### Issue 04: Duplicate Address Validation Confusions (Severity 2)
*   **Description:** If a user enters "123 Main Street Apt 2B" and the database recommends "123 Main St Apt 2B", the validation modal shows:
    - *Option 1:* Suggested Address: 123 Main St Apt 2B
    - *Option 2:* Original Address: 123 Main Street Apt 2B
    There is no visual indicator explaining why Option 1 is preferred by carriers.
*   **Heuristic Violation:** *Help Users Recognize, Diagnose, and Recover from Errors (Heuristic 9)*. The user is presented with a choice without explanation of the issue (abbreviation formatting) or why one is better.
*   **Recommendation:** Label the options clearly (e.g., "Normalized Postal Format" vs. "Your Entered Format") and visually highlight the specific change.
