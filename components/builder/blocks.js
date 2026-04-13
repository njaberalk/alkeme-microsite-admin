/**
 * Custom ALKEME blocks for GrapeJS.
 * Each block matches the actual components used on the insurance microsites.
 */

export const alkemeBlocks = [
  // ===== LAYOUT =====
  {
    id: 'section',
    label: 'Section',
    category: 'Layout',
    media: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>',
    content: `<section style="padding: 5rem 0;">
      <div style="max-width: 68rem; margin: 0 auto; padding: 0 60px;">
        <h2 style="font-weight: bold; font-size: clamp(1.8rem, 3vw, 2.2rem); margin-bottom: 1rem; color: #25475e;">Section Heading</h2>
        <p style="font-size: 1rem; line-height: 1.7; color: #25475e;">Add your content here. Click to edit.</p>
      </div>
    </section>`,
  },
  {
    id: 'two-columns',
    label: '2 Columns',
    category: 'Layout',
    media: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="8" height="18" rx="1"/><rect x="13" y="3" width="8" height="18" rx="1"/></svg>',
    content: `<section style="padding: 5rem 0;">
      <div style="max-width: 68rem; margin: 0 auto; padding: 0 60px; display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
        <div style="padding: 1rem;">
          <h3 style="font-weight: bold; font-size: 1.3rem; margin-bottom: 0.5rem; color: #25475e;">Left Column</h3>
          <p style="font-size: 1rem; line-height: 1.7; color: #25475e;">Content here.</p>
        </div>
        <div style="padding: 1rem;">
          <h3 style="font-weight: bold; font-size: 1.3rem; margin-bottom: 0.5rem; color: #25475e;">Right Column</h3>
          <p style="font-size: 1rem; line-height: 1.7; color: #25475e;">Content here.</p>
        </div>
      </div>
    </section>`,
  },
  {
    id: 'three-columns',
    label: '3 Columns',
    category: 'Layout',
    media: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="6" height="18" rx="1"/><rect x="9" y="3" width="6" height="18" rx="1"/><rect x="16" y="3" width="6" height="18" rx="1"/></svg>',
    content: `<section style="padding: 5rem 0;">
      <div style="max-width: 68rem; margin: 0 auto; padding: 0 60px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1.5rem;">
        <div style="padding: 1rem;"><h4 style="font-weight:bold;margin-bottom:0.5rem;">Column 1</h4><p>Content</p></div>
        <div style="padding: 1rem;"><h4 style="font-weight:bold;margin-bottom:0.5rem;">Column 2</h4><p>Content</p></div>
        <div style="padding: 1rem;"><h4 style="font-weight:bold;margin-bottom:0.5rem;">Column 3</h4><p>Content</p></div>
      </div>
    </section>`,
  },

  // ===== HERO =====
  {
    id: 'hero',
    label: 'Hero Section',
    category: 'Sections',
    media: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="12" rx="2"/><line x1="7" y1="8" x2="17" y2="8"/><line x1="9" y1="11" x2="15" y2="11"/></svg>',
    content: `<section style="position:relative;overflow:hidden;background:#25475e;min-height:600px;display:flex;align-items:center;justify-content:center;text-align:center;">
      <div style="position:relative;max-width:68rem;margin:0 auto;padding:4rem 60px;">
        <h1 style="font-weight:800;font-size:clamp(2.5rem,7vw,5rem);line-height:1;margin-bottom:1.5rem;letter-spacing:-0.02em;">
          <span style="color:#f4f4ec;">Coverage Built for</span><br/>
          <span style="color:#ffbf3b;">the Road Ahead.</span>
        </h1>
        <p style="color:#f5f1e8;font-size:1.15rem;line-height:1.65;max-width:550px;margin:0 auto 2rem;">
          Specialized insurance for your business — from the operation you've built to the growth ahead.
        </p>
        <a href="#quote" style="display:inline-block;padding:0.8rem 2.5rem;background:#25475e;color:#f4f4ec;border:2px solid #f4f4ec;border-radius:2rem;font-weight:600;font-size:0.75rem;letter-spacing:0.16em;text-transform:uppercase;text-decoration:none;">
          Get Your Quote Today
        </a>
      </div>
    </section>`,
  },

  // ===== CONTENT =====
  {
    id: 'content-light',
    label: 'Content (Light)',
    category: 'Sections',
    media: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="5" width="18" height="14" rx="1" fill="#f4f4ec" stroke="#25475e"/><line x1="7" y1="9" x2="17" y2="9" stroke="#25475e"/><line x1="7" y1="13" x2="14" y2="13" stroke="#25475e"/></svg>',
    content: `<section style="padding:5rem 0;background:#f4f4ec;">
      <div style="max-width:68rem;margin:0 auto;padding:0 60px;">
        <div style="max-width:48rem;">
          <h2 style="font-weight:bold;font-size:clamp(1.8rem,3vw,2.2rem);line-height:1.3;margin-bottom:1.25rem;color:#25475e;">What This Covers</h2>
          <p style="font-size:1rem;line-height:1.7;color:#25475e;margin-bottom:1rem;">Add your content here. Explain coverage details, benefits, and why clients need this protection.</p>
          <p style="font-size:1rem;line-height:1.7;color:#25475e;">A second paragraph with more details about this topic.</p>
        </div>
      </div>
    </section>`,
  },
  {
    id: 'content-dark',
    label: 'Content (Dark)',
    category: 'Sections',
    media: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="5" width="18" height="14" rx="1" fill="#25475e" stroke="#25475e"/><line x1="7" y1="9" x2="17" y2="9" stroke="#f4f4ec"/><line x1="7" y1="13" x2="14" y2="13" stroke="#f4f4ec"/></svg>',
    content: `<section style="padding:5rem 0;background:#25475e;">
      <div style="max-width:68rem;margin:0 auto;padding:0 60px;">
        <div style="max-width:48rem;">
          <h2 style="font-weight:bold;font-size:clamp(1.8rem,3vw,2.2rem);line-height:1.3;margin-bottom:1.25rem;color:#f4f4ec;">Section Heading</h2>
          <p style="font-size:1rem;line-height:1.7;color:#f5f1e8;margin-bottom:1rem;">Content on a dark background. Great for alternating sections.</p>
        </div>
      </div>
    </section>`,
  },

  // ===== FAQ =====
  {
    id: 'faq',
    label: 'FAQ Section',
    category: 'Sections',
    media: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="9"/><path d="M9 9a3 3 0 115.83 1.5c0 1.5-2.83 2-2.83 3.5M12 18h.01"/></svg>',
    content: `<section style="padding:5rem 0;background:#f4f4ec;">
      <div style="max-width:900px;margin:0 auto;padding:0 60px;">
        <div style="text-align:center;margin-bottom:3rem;">
          <p style="color:#74a7f5;font-size:0.85rem;font-weight:bold;letter-spacing:0.15em;text-transform:uppercase;margin-bottom:1rem;">Frequently Asked Questions</p>
          <h2 style="color:#25475e;font-weight:bold;font-size:clamp(1.8rem,3vw,2.2rem);">Common Questions</h2>
        </div>
        <div style="border:2px solid #e3e3d8;border-radius:2rem;padding:1.5rem;margin-bottom:1rem;">
          <h4 style="font-weight:bold;color:#25475e;margin-bottom:0.5rem;">What does this insurance cover?</h4>
          <p style="color:rgba(37,71,94,0.7);font-size:0.9rem;line-height:1.6;">This coverage protects your business against common risks including liability claims, property damage, and operational exposures.</p>
        </div>
        <div style="border:2px solid #e3e3d8;border-radius:2rem;padding:1.5rem;margin-bottom:1rem;">
          <h4 style="font-weight:bold;color:#25475e;margin-bottom:0.5rem;">How much does it cost?</h4>
          <p style="color:rgba(37,71,94,0.7);font-size:0.9rem;line-height:1.6;">Pricing depends on your business size, location, and risk profile. Contact us for a personalized quote.</p>
        </div>
      </div>
    </section>`,
  },

  // ===== STATS =====
  {
    id: 'stats',
    label: 'Stats Row',
    category: 'Sections',
    media: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="12" width="4" height="8" rx="1"/><rect x="10" y="6" width="4" height="14" rx="1"/><rect x="17" y="9" width="4" height="11" rx="1"/></svg>',
    content: `<section style="padding:4rem 0;background:#25475e;">
      <div style="max-width:68rem;margin:0 auto;padding:0 60px;display:grid;grid-template-columns:repeat(3,1fr);gap:2rem;text-align:center;">
        <div>
          <div style="font-size:2.5rem;font-weight:800;color:#ffbf3b;">20+</div>
          <div style="font-size:0.85rem;color:#f5f1e8;margin-top:0.5rem;">Years Experience</div>
        </div>
        <div>
          <div style="font-size:2.5rem;font-weight:800;color:#ffbf3b;">1,000+</div>
          <div style="font-size:0.85rem;color:#f5f1e8;margin-top:0.5rem;">Clients Served</div>
        </div>
        <div>
          <div style="font-size:2.5rem;font-weight:800;color:#ffbf3b;">24hr</div>
          <div style="font-size:0.85rem;color:#f5f1e8;margin-top:0.5rem;">Quote Turnaround</div>
        </div>
      </div>
    </section>`,
  },

  // ===== CTA =====
  {
    id: 'cta-button',
    label: 'CTA Button',
    category: 'Elements',
    media: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="4" y="8" width="16" height="8" rx="4"/><line x1="9" y1="12" x2="15" y2="12"/></svg>',
    content: `<a href="#quote" style="display:inline-flex;align-items:center;justify-content:center;padding:0.8rem 2.5rem;background:#25475e;color:#f4f4ec;border:2px solid #25475e;border-radius:2rem;font-weight:600;font-size:0.75rem;letter-spacing:0.16em;text-transform:uppercase;text-decoration:none;">Get Your Quote</a>`,
  },
  {
    id: 'cta-gold',
    label: 'CTA (Gold)',
    category: 'Elements',
    media: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="4" y="8" width="16" height="8" rx="4" fill="#ffbf3b" stroke="#ffbf3b"/></svg>',
    content: `<a href="#quote" style="display:inline-flex;align-items:center;justify-content:center;padding:0.8rem 2rem;background:#ffbf3b;color:#25475e;border:2px solid #ffbf3b;border-radius:2rem;font-weight:600;font-size:0.75rem;letter-spacing:0.16em;text-transform:uppercase;text-decoration:none;">Get Started Today</a>`,
  },

  // ===== TESTIMONIAL =====
  {
    id: 'testimonial',
    label: 'Testimonial',
    category: 'Sections',
    media: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M7 8h10M7 12h6m-6 8l4-4H18a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2h2l-1 4z"/></svg>',
    content: `<section style="padding:5rem 0;background:#f4f4ec;">
      <div style="max-width:48rem;margin:0 auto;padding:0 60px;text-align:center;">
        <p style="font-size:1.25rem;font-style:italic;line-height:1.7;color:#25475e;margin-bottom:2rem;">
          "Working with this team transformed our insurance program. They understood our operation from day one and found coverage we didn't know existed."
        </p>
        <div>
          <p style="font-weight:bold;color:#25475e;">Client Name</p>
          <p style="font-size:0.85rem;color:rgba(37,71,94,0.6);">President, Company Name</p>
        </div>
      </div>
    </section>`,
  },

  // ===== CARDS =====
  {
    id: 'feature-cards',
    label: 'Feature Cards',
    category: 'Sections',
    media: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="8" height="8" rx="2"/><rect x="13" y="3" width="8" height="8" rx="2"/><rect x="3" y="13" width="8" height="8" rx="2"/><rect x="13" y="13" width="8" height="8" rx="2"/></svg>',
    content: `<section style="padding:5rem 0;background:#25475e;">
      <div style="max-width:68rem;margin:0 auto;padding:0 60px;">
        <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:1.25rem;">
          <div style="border:2px solid rgba(227,227,216,0.3);border-radius:2rem;padding:1.5rem;">
            <h4 style="font-weight:bold;color:#f4f4ec;font-size:1.1rem;margin-bottom:0.5rem;">Feature One</h4>
            <p style="color:#f5f1e8;font-size:0.85rem;line-height:1.5;">Description of this feature or benefit.</p>
          </div>
          <div style="border:2px solid rgba(227,227,216,0.3);border-radius:2rem;padding:1.5rem;">
            <h4 style="font-weight:bold;color:#f4f4ec;font-size:1.1rem;margin-bottom:0.5rem;">Feature Two</h4>
            <p style="color:#f5f1e8;font-size:0.85rem;line-height:1.5;">Description of this feature or benefit.</p>
          </div>
          <div style="border:2px solid rgba(227,227,216,0.3);border-radius:2rem;padding:1.5rem;">
            <h4 style="font-weight:bold;color:#f4f4ec;font-size:1.1rem;margin-bottom:0.5rem;">Feature Three</h4>
            <p style="color:#f5f1e8;font-size:0.85rem;line-height:1.5;">Description of this feature or benefit.</p>
          </div>
          <div style="border:2px solid rgba(227,227,216,0.3);border-radius:2rem;padding:1.5rem;">
            <h4 style="font-weight:bold;color:#f4f4ec;font-size:1.1rem;margin-bottom:0.5rem;">Feature Four</h4>
            <p style="color:#f5f1e8;font-size:0.85rem;line-height:1.5;">Description of this feature or benefit.</p>
          </div>
        </div>
      </div>
    </section>`,
  },

  // ===== BASIC ELEMENTS =====
  {
    id: 'heading',
    label: 'Heading',
    category: 'Elements',
    content: '<h2 style="font-weight:bold;font-size:clamp(1.8rem,3vw,2.2rem);color:#25475e;margin-bottom:1rem;">New Heading</h2>',
  },
  {
    id: 'paragraph',
    label: 'Paragraph',
    category: 'Elements',
    content: '<p style="font-size:1rem;line-height:1.7;color:#25475e;margin-bottom:1rem;">Click to edit this paragraph. Add your content here.</p>',
  },
  {
    id: 'image',
    label: 'Image',
    category: 'Elements',
    content: '<img src="https://placehold.co/800x400/25475e/f4f4ec?text=Click+to+replace" alt="Image description" style="max-width:100%;border-radius:1rem;"/>',
  },
  {
    id: 'bullet-list',
    label: 'Bullet List',
    category: 'Elements',
    content: `<ul style="list-style:none;padding:0;margin:1rem 0;">
      <li style="display:flex;align-items:start;gap:0.75rem;margin-bottom:0.75rem;font-size:0.95rem;line-height:1.5;color:#25475e;"><span style="color:#ffbf3b;margin-top:0.25rem;">&#9679;</span><span>First benefit or feature point</span></li>
      <li style="display:flex;align-items:start;gap:0.75rem;margin-bottom:0.75rem;font-size:0.95rem;line-height:1.5;color:#25475e;"><span style="color:#ffbf3b;margin-top:0.25rem;">&#9679;</span><span>Second benefit or feature point</span></li>
      <li style="display:flex;align-items:start;gap:0.75rem;margin-bottom:0.75rem;font-size:0.95rem;line-height:1.5;color:#25475e;"><span style="color:#ffbf3b;margin-top:0.25rem;">&#9679;</span><span>Third benefit or feature point</span></li>
    </ul>`,
  },
  {
    id: 'divider',
    label: 'Divider',
    category: 'Elements',
    content: '<hr style="border:none;border-top:2px solid #e3e3d8;margin:2rem 0;"/>',
  },
  {
    id: 'spacer',
    label: 'Spacer',
    category: 'Elements',
    content: '<div style="height:3rem;"></div>',
  },

  // ===== QUOTE FORM =====
  {
    id: 'quote-form',
    label: 'Quote CTA',
    category: 'Sections',
    content: `<section style="padding:5rem 0;background:#25475e;">
      <div style="max-width:48rem;margin:0 auto;padding:0 60px;text-align:center;">
        <h2 style="font-weight:bold;font-size:clamp(1.8rem,3vw,2.2rem);color:#f4f4ec;margin-bottom:1rem;">Ready to Get Started?</h2>
        <p style="color:#f5f1e8;font-size:1rem;line-height:1.6;margin-bottom:2rem;">Get a personalized quote from our insurance specialists. We'll review your operation and find the right coverage.</p>
        <a href="https://alkemeins.com/form" style="display:inline-flex;padding:0.9rem 2.5rem;background:#ffbf3b;color:#25475e;border-radius:2rem;font-weight:700;font-size:0.8rem;letter-spacing:0.14em;text-transform:uppercase;text-decoration:none;">Get Your Free Quote</a>
      </div>
    </section>`,
  },
];
