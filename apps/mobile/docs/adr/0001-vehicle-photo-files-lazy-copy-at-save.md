# Vehicle photo files are copied to permanent storage lazily, at save

The vehicle form holds newly captured/picked photos as their **temporary**
camera/picker URIs and only copies them into permanent storage (`vehicle-photos/`)
when the form is **saved**; on save it also deletes the files of any original
photos that were removed, and deleting a vehicle deletes its photo files. We chose
this over the rental feature's eager pattern (copy to permanent storage on
capture, reconcile on save/cancel) because the form can be left by many paths —
Cancel, the header back arrow, the back gesture — and none of them can be
intercepted reliably to clean up. Lazy copy means **nothing permanent is written
until save**, so abandoning the form by any path leaves zero orphaned files,
which also removes the data-loss risk of eagerly deleting a still-referenced file
on Cancel. The trade-off is a deliberate divergence from the rental photo flow and
a small dependency on temporary files surviving until save (acceptable for a
short-lived single-screen form).
