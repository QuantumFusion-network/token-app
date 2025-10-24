interface MutationErrorProps {
  error?: Error | null
}

export function MutationError({ error }: MutationErrorProps) {
  if (!error) return null

  return (
    <div className="text-destructive bg-destructive/10 border-destructive/20 rounded-md border p-3 text-sm">
      {error.message}
    </div>
  )
}
