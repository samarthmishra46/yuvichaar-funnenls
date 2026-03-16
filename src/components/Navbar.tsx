'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { name: 'Case Studies', href: '#case-studies' },
  { name: 'What We Do', href: '#what-we-do' },
  { name: 'Founder', href: '#founder' },
  { name: 'Timeline', href: '#timeline' },
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold">
              <span className="text-foreground">Yuvi</span>
              <span className="text-primary">chaar</span>
               <span className="text-text-muted ml-1 text-sm font-normal">FUNNELS</span>

            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-text-secondary hover:text-foreground transition-colors duration-200 text-sm font-medium"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right side - Theme Toggle + CTA */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <a
              href="https://rzp.io/rzp/SiDWLsca"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center justify-center px-5 py-2 rounded-full bg-primary text-white font-semibold text-sm hover:bg-primary-hover transition-colors duration-200"
            >
              BOOK A CALL
            </a>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg text-foreground hover:bg-background-secondary transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-text-secondary hover:text-foreground transition-colors duration-200 text-sm font-medium px-2 py-1"
                >
                  {link.name}
                </Link>
              ))}
              <a
                href="https://rzp.io/rzp/SiDWLsca"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsMenuOpen(false)}
                className="sm:hidden inline-flex items-center justify-center px-5 py-2 rounded-full bg-primary text-white font-semibold text-sm hover:bg-primary-hover transition-colors duration-200"
              >
                BOOK A CALL
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
