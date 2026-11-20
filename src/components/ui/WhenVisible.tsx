import { useEffect, useRef, useState, type ReactNode } from 'react';

type WhenVisibleProps = {
  children: ReactNode;
  className?: string;
};

/** Mount children once this box is near the viewport. */
export default function WhenVisible({ children, className }: WhenVisibleProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(
    () => typeof IntersectionObserver === 'undefined'
  );

  useEffect(() => {
    const node = ref.current;
    if (!node || show) return;

    const observer = new IntersectionObserver(
      entries => {
        if (!entries.some(entry => entry.isIntersecting)) return;
        setShow(true);
        observer.disconnect();
      },
      { rootMargin: '160px' }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [show]);

  return (
    <div ref={ref} className={className}>
      {show ? children : null}
    </div>
  );
}
