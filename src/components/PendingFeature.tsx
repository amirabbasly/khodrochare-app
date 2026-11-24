"use client";

import {createContext, useCallback, useContext, useEffect, useId, useRef, useState, type ReactNode} from 'react';
import {Icon} from './Icons';
import './pending-feature.css';

const PendingFeatureContext = createContext<(() => void) | null>(null);

export function usePendingFeature() {
  const show = useContext(PendingFeatureContext);
  if (!show) throw new Error('PendingFeatureProvider is required');
  return show;
}

export function PendingFeatureDialog({onClose,titleText}: {onClose: () => void;titleText?:string}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const title = useId(), description = useId();
  useEffect(() => {
    const element = dialog.current;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    element?.showModal();
    return () => {
      element?.close();
      document.body.style.overflow = overflow;
      if (previous?.isConnected) previous.focus({preventScroll: true});
    };
  }, []);
  return <dialog ref={dialog} className="pending-feature-dialog" aria-labelledby={title} aria-describedby={description}
    onCancel={event => {event.preventDefault(); onClose();}}
    onClick={event => {
      if (event.target !== event.currentTarget) return;
      const rect = event.currentTarget.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose();
    }}>
    <button className="pending-feature-close" type="button" onClick={onClose} aria-label="بستن پنجره"><Icon name="close" size={20}/></button>
    <span className="pending-feature-icon" aria-hidden="true"><Icon name="clock" size={30}/></span>
    <h2 id={title}>{titleText||"در حال تکمیل"}</h2>
    <p id={description}>این بخش در حال تکمیل است و به زودی فعال می‌شود.</p>
    <button className="pending-feature-confirm" type="button" onClick={onClose}>متوجه شدم</button>
  </dialog>;
}

export function PendingFeatureProvider({children}: {children: ReactNode}) {
  const [open, setOpen] = useState(false);
  const show = useCallback(() => setOpen(true), []);
  return <PendingFeatureContext.Provider value={show}>
    {children}
    {open && <PendingFeatureDialog onClose={() => setOpen(false)}/>}
  </PendingFeatureContext.Provider>;
}
