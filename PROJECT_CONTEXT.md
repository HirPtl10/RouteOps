# TransitOps

## Tech Stack

- Next.js App Router
- TypeScript
- PostgreSQL
- Neon
- Prisma
- Auth.js
- Tailwind CSS
- shadcn/ui
- TanStack Query
- React Hook Form
- Zod
- Recharts

## Architecture

- Modular monolith
- Server-side business logic
- Prisma transactions for status transitions
- Organization-based multi-tenancy

## Roles

- FLEET_MANAGER
- DISPATCHER
- SAFETY_OFFICER
- FINANCIAL_ANALYST

## Vehicle Status

- AVAILABLE
- ON_TRIP
- IN_SHOP
- RETIRED

## Driver Status

- AVAILABLE
- ON_TRIP
- OFF_DUTY
- SUSPENDED

## Trip Status

- DRAFT
- DISPATCHED
- COMPLETED
- CANCELLED

## Rules

- Expired drivers cannot be dispatched
- Suspended drivers cannot be dispatched
- IN_SHOP vehicles cannot be dispatched
- RETIRED vehicles cannot be dispatched
- Cargo cannot exceed vehicle capacity
- Dispatch sets vehicle and driver ON_TRIP
- Completion restores vehicle and driver AVAILABLE
- Cancellation restores resources
- Maintenance sets vehicle IN_SHOP
- Closing maintenance restores AVAILABLE