---
name: drive-payment-flow
description: Run/drive the end-to-end payment workflow in the Expo app on the Android emulator (create rental → accept quote → Stripe payment link → verify status), against the live apps/server backend
---

Drive the **actual app** on the emulator with mobile-mcp (device
`emulator-5554`) — not the test suite. This verifies the real
mobile → `apps/server` → Stripe → Resend path.

## Prerequisites (start these first)

1. **Metro** (`:8081`) + dev client running: `pnpm --filter mobile run start`.
2. **Server** (`:4000`) running: `pnpm --filter server run dev`.
   Verify it's up — a POST with an empty body returns a JSON validation
   error (proves Express is alive), not a connection refusal:
   `curl -s http://localhost:4000/payment-links -X POST -H "Content-Type: application/json" -d '{}'`
3. **Bridge the emulator to the host server**: `adb reverse tcp:4000 tcp:4000`.
   Without this the app's `createAndSendPaymentLink` call can't reach the host.
4. Launch the app: `mobile_launch_app` with `com.jessyv96.carrental`.

## THE coordinate gotcha (read before tapping)

`mobile_click_on_screen_at_coordinates` and `mobile_swipe_on_screen`
take **device pixel** coordinates. The device is **1280×2856**.
Screenshots render **~896 wide** (scale ≈ **1.428×**).

- **Always tap using coords from `mobile_list_elements_on_screen`** (those
  are already device pixels) — element center = `x + width/2, y + height/2`.
- Do **not** feed screenshot coordinates into a tap. Symptom: the tap
  "succeeds" but nothing happens, or it hits the wrong control (e.g.
  focuses the Notes field instead of Open camera). If a tap had no effect,
  this is almost always why — re-list elements and use those coords.

## Flow (element identifiers are stable; re-list for live pixel coords)

1. **Step 1/4 Customer** — fill name/email/phone. **License photos are
   required** (validation is silent — Next just won't advance). Tap the
   camera button, grant permission ("While using the app"), take front +
   back. Use **`c.j91350@gmail.com`** as the customer email — Resend is in
   test mode and only delivers there (see [[resend-test-mode-recipient]]).
2. **Step 2/4 Vehicle & dates** — pick vehicle; the date field opens a
   **date picker followed by a separate time picker** (two dialogs, don't
   assume the first one failed).
3. **Step 3/4 Inspection** — mileage, fuel slider. **"Before" photo
   required**: `inspection-step.open-camera-button` →
   `inspection-step.capture-photo-button` (a "Remove" thumbnail appearing
   confirms capture) → `inspection-step.close-camera-button`. The red
   "Take at least one photo" text must clear before `inspection-step.next-button`.
4. **Step 4/4 Summary** — `recap-step.next-button` ("Generate quote (PDF)").
5. **Quote acceptance** — the "I accept" button is **disabled until a
   signature is drawn**. Draw with `mobile_swipe_on_screen` inside the
   signature pad (a couple of strokes), then tap "I accept". This fires
   `createAndSendPaymentLink`.

## Verify success (on the Rental Detail screen, scroll to Quote section)

- A payment row: amount + **"Pending"** badge + **"Resend payment link"** button.
- **No "Email could not be sent" warning** ⇒ `emailSent: true` persisted and
  the Stripe link email was delivered. The warning *appearing* means the
  email step failed but the Stripe session was still saved (resend works).
- Status polling (`getPaymentLinkStatus`, every 5s) runs against the live
  server and flips the badge **Pending → Paid** once the checkout is paid.

## Completing an actual payment (optional)

Polling only flips to Paid after a real checkout. Open the payment URL in a
browser and pay with Stripe test card `4242 4242 4242 4242` (any future
expiry / any CVC). Requires a browser — can't be done from the emulator.
