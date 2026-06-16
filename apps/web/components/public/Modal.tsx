'use client';
import { useEffect } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

/**
 * Modal component per DESIGN.md "Components > Modal":
 * - bg-secondary/50 backdrop overlay
 * - rounded-md shadow-lg max-w-lg card
 * - click-outside-to-close, ESC-to-close
 * - scroll lock on open
 *
 * Currently unused (dormant) per DESIGN.md "Known Gaps".
 * Exported for future use; no parent renders it yet.
 */
export function Modal({ open, onClose, children }: ModalProps) {
  // ESC to close
  useEffect(() => {
    if (!open) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [open, onClose]);

  // Scroll lock
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center
                 bg-secondary/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-canvas text-ink rounded-md shadow-lg
                   max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
