# Fleet

The mobile bounded context that owns the rental company's vehicle inventory:
listing vehicles, viewing/editing their details, and building a new vehicle from
photos (AI pre-fill + a stored visual record).

## Language

**Fleet**:
The company's whole set of vehicles. The feature is named for the business
concept, not the entity.
_Avoid_: Cars, inventory, vehicle list

**Vehicle**:
A single rentable unit held in the fleet — of some Vehicle Type (car, motorcycle,
or truck) — with its pricing and a collection of photos. Aggregate root of this
context.
_Avoid_: Car, auto

**Vehicle Type**:
The category a Vehicle belongs to, from a **closed set**: `car`, `motorcycle`,
`truck`. Drives the vehicle's icon (and, later, filtering the fleet by type). A
fixed enumeration, not free text — unlike a vehicle's color. Pricing does **not**
depend on it: the day + included-km + extra-km model applies to every type.
_Avoid_: Category, class, kind, segment

**Vehicle Photo**:
A photo belonging to a Vehicle. Part of the Vehicle aggregate — it has no
meaning outside its vehicle. The photos form an **unordered** collection; a
photo's identity is not stable across an edit (the set is rewritten on save).
_Avoid_: Picture, image, attachment

**Primary Photo**:
The one Vehicle Photo flagged as representative of the vehicle, shown on the
listing card and the detail screen. Invariant: **exactly one** primary whenever
a vehicle has photos. The first photo added becomes primary by default;
removing the primary **auto-promotes** another.
_Avoid_: Main photo, cover, default photo, thumbnail

**Vehicle Recognition**:
Analyzing a vehicle's photos to read off its attributes, so the new-vehicle form
can be pre-filled. Manual, explicit action ("pre-fill from photos"); the actual
vision analysis runs server-side (the mobile app only sends photos).
_Avoid_: Detection, scanning, OCR, AI

**Recognized Vehicle Draft**:
The best-effort result of a Vehicle Recognition: the subset of vehicle
attributes that could be read (`make`, `model`, `year`, `color`,
`licensePlate`), each possibly absent. Used only to pre-fill form fields — never
persisted as-is, never trusted without the user's review.
_Avoid_: Prediction, guess, scan result

## Notes on the model

- **Photos are managed only in the create/edit form.** Add, remove, and choosing
  the Primary Photo all happen there; nothing is persisted until the form is
  saved (the whole photo set is rewritten on save).
- **Pricing attributes** (daily rate, included km, extra-km rate) are never part
  of a Recognized Vehicle Draft — a photo cannot reveal them; the user always
  enters them by hand.
- **Recognition runs through `apps/server`'s HTTP API** — the AI provider key
  never lives in the mobile app (monorepo rule). This context only knows "ask
  the server to recognize these photos".
