'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState, useCallback } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  const handleMount = useCallback(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    handleMount();
  }, [handleMount]);

  if (!mounted) {
    return (
      <button className="p-2 rounded-full bg-background-secondary border border-border">
        <Monitor className="w-5 h-5" />
      </button>
    );
  }

  const cycleTheme = () => {
    if (theme === 'system') {
      setTheme('light');
    } else if (theme === 'light') {
      setTheme('dark');
    } else {
      setTheme('system');
    }
  };

  return (
    <button
      onClick={cycleTheme}
      className="p-2 rounded-full bg-background-secondary border border-border hover:bg-background-tertiary transition-all duration-200"
      aria-label="Toggle theme"
      title={`Current: ${theme}`}
    >
      {theme === 'dark' ? (
        <Moon className="w-5 h-5 text-secondary" />
      ) : theme === 'light' ? (
        <Sun className="w-5 h-5 text-primary" />
      ) : (
        <Monitor className="w-5 h-5 text-text-muted" />
      )}
    </button>
  );
}
