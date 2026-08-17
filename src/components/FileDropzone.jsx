import { useCallback, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { UploadCloud, X, FileText, AlertTriangle, Loader2, CheckCircle2 } from 'lucide-react'
import { uploadFile, removeUploadedFile, describeUploadError, resolveUploadUrl } from '../services/uploadsApi.js'

const DEFAULT_ACCEPT = ['image/png', 'image/jpeg', 'image/webp', 'application/pdf']

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/**
 * Generic drag-and-drop file uploader. Validates client-side, uploads
 * immediately on drop/select (not deferred to a parent form's submit),
 * shows a real progress bar while it happens, then a preview (image
 * thumbnail or file icon) once done. Reports the uploaded file's metadata
 * back to the parent via onChange — the parent never has to think about
 * multipart bodies or progress events, just the resulting {url, filename,
 * originalName, mimetype, size} object (or null once removed).
 */
export default function FileDropzone({
  label = 'Attach a file',
  helpText,
  accept = DEFAULT_ACCEPT,
  maxSizeMB = 5,
  value,
  onChange,
}) {
  const inputRef = useRef(null)
  const abortRef = useRef(null)

  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState(null)
  const [localPreviewUrl, setLocalPreviewUrl] = useState(null)

  function validateFile(file) {
    if (!accept.includes(file.type)) {
      return 'File must be a PNG, JPEG, WEBP image, or PDF.'
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `File must be smaller than ${maxSizeMB}MB.`
    }
    return null
  }

  const startUpload = useCallback(async (file) => {
    setError(null)
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    if (file.type.startsWith('image/')) {
      setLocalPreviewUrl(URL.createObjectURL(file))
    }

    setUploading(true)
    setProgress(0)
    const controller = new AbortController()
    abortRef.current = controller

    try {
      const result = await uploadFile(file, {
        onProgress: setProgress,
        signal: controller.signal,
      })
      onChange?.(result)
    } catch (err) {
      if (err.message !== 'ABORTED') {
        setError(describeUploadError(err.message))
      }
      setLocalPreviewUrl(null)
      onChange?.(null)
    } finally {
      setUploading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onChange])

  function handleInputChange(e) {
    const file = e.target.files?.[0]
    if (file) startUpload(file)
    e.target.value = '' // allow re-selecting the same file later
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragActive(false)
    const file = e.dataTransfer.files?.[0]
    if (file) startUpload(file)
  }

  async function handleRemove() {
    if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl)
    setLocalPreviewUrl(null)
    setError(null)
    const toRemove = value
    onChange?.(null)
    if (toRemove?.publicId) {
      try {
        await removeUploadedFile(toRemove.publicId)
      } catch {
        // Best-effort cleanup — if this fails the file is simply orphaned on
        // Cloudinary, which doesn't affect the user's current form state.
      }
    }
  }

  const isImage = value?.mimetype?.startsWith('image/')
  const previewSrc = value ? (isImage ? resolveUploadUrl(value.url) : null) : localPreviewUrl

  return (
    <div>
      {label && (
        <label className="block text-xs font-mono uppercase tracking-widest text-(--color-ink-soft) mb-1.5">
          {label}
        </label>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept.join(',')}
        onChange={handleInputChange}
        className="sr-only"
        id="file-dropzone-input"
      />

      {!value && !uploading && (
        <div
          onDragEnter={(e) => { e.preventDefault(); setDragActive(true) }}
          onDragOver={(e) => e.preventDefault()}
          onDragLeave={(e) => { e.preventDefault(); setDragActive(false) }}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click() }}
          role="button"
          tabIndex={0}
          aria-label={label}
          className={`flex flex-col items-center justify-center gap-2 text-center px-4 py-8 rounded-xl border-2 border-dashed cursor-pointer transition-colors visible-focus ${
            dragActive
              ? 'border-(--color-leaf) bg-(--color-leaf-soft)/30'
              : 'border-(--color-line) bg-(--color-surface) hover:border-(--color-leaf)'
          }`}
        >
          <UploadCloud size={22} className="text-(--color-ink-soft)" />
          <p className="text-sm text-(--color-ink)">
            <span className="font-medium text-(--color-forest-deep)">Click to browse</span> or drag a file here
          </p>
          {helpText && <p className="text-xs text-(--color-ink-soft)">{helpText}</p>}
        </div>
      )}

      {uploading && (
        <div className="rounded-xl border border-(--color-line) bg-(--color-surface) px-4 py-4">
          <div className="flex items-center gap-3">
            {localPreviewUrl ? (
              <img src={localPreviewUrl} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
            ) : (
              <span className="grid place-items-center w-10 h-10 rounded-lg bg-(--color-bg) text-(--color-ink-soft) shrink-0">
                <FileText size={18} />
              </span>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-(--color-ink) flex items-center gap-1.5">
                <Loader2 size={13} className="animate-spin text-(--color-forest)" /> Uploading… {progress}%
              </p>
              <div className="mt-1.5 h-1.5 rounded-full bg-(--color-bg) overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-(--color-forest)"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: 'easeOut' }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {value && !uploading && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 rounded-xl border border-(--color-leaf) bg-(--color-leaf-soft)/20 px-4 py-3"
          >
            {isImage ? (
              <img src={previewSrc} alt={value.originalName} className="w-10 h-10 rounded-lg object-cover shrink-0" />
            ) : (
              <span className="grid place-items-center w-10 h-10 rounded-lg bg-(--color-surface) text-(--color-forest-deep) shrink-0">
                <FileText size={18} />
              </span>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-(--color-ink) truncate flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-(--color-forest) shrink-0" /> {value.originalName}
              </p>
              <p className="text-xs text-(--color-ink-soft)">{formatBytes(value.size)}</p>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              aria-label="Remove file"
              className="shrink-0 text-(--color-ink-soft) hover:text-[#B5502E] visible-focus"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-[#B5502E]">
          <AlertTriangle size={12} /> {error}
        </p>
      )}
    </div>
  )
}