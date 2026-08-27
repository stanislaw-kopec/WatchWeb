import { UnsavedChangesGuard } from '@/shared/ui/unsaved-changes-guard'

type UnsavedArticleChangesGuardProps = {
  when: boolean
  onSave: () => Promise<void>
  saveLabel?: string
}

export function UnsavedArticleChangesGuard(props: UnsavedArticleChangesGuardProps) {
  return <UnsavedChangesGuard {...props} itemName="Artykuł" />
}
