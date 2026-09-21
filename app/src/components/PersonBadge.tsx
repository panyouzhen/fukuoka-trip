export function PersonBadge({ person }: { person: string }) {
  return (
    <span className="inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border border-hairline text-[11px] text-muted">
      {person}
    </span>
  )
}

export function PersonBadgeRow({ people }: { people: string[] }) {
  if (!people.length) return null
  return (
    <span className="inline-flex items-center gap-1">
      {people.map((p) => (
        <PersonBadge key={p} person={p} />
      ))}
    </span>
  )
}
