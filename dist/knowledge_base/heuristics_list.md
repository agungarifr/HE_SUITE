# Jakob Nielsen's 10 Usability Heuristics

This reference guide details the 10 Usability Heuristics for User Interface Design, formulated by Jakob Nielsen. For each heuristic, we provide a definition, key evaluation checklist questions, and examples of good and bad designs.

## Severity Rating Guidelines

When evaluating usability issues, use the following severity scale:

- **0 = Bukan merupakan usability problem**: Tidak ada masalah usability yang berarti
- **1 = Masalah kosmetik saja**: Dapat diperbaiki ketika ada waktu luang; contoh: typo, ejaan
- **2 = Minor usability problem**: Perbaikan dengan prioritas rendah; contoh: style warna tidak konsisten, Bahasa
- **3 = Major usability problem**: Menjadi prioritas utama untuk diperbaiki; contoh: fungsi utama dan journey utama
- **4 = Usability catastrophe**: Sangat penting untuk diperbaiki sebelum dirilis; contoh: payment, add to cart, register

---

## Heuristic 1: Visibility of System Status
> The design should always keep users informed about what is happening, through appropriate feedback within a reasonable time.

### Evaluation Checklist
* Is there immediate visual feedback when the user clicks or taps an action?
* Is there a clear loading indicator (progress bar, spinner) for operations taking longer than 2 seconds?
* Does the system indicate the current step in multi-stage processes (e.g., checkout, wizard)?
* Are success/error states of transactions explicitly stated?

### Examples
* **Good:** Google Drive displays a toast notification saying "Upload complete (1 file)" with a preview link once a file is uploaded.
* **Bad:** Clicking a "Save Profile" button does nothing for 5 seconds, leaving the user wondering if the site is frozen, before suddenly reloading the page.

---

## Heuristic 2: Match Between System and the Real World
> The design should speak the users' language. Use words, phrases, and concepts familiar to the user, rather than internal jargon. Follow real-world conventions, making information appear in a natural and logical order.

### Evaluation Checklist
* Does the interface avoid technical terminology (e.g., database keys, server codes)?
* Are icons used in standard ways that reflect real-world counterparts (e.g., trash can for delete)?
* Is information organized chronologically, alphabetically, or by logical user relevance?

### Examples
* **Good:** A banking app displays transaction fees as "Card Processing Fee" rather than "Interchange Fee ID: 049A".
* **Bad:** An e-commerce app displays a checkout crash error: "SQL Exception: Foreign Key constraint failed on table ORDER_ITEMS."

---

## Heuristic 3: User Control and Freedom
> Users often perform actions by mistake. They need a clearly marked "emergency exit" to leave the unwanted action without having to go through an extended process. Support undo and redo.

### Evaluation Checklist
* Is there an "Undo" option for destructive actions (e.g., delete, archive)?
* Can users cancel out of file uploads, payments, or long queries?
* Is there a clear "Back" or "Cancel" button on all wizard or modal screens?

### Examples
* **Good:** Gmail shows a popup banner at the bottom with an "Undo" button immediately after an email is sent.
* **Bad:** An app has a multi-step setup flow where clicking "Next" commits changes to the database immediately, and there is no "Back" button to correct a mistake in step 1.

---

## Heuristic 4: Consistency and Standards
> Users should not have to wonder whether different words, situations, or actions mean the same thing. Follow platform and industry conventions.

### Evaluation Checklist
* Are the visual layouts, button styles, and colors consistent across all pages?
* Does the app follow established UI standards (e.g., logo links to home page, search bar is top-right/center)?
* Do terms mean the same thing throughout the application (e.g., don't use "Delete" on one screen and "Trash" on another)?

### Examples
* **Good:** E-commerce sites universally place the shopping cart icon in the top right corner of the header.
* **Bad:** A website uses blue buttons for "Confirm" on the login screen, green buttons for "Submit" on the contact page, and red buttons for "Save" on the profile page.

---

## Heuristic 5: Error Prevention
> Even better than good error messages is a careful design which prevents a problem from occurring in the first place. Either eliminate error-prone conditions or check for them and present users with a confirmation option before they commit to the action.

### Evaluation Checklist
* Does the form prevent users from typing invalid characters (e.g., letters in a phone number field)?
* Are password rules displayed dynamically *before* the user submits the signup form?
* Does the system prompt for confirmation before performing irreversible destructive actions (e.g., deleting an account)?

### Examples
* **Good:** A flight booking calendar disables all past dates, preventing users from selecting a departure date in the past.
* **Bad:** A user fills out a registration form, hits submit, and the page reloads clearing all fields because the username they chose was already taken.

---

## Heuristic 6: Recognition Rather Than Recall
> Minimize the user's memory load by making elements, actions, and options visible. The user should not have to remember information from one part of the interface to another. Instructions for use of the system should be visible or easily retrievable whenever appropriate.

### Evaluation Checklist
* Are formatting hints (e.g., `MM/DD/YYYY`) visible in the text field itself?
* Does the search bar offer history or auto-suggestions?
* In multi-step wizards, are details entered in step 1 shown in a sidebar for reference in step 3?

### Examples
* **Good:** E-commerce checkout displays a sidebar summary of the items being purchased, including sizes and quantities, on the final payment screen.
* **Bad:** A tax software app asks the user to enter their business income in Step 2, and then in Step 5 asks them to calculate 15% of that income themselves without displaying the original entered number.

---

## Heuristic 7: Flexibility and Efficiency of Use
> Accelerators — unseen by the novice user — may often speed up the interaction for the expert user such that the system can cater to both inexperienced and experienced users. Allow users to tailor frequent actions.

### Evaluation Checklist
* Are keyboard shortcuts available for core commands?
* Can power users configure custom templates, quick filters, or command menus?
* Is there a "Bulk Edit" or "Select All" option for tabular data?

### Examples
* **Good:** Slack allows power users to hit `Cmd+K` / `Ctrl+K` to open a quick switcher to hop between any channel, thread, or direct message instantly.
* **Bad:** A file manager forces users to click a checkbox next to each of 100 files individually and select "Delete" from a dropdown for each one, with no "Select All" feature.

---

## Heuristic 8: Aesthetic and Minimalist Design
> Interfaces should not contain information which is irrelevant or rarely needed. Every extra unit of information in an interface competes with the relevant units of information and diminishes their relative visibility.

### Evaluation Checklist
* Is there a clean hierarchy of typography (clear heading sizes, readable body text)?
* Is whitespace used effectively to separate visual sections?
* Are secondary actions hidden under menus rather than cluttering the primary canvas?

### Examples
* **Good:** Google.com keeps the homepage extremely clean with a search input, logo, and two simple buttons.
* **Bad:** A news homepage is packed with flashing banner ads, auto-playing video sidebars, tickers, and 50 different category links competing for attention.

---

## Heuristic 9: Help Users Recognize, Diagnose, and Recover from Errors
> Error messages should be expressed in plain language (no error codes), precisely indicate the problem, and constructively suggest a solution.

### Evaluation Checklist
* Do error messages highlight the exact field that failed?
* Do error messages suggest how to correct the issue (e.g., "Password must contain a number")?
* Do error screens have a clear CTA to get the user back on track (e.g., "Go back to dashboard")?

### Examples
* **Good:** A login screen says: "Incorrect password. Did you forget your password? [Reset password link]."
* **Bad:** A web application throws a generic screen: "Error 500: An unexpected internal handler exception occurred."

---

## Heuristic 10: Help and Documentation
> It's best if the system doesn't need any additional explanation. However, it may be necessary to provide documentation to help users understand how to complete their tasks.

### Evaluation Checklist
* Is the search bar in the Help section easy to find?
* Are help articles written as short, actionable steps?
* Are tooltips available next to advanced or complex configuration settings?

### Examples
* **Good:** Stripe includes inline tooltips next to terms like "Webhook signing secret" with links to step-by-step setup guides.
* **Bad:** A complex software product has a help button that links to a single 800-page PDF user manual that is not searchable online.
