import { Save, Trash2, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useBlocker } from 'react-router'

import { Button } from '@/shared/ui/button'

type UnsavedChangesGuardProps = {
  when: boolean
  onSave: () => Promise<void>
  itemName: string
  saveLabel?: string
}

export function UnsavedChangesGuard({ when, onSave, itemName, saveLabel = 'Zapisz wersję roboczą' }: UnsavedChangesGuardProps) {
  const blocker = useBlocker(({ currentLocation, nextLocation }) => when && currentLocation.pathname !== nextLocation.pathname)
  const dialogRef = useRef<HTMLDivElement>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    function handleBeforeUnload(event: BeforeUnloadEvent) {
      if (!when) {
        return
      }
      event.preventDefault()
      event.returnValue = ''
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [when])

  useEffect(() => {
    if (blocker.state === 'blocked') {
      dialogRef.current?.focus()
    }
  }, [blocker.state])

  if (blocker.state !== 'blocked') {
    return null
  }

  async function saveAndLeave() {
    setIsSaving(true)
    setSaveError(null)
    try {
      await onSave()
      blocker.proceed?.()
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : `Nie udało się zapisać ${itemName}.`)
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/45 p-4">
      <div
        aria-labelledby="unsaved-changes-title"
        aria-modal="true"
        className="w-full max-w-lg rounded-lg border border-border bg-card p-5 shadow-xl outline-none"
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
      >
        <h2 className="text-xl font-semibold text-foreground" id="unsaved-changes-title">Niezapisane zmiany</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {itemName} zawiera niezapisane zmiany. Czy chcesz je zapisać przed opuszczeniem edytora?
        </p>

        {saveError ? <p className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{saveError}</p> : null}

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button disabled={isSaving} onClick={() => blocker.reset()} type="button" variant="outline">
            <X className="size-4" aria-hidden="true" />
            Zostań
          </Button>
          <Button disabled={isSaving} onClick={() => blocker.proceed?.()} type="button" variant="outline">
            <Trash2 className="size-4" aria-hidden="true" />
            Opuść bez zapisywania
          </Button>
          <Button disabled={isSaving} onClick={() => void saveAndLeave()} type="button">
            <Save className="size-4" aria-hidden="true" />
            {isSaving ? 'Zapisywanie...' : saveLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
