
/* UI Engine: Tables, Menus, Modals, and Column Sets */
'use strict';

/* ---------- Table Engine: Search, Filters, and Sorting ---------- */

const T = {};
const TS = {};

// T: Table configurations
// TS: Table state { q, f: { col: val }, s: { k, dir } }

function tbl(id, cfg) {
    T[id] = cfg;

    TS[id] = TS[id] || {
        q: '',
        f: {},
        s: null
    };

    return `
        <div class="c tw">
            <div id="t-${id}"></div>
        </div>
    `;
}

/* ---------- Column Value Helper ---------- */

const cv = (c, r) =>
    c.v ? c.v(r) : r[c.k];

/* ---------- Sorting Comparator ---------- */

const cmp = (c, dir) => (a, b) => {
    let x = cv(c, a);
    let y = cv(c, b);

    if (c.t === 'date') {
        x = pd(x);
        y = pd(y);
    } else if (c.t === 'num') {
        x = Number(x);
        y = Number(y);
    } else {
        x = String(x).toLowerCase();
        y = String(y).toLowerCase();
    }

    if (
        x == null ||
        (typeof x === 'number' && isNaN(x))
    ) {
        return (
            y == null || isNaN(y)
        ) ? 0 : 1;
    }

    if (
        y == null ||
        (typeof y === 'number' && isNaN(y))
    ) {
        return -1;
    }

    return (
        x < y ? -1 :
        x > y ? 1 : 0
    ) * dir;
};

/* ---------- Render Table ---------- */

function drawT(id) {
    const cfg = T[id];
    const st = TS[id];
    const el = $('#t-' + id);

    if (!el) {
        return;
    }

    let rows = cfg.rows();

    const total = rows.length;
    const q = st.q.trim().toLowerCase();

    /* ---------- Search ---------- */

    if (q) {
        rows = rows.filter(r =>
            cfg.cols.some(c =>
                String(cv(c, r))
                    .toLowerCase()
                    .includes(q)
            )
        );
    }

    /* ---------- Column Filters ---------- */

    cfg.cols.forEach(c => {
        if (st.f[c.k] != null) {
            rows = rows.filter(r =>
                String(cv(c, r)) === st.f[c.k]
            );
        }
    });

    /* ---------- Column Sorting ---------- */

    if (st.s) {
        const c = cfg.cols.find(c =>
            c.k === st.s.k
        );

        if (c) {
            rows = [...rows].sort(
                cmp(c, st.s.dir)
            );
        }
    }

    /* ---------- Active Filter Labels ---------- */

    const lab = k =>
        (cfg.cols.find(c => c.k === k) || {}).l;

    const chips = [
        ...Object.keys(st.f).map(k => [
            k,
            lab(k) + ': ' + st.f[k]
        ]),

        ...(
            st.s
                ? [[
                    '~s',
                    lab(st.s.k) + ': ' +
                    SORTL[
                        (cfg.cols.find(c =>
                            c.k === st.s.k
                        ) || {}).t
                    ][st.s.dir > 0 ? 0 : 1]
                ]]
                : []
        )
    ];

    /* ---------- Table Headers ---------- */

    const th = cfg.cols.map(c => {
        if (c.t === 'none' || !c.t) {
            return `<th>${c.l}</th>`;
        }

        const f = st.f[c.k];

        const s = st.s && st.s.k === c.k
            ? st.s
            : null;

        return `
            <th
                aria-sort="${
                    s
                        ? (
                            s.dir > 0
                                ? 'ascending'
                                : 'descending'
                        )
                        : 'none'
                }"
            >
                <button
                    class="hb${f != null || s ? ' on' : ''}"
                    data-m="${id}|${c.k}"
                    aria-haspopup="true"
                >
                    ${c.l}

                    <i>
                        ${
                            s
                                ? (s.dir > 0 ? '▲' : '▼')
                                : '▼'
                        }
                    </i>
                </button>
            </th>
        `;
    }).join('');

    /* ---------- Table Body ---------- */

    const body = rows.length
        ? rows.map(r => `
            <tr ${cfg.row ? cfg.row(r) : ''}>
                ${cfg.cols.map(c => `
                    <td${c.nw ? ' class="nw"' : ''}>
                        ${c.f ? c.f(r) : esc(cv(c, r))}
                    </td>
                `).join('')}
            </tr>
        `).join('')
        : `
            <tr>
                <td
                    colspan="${cfg.cols.length}"
                    class="mu"
                    style="text-align:center;font-weight:400;padding:28px"
                >
                    ${
                        q || Object.keys(st.f).length
                            ? 'No records match your search or filters.'
                            : (cfg.empty || 'No records yet.')
                    }
                </td>
            </tr>
        `;

    /* ---------- Complete Table Layout ---------- */

    el.innerHTML = `
        <div class="tt">
            <span class="mu">
                ${
                    rows.length === total
                        ? total + ' record' + (total === 1 ? '' : 's')
                        : rows.length + ' of ' + total + ' records'
                }
            </span>

            <span class="chips">
                ${chips.map(c => `
                    <span class="chip">
                        ${esc(c[1])}

                        <button
                            data-a="rmf"
                            data-v="${id}|${c[0]}"
                            aria-label="Remove ${esc(c[1])}"
                        >
                            ✕
                        </button>
                    </span>
                `).join('')}

                ${chips.length ? `
                    <button
                        class="lk"
                        data-a="clr"
                        data-v="${id}"
                    >
                        Reset
                    </button>
                ` : ''}
            </span>
        </div>

        <table>
            <thead>
                <tr>${th}</tr>
            </thead>

            <tbody>
                ${body}
            </tbody>
        </table>

        ${cfg.foot ? `
            <div class="tf">
                ${cfg.foot()}
            </div>
        ` : ''}
    `;
}

/* ---------- Sorting Labels ---------- */

const SORTL = {
    date: [
        'Older to Newer',
        'Newer to Older'
    ],

    text: [
        'A → Z',
        'Z → A'
    ],

    num: [
        'Low to High',
        'High to Low'
    ],

    cat: [
        '',
        ''
    ]
};

/* ---------- Render All Tables ---------- */

const drawAll = () =>
    Object.keys(T).forEach(drawT);

/* ---------- Table Filter and Sort Menu ---------- */

function openMenu(btn) {
    closeMenu();

    const [id, k] = btn.dataset.m.split('|');

    const cfg = T[id];
    const st = TS[id];
    const c = cfg.cols.find(c => c.k === k);

    let items = [];

    /* ---------- Category Filters ---------- */

    if (c.t === 'cat') {
        const base = [
            ...new Set(c.o ? c.o() : [])
        ];

        const vals = [
            ...base,

            ...[
                ...new Set(
                    cfg.rows().map(r =>
                        String(cv(c, r))
                    )
                )
            ]
                .filter(v => !base.includes(v))
                .sort()
        ];

        items = [
            [
                'All',
                'f',
                null,
                st.f[k] == null
            ],

            ...vals.map(v => [
                v,
                'f',
                v,
                st.f[k] === v
            ])
        ];
    }

    /* ---------- Sorting Options ---------- */

    else {
        const L = SORTL[c.t];

        const cur = st.s && st.s.k === k
            ? st.s.dir
            : 0;

        items = [
            [
                L[0],
                's',
                1,
                cur === 1
            ],
            [
                L[1],
                's',
                -1,
                cur === -1
            ],
            [
                'Default order',
                's',
                0,
                !cur
            ]
        ];
    }

    /* ---------- Create Dropdown Menu ---------- */

    const m = document.createElement('div');

    m.id = 'menu';
    m.setAttribute('role', 'menu');

    m.innerHTML = items.map((it, i) => `
        <button
            role="menuitemradio"
            aria-checked="${!!it[3]}"
            data-i="${i}"
        >
            ${esc(it[0])}
        </button>
    `).join('');

    document.body.appendChild(m);

    /* ---------- Dropdown Position ---------- */

    const r = btn.getBoundingClientRect();

    m.style.top = Math.min(
        r.bottom + 4,
        innerHeight - m.offsetHeight - 8
    ) + 'px';

    m.style.left = Math.max(
        8,
        Math.min(
            r.left,
            innerWidth - m.offsetWidth - 8
        )
    ) + 'px';

    /* ---------- Dropdown Click Handler ---------- */

    m.onclick = e => {
        const b = e.target.closest('button');

        if (!b) {
            return;
        }

        const it = items[+b.dataset.i];

        if (it[1] === 'f') {
            if (it[2] == null) {
                delete st.f[k];
            } else {
                st.f[k] = it[2];
            }
        } else {
            st.s = it[2]
                ? {
                    k,
                    dir: it[2]
                }
                : null;
        }

        closeMenu();
        drawT(id);
    };

    /* ---------- Keyboard Navigation ---------- */

    m.onkeydown = e => {
        const bs = $$('button', m);

        const i = bs.indexOf(
            document.activeElement
        );

        if (e.key === 'ArrowDown') {
            e.preventDefault();

            bs[(i + 1) % bs.length].focus();
        }

        if (e.key === 'ArrowUp') {
            e.preventDefault();

            bs[
                (i - 1 + bs.length) % bs.length
            ].focus();
        }

        if (e.key === 'Escape') {
            closeMenu();
            btn.focus();
        }
    };

    /* ---------- Focus Selected Option ---------- */

    (bs =>
        bs[
            Math.max(
                0,
                items.findIndex(i => i[3])
            )
        ].focus()
    )($$('button', m));
}

/* ---------- Close Dropdown Menu ---------- */

const closeMenu = () => {
    const m = $('#menu');

    if (m) {
        m.remove();
    }
};

/* ==================================================
   MODAL COMPONENTS
   ================================================== */

/* ---------- Open Modal ---------- */

function modal(html, wide) {
    closeModal();

    const o = document.createElement('div');

    o.className = 'ov';
    o.id = 'ov';

    o.innerHTML = `
        <div
            class="md${wide ? ' w' : ''}"
            role="dialog"
            aria-modal="true"
        >
            <button
                class="x"
                data-a="cm"
                aria-label="Close"
            >
                ✕
            </button>

            ${html}
        </div>
    `;

    o.addEventListener('mousedown', e => {
        if (e.target === o) {
            closeModal();
        }
    });

    document.body.appendChild(o);

    const f = $(
        'input:not([disabled]),select,textarea',
        o
    );

    if (f) {
        f.focus();
    }
}

/* ---------- Close Modal ---------- */

const closeModal = () => {
    const o = $('#ov');

    if (o) {
        o.remove();
    }
};

/* ---------- Modal Error Message ---------- */

const merr = m => {
    const e = $('#ov .err');

    if (e) {
        e.textContent = m;
    }
};

/* ---------- Form Input Field ---------- */

const fld = (l, id, v = '', x = '') => `
    <label>
        ${l}

        <input
            id="${id}"
            value="${esc(v)}"
            ${x}
        >
    </label>
`;

/* ---------- Form Select Field ---------- */

const sel = (l, id, list, v) => {
    if (v && !list.includes(v)) {
        list = [...list, v];
    }

    return `
        <label>
            ${l}

            <select id="${id}">
                ${list.map(o => `
                    <option${o === v ? ' selected' : ''}>
                        ${esc(o)}
                    </option>
                `).join('')}
            </select>
        </label>
    `;
};

/* ---------- Modal Action Buttons ---------- */

const acts = (a, l, extra = '') => `
    <div class="err" role="alert"></div>

    <div class="acts">
        <button
            class="btn sec"
            data-a="cm"
        >
            ${extra || 'Cancel'}
        </button>

        <button
            class="btn"
            data-a="${a}"
        >
            ${l}
        </button>
    </div>
`;

/* ---------- Confirmation Modal ---------- */

const confirmM = (msg, a, v, lbl = 'Delete') =>
    modal(`
        <h2>Please confirm</h2>

        <p>${msg}</p>

        <div class="acts">
            <button
                class="btn sec"
                data-a="cm"
            >
                Cancel
            </button>

            <button
                class="btn dng"
                data-a="${a}"
                data-v="${v}"
            >
                ${lbl}
            </button>
        </div>
    `);

/* ---------- Form Value Helper ---------- */

const val = id =>
    ($('#ov #' + id) || { value: '' })
        .value
        .trim();

/* ---------- Key-Value Display ---------- */

const kv = a =>
    a.map(([k, v]) => `
        <div class="kv">
            <span>${k}</span>
            <b>${v}</b>
        </div>
    `).join('');

/* ==================================================
   TABLE COLUMN CONFIGURATIONS
   ================================================== */

/* ---------- Service Request Columns ---------- */

const reqCols = adm => [
    {
        k: 'id',
        l: 'Request ID',
        t: 'none'
    },

    ...(
        adm
            ? [
                {
                    k: 'who',
                    l: 'Requester',
                    t: 'none',
                    v: reqWho
                },
                {
                    k: 'role',
                    l: 'Role',
                    t: 'cat'
                }
            ]
            : []
    ),

    {
        k: 'type',
        l: adm ? 'Request type' : 'Request type',
        t: 'cat'
    },
    {
        k: 'date',
        l: adm ? 'Date' : 'Date submitted',
        t: 'date'
    },
    {
        k: 'st',
        l: 'Status',
        t: 'cat',
        f: r => sx(r.st)
    },

    ...(
        adm
            ? [
                {
                    k: 'upd',
                    l: 'Update',
                    t: 'none',
                    v: r => r.st,
                    f: r => `
                        <span class="st">
                            <select
                                data-st="${r.id}"
                                aria-label="Update status of ${r.id}"
                            >
                                ${[
                                    'Pending',
                                    'In progress',
                                    'Resolved',
                                    'Rejected'
                                ].map(s => `
                                    <option${s === r.st ? ' selected' : ''}>
                                        ${s}
                                    </option>
                                `).join('')}
                            </select>
                        </span>
                    `
                }
            ]
            : []
    )
];

/* ---------- Service Request Table Configuration ---------- */

const reqCfg = adm => ({
    cols: reqCols(adm),

    rows: () =>
        adm ? DB.reqs : myReqs(),

    row: r =>
        `data-a="rq" data-v="${r.id}"`,

    empty: 'No service requests yet.'
});

/* ---------- Action Column ---------- */

const actCol = (a, x = '') => ({
    k: 'act',
    l: 'Action',
    t: 'none',
    nw: 1,
    v: () => '',

    f: r => `
        <button
            class="act"
            data-a="${a}v"
            data-v="${r.id ?? r.no}"
        >
            View
        </button>

        ·

        <button
            class="act"
            data-a="${a}e"
            data-v="${r.id ?? r.no}"
        >
            Edit
        </button>

        ${x ? `
            ·

            <button
                class="act"
                data-a="${a}d"
                data-v="${r.id}"
            >
                Delete
            </button>
        ` : ''}
    `
});

/* ==================================================
   REUSABLE UI COMPONENTS
   ================================================== */

/* ---------- Search Field ---------- */

const search = (ids, ph) => `
    <input
        class="search"
        data-q="${ids}"
        placeholder="${ph}"
        aria-label="${ph}"
    >
`;

/* ---------- Page Header ---------- */

const hd = (t, a = '') => `
    <div class="top">
        <h1>${t}</h1>
        ${a}
    </div>
`;

/* ---------- Primary Button ---------- */

const bt = (l, a) => `
    <button
        class="btn"
        data-a="${a}"
    >
        ${l}
    </button>
`;

/* ---------- Announcement List Item ---------- */

const annLine = (a, u) => `
    <button
        class="rw"
        data-a="av"
        data-v="${a.id}"
    >
        <small>
            ${esc(a.o)} · ${esc(a.d)}
        </small>

        <b>${esc(a.t)}</b>
    </button>
`;

/* ---------- Profile Avatar ---------- */

const avatar = u => `
    <div class="av">
        ${u.photo
            ? `<img src="${u.photo}" alt="Profile photo">`
            : initials(u.name)
        }
    </div>
`;

/* ---------- Profile Photo Controls ---------- */

const photoCtl = u => `
    <div class="pc">
        <input
            type="file"
            id="photo"
            accept="image/*"
            hidden
        >

        <button
            class="btn sec sm"
            data-a="phk"
        >
            ${u.photo ? 'Change photo' : 'Upload photo'}
        </button>

        ${u.photo ? `
            <button
                class="btn sec sm"
                data-a="phr"
            >
                Remove
            </button>
        ` : ''}
    </div>
`;

/* ---------- Profile Photo Upload ---------- */

function setPhoto(f) {
    if (!/^image\//.test(f.type)) {
        return toast('Please choose an image file');
    }

    if (f.size > 8e6) {
        return toast('Image must be under 8 MB');
    }

    const r = new FileReader();

    r.onload = () => {
        const i = new Image();

        i.onload = () => {
            const m = Math.min(
                i.width,
                i.height
            );

            const c = document.createElement('canvas');

            c.width = c.height = 256;

            c.getContext('2d').drawImage(
                i,
                (i.width - m) / 2,
                (i.height - m) / 2,
                m,
                m,
                0,
                0,
                256,
                256
            );

            U().photo = c.toDataURL(
                'image/jpeg',
                .85
            );

            save();
            render();

            toast('Profile photo updated');
        };

        i.onerror = () =>
            toast('Could not read that image');

        i.src = r.result;
    };

    r.readAsDataURL(f);
}

/* ---------- Profile Initials ---------- */

const initials = n =>
    n.replace(/^Prof\.\s*/, '')
        .split(' ')
        .filter(Boolean)
        .map(w => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
