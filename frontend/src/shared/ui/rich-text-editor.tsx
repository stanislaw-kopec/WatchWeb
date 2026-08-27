import {
  Bold,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Pilcrow,
  Quote,
  Strikethrough,
  Underline,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { normalizeRichContentForEditor } from '@/shared/lib/richContent'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

type UploadedImage = {
  url: string
}

type RichTextEditorProps = {
  value: string
  onChange: (value: string) => void
  uploadImage: (file: File) => Promise<UploadedImage>
  ariaLabel: string
  placeholder: string
  onBlur?: () => void
  disabled?: boolean
  invalid?: boolean
}

export function RichTextEditor({
  value,
  onChange,
  uploadImage,
  ariaLabel,
  placeholder,
  onBlur,
  disabled,
  invalid,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const savedRangeRef = useRef<Range | null>(null)
  const [imageError, setImageError] = useState<string | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  useEffect(() => {
    const editor = editorRef.current
    if (!editor || document.activeElement === editor) {
      return
    }

    const normalizedValue = normalizeRichContentForEditor(value)
    if (editor.innerHTML !== normalizedValue) {
      editor.innerHTML = normalizedValue
    }
  }, [value])

  function emitChange() {
    onChange(editorRef.current?.innerHTML ?? '')
  }

  function applyCommand(command: string, commandValue?: string) {
    editorRef.current?.focus()
    document.execCommand(command, false, commandValue)
    emitChange()
  }

  function addLink() {
    const href = window.prompt('Podaj adres odnośnika (https://...)')?.trim()
    if (!href) {
      return
    }
    if (!/^(https?:\/\/|mailto:)/i.test(href)) {
      setImageError('Odnośnik musi zaczynać się od https://, http:// albo mailto:.')
      return
    }

    setImageError(null)
    applyCommand('createLink', href)
  }

  function openImagePicker() {
    saveSelection()
    imageInputRef.current?.click()
  }

  async function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) {
      return
    }

    const validationError = validateImage(file)
    if (validationError) {
      setImageError(validationError)
      return
    }

    setImageError(null)
    setIsUploadingImage(true)
    try {
      const image = await uploadImage(file)
      insertImage(image.url, file.name)
      emitChange()
    } catch (error) {
      setImageError(error instanceof Error ? error.message : 'Nie udało się dodać obrazu.')
    } finally {
      setIsUploadingImage(false)
    }
  }

  function saveSelection() {
    const selection = window.getSelection()
    if (selection?.rangeCount && editorRef.current?.contains(selection.anchorNode)) {
      savedRangeRef.current = selection.getRangeAt(0).cloneRange()
    }
  }

  function insertImage(url: string, alt: string) {
    const editor = editorRef.current
    if (!editor) {
      return
    }

    editor.focus()
    const selection = window.getSelection()
    const range = savedRangeRef.current ?? document.createRange()
    if (!savedRangeRef.current) {
      range.selectNodeContents(editor)
      range.collapse(false)
    }

    const image = document.createElement('img')
    image.src = url
    image.alt = alt
    range.deleteContents()
    range.insertNode(image)
    range.setStartAfter(image)
    range.collapse(true)
    selection?.removeAllRanges()
    selection?.addRange(range)
    savedRangeRef.current = null
  }

  return (
    <div className={cn('overflow-hidden rounded-md border bg-card', invalid ? 'border-destructive' : 'border-input')}>
      <div className="flex flex-wrap gap-1 border-b border-border bg-secondary/45 p-2" role="toolbar" aria-label="Formatowanie tekstu">
        <ToolbarButton disabled={disabled} icon={Pilcrow} label="Akapit" onClick={() => applyCommand('formatBlock', 'p')} />
        <ToolbarButton disabled={disabled} icon={Heading2} label="Nagłówek 2" onClick={() => applyCommand('formatBlock', 'h2')} />
        <ToolbarButton disabled={disabled} icon={Heading3} label="Nagłówek 3" onClick={() => applyCommand('formatBlock', 'h3')} />
        <ToolbarDivider />
        <ToolbarButton disabled={disabled} icon={Bold} label="Pogrubienie" onClick={() => applyCommand('bold')} />
        <ToolbarButton disabled={disabled} icon={Italic} label="Kursywa" onClick={() => applyCommand('italic')} />
        <ToolbarButton disabled={disabled} icon={Underline} label="Podkreślenie" onClick={() => applyCommand('underline')} />
        <ToolbarButton disabled={disabled} icon={Strikethrough} label="Przekreślenie" onClick={() => applyCommand('strikeThrough')} />
        <ToolbarDivider />
        <ToolbarButton disabled={disabled} icon={List} label="Lista punktowana" onClick={() => applyCommand('insertUnorderedList')} />
        <ToolbarButton disabled={disabled} icon={ListOrdered} label="Lista numerowana" onClick={() => applyCommand('insertOrderedList')} />
        <ToolbarButton disabled={disabled} icon={Quote} label="Cytat" onClick={() => applyCommand('formatBlock', 'blockquote')} />
        <ToolbarButton disabled={disabled} icon={LinkIcon} label="Dodaj odnośnik" onClick={addLink} />
        <ToolbarButton disabled={disabled || isUploadingImage} icon={ImagePlus} label="Dodaj obraz" onClick={openImagePicker} />
      </div>

      <div
        aria-label={ariaLabel}
        aria-multiline="true"
        className="rich-content min-h-96 px-4 py-3 outline-none focus:ring-2 focus:ring-inset focus:ring-ring"
        contentEditable={!disabled}
        data-placeholder={placeholder}
        onBlur={onBlur}
        onInput={emitChange}
        onKeyUp={saveSelection}
        onMouseUp={saveSelection}
        ref={editorRef}
        role="textbox"
        suppressContentEditableWarning
      />

      <input
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(event) => void handleImageChange(event)}
        ref={imageInputRef}
        type="file"
      />

      {isUploadingImage ? <p className="border-t border-border px-3 py-2 text-xs text-muted-foreground">Dodawanie obrazu...</p> : null}
      {imageError ? <p className="border-t border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">{imageError}</p> : null}
    </div>
  )
}

type ToolbarButtonProps = {
  icon: typeof Bold
  label: string
  onClick: () => void
  disabled?: boolean
}

function ToolbarButton({ icon: Icon, label, onClick, disabled }: ToolbarButtonProps) {
  return (
    <Button
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      onMouseDown={(event) => event.preventDefault()}
      size="icon"
      title={label}
      type="button"
      variant="ghost"
    >
      <Icon className="size-4" aria-hidden="true" />
    </Button>
  )
}

function ToolbarDivider() {
  return <span className="mx-1 h-8 w-px self-center bg-border" aria-hidden="true" />
}

function validateImage(file: File) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return 'Dozwolone są tylko pliki JPG, PNG albo WEBP.'
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return 'Plik może mieć maksymalnie 5 MB.'
  }
  return null
}
