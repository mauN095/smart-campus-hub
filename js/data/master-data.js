
/* Master data: rooms, sections, subjects, schedules, workload, form helpers */
'use strict';

/* ---------- data ---------- */

/* ---------- master data: subjects, rooms, sections, schedules (seed for System Maintenance) ---------- */

const ROOMS = [
    'Rm1', 'Rm2', 'Rm3', 'Rm4', 'Rm5',
    'Lab 1', 'Lab 2', 'Lab 3',
    'C-105', 'C-201', 'C-210', 'C-302', 'C-304',
    'B-102', 'Hub 4'
];

const SECP = {
    BSIS: 'BS Information Systems',
    BSIT: 'BS Information Technology',
    BSCS: 'BS Computer Science',
    BSA: 'BS Accountancy',
    BSBA: 'BS Business Administration',
    BSED: 'BS Education'
};

const SECTS = ['BSIS', 'BSIT', 'BSCS', 'BSA', 'BSBA', 'BSED']
    .flatMap(p =>
        [1, 2, 3, 4].flatMap(y =>
            ['A', 'B'].map(x => p + ' ' + y + x)
        )
    );

const CAT = [
    /* [code, title, units, department] */

    ['IS 310', 'Project Management', 3, 'Business'],
    ['MGT 101', 'Principles of Management', 3, 'Business'],
    ['ACC 101', 'Fundamentals of Accounting', 3, 'Business'],
    ['MKT 101', 'Principles of Marketing', 3, 'Business'],
    ['BUS 201', 'Business Law', 3, 'Business'],
    ['ECO 101', 'Microeconomics', 3, 'Business'],

    ['CAP 401', 'Capstone Advising', 6, 'Computing'],
    ['CS 201', 'Data Structures', 3, 'Computing'],
    ['CS 301', 'Design and Analysis of Algorithms', 3, 'Computing'],
    ['IS 220', 'Systems Analysis & Design', 3, 'Computing'],
    ['IT 201', 'Web Development', 3, 'Computing'],
    ['IT 305', 'Database Systems', 3, 'Computing'],
    ['IT 310', 'Computer Networks', 3, 'Computing'],
    ['IT327', 'Application Development and Emerging Technologies', 3, 'Computing'],
    ['ITNDS306', 'Enterprise Network Security & Automation', 3, 'Computing'],
    ['IT227L', 'Information and Assurance Security 1 LAB', 1, 'Computing'],
    ['IT227', 'Information and Assurance Security 1 LEC', 2, 'Computing'],
    ['IT365', 'Design Thinking (UX/UI)', 3, 'Computing'],

    ['EDU 101', 'Foundations of Education', 3, 'Education'],
    ['EDU 210', 'Assessment of Learning', 3, 'Education'],
    ['EDU 220', 'Curriculum Development', 3, 'Education'],
    ['EDU 230', 'Educational Technology', 3, 'Education'],
    ['EDU 301', 'Classroom Management', 3, 'Education'],
    ['HIS 101', 'Philippine History', 3, 'Education']
];

const SLOTS = [
    ...['M/W', 'T/Th'].flatMap(d =>
        [
            '08:00–09:30',
            '09:00–10:30',
            '10:30–12:00',
            '11:00–12:30',
            '13:00–14:30',
            '14:00–15:30',
            '15:00–16:30'
        ].map(t => d + ' ' + t)
    ),
    'Fri 09:00–12:00',
    'Fri 13:00–16:00'
];

const EXPL = {
    IT327: [
        'M/Th 09:00–10:00',
        'T/F 09:00–10:00'
    ],

    ITNDS306: [
        'M/Th 11:00–12:00',
        'T/F 11:00–12:00'
    ],

    IT227L: [
        'Thu 14:00–17:00',
        'Fri 14:00–17:00'
    ],

    IT227: [
        'Fri 09:00–10:00',
        'Wed 09:00–10:00'
    ],

    IT365: [
        'Fri 11:00–12:00',
        'Wed 11:00–12:00'
    ]
};

const offered = code => {
    const used = WL_ROWS
        .filter(r => r[1] === code)
        .map(r => r[3]);

    if (EXPL[code]) {
        return [...new Set([...EXPL[code], ...used])];
    }

    const i = CAT.findIndex(c => c[0] === code);

    return [
        ...new Set([
            ...used,
            ...[0, 5, 9].map(d => SLOTS[(i * 3 + d) % SLOTS.length])
        ])
    ];
};

/* schedule helpers: "M/W 09:00–10:30" -> days + minutes; used for conflict and room-availability checks */

const parseS = x => {
    const m = String(x).match(
        /^([A-Za-z/]+)\s+(\d{1,2}):(\d{2})\s*[–-]\s*(\d{1,2}):(\d{2})/
    );

    if (!m) return null;

    const D = {
        Mon: 'M',
        Tue: 'T',
        Wed: 'W',
        Thu: 'Th',
        Fri: 'F',
        Sat: 'S'
    };

    return {
        d: m[1].split('/').map(y => D[y] || y),
        a: +m[2] * 60 + +m[3],
        b: +m[4] * 60 + +m[5]
    };
};

const ovl = (x, y) => {
    const a = parseS(x);
    const b = parseS(y);

    if (!a || !b) return x === y;

    return a.d.some(d => b.d.includes(d)) &&
        a.a < b.b &&
        b.a < a.b;
};

const allSubs = d =>
    d.stu.flatMap(x =>
        x.enr.flatMap(e => e.subs || [])
    );

const CURT = {
    ay: '2026–2027',
    sem: '1st Semester'
};

const tkey = x => x.ay + ' · ' + x.sem;

const splitT = k => {
    const [ay, sem] = String(k).split(' · ');

    return {ay, sem};
};

const facTerms = no => {
    const key = k => {
        const t = splitT(k);

        return parseInt(t.ay) * 10 + OPT.terms.indexOf(t.sem);
    };

    return [
        ...new Set([
            tkey(CURT),
            ...DB.wl.filter(w => w.no === no).map(tkey)
        ])
    ].sort((a, b) => key(b) - key(a));
};

const schRecs = d => [
    ...d.wl,
    ...allSubs(d)
];

/* ---------- seed workload: one explicit table. Every class has one faculty, one section, one schedule and one room.
   Full-time faculty carry up to 24 approved units and part-time faculty up to 12. No faculty, room or student has two classes at the same time. ---------- */

const WL_ROWS = [
    /* [faculty no., subject code, section, schedule, room, status, academic year, term] (term defaults to the current one) */

    ['F-0012', 'IS 220', 'BSIS 2A', 'M/W 09:00–10:30', 'C-304', 'Approved'],
    ['F-0012', 'IS 220', 'BSIS 2B', 'T/Th 10:30–12:00', 'C-302', 'Approved'],
    ['F-0012', 'IT 201', 'BSCS 2A', 'M/W 11:00–12:30', 'Lab 2', 'Approved'],
    ['F-0012', 'IS 310', 'BSIS 3A', 'T/Th 09:00–10:30', 'C-210', 'Approved'],
    ['F-0012', 'CAP 401', 'BSIT 4A', 'Fri 13:00–16:00', 'Hub 4', 'Approved'],
    ['F-0012', 'IT227L', 'BSIT 2A', 'Thu 14:00–17:00', 'Lab 1', 'Approved'],
    ['F-0012', 'IT227', 'BSIT 2A', 'Fri 09:00–10:00', 'Rm3', 'Approved'],
    ['F-0012', 'IT365', 'BSIT 2A', 'Fri 11:00–12:00', 'Rm1', 'Approved'],

    ['F-0034', 'IT327', 'BSIT 2A', 'M/Th 09:00–10:00', 'Rm5', 'Approved'],
    ['F-0034', 'ITNDS306', 'BSIT 2A', 'M/Th 11:00–12:00', 'Rm5', 'Approved'],
    ['F-0034', 'CS 201', 'BSCS 2A', 'M/W 13:00–14:30', 'Lab 1', 'Approved'],
    ['F-0034', 'CS 301', 'BSCS 3A', 'T/Th 13:00–14:30', 'Lab 3', 'Approved'],
    ['F-0034', 'IT 305', 'BSIT 3A', 'T/Th 15:00–16:30', 'Lab 3', 'Pending'],

    ['F-0047', 'ACC 101', 'BSA 1A', 'M/W 08:00–09:30', 'B-102', 'Approved'],
    ['F-0047', 'ECO 101', 'BSA 1A', 'M/W 10:30–12:00', 'B-102', 'Approved'],
    ['F-0047', 'MGT 101', 'BSA 1A', 'T/Th 13:00–14:30', 'B-102', 'Approved'],
    ['F-0047', 'BUS 201', 'BSBA 3A', 'T/Th 09:00–10:30', 'B-102', 'Approved'],
    ['F-0047', 'ECO 101', 'BSBA 3A', 'T/Th 10:30–12:00', 'B-102', 'Approved'],
    ['F-0047', 'MKT 101', 'BSBA 3A', 'M/W 13:00–14:30', 'B-102', 'Approved'],
    ['F-0047', 'BUS 201', 'BSCS 3A', 'M/W 15:00–16:30', 'B-102', 'Approved'],
    ['F-0047', 'ECO 101', 'BSCS 3A', 'T/Th 15:00–16:30', 'B-102', 'Approved'],

    ['F-0051', 'EDU 210', 'BSED 2A', 'M/W 15:00–16:30', 'C-201', 'Pending'],
    ['F-0051', 'EDU 220', 'BSED 2A', 'M/W 09:00–10:30', 'C-105', 'Approved'],
    ['F-0051', 'EDU 230', 'BSED 2A', 'M/W 11:00–12:30', 'C-105', 'Approved'],
    ['F-0051', 'EDU 301', 'BSED 2A', 'M/W 13:00–14:30', 'C-105', 'Approved'],
    ['F-0051', 'HIS 101', 'BSED 2A', 'T/Th 13:00–14:30', 'C-105', 'Approved'],
    ['F-0051', 'HIS 101', 'BSA 1A', 'T/Th 09:00–10:30', 'C-201', 'Approved'],
    ['F-0051', 'HIS 101', 'BSIT 1A', 'T/Th 10:30–12:00', 'C-105', 'Approved'],
    ['F-0051', 'HIS 101', 'BSCS 2A', 'T/Th 15:00–16:30', 'C-105', 'Approved'],
    ['F-0051', 'EDU 101', 'BSED 1A', 'Fri 09:00–12:00', 'C-201', 'Approved'],

    ['F-0012', 'IT 201', 'BSIT 1A', 'M/W 09:00–10:30', 'Lab 1', 'Approved', '2025–2026', '2nd Semester'],
    ['F-0012', 'IS 220', 'BSIS 2A', 'T/Th 10:30–12:00', 'C-304', 'Approved', '2025–2026', '2nd Semester'],
    ['F-0012', 'CAP 401', 'BSIT 4A', 'Fri 13:00–16:00', 'Hub 4', 'Approved', '2025–2026', '2nd Semester']
];

const mkWl = () =>
    WL_ROWS.map((a, i) => {
        const c = CAT.find(x => x[0] === a[1]);

        return {
            id: i + 1,
            no: a[0],
            code: c[0],
            title: c[1],
            dept: c[3],
            units: c[2],
            sched: a[3],
            st: a[5],
            sec: a[2],
            room: a[4],
            ay: a[6] || '2026–2027',
            sem: a[7] || '1st Semester'
        };
    });

/* form helpers: dropdowns that depend on System Maintenance */

let FSELF = null;

const FM = {
    u: {
        t: 'u3',
        c: 'u1',
        n: 'u2',
        s: 'u4',
        r: 'u5'
    },

    w: {
        t: 'w3',
        c: 'w2',
        n: 'w4',
        s: 'w5',
        r: 'w9',
        d: 'w6',
        x: 'w8',
        ay: 'w10',
        sm: 'w11'
    }
};

const opts = (list, v, ph) => {
    list = [...list];

    if (v && !list.includes(v)) {
        list.push(v);
    }

    return `<option value="">${esc(ph)}</option>` +
        list.map(o =>
            `<option${o === v ? ' selected' : ''}>${esc(o)}</option>`
        ).join('');
};

const selx = (l, id, list, v, ph, dis) =>
    `<label>${l}<select id="${id}"${dis ? ' disabled' : ''}>${opts(list, v, ph)}</select></label>`;

const schedFor = t =>
    DB.mt.sched
        .filter(x => x.on && x.subj === t)
        .map(x => x.n);

const occ = t => {
    const T = t && t.ay && t.sem;

    return [
        ...DB.wl.filter(w =>
            w.st !== 'Rejected' &&
            w.st !== 'Cancelled' &&
            (!T || (w.ay === t.ay && w.sem === t.sem))
        ),

        ...(T
            ? DB.stu.flatMap(x =>
                x.enr
                    .filter(e => e.ay === t.ay && e.sem === t.sem)
                    .flatMap(e => e.subs || [])
            )
            : allSubs(DB))
    ];
};

/* rooms with no other class overlapping the chosen schedule (same class = same subject + same schedule can share a room) */

const roomsFree = (title, sched, sec, self, term) => {
    const busy = new Set(
        occ(term)
            .filter(x =>
                x !== self &&
                ovl(x.sched, sched) &&
                !(
                    x.title === title &&
                    x.sched === sched &&
                    (!x.sec || !sec || x.sec === sec)
                )
            )
            .map(x => x.room)
    );

    return mtA('room').filter(r => !busy.has(r));
};

function depSel(id) {
    const g = k => $('#ov #' + k);

    if (id === 'e1') {
        const ay = g('e1').value;

        const have = curS().enr
            .filter(x => x.ay === ay)
            .map(x => x.sem);

        const l = ay
            ? OPT.terms.filter(t => !have.includes(t))
            : [];

        g('e2').innerHTML = opts(
            l,
            '',
            ay
                ? (l.length ? 'Select academic term' : 'All terms already added')
                : 'Select academic year first'
        );

        g('e2').disabled = !l.length;

        return;
    }

    const f = FM[id[0]];

    if (!f || ![f.t, f.s, f.x, f.ay, f.sm].includes(id) || !g(f.t)) {
        return;
    }

    if (id === f.ay) {
        const a = g(f.ay).value;

        g(f.sm).innerHTML = opts(
            a ? OPT.terms : [],
            '',
            a ? 'Select academic term' : 'Select academic year first'
        );

        g(f.sm).disabled = !a;
    }

    const S = g(f.s);
    const R = g(f.r);
    const sj = DB.mt.subj.find(x => x.n === g(f.t).value);

    if (id === f.t) {
        g(f.c).value = sj ? sj.code : '';
        g(f.n).value = sj ? sj.units : '';

        if (
            f.d &&
            sj &&
            [...g(f.d).options].some(o => o.value === sj.dept)
        ) {
            g(f.d).value = sj.dept;
        }

        const sc = sj ? schedFor(sj.n) : [];

        S.innerHTML = opts(
            sc,
            '',
            sj
                ? (sc.length ? 'Select schedule' : 'No schedules available')
                : 'Select a subject first'
        );

        S.disabled = !sc.length;
    }

    const prev = R.value;

    const rs = sj && S.value
        ? roomsFree(
            sj.n,
            S.value,
            f.x ? g(f.x).value : '',
            FSELF,
            f.ay
                ? {ay: g(f.ay).value, sem: g(f.sm).value}
                : curE()
        )
        : [];

    R.innerHTML = opts(
        rs,
        '',
        S.value
            ? (rs.length ? 'Select room' : 'No rooms available')
            : 'Select a schedule first'
    );

    R.disabled = !rs.length;

    if (rs.includes(prev)) {
        R.value = prev;
    }
}

const LS = 'sch.v5';

const em = n =>
    n.replace(/^Prof\.\s*/, '')
        .toLowerCase()
        .split(' ')
        .filter(w => !/^[a-z]\.$/.test(w))
        .join('.') + '@campus.edu';

const ph = i =>
    '+63 9' + (17 + i % 8) + ' 555 ' +
    String(1000 + i * 137 % 9000);

const enrRef = (date, id) =>
    'ENR-' +
    new Date(pd(date) || Date.now()).getFullYear() +
    '-' +
    String(id).replace(/\D/g, '').slice(-6);

const mkEnr = (st, yr, id) => {
    const on = st !== 'Pending' && st !== 'Inactive';
    const d = on ? fd(new Date()) : '';

    return [
        {
            term: '2026–2027 · 1st Semester',
            ay: '2026–2027',
            sem: '1st Semester',
            st: st === 'Pending'
                ? 'Pending'
                : st === 'Inactive'
                    ? 'Not Enrolled'
                    : 'Enrolled',
            units: 0,
            date: d,
            ref: on ? enrRef(d, id) : '',
            yl: yr,
            subs: []
        },
        {
            term: '2026–2027 · 2nd Semester',
            ay: '2026–2027',
            sem: '2nd Semester',
            st: 'Not Enrolled',
            subs: []
        }
    ];
};
