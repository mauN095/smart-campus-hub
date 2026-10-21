
/* System Maintenance data, session state, nav, lookups */
'use strict';

/* ---------- maintenance data (master lists used by student, faculty, request and announcement records) ---------- */

const MT_SEED = () => ({
    prog: [
        'BS Information Systems',
        'BS Computer Science',
        'BS Information Technology',
        'BS Accountancy',
        'BS Business Administration',
        'BS Education'
    ].map((n, i) => ({
        id: i + 1,
        n,
        on: 1
    })),

    dept: [
        ['Business', 'College of Business'],
        ['Computing', 'College of Computing Studies'],
        ['Education', 'College of Education']
    ].map((a, i) => ({
        id: i + 1,
        n: a[0],
        full: a[1],
        on: 1
    })),

    cat: [
        'Academic',
        'Events',
        'Services'
    ].map((n, i) => ({
        id: i + 1,
        n,
        on: 1
    })),

    req: [
        ['Academic Records', 'Student'],
        ['Enrollment and Subjects', 'Student'],
        ['Student Information', 'Student'],
        ['Class and Schedule', 'Faculty'],
        ['Faculty Information', 'Faculty'],
        ['Student Records', 'Faculty'],
        ['Account and Access', 'Both'],
        ['Technical and Facilities', 'Both']
    ].map((a, i) => ({
        id: i + 1,
        n: a[0],
        for: a[1],
        on: 1
    })),

    room: ROOMS.map((n, i) => ({
        id: i + 1,
        n,
        on: 1
    })),

    sect: SECTS.map((n, i) => ({
        id: i + 1,
        n,
        prog: SECP[n.split(' ')[0]],
        on: 1
    })),

    subj: CAT.map((c, i) => ({
        id: i + 1,
        n: c[1],
        code: c[0],
        units: c[2],
        dept: c[3],
        on: 1
    })),

    sched: CAT.flatMap(c =>
        offered(c[0]).map(x => ({
            subj: c[1],
            n: x,
            on: 1
        }))
    ).map((x, i) => ({
        id: i + 1,
        ...x
    }))
});

/*  MTK: list -> [records that store the value, field name]. 
    Used for rename cascade, in-use counts and sync. */

const MTK = {
    prog: [
        d => [...d.stu, ...(d.mt ? d.mt.sect : [])],
        'prog'
    ],

    dept: [
        d => [...d.fac, ...d.wl, ...(d.mt ? d.mt.subj : [])],
        'dept'
    ],

    cat: [d => d.anns, 'cat'],
    req: [d => d.reqs, 'type'],
    room: [schRecs, 'room'],
    sect: [d => d.wl, 'sec'],
    subj: [schRecs, 'title']
};

const mtSync = d => {
    const m = d.mt = d.mt || MT_SEED();
    const s0 = MT_SEED();

    Object.keys(s0).forEach(k => {
        if (!m[k]) m[k] = s0[k];
    });

    Object.keys(MTK).forEach(k => {
        const f = MTK[k][1];

        MTK[k][0](d).forEach(x => {
            const v = x[f];

            if (v && !m[k].some(i => i.n === v)) {
                m[k].push({
                    id: Math.max(0, ...m[k].map(i => i.id)) + 1,
                    n: v,
                    on: 1,
                    ...(k === 'dept' ? {full: v} : {}),
                    ...(k === 'req' ? {for: 'Both'} : {}),
                    ...(k === 'subj' ? {
                        code: x.code || '',
                        units: x.units || 3,
                        dept: x.dept || ''
                    } : {})
                });
            }
        });
    });

    d.wl.forEach(w => {
        if (!w.ay) {
            w.ay = CURT.ay;
            w.sem = CURT.sem;
        }
    });

    m.sect.forEach(x => {
        if (!x.prog) {
            x.prog = SECP[x.n.split(' ')[0]] || mtA('prog')[0] || '';
        }
    });

    schRecs(d).forEach(x => {
        if (
            x.title &&
            x.sched &&
            !m.sched.some(y => y.subj === x.title && y.n === x.sched)
        ) {
            m.sched.push({
                id: Math.max(0, ...m.sched.map(y => y.id)) + 1,
                subj: x.title,
                n: x.sched,
                on: 1
            });
        }
    });

    return d;
};

const load = () => mtSync(load0());

const mtUse = (k, n, it) =>
    k === 'sched'
        ? (it
            ? schRecs(DB).filter(x => x.title === it.subj && x.sched === n).length
            : 0)
        : MTK[k][0](DB).filter(x => x[MTK[k][1]] === n).length;

const mtAll = k => DB.mt[k].map(x => x.n);

const mtA = k => DB.mt[k].filter(x => x.on).map(x => x.n);

const mtD = (k, p) =>
    mtA(k).includes(p) ? p : mtA(k)[0];

const mtReq = r =>
    DB.mt.req
        .filter(x => x.on && (x.for === 'Both' || x.for === r))
        .map(x => x.n);

const mtPills = () =>
    DB.mt.cat
        .filter(x => x.on || mtUse('cat', x.n))
        .map(x => x.n);

const mtOk = k =>
    k === 'req'
        ? ['Student', 'Faculty'].every(r => mtReq(r).length)
        : k === 'sched'
            ? true
            : mtA(k).length > 0;

let role = null,
    uid = null,
    page = 'dash',
    sub = null,
    view = 'login',
    folder = 'All',
    term = 0;

try {
    const r = sessionStorage.getItem('sch.role');

    if (r) role = r;

    uid = sessionStorage.getItem('sch.uid');
} catch (e) { }

const NAMES = {
    student: 'Student',
    faculty: 'Faculty',
    admin: 'Admin'
};

const NAV = {
    student: [
        ['dash', 'Dashboard', 'dash'],
        ['prof', 'My Profile', 'user'],
        ['enr', 'Enrollment Status', 'cap'],
        ['ann', 'Announcements', 'mega'],
        ['req', 'Service Requests', 'card']
    ],

    faculty: [
        ['dash', 'Dashboard', 'dash'],
        ['prof', 'My Profile', 'user'],
        ['load', 'Faculty Workload', 'clock'],
        ['ann', 'Announcements', 'mega'],
        ['req', 'Service Requests', 'card']
    ],

    admin: [
        ['dash', 'Dashboard', 'dash'],
        ['stu', 'Student Management', 'users'],
        ['fac', 'Faculty & Workload', 'clock'],
        ['ann', 'Announcements', 'mega'],
        ['req', 'Service Requests', 'card'],
        ['rep', 'Reports', 'file'],
        ['mt', 'Maintenance', 'sliders']
    ]
};

const SC = {
    Enrolled: 'g',
    Active: 'g',
    Resolved: 'g',
    Published: 'g',
    Final: 'g',
    Approved: 'g',
    Pending: 'y',
    'On leave': 'y',
    Inactive: 'n',
    Cancelled: 'n',
    'Not Enrolled': 'y',
    'In progress': 'b',
    Irregular: 'b',
    Scheduled: 'b',
    'In review': 'b',
    Rejected: 'r',
    Draft: 'n',
    Archived: 'n'
};

const sx = s =>
    `<span class="s-${SC[s] || 'b'}">${esc(s)}</span>`;

const pill = s =>
    `<span class="p ${SC[s] || 'b'}">${esc(s)}</span>`;

const emailOk = e =>
    /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e);

const phoneOk = p =>
    /^(\+63|0)9\d{9}$/.test(p.replace(/[\s-]/g, ''));

const pwOk = p =>
    p.length >= 8 &&
    /[A-Z]/.test(p) &&
    /[a-z]/.test(p) &&
    /\d/.test(p);

const U = () =>
    role === 'admin'
        ? DB.me.admin
        : role === 'student'
            ? DB.stu.find(x => x.id === uid)
            : DB.fac.find(x => x.no === uid);

const myReqs = () =>
    DB.reqs.filter(r => r.uid === uid);

const reqWho = r =>
    (
        (DB.stu.find(x => x.id === r.uid) ||
         DB.fac.find(x => x.no === r.uid)) ||
        {name: r.who}
    ).name;

const rdl = () =>
    DB.read[uid] || (DB.read[uid] = []);

const DEPTF = d =>
    ((DB.mt.dept.find(x => x.n === d) || {}).full) || d;

const mono = t =>
    `<span style="font-family:ui-monospace,Menlo,Consolas,monospace;word-break:break-all">${esc(t)}</span>`;

const accts = () => [
    ...DB.stu.map(x => ({
        u: x.email,
        p: x.pw,
        r: 'student',
        id: x.id,
        st: x.st
    })),

    ...DB.fac.map(x => ({
        u: x.email,
        p: x.pw,
        r: 'faculty',
        id: x.no,
        st: x.st
    })),

    ...DB.acc.map(a => ({
        u: a.u,
        p: a.p,
        r: a.r,
        id: 'A-001',
        st: 'Active'
    }))
];

const emailTaken = (e, self) =>
    DB.stu.some(x => x.id !== self && x.email.toLowerCase() === e) ||
    DB.fac.some(x => x.no !== self && x.email.toLowerCase() === e) ||
    DB.acc.some(a => self !== 'A-001' && a.u.toLowerCase() === e);

const sessOk = () =>
    role === 'admin' ||
    (role === 'student' &&
        DB.stu.some(x => x.id === uid && x.st !== 'Inactive')) ||
    (role === 'faculty' &&
        DB.fac.some(x => x.no === uid && x.st !== 'Inactive'));

const reid = (o, n) => {
    DB.reqs.forEach(r => {
        if (r.uid === o) r.uid = n;
    });

    if (DB.read[o]) {
        DB.read[n] = DB.read[o];
        delete DB.read[o];
    }

    if (uid === o) {
        uid = n;

        try {
            sessionStorage.setItem('sch.uid', n);
        } catch (e) { }
    }
};

const sumU = e => {
    e.units = (e.subs || []).reduce((a, x) => a + x.units, 0);
};

const curS = () =>
    DB.stu.find(x => x.id === sub.sd);

const curE = () =>
    curS().enr[sub.t || 0];

const curF = () =>
    DB.fac.find(x => x.no === sub.fd);

const visAnn = () =>
    DB.anns.filter(a =>
        a.st === 'Published' &&
        (
            a.aud === 'Everyone' ||
            a.aud === (role === 'student' ? 'Students' : 'Faculty')
        )
    );

const fUnits = (no, t = CURT) =>
    DB.wl
        .filter(w =>
            w.no === no &&
            w.ay === t.ay &&
            w.sem === t.sem &&
            w.st === 'Approved'
        )
        .reduce((a, w) => a + w.units, 0);

/* live System Maintenance lookups used to render subject/schedule/room columns 
    so they always reflect the current master data, 
    not just a stale copy saved on the record */

const mtSubjLive = title =>
    DB.mt.subj.find(x => x.n === title);

const mtRoomLive = n =>
    DB.mt.room.find(x => x.n === n);

const mtSchedLive = (title, n) =>
    DB.mt.sched.find(x => x.subj === title && x.n === n);

const unavail = ok =>
    ok ? '' : ' <span class="mu" style="font-size:11px">(unavailable)</span>';

const toast = m => {
    const t = $('#toast');

    t.textContent = m;
    t.classList.add('on');

    clearTimeout(toast.t);

    toast.t = setTimeout(() => t.classList.remove('on'), 2600);
};
