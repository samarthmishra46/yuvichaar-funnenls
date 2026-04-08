'use client';

import { useState } from 'react';
import './deal.css';

interface Deliverable {
  name: string;
  description: string;
  quantity: string;
  enabled: boolean;
}

interface TimelineItem {
  week: string;
  phase: string;
  description: string;
}

interface Stat {
  value: string;
  label: string;
}

interface DealData {
  company: string;
  email: string;
  phone?: string;
  proposalTitle: string;
  goal: string;
  target: string;
  startDate?: string;
  adsCount: number;
  socialVideosCount: number;
  landingPagesCount: number;
  fixedFee: number;
  advanceAmount: number;
  advanceWithGst: number;
  balanceAmount: number;
  balanceWithGst: number;
  hasPerformanceFee: boolean;
  perfBonus1Trigger: string;
  perfBonus1Amount: string;
  perfBonus2Trigger: string;
  perfBonus2Amount: string;
  customDeliverable?: string;
  customDeliverableDesc?: string;
  portfolioUrl?: string;
  whatsappNumber: string;
  razorpayLink?: string;
  successItems: string[];
  nextStepText: string;
  deliverables: Deliverable[];
  timeline: TimelineItem[];
  stats: Stat[];
}

interface Props {
  data: DealData;
  token: string;
}

export default function DealPageContent({ data, token }: Props) {
  const [currentScreen, setCurrentScreen] = useState(1);
  const [pricingAccepted, setPricingAccepted] = useState(false);
  const [signature, setSignature] = useState('');
  const [confirmations, setConfirmations] = useState([false, false, false, false, false]);
  const [paymentMethod, setPaymentMethod] = useState(1);
  const [helpOpen, setHelpOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [signing, setSigning] = useState(false);
  const [alreadySigned, setAlreadySigned] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [settingPassword, setSettingPassword] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN').format(amount);
  };

  const allConfirmed = confirmations.every(c => c);
  const signatureValid = signature.trim().length > 1;
  const canSign = allConfirmed && signatureValid;

  const goToScreen = (n: number) => {
    setCurrentScreen(n);
    window.scrollTo(0, 0);
  };

  const handleSign = async () => {
    if (!canSign || signing) return;
    
    setSigning(true);
    try {
      const res = await fetch(`/api/deal/${token}/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signatureName: signature.trim() }),
      });
      
      const result = await res.json();
      
      if (res.ok) {
        setAlreadySigned(true);
        goToScreen(4);
      } else if (result.error === 'Agreement already signed') {
        setAlreadySigned(true);
        goToScreen(4);
      } else {
        alert(result.error || 'Failed to sign agreement');
      }
    } catch {
      alert('Failed to sign agreement. Please try again.');
    } finally {
      setSigning(false);
    }
  };

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window !== 'undefined' && (window as Window & { Razorpay?: unknown }).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setProcessingPayment(true);
    try {
      // For online payment via Razorpay
      if (paymentMethod === 1) {
        // Load Razorpay script
        const loaded = await loadRazorpayScript();
        if (!loaded) {
          alert('Failed to load payment gateway. Please try again.');
          setProcessingPayment(false);
          return;
        }

        // Create Razorpay order
        const orderRes = await fetch(`/api/deal/${token}/create-order`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!orderRes.ok) {
          const err = await orderRes.json();
          alert(err.error || 'Failed to create payment order');
          setProcessingPayment(false);
          return;
        }

        const orderData = await orderRes.json();

        // Open Razorpay checkout
        const options = {
          key: orderData.key,
          amount: orderData.amount,
          currency: orderData.currency,
          name: 'Yuvichaar Funnels',
          description: '60-Day Growth Marathon - Advance Payment',
          order_id: orderData.orderId,
          prefill: orderData.prefill,
          theme: { color: '#6d28d9' },
          handler: async (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
            // Verify payment
            const verifyRes = await fetch(`/api/deal/${token}/verify-payment`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                amount: orderData.amount,
              }),
            });

            if (verifyRes.ok) {
              goToScreen(5); // Go to password setup
            } else {
              const err = await verifyRes.json();
              alert(err.error || 'Payment verification failed');
            }
            setProcessingPayment(false);
          },
          modal: {
            ondismiss: () => {
              setProcessingPayment(false);
            },
          },
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const RazorpayConstructor = (window as any).Razorpay;
        const razorpay = new RazorpayConstructor(options);
        razorpay.open();
        return;
      }
      
      // For bank transfer or already paid, record payment
      const res = await fetch(`/api/deal/${token}/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          paymentMethod: paymentMethod === 2 ? 'bank_transfer' : 'manual',
          amount: data.advanceWithGst 
        }),
      });
      
      if (res.ok) {
        goToScreen(5); // Go to password setup
      } else {
        const result = await res.json();
        alert(result.error || 'Failed to record payment');
      }
    } catch {
      alert('Failed to process payment. Please try again.');
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleSetPassword = async () => {
    if (password.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    
    setSettingPassword(true);
    try {
      const res = await fetch(`/api/deal/${token}/set-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      
      const result = await res.json();
      
      if (res.ok) {
        goToScreen(6); // Go to success screen
      } else {
        alert(result.error || 'Failed to set password');
      }
    } catch {
      alert('Failed to set password. Please try again.');
    } finally {
      setSettingPassword(false);
    }
  };

  return (
    <div className="deal-page">
      {/* Screen 1 - Proposal */}
      <div className={`screen ${currentScreen === 1 ? 'on' : ''}`}>
        <div className="topbar">
          <div className="brand">
            <svg viewBox="0 0 16 16"><polygon points="8,1 15,15 1,15" fill="#6d28d9"/></svg>
            <span className="brand-name">Yuvichaar Funnels</span>
          </div>
          <button className="help-btn" onClick={() => setHelpOpen(true)}>
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.3"/><path d="M8 11V10M8 8.5A1.75 1.75 0 106.25 6.75" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><circle cx="8" cy="11.5" r=".4" fill="currentColor"/></svg>
            Help
          </button>
        </div>
        <div className="stepnav">
          <div className="stp cur">Proposal</div>
          <div className="stp">Pricing</div>
          <div className="stp">Agreement</div>
          <div className="stp">Payment</div>
        </div>
        <div className="body">
          {/* Hero */}
          <div className="hero">
            <div className="hero-eyebrow">Proposal</div>
            <div className="hero-title">{data.proposalTitle.split(' ').slice(0, 3).join(' ')}<br/>{data.proposalTitle.split(' ').slice(3).join(' ')}</div>
            <div className="hero-for">Prepared for <strong>{data.company}</strong> &nbsp;·&nbsp; Yuvraj Singh Rajawat</div>
          </div>

          {/* Goal */}
          <div className="goalblock">
            <div className="gl">
              <div>
                <div className="gi-label">Engagement goal</div>
                <div className="gi-val">{data.goal}</div>
              </div>
              <div>
                <div className="gi-label">Target milestone</div>
                <div className="gi-val">{data.target}</div>
              </div>
            </div>
          </div>

          {/* Funnel Diagram */}
          <div className="funnel-wrap">
            <div className="funnel-label">Your complete funnel — how it works</div>
            <div className="fd">
              <div className="fd-topnote">
                <span className="fd-topnote-text">People scrolling Instagram &amp; Facebook</span>
              </div>
              <div className="fd-flow">
                <div className="fd-node nd-purple">
                  <div className="fd-node-label">🎬 They see your ads</div>
                  <div className="fd-node-sub">{data.adsCount} video ads · Netflix-grade cameras · multiple angles</div>
                </div>
                <div className="fd-arrow"></div><div className="fd-arrow-head"></div>
                <div className="fd-node nd-blue">
                  <div className="fd-node-label">📱 They check your social media</div>
                  <div className="fd-node-sub">Optimised profile · {data.socialVideosCount} trust-building videos · blue tick</div>
                </div>
                <div className="fd-arrow"></div><div className="fd-arrow-head"></div>
                <div className="fd-node nd-teal">
                  <div className="fd-node-label">🏠 They land on your funnel page</div>
                  <div className="fd-node-sub">VSL · social proof · urgency · single-click checkout</div>
                </div>
                <div className="fd-arrow"></div><div className="fd-arrow-head"></div>
              </div>
              <div className="fd-split">
                <div className="fd-branch buy">
                  <div className="fd-branch-title">They buy ✓</div>
                  <div className="fd-branch-item"><div className="fd-branch-dot"></div>Added to WhatsApp community</div>
                  <div className="fd-branch-item"><div className="fd-branch-dot"></div>Repeat purchase sequences fire</div>
                  <div className="fd-branch-item"><div className="fd-branch-dot"></div>Cross-sell + upsell video flows</div>
                  <div className="fd-branch-item"><div className="fd-branch-dot"></div>Close to zero CAC on repeat</div>
                </div>
                <div className="fd-branch nobuy">
                  <div className="fd-branch-title">They don&apos;t buy</div>
                  <div className="fd-branch-item"><div className="fd-branch-dot"></div>Retargeted with new ads</div>
                  <div className="fd-branch-item"><div className="fd-branch-dot"></div>WhatsApp video sequences fire</div>
                  <div className="fd-branch-item"><div className="fd-branch-dot"></div>Email cart abandonment</div>
                  <div className="fd-branch-item"><div className="fd-branch-dot"></div>AI calling for high-intent visitors</div>
                </div>
              </div>
              <div className="fd-profit">
                <div className="fd-profit-label">The outcome</div>
                <div className="fd-profit-text">Predictable customers · Lower CAC · Higher LTV</div>
              </div>
            </div>
          </div>

          {/* Deliverables */}
          <div className="del-wrap">
            <div className="del-label">Exact deliverables</div>
            <table className="del-table">
              <tbody>
                {data.deliverables.filter(d => d.enabled).map((deliverable, index) => (
                  <tr key={index}>
                    <td className="dt-num">{String(index + 1).padStart(2, '0')}</td>
                    <td>
                      <div className="dt-name">{deliverable.name}</div>
                      <div className="dt-desc">{deliverable.description}</div>
                    </td>
                    <td className="dt-qty">{deliverable.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Timeline */}
          <div className="tl-wrap">
            <div className="tl-label">Exact timeline</div>
            <table className="tl-table">
              <tbody>
                {data.timeline.map((item, index) => (
                  <tr key={index} className={item.phase.includes('🚀') ? 'tl-launch-row' : ''}>
                    <td className={`tt-week ${item.phase.includes('🚀') ? 'tl-launch-week' : ''}`}>{item.week}</td>
                    <td>
                      <div className={`tt-phase ${item.phase.includes('🚀') ? 'tl-launch-phase' : ''}`}>{item.phase}</div>
                      <div className={`tt-desc ${item.phase.includes('🚀') ? 'tl-launch-desc' : ''}`}>{item.description}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="tl-note">Engagement starts on <strong style={{color: 'var(--ink)'}}>{data.startDate || 'your confirmed kickoff date'}</strong>.</div>
          </div>

          {/* Proof */}
          <div className="proof-wrap">
            <div className="proof-label">Why Yuvichaar Funnels</div>
            <div className="proof-grid">
              {data.stats.map((stat, index) => (
                <div className="pc" key={index}><div className="pc-num">{stat.value}</div><div className="pc-lbl">{stat.label}</div></div>
              ))}
            </div>
          </div>

          {/* Portfolio */}
          {data.portfolioUrl && (
            <div className="port-wrap">
              <a className="port-card" href={data.portfolioUrl} target="_blank" rel="noopener noreferrer">
                <div>
                  <div className="port-label">Our previous work</div>
                  <div className="port-title">See the funnels we&apos;ve built for brands like yours →</div>
                </div>
                <div className="port-icon">
                  <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M2.5 11.5L11.5 2.5M11.5 2.5H5M11.5 2.5V9" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              </a>
            </div>
          )}
        </div>
        <div className="footer">
          <button className="cta" onClick={() => goToScreen(2)}>See pricing &amp; payment plan →</button>
        </div>
      </div>

      {/* Screen 2 - Pricing */}
      <div className={`screen ${currentScreen === 2 ? 'on' : ''}`}>
        <div className="topbar">
          <button className="back-btn" onClick={() => goToScreen(1)}>← Back</button>
          <div className="brand"><svg viewBox="0 0 16 16" style={{width: '16px', height: '16px'}}><polygon points="8,1 15,15 1,15" fill="#6d28d9"/></svg></div>
          <button className="help-btn" onClick={() => setHelpOpen(true)}>
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.3"/><path d="M8 11V10M8 8.5A1.75 1.75 0 106.25 6.75" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><circle cx="8" cy="11.5" r=".4" fill="currentColor"/></svg>
            Help
          </button>
        </div>
        <div className="stepnav">
          <div className="stp done">Proposal</div>
          <div className="stp cur">Pricing</div>
          <div className="stp">Agreement</div>
          <div className="stp">Payment</div>
        </div>
        <div className="body">
          <div className="price-hero">
            <div className="price-eyebrow">Investment</div>
            <div className="price-headline">Transparent pricing.<br/>Milestone-based payments.</div>
            <div className="price-sub">You pay in stages — not all upfront. The first payment unlocks everything. The second comes on Day 30, after you&apos;ve seen 30 days of work.</div>
          </div>

          <div className="fee-block">
            <div className="fee-section-label">Fee structure</div>
            <div className="fee-row">
              <div>
                <div className="fee-name">Fixed fee</div>
                <div className="fee-desc">Covers everything in the scope — creative production, funnel build, automations, performance marketing for 60 days</div>
              </div>
              <div style={{textAlign: 'right'}}>
                <div className="fee-amount">₹{formatCurrency(data.fixedFee)}</div>
                <div className="fee-note">+ GST</div>
              </div>
            </div>
            {data.hasPerformanceFee && (
              <div className="fee-row">
                <div>
                  <div className="fee-name">Performance fee</div>
                  <div className="fee-desc">Only paid when you hit revenue milestones. Our incentive is aligned with yours.</div>
                </div>
                <div style={{textAlign: 'right'}}>
                  <div className="fee-amount">₹2,00,000</div>
                  <div className="fee-note">+ GST</div>
                </div>
              </div>
            )}
            <div className="fee-total-row">
              <div className="fee-total-label">Total engagement value</div>
              <div className="fee-total-amount">₹{formatCurrency(data.fixedFee)}{data.hasPerformanceFee ? ' + ₹2,00,000' : ''} + GST</div>
            </div>
          </div>

          <div className="paytl-block">
            <div className="paytl-label">Payment schedule</div>
            <div className="track">
              <div className="track-item">
                <div className="track-dot active"><div className="track-dot-inner"></div></div>
                <div className="track-card featured">
                  <div className="tc-when">On signing — due today</div>
                  <div className="tc-title">Advance payment</div>
                  <div className="tc-amount">₹{formatCurrency(data.advanceWithGst)}</div>
                  <div className="tc-note">50% of fixed fee (₹{formatCurrency(data.advanceAmount)}) + 18% GST<br/>This unlocks your portal and starts the marathon</div>
                </div>
              </div>
              <div className="track-item">
                <div className="track-dot"><div className="track-dot-inner"></div></div>
                <div className="track-card">
                  <div className="tc-when">Day 30</div>
                  <div className="tc-title">Balance payment</div>
                  <div className="tc-amount">₹{formatCurrency(data.balanceWithGst)}</div>
                  <div className="tc-note">Remaining 50% of fixed fee (₹{formatCurrency(data.balanceAmount)}) + 18% GST<br/>Due after 30 days of delivered work</div>
                </div>
              </div>
              {data.hasPerformanceFee && (
                <>
                  <div className="track-item">
                    <div className="track-dot perf"></div>
                    <div className="track-card perf-card">
                      <div className="tc-when">Performance milestone 1</div>
                      <div className="tc-title">Revenue bonus</div>
                      <div className="tc-amount">{data.perfBonus1Amount}</div>
                      <div className="tc-note">+ 18% GST</div>
                      <div className="tc-trigger">
                        <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                        Triggered on {data.perfBonus1Trigger} in revenue
                      </div>
                    </div>
                  </div>
                  <div className="track-item">
                    <div className="track-dot perf"></div>
                    <div className="track-card perf-card">
                      <div className="tc-when">Performance milestone 2</div>
                      <div className="tc-title">Revenue bonus</div>
                      <div className="tc-amount">{data.perfBonus2Amount}</div>
                      <div className="tc-note">+ 18% GST</div>
                      <div className="tc-trigger">
                        <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                        Triggered on {data.perfBonus2Trigger} in revenue
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div style={{padding: '0 20px'}}>
            <div className="notice gray">
              <div className="notice-title">Ad spend is not included in the fee</div>
              <div className="notice-body">We cover campaign management. Ad spend on Meta is separate. We start with our own ₹25,000 test budget to find what works — then you fund the scale.</div>
            </div>
            <div className="notice gray" style={{marginTop: '10px'}}>
              <div className="notice-title">On revenue outcomes</div>
              <div className="notice-body">We build and run the system. Revenue outcomes depend on market, pricing, and platform conditions outside our control. We don&apos;t guarantee revenue numbers — we guarantee the best possible funnel and campaigns.</div>
            </div>
          </div>

          <div className="accept-wrap">
            <div className="accept-row">
              <input type="checkbox" className="acb" checked={pricingAccepted} onChange={(e) => setPricingAccepted(e.target.checked)} />
              <label className="aclbl" onClick={() => setPricingAccepted(!pricingAccepted)}>I have read and understood the fee structure and payment schedule above.</label>
            </div>
          </div>
        </div>
        <div className="footer">
          <button className="cta" disabled={!pricingAccepted} onClick={() => goToScreen(3)}>Accept and proceed to agreement →</button>
          <div className="cta-note">Agreement shown next — no payment until after signing</div>
        </div>
      </div>

      {/* Screen 3 - Agreement */}
      <div className={`screen ${currentScreen === 3 ? 'on' : ''}`}>
        <div className="topbar">
          <button className="back-btn" onClick={() => goToScreen(2)}>← Back</button>
          <div className="brand"><svg viewBox="0 0 16 16" style={{width: '16px', height: '16px'}}><polygon points="8,1 15,15 1,15" fill="#6d28d9"/></svg></div>
          <button className="help-btn" onClick={() => setHelpOpen(true)}>
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.3"/><path d="M8 11V10M8 8.5A1.75 1.75 0 106.25 6.75" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><circle cx="8" cy="11.5" r=".4" fill="currentColor"/></svg>
            Help
          </button>
        </div>
        <div className="stepnav">
          <div className="stp done">Proposal</div>
          <div className="stp done">Pricing</div>
          <div className="stp cur">Agreement</div>
          <div className="stp">Payment</div>
        </div>
        <div className="body">
          <div className="mou-hero">
            <div className="mou-eyebrow">Legal document · MoU</div>
            <div className="mou-title">Service Agreement</div>
            <div className="mou-intro">This agreement defines the exact terms of the engagement. Read every clause. By signing, you confirm you have read, understood, and agreed to all terms.</div>
          </div>

          <div className="parties">
            <div className="party">
              <div className="party-label">Service provider</div>
              <div className="party-name">Yuvichaar Funnels</div>
              <div className="party-sub">Yuvichaar Edtech Pvt Ltd<br/>GSTIN: 08AABCY8310R1ZP</div>
            </div>
            <div className="party">
              <div className="party-label">Client</div>
              <div className="party-name">{data.company}</div>
              <div className="party-sub">{data.company}</div>
            </div>
          </div>

          <div className="meta-block">
            <div className="meta-row"><span className="mk">Engagement</span><span className="mv">{data.proposalTitle}</span></div>
            <div className="meta-row"><span className="mk">Start date</span><span className="mv">{data.startDate || 'To be confirmed at kickoff'}</span></div>
            <div className="meta-row"><span className="mk">Fixed fee</span><span className="mv">₹{formatCurrency(data.fixedFee)} + GST</span></div>
            <div className="meta-row"><span className="mk">Advance (50% — on signing)</span><span className="mv">₹{formatCurrency(data.advanceWithGst)} incl. GST</span></div>
            <div className="meta-row"><span className="mk">Balance (50% — Day 30)</span><span className="mv">₹{formatCurrency(data.balanceWithGst)} incl. GST</span></div>
          </div>

          <div className="clauses">
            <div className="cg-title">Section A — Scope of Work</div>
            <div className="clause">
              <div className="cl-num">Clause 1</div>
              <div className="cl-title">Services to be delivered</div>
              <div className="cl-body">Yuvichaar Funnels (&quot;the Agency&quot;) agrees to design and execute the {data.proposalTitle} for <span className="hl">{data.company}</span>, commencing <span className="hl">{data.startDate || 'the agreed start date'}</span>:
                <ul className="cl-list">
                  <li>{data.adsCount} performance video ads — scripted, shot, edited, Meta-ready</li>
                  <li>{data.socialVideosCount} social media videos + full Instagram profile optimisation</li>
                  <li>{data.landingPagesCount} high-converting landing page(s) including Video Sales Letter</li>
                  <li>Checkout experience — single-click checkout, order bumps, copy optimisation</li>
                  <li>WATI WhatsApp automations — cart abandonment + repeat purchase + cross-sell + upsell (video + text sequences)</li>
                  <li>Email automations — cart abandonment + post-purchase sequences</li>
                  <li>ManyChat Instagram DM automations</li>
                  <li>AI calling integration for high-intent visitors</li>
                  <li>60-day Meta campaign management</li>
                  {data.customDeliverable && <li>{data.customDeliverable} — as separately agreed</li>}
                </ul>
              </div>
            </div>

            <div className="clause">
              <div className="cl-num">Clause 2</div>
              <div className="cl-title">Production and quality standards</div>
              <div className="cl-body">All video content will be shot on professional Netflix-approved cameras. All deliverables meet Meta advertising specifications. Landing pages will be mobile-first, load under 3 seconds, and meet the conversion standards in the proposal. All automation sequences will be fully tested before launch.</div>
            </div>

            <div className="clause">
              <div className="cl-num">Clause 3</div>
              <div className="cl-title">Timeline</div>
              <div className="cl-body">The engagement runs for 60 days from the confirmed start date. Campaigns go live by Day 21. Some phases run in parallel. If the Client delays feedback, access, or approvals, the Agency will notify the Client of the timeline impact and agree a revised schedule.</div>
            </div>

            <div className="cg-title">Section B — Payment Terms</div>

            <div className="clause">
              <div className="cl-num">Clause 4</div>
              <div className="cl-title">Fee structure and payment schedule</div>
              <div className="cl-body">The fixed fee for this engagement is <span className="hl">₹{formatCurrency(data.fixedFee)}</span> excluding GST at 18%. Payment is in two equal instalments:
                <ul className="cl-list">
                  <li>Advance: <span className="hl">₹{formatCurrency(data.advanceAmount)} + GST (₹{formatCurrency(data.advanceWithGst)} total)</span> — due on signing. This activates the engagement.</li>
                  <li>Balance: <span className="hl">₹{formatCurrency(data.balanceAmount)} + GST (₹{formatCurrency(data.balanceWithGst)} total)</span> — due on Day 30, regardless of delivery status unless there is a material breach by the Agency.</li>
                </ul>
                All fixed fee payments are non-refundable once the corresponding phase of work has commenced.
              </div>
            </div>

            {data.hasPerformanceFee && (
              <div className="clause">
                <div className="cl-num">Clause 5</div>
                <div className="cl-title">Performance bonuses</div>
                <div className="cl-body">A performance fee of <span className="hl">₹2,00,000 + GST</span> is payable in two tranches only upon confirmed achievement of revenue milestones:
                  <ul className="cl-list">
                    <li>{data.perfBonus1Amount} + GST — upon hitting {data.perfBonus1Trigger} in attributed revenue</li>
                    <li>{data.perfBonus2Amount} + GST — upon hitting {data.perfBonus2Trigger} in attributed revenue</li>
                  </ul>
                  Performance bonuses are not due unless the stated revenue milestones are met and verified. If milestones are not reached, no performance fee is payable.
                </div>
              </div>
            )}

            <div className="clause">
              <div className="cl-num">Clause 6</div>
              <div className="cl-title">Ad spend budget</div>
              <div className="cl-body">The fees above cover campaign management only. Meta ad spend is not included. The Agency will fund up to ₹25,000 in initial test spend. Thereafter, the Client is responsible for funding ad spend. The Agency cannot be held responsible for campaign results if the Client does not fund adequate spend.</div>
            </div>

            <div className="cg-title">Section C — Mutual Responsibilities</div>

            <div className="clause">
              <div className="cl-num">Clause 7</div>
              <div className="cl-title">Agency commitments</div>
              <div className="cl-body">
                <ul className="cl-list">
                  <li>Deliver every item in Clause 1 within the agreed timeline</li>
                  <li>Assign a dedicated POC who sends the Client a daily update</li>
                  <li>Provide real-time visibility via the Client&apos;s dedicated portal</li>
                  <li>Cover automation tool subscription costs for the first 2 months</li>
                  <li>Fund ₹25,000 in initial Meta test spend</li>
                  <li>Share weekly performance reports during the campaign period</li>
                </ul>
              </div>
            </div>

            <div className="clause">
              <div className="cl-num">Clause 8</div>
              <div className="cl-title">Client responsibilities</div>
              <div className="cl-body">
                <ul className="cl-list">
                  <li>Provide feedback on all deliverables within 48 hours. Delays impact launch timing.</li>
                  <li>Grant platform access (Meta BM, website, WhatsApp API, Instagram) by end of Week 1</li>
                  <li>Designate one decision-maker with authority to approve scripts, creatives, and copy</li>
                  <li>Fund ad spend budget as agreed at kickoff</li>
                  <li>Provide brand assets, product imagery, and testimonials as requested</li>
                </ul>
              </div>
            </div>

            <div className="cg-title">Section D — Revisions, Reshoots, Scope</div>

            <div className="clause">
              <div className="cl-num">Clause 9</div>
              <div className="cl-title">Revision policy</div>
              <div className="cl-body">Included at no cost: minor script adjustments before production, subtitle/text corrections, minor editing changes aligned with approved concept. Not included: complete concept changes after production, additional creatives beyond the agreed quantity, new deliverables not in this agreement.</div>
            </div>

            <div className="clause">
              <div className="cl-num">Clause 10</div>
              <div className="cl-title">Reshoot policy</div>
              <div className="cl-body">Reshoots at no cost only when the Agency deviates from the approved script (missed lines, wrong wording, technical equipment failure). Not provided for subjective dissatisfaction including acting preferences or creative direction changes formed after production.</div>
            </div>

            <div className="clause">
              <div className="cl-num">Clause 11</div>
              <div className="cl-title">Scope limitations</div>
              <div className="cl-body">Outside scope unless separately agreed in writing:
                <ul className="cl-list">
                  <li>Additional video ads or landing pages beyond the quantity in Clause 1</li>
                  <li>Website development outside the funnel landing page</li>
                  <li>Additional automation systems beyond those in Clause 1</li>
                  <li>Customer service handling on behalf of the Client</li>
                </ul>
              </div>
            </div>

            <div className="cg-title">Section E — Outcomes and Liability</div>

            <div className="clause">
              <div className="cl-num">Clause 12</div>
              <div className="cl-title">No guarantee of revenue outcomes</div>
              <div className="cl-body">The Agency installs the infrastructure and manages campaigns. Revenue outcomes are not guaranteed — they depend on market demand, pricing, competition, and platform dynamics outside the Agency&apos;s control. The Agency commits to delivering the best possible system and campaigns.</div>
            </div>

            <div className="clause">
              <div className="cl-num">Clause 13</div>
              <div className="cl-title">Automation subscriptions after 2 months</div>
              <div className="cl-body">The Agency covers WATI, email, and ManyChat subscription costs for the first 2 months. After that, all renewals are the Client&apos;s responsibility. The Agency provides all credentials and documentation required to manage subscriptions independently.</div>
            </div>

            <div className="clause" style={{marginBottom: 0}}>
              <div className="cl-num">Clause 14</div>
              <div className="cl-title">Governing law</div>
              <div className="cl-body">This agreement is governed by the laws of India. Disputes are subject to the jurisdiction of the courts of Jaipur, Rajasthan. Both parties agree to attempt amicable resolution before pursuing legal remedies.</div>
            </div>
          </div>

          <div className="confirms-wrap">
            <div className="confirms-label">Before signing — confirm you have read</div>
            {[
              'The exact deliverables and quantities in Clause 1',
              'The payment schedule — advance on signing, balance on Day 30 (Clause 4)',
              'Performance bonuses are only triggered on revenue milestones (Clause 5)',
              'Revenue outcomes are not guaranteed (Clause 12)',
              'My 48-hour feedback responsibility and scope limitations (Clauses 8 & 11)'
            ].map((text, i) => (
              <div className="ci" key={i}>
                <input 
                  type="checkbox" 
                  className="cicb" 
                  checked={confirmations[i]} 
                  onChange={() => {
                    const newConf = [...confirmations];
                    newConf[i] = !newConf[i];
                    setConfirmations(newConf);
                  }}
                />
                <label className="cilbl" onClick={() => {
                  const newConf = [...confirmations];
                  newConf[i] = !newConf[i];
                  setConfirmations(newConf);
                }}>{text}</label>
              </div>
            ))}
          </div>

          <div className="sig-wrap">
            <div className="sig-label">Your e-signature</div>
            <input 
              className="sig-field" 
              type="text" 
              placeholder="Type your full legal name" 
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              autoComplete="name"
            />
            <div className={`sig-preview ${signatureValid ? 'live' : ''}`}>
              {signatureValid ? (
                <span className="sig-text">{signature}</span>
              ) : (
                <span className="sig-empty">Your signature will appear here</span>
              )}
            </div>
            <div className="sig-note">Legally valid under IT Act, 2000 · Signed PDF sent to your email immediately</div>
          </div>
        </div>
        <div className="footer">
          <button className="cta" disabled={!canSign || signing} onClick={handleSign}>
            {signing ? 'Signing...' : 'Sign and proceed to payment →'}
          </button>
        </div>
      </div>

      {/* Screen 4 - Payment */}
      <div className={`screen ${currentScreen === 4 ? 'on' : ''}`}>
        <div className="topbar">
          <button className="back-btn" onClick={() => goToScreen(3)}>← Back</button>
          <div className="brand"><svg viewBox="0 0 16 16" style={{width: '16px', height: '16px'}}><polygon points="8,1 15,15 1,15" fill="#6d28d9"/></svg></div>
          <button className="help-btn" onClick={() => setHelpOpen(true)}>
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.3"/><path d="M8 11V10M8 8.5A1.75 1.75 0 106.25 6.75" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><circle cx="8" cy="11.5" r=".4" fill="currentColor"/></svg>
            Help
          </button>
        </div>
        <div className="stepnav">
          <div className="stp done">Proposal</div>
          <div className="stp done">Pricing</div>
          <div className="stp done">Agreement</div>
          <div className="stp cur">Payment</div>
        </div>
        <div className="body">
          <div className="pay-hero">
            <div className="pay-eyebrow">Advance payment — due now</div>
            <div className="pay-amount">₹{formatCurrency(data.advanceWithGst)}</div>
            <div className="pay-breakdown">₹{formatCurrency(data.advanceAmount)} + 18% GST · 50% of fixed fee</div>
          </div>

          <div className="unlock-block">
            <div className="unlock-label">Paying this activates</div>
            <div className="ul-item"><div className="ul-dot"></div>Instant access to your client portal</div>
            <div className="ul-item"><div className="ul-dot"></div>WhatsApp onboarding sequence starts immediately</div>
            <div className="ul-item"><div className="ul-dot"></div>Kickoff call link sent automatically</div>
            <div className="ul-item"><div className="ul-dot"></div>Brand question form sent on WhatsApp</div>
            <div className="ul-item"><div className="ul-dot"></div>Signed MoU + receipt to your email</div>
            <div className="ul-item"><div className="ul-dot"></div>60-Day Marathon officially begins</div>
          </div>

          <div className="pm-block">
            <div className="pm-label">Choose payment method</div>
            <div className={`popt ${paymentMethod === 1 ? 'sel' : ''}`} onClick={() => setPaymentMethod(1)}>
              <span className="pm-icon">💳</span>
              <div className="pm-body">
                <div className="pm-name">Pay online</div>
                <div className="pm-desc">Cards, UPI, netbanking — via Razorpay</div>
              </div>
              <div className="pm-radio"><div className="pm-dot"></div></div>
            </div>
            <div className={`popt ${paymentMethod === 2 ? 'sel' : ''}`} onClick={() => setPaymentMethod(2)}>
              <span className="pm-icon">🏦</span>
              <div className="pm-body">
                <div className="pm-name">Bank transfer</div>
                <div className="pm-desc">NEFT / IMPS / RTGS</div>
              </div>
              <div className="pm-radio"><div className="pm-dot"></div></div>
            </div>
            <div className={`bank-box ${paymentMethod === 2 ? 'on' : ''}`}>
              <div className="brow"><span className="bk">Account name</span><span className="bv">Yuvichaar EdTech Pvt Ltd</span></div>
              <div className="brow"><span className="bk">Bank</span><span className="bv">HDFC Bank</span></div>
              <div className="brow"><span className="bk">Account number</span><span className="bv">50200104748061</span></div>
              <div className="brow"><span className="bk">IFSC code</span><span className="bv">HDFC0007731</span></div>
              <div className="brow"><span className="bk">Account type</span><span className="bv">Current</span></div>
              <div className="brow"><span className="bk">Amount to transfer</span><span className="bv">₹{formatCurrency(data.advanceWithGst)}</span></div>
              <div className="bank-note">After transferring, select &quot;Already paid&quot; below and upload your screenshot. We verify within 2 hours.</div>
            </div>
            <div className={`popt ${paymentMethod === 3 ? 'sel' : ''}`} onClick={() => setPaymentMethod(3)}>
              <span className="pm-icon">📎</span>
              <div className="pm-body">
                <div className="pm-name">Already paid?</div>
                <div className="pm-desc">Upload your transfer screenshot</div>
              </div>
              <div className="pm-radio"><div className="pm-dot"></div></div>
            </div>
            <div className={`proof-box ${paymentMethod === 3 ? 'on' : ''}`}>
              <input type="file" accept="image/*,.pdf" style={{display: 'none'}} />
              <div className="proof-title">Tap to upload screenshot</div>
              <div className="proof-hint">JPG, PNG or PDF · max 10MB</div>
            </div>
            <div className="secure-note">🔒 256-bit SSL encryption · Razorpay secured</div>
          </div>
        </div>
        <div className="footer">
          <button className="cta" disabled={processingPayment} onClick={handlePayment}>
            {processingPayment ? 'Processing...' : `Pay ₹${formatCurrency(data.advanceWithGst)} →`}
          </button>
        </div>
      </div>

      {/* Screen 5 - Password Setup */}
      <div className={`screen ${currentScreen === 5 ? 'on' : ''}`}>
        <div className="topbar">
          <div className="brand">
            <svg viewBox="0 0 16 16" style={{width: '16px', height: '16px'}}><polygon points="8,1 15,15 1,15" fill="#6d28d9"/></svg>
            <span className="brand-name">Yuvichaar Funnels</span>
          </div>
        </div>
        <div className="body">
          <div className="success-body">
            <span className="s-icon">🔐</span>
            <div className="s-title">Set Your Password</div>
            <div className="s-sub">
              Create a password to access your client dashboard. You&apos;ll use your email ({data.email}) to log in.
            </div>
            <div style={{width: '100%', maxWidth: '320px', margin: '24px auto'}}>
              <input
                type="password"
                placeholder="Create password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  fontSize: '16px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  marginBottom: '12px',
                  outline: 'none',
                }}
              />
              <input
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  fontSize: '16px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  outline: 'none',
                }}
              />
            </div>
          </div>
        </div>
        <div className="footer">
          <button 
            className="cta" 
            disabled={settingPassword || password.length < 6 || password !== confirmPassword}
            onClick={handleSetPassword}
          >
            {settingPassword ? 'Setting up...' : 'Create Account & Continue →'}
          </button>
        </div>
      </div>

      {/* Screen 6 - Success */}
      <div className={`screen ${currentScreen === 6 ? 'on' : ''}`}>
        <div className="topbar">
          <div className="brand">
            <svg viewBox="0 0 16 16" style={{width: '16px', height: '16px'}}><polygon points="8,1 15,15 1,15" fill="#6d28d9"/></svg>
            <span className="brand-name">Yuvichaar Funnels</span>
          </div>
        </div>
        <div className="body">
          <div className="success-body">
            <span className="s-icon">{paymentMethod === 1 ? '🎉' : '⏳'}</span>
            <div className="s-title">{paymentMethod === 1 ? "You're in." : 'Payment submitted.'}</div>
            <div className="s-sub">
              {paymentMethod === 1 
                ? "Payment confirmed. Your 60-Day Growth Marathon starts now. Everything below happened automatically."
                : "We'll verify within 2 hours and activate everything. You'll receive a WhatsApp confirmation."
              }
            </div>
            <div className="auto-label">What just happened</div>
            {data.successItems.map((item, i) => (
              <div className="ai" key={i}>
                <div className="a-chk">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="white" strokeWidth="1.5"><polyline points="2,5 4.5,7.5 8.5,2.5"/></svg>
                </div>
                {item}
              </div>
            ))}
            <div className="next-box">
              <div className="next-label">Your next step</div>
              <div className="next-text">{data.nextStepText}</div>
            </div>
            <a className="portal-cta" href="/login">Login to Dashboard →</a>
          </div>
        </div>
      </div>

      {/* Help Sheet */}
      <div className={`backdrop ${helpOpen ? 'on' : ''}`} onClick={() => setHelpOpen(false)}></div>
      <div className={`sheet ${helpOpen ? 'on' : ''}`}>
        <div className="sh-handle"></div>
        <div className="sh-title">Need help?</div>
        <div className="sh-sub">Questions about the proposal, pricing, or payment — talk to us directly.</div>
        <a className="wa-btn" href={`https://wa.me/${data.whatsappNumber.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a5.5 5.5 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479s1.065 2.875 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M11.999 2.003a9.996 9.996 0 00-8.591 15.077L2 22l5.093-1.336A9.996 9.996 0 1011.999 2.003z"/></svg>
          WhatsApp Yuvraj directly
        </a>
        <a className="call-btn" href="tel:+919999900001">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
          Call directly
        </a>
        <div className="faq-lbl">Common questions</div>
        {[
          { q: 'What is the 60-Day Growth Marathon?', a: 'A fixed 60-day engagement where we build your complete D2C customer acquisition system — video ads, landing page, automations, live campaigns. By Day 60 you have a fully running funnel.' },
          { q: 'Why is the fee split?', a: 'The fixed fee (₹4,49,000) is paid in two equal halves — 50% on signing, 50% on Day 30 after you\'ve seen 30 days of work. The performance fee (₹2,00,000) is only paid when you hit the revenue milestones.' },
          { q: 'Is my payment secure?', a: 'Yes. Online payments go through Razorpay with 256-bit SSL. Bank transfers go directly to our registered HDFC current account (Yuvichaar Edtech Pvt Ltd).' },
          { q: 'What happens after I pay?', a: 'Everything activates automatically — your portal, a personal WhatsApp from Yuvraj, your kickoff call link, your brand question form, and your signed MoU + receipt by email.' }
        ].map((faq, i) => (
          <div key={i}>
            <div className={`fq ${faqOpen === i ? 'open' : ''}`} onClick={() => setFaqOpen(faqOpen === i ? null : i)}>
              {faq.q} <span className="fa-ar">›</span>
            </div>
            <div className={`fa ${faqOpen === i ? '' : ''}`} style={{display: faqOpen === i ? 'block' : 'none'}}>{faq.a}</div>
          </div>
        ))}
        <button className="dismiss-btn" onClick={() => setHelpOpen(false)}>Dismiss</button>
      </div>
    </div>
  );
}
