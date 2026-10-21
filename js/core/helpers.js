
/* Helpers: DOM shortcuts, escaping, date parsing, SVG icons */
'use strict';

/* Smart Campus Hub prototype. Simulated auth + localStorage data (no backend). */

const $ = (s, e = document) => e.querySelector(s);
const $$ = (s, e = document) => [...e.querySelectorAll(s)];

const esc = s =>
    String(s ?? '').replace(/[&<>"']/g, c => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[c]));

const MON = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

/* parse "06 Oct 2026" or "07 Oct" (year defaults 2026); returns ms or null */
const pd = s => {
    const m = String(s).trim().match(/^(\d{1,2})\s+([A-Za-z]{3})[a-z]*\.?\s*(\d{4})?$/);

    if (!m) return null;

    const i = MON.findIndex(x => x.toLowerCase() === m[2].toLowerCase());

    return i < 0
        ? null
        : new Date(+(m[3] || 2026), i, +m[1]).getTime();
};

const fd = (d, y = 1) =>
    `${String(d.getDate()).padStart(2, '0')} ${MON[d.getMonth()]}${y ? ' ' + d.getFullYear() : ''}`;

const ICO = {
    dash: 'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z',
    user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',
    cap: 'M22 10 12 5 2 10l10 5 10-5zM6 12v5c3 2 9 2 12 0v-5',
    mega: 'M3 11v2l14 6V5L3 11zM17 8a4 4 0 0 1 0 8',
    card: 'M2 5h20v14H2zM2 10h20',
    users: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8',
    clock: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM12 6v6l4 2',
    file: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6',
    out: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9',
    sliders: 'M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6',
    pen: 'M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z'
};

const ic = n =>
    `<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
    <path d="${ICO[n]}"/></svg>`;
