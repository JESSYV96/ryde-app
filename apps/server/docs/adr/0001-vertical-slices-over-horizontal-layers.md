# Organize by vertical slice, hexagonal inside each, over horizontal layers

We group code **by feature** — a *slice* (`features/payments/`,
`features/vehicle-recognition/`), each a full column through every layer
(`domain → application → infrastructure`) — rather than the classic horizontal
layout that groups all controllers together, all services together, all models
together. A slice **never imports another slice**; genuinely cross-cutting
plumbing (env loading, the Express app factory, the generic RabbitMQ connection)
lives in `shared/`, which never imports a slice. The composition roots
(`composition/`) are the only place allowed to know more than one slice.

We chose this over horizontal layers because in the layered layout you touch
every layer folder to change one feature, and unrelated features share the same
files — so they drift into coupling over time. Vertical slices keep a feature's
code together (high cohesion) and features apart (low coupling): adding or
removing a feature is dropping in or deleting one folder, and "where's the
vehicle-recognition code?" has one answer — `features/vehicle-recognition/`, all
of it. Keeping each slice **internally hexagonal** preserves the property we care
about most: provider SDKs (Stripe, Resend, Expo, Anthropic) and their secrets stay
at the edges, behind ports, so business rules stay pure and testable.

The trade-off is a little apparent duplication — each slice repeats the
`domain/application/infrastructure` skeleton and may define structurally similar
types — which we accept as the price of independence; we resist the urge to
"deduplicate" by promoting feature logic into `shared/`, because that is exactly
the coupling this structure exists to prevent. See
[`../architecture.md`](../architecture.md) for the dependency rules and the
step-by-step for adding a feature.
