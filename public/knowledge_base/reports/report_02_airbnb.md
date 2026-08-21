# Heuristic Evaluation Report: Airbnb

**Product:** Airbnb (Web Platform)  
**Evaluator:** UX Audit Team  
**Date:** June 2026  
**Scope:** Search Filters, Map Navigation, and Booking Checkout Flow  

---

## 1. Executive Summary
Airbnb delivers an industry-leading user interface with rich micro-interactions and maps. However, during high-complexity actions like applying multi-layered filters and going through the booking checkout, several issues arise. These problems primarily violate Error Prevention (Heuristic 5) and Match Between System and the Real World (Heuristic 2) regarding fee transparency.

---

## 2. Findings & Violations Summary

| ID | Issue Description | Heuristic Violated | Severity | Recommended Fix |
|---|---|---|---|---|
| 01 | **Invisible Fee Breakdown:** The initial search results display a nightly rate, but cleaning fees, service fees, and occupancy taxes are hidden until the final checkout page. | H2: Match Between System & Real World / H8: Aesthetic & Minimalist (Clarity) | 3 (Major) | Include a toggle for "Display Total Price (including all service/cleaning fees)" on the search page. |
| 02 | **Unsynchronized Filter Count:** Applying multiple filters does not show how many results are left in real-time, resulting in "0 results found" screens. | H5: Error Prevention | 2 (Minor) | Update the filter submit button text in real-time to show the remaining results (e.g., "Show 14 stays") and disable filters that lead to 0 results. |
| 03 | **Disorienting Map Zooming:** Clicking a listing card automatically refocused the map to a tight zoom level, causing users to lose track of where they are in the city. | H3: User Control & Freedom | 2 (Minor) | Maintain the user's manual zoom level on the map unless they click an explicit "Re-center" button. |
| 04 | **Lost Checkout Data on Back Navigation:** Clicking the browser back button during payment inputs clears all previously filled form fields. | H3: User Control & Freedom / H5: Error Prevention | 3 (Major) | Cache checkout form state locally (session storage) so that navigating back does not delete user inputs. |

---

## 3. Detailed Findings

### Issue 01: Invisible Fee Breakdown (Severity 3)
*   **Description:** Users select listings based on a displayed price of "$120/night". When they click into the listing and go to checkout, the actual average night cost increases to "$190/night" due to added cleaning and platform fees.
*   **Heuristic Violation:** *Match Between System and the Real World (Heuristic 2)*. In the real world, customers expect pricing transparency. Hidden fees violate trust and disrupt the decision-making model.
*   **Recommendation:** Default to displaying total pricing (excluding local tourist taxes if unavailable) or place a clear indicator of estimated fees directly on listing cards.

### Issue 02: Unsynchronized Filter Count (Severity 2)
*   **Description:** Users open the filters panel and select multiple criteria (e.g., "Pool", "Wifi", "Superhost", "Pets allowed", "Free cancellation"). There is no feedback indicating how these selections impact listing availability until they close the panel, frequently resulting in a blank "No results match your criteria" screen.
*   **Heuristic Violation:** *Error Prevention (Heuristic 5)*. The interface does not prevent the user from making a combination of filter choices that yields zero results.
*   **Recommendation:** Dynamically disable checkboxes that have a count of 0 given the currently selected filters, and show a loading number inside the primary CTA button.
