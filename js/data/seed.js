
/* Seed data: people, requests, announcements, reports + load/save */
'use strict';

/* ---------- seed people: each student's subjects are copied from real, approved workload rows ---------- */

const FAC_SEED = [
    [
        'Prof. Elena Cruz',
        'F-0012',
        'Computing',
        'Associate Professor',
        'Full-time Faculty',
        '+63 923 456 7890'
    ],
    [
        'Prof. Marco Lee',
        'F-0034',
        'Computing',
        'Assistant Professor',
        'Part-time Faculty',
        ph(22)
    ],
    [
        'Prof. Priya Shah',
        'F-0047',
        'Business',
        'Professor',
        'Full-time Faculty',
        ph(23)
    ],
    [
        'Prof. Ana Reyes',
        'F-0051',
        'Education',
        'Instructor',
        'Full-time Faculty',
        ph(20)
    ]
];

const mkFac = () =>
    FAC_SEED.map(a => ({
        name: a[0],
        no: a[1],
        dept: a[2],
        rank: a[3],
        pos: a[4],
        st: 'Active',
        email: em(a[0]),
        pw: 'Faculty@123',
        phone: a[5]
    }));

const STU_SEED = [
    /* name, ID, program, year level, status, classes taken this term [subject code, section], registration date, enrollment ref, phone, email */

    [
        'Maya Lim Santos',
        '2023-01482',
        'BS Information Technology',
        '2nd Year',
        'Enrolled',
        [
            ['IT327', 'BSIT 2A'],
            ['ITNDS306', 'BSIT 2A'],
            ['IT227L', 'BSIT 2A'],
            ['IT227', 'BSIT 2A'],
            ['IT365', 'BSIT 2A']
        ],
        '10 Aug 2026',
        'ENR-2026-018492',
        '+63 917 555 0184',
        'maya.santos@campus.edu'
    ],
    [
        'Paolo R. Garcia',
        '2022-00817',
        'BS Computer Science',
        '3rd Year',
        'Enrolled',
        [
            ['CS 301', 'BSCS 3A'],
            ['BUS 201', 'BSCS 3A'],
            ['ECO 101', 'BSCS 3A']
        ],
        '03 Aug 2026',
        'ENR-2026-018211',
        ph(1)
    ],
    [
        'Aisha M. Khan',
        '2024-02106',
        'BS Information Technology',
        '1st Year',
        'Pending',
        [],
        '',
        '',
        ph(2)
    ],
    [
        'Luis A. Reyes',
        '2021-00342',
        'BS Information Systems',
        '4th Year',
        'Irregular',
        [
            ['IS 220', 'BSIS 2A'],
            ['IS 310', 'BSIS 3A']
        ],
        '12 Sep 2026',
        'ENR-2026-019208',
        ph(3)
    ],
    [
        'Nicole T. Lim',
        '2023-01779',
        'BS Computer Science',
        '2nd Year',
        'Enrolled',
        [
            ['CS 201', 'BSCS 2A'],
            ['IT 201', 'BSCS 2A'],
            ['HIS 101', 'BSCS 2A']
        ],
        '04 Aug 2026',
        'ENR-2026-018263',
        ph(4)
    ],
    [
        'Carlo J. Ramos',
        '2023-00512',
        'BS Computer Science',
        '3rd Year',
        'Enrolled',
        [
            ['CS 301', 'BSCS 3A'],
            ['BUS 201', 'BSCS 3A'],
            ['ECO 101', 'BSCS 3A']
        ],
        '05 Aug 2026',
        'ENR-2026-018304',
        ph(5)
    ],
    [
        'Bianca N. Tan',
        '2024-01955',
        'BS Accountancy',
        '1st Year',
        'Enrolled',
        [
            ['ACC 101', 'BSA 1A'],
            ['MGT 101', 'BSA 1A'],
            ['ECO 101', 'BSA 1A'],
            ['HIS 101', 'BSA 1A']
        ],
        '10 Aug 2026',
        'ENR-2026-018470',
        ph(6)
    ],
    [
        'Jerome V. Cruz',
        '2022-00634',
        'BS Business Administration',
        '3rd Year',
        'Enrolled',
        [
            ['BUS 201', 'BSBA 3A'],
            ['ECO 101', 'BSBA 3A'],
            ['MKT 101', 'BSBA 3A']
        ],
        '06 Aug 2026',
        'ENR-2026-018355',
        ph(7)
    ],
    [
        'Hannah P. Dizon',
        '2023-01120',
        'BS Education',
        '2nd Year',
        'Enrolled',
        [
            ['EDU 220', 'BSED 2A'],
            ['EDU 230', 'BSED 2A'],
            ['EDU 301', 'BSED 2A'],
            ['HIS 101', 'BSED 2A']
        ],
        '07 Aug 2026',
        'ENR-2026-018402',
        ph(8)
    ],
    [
        'Rafael D. Mendoza',
        '2021-00288',
        'BS Accountancy',
        '4th Year',
        'Irregular',
        [
            ['ACC 101', 'BSA 1A'],
            ['MGT 101', 'BSA 1A'],
            ['BUS 201', 'BSBA 3A']
        ],
        '11 Aug 2026',
        'ENR-2026-018531',
        ph(9)
    ]
];

const mkStu = wl => {
    const prevYr = {
        '2nd Year': '1st Year',
        '3rd Year': '2nd Year',
        '4th Year': '3rd Year'
    };

    return STU_SEED.map((a, i) => {
        const [name, id, prog, yr, st, cls, date, ref, phone, mail] = a;
        const on = st !== 'Pending';

        const subs = cls.map((c, k) => {
            const w = wl.find(x =>
                x.ay === CURT.ay &&
                x.sem === CURT.sem &&
                x.st === 'Approved' &&
                x.code === c[0] &&
                x.sec === c[1]
            );

            if (!w) {
                throw new Error('Seed: no approved class for ' + c.join(' '));
            }

            return {
                id: k + 1,
                code: w.code,
                title: w.title,
                units: w.units,
                sched: w.sched,
                room: w.room
            };
        });

        const enr = [
            {
                term: '2026–2027 · 1st Semester',
                ay: '2026–2027',
                sem: '1st Semester',
                st: on ? 'Enrolled' : 'Pending',
                units: subs.reduce((t, x) => t + x.units, 0),
                date,
                ref,
                yl: yr,
                subs
            },
            {
                term: '2026–2027 · 2nd Semester',
                ay: '2026–2027',
                sem: '2nd Semester',
                st: 'Not Enrolled',
                subs: []
            }
        ];

        if (id === '2023-01482') {
            enr.push(
                {
                    term: '2025–2026 · 2nd Semester',
                    ay: '2025–2026',
                    sem: '2nd Semester',
                    st: 'Enrolled',
                    units: 21,
                    date: '05 Jan 2026',
                    ref: 'ENR-2026-011207',
                    yl: '1st Year',
                    nosub: 1,
                    subs: []
                },
                {
                    term: '2025–2026 · 1st Semester',
                    ay: '2025–2026',
                    sem: '1st Semester',
                    st: 'Enrolled',
                    units: 18,
                    date: '11 Aug 2025',
                    ref: 'ENR-2025-017733',
                    yl: '1st Year',
                    nosub: 1,
                    subs: []
                }
            );
        } else if (prevYr[yr]) {
            const ir = st === 'Irregular';

            enr.push(
                {
                    term: '2025–2026 · 2nd Semester',
                    ay: '2025–2026',
                    sem: '2nd Semester',
                    st: 'Enrolled',
                    units: ir ? 15 : 21,
                    date: '0' + (5 + i % 4) + ' Jan 2026',
                    ref: 'ENR-2026-0' + (11200 + i * 17),
                    yl: prevYr[yr],
                    nosub: 1,
                    subs: []
                },
                {
                    term: '2025–2026 · 1st Semester',
                    ay: '2025–2026',
                    sem: '1st Semester',
                    st: 'Enrolled',
                    units: ir ? 12 : 18,
                    date: '0' + (4 + i % 5) + ' Aug 2025',
                    ref: 'ENR-2025-0' + (17500 + i * 23),
                    yl: prevYr[yr],
                    nosub: 1,
                    subs: []
                }
            );
        }

        return {
            name,
            id,
            prog,
            yr,
            st,
            email: mail || em(name),
            pw: 'Student@123',
            phone,
            enr
        };
    });
};

/* ---------- seed requests: the requester is looked up from the student/faculty record, and each request points at real classes, rooms and enrollment records ---------- */


const mkReqs = (stu, fac) => [
    [
        'SR-0012',
        'F-0012',
        'Technical and Facilities',
        'Projector not working in Lab 2',
        'The ceiling projector in Lab 2 does not turn on. It is needed for IT 201 BSCS 2A on Mondays and Wednesdays.',
        '06 Oct 2026',
        'Pending'
    ],
    [
        'SR-0011',
        '2024-02106',
        'Enrollment and Subjects',
        'Enrollment approval follow-up',
        'My enrollment is still pending. Please confirm that my documents were received.',
        '05 Oct 2026',
        'Pending'
    ],
    [
        'SR-0010',
        '2023-01482',
        'Academic Records',
        'Certificate of Good Moral',
        'Requesting a certificate of good moral character for a scholarship application.',
        '05 Oct 2026',
        'Pending'
    ],
    [
        'SR-0009',
        '2023-01482',
        'Academic Records',
        'Certificate of Enrollment',
        'Needed for an internship application. Please release a signed copy.',
        '02 Oct 2026',
        'In progress'
    ],
    [
        'SR-0008',
        'F-0012',
        'Class and Schedule',
        'Room change request C-304',
        'Class size increased to 45. Requesting a larger room for IS 220 BSIS 2A.',
        '28 Sep 2026',
        'In progress'
    ],
    [
        'SR-0007',
        'F-0012',
        'Student Records',
        'Class list correction',
        'Two students are missing from the IT 201 BSCS 2A class list.',
        '20 Sep 2026',
        'Resolved'
    ],
    [
        'SR-0006',
        '2023-01482',
        'Student Information',
        'Correction of email address',
        'The email address on file is wrong. Please update it to maya.santos@campus.edu.',
        '15 Sep 2026',
        'Resolved'
    ],
    [
        'SR-0005',
        '2021-00342',
        'Enrollment and Subjects',
        'Late enrollment appeal',
        'Appeal to enroll after the deadline due to a medical leave.',
        '10 Sep 2026',
        'Resolved'
    ],
    [
        'SR-0004',
        'F-0012',
        'Class and Schedule',
        'Schedule conflict',
        'My Friday consultation hour overlaps with a faculty meeting.',
        '02 Sep 2026',
        'Resolved'
    ],
    [
        'SR-0003',
        '2023-01482',
        'Account and Access',
        'Reset portal password',
        'I forgot my password and cannot sign in to the portal.',
        '02 Sep 2026',
        'Resolved'
    ],
    [
        'SR-0002',
        '2023-00512',
        'Student Information',
        'Program change request',
        'I would like to transfer from BS Computer Science to BS Information Technology.',
        '28 Aug 2026',
        'Rejected'
    ],
    [
        'SR-0001',
        'F-0012',
        'Account and Access',
        'Email access issue',
        'I could not access my campus email from off campus.',
        '25 Aug 2026',
        'Resolved'
    ]
].map(a => {
    const s = stu.find(x => x.id === a[1]);
    const p = s || fac.find(x => x.no === a[1]);

    return {
        id: a[0],
        who: p.name,
        role: s ? 'Student' : 'Faculty',
        uid: a[1],
        type: a[2],
        subj: a[3],
        desc: a[4],
        date: a[5],
        st: a[6]
    };
});


const mkAnns = () => [
    {
        id: 1,
        t: 'Midterm examination schedules are now available',
        o: 'Registrar',
        d: '07 Oct',
        cat: 'Academic',
        aud: 'Everyone',
        st: 'Published',
        b: 'The official midterm examination schedule for the 1st Semester 2026–2027 is now available. Review your assigned rooms and reporting times in advance.',
        f: 'Midterm_Schedule.pdf'
    },
    {
        id: 2,
        t: 'Midterm grade encoding opens 19 October',
        o: 'Registrar',
        d: '06 Oct',
        cat: 'Academic',
        aud: 'Faculty',
        st: 'Published',
        b: 'Faculty may start encoding midterm grades on 19 October. Please finish before the posted deadline.',
        f: ''
    },
    {
        id: 3,
        t: 'Campus wellness week: activities and support services',
        o: 'Student Affairs',
        d: '05 Oct',
        cat: 'Events',
        aud: 'Everyone',
        st: 'Published',
        b: 'Join the wellness week activities across campus. Counseling and support services stay open all week.',
        f: ''
    },
    {
        id: 4,
        t: 'Extended library hours during midterm week',
        o: 'Library',
        d: '02 Oct',
        cat: 'Services',
        aud: 'Everyone',
        st: 'Published',
        b: 'The library will open until 9:00 PM during midterm week.',
        f: ''
    },
    {
        id: 5,
        t: 'Faculty meeting on curriculum review',
        o: "Dean's Office",
        d: '12 Oct',
        cat: 'Academic',
        aud: 'Faculty',
        st: 'Scheduled',
        b: 'Curriculum review meeting for all department faculty.',
        f: ''
    },
    {
        id: 6,
        t: 'Planned Wi-Fi maintenance',
        o: 'IT Services',
        d: '—',
        cat: 'Services',
        aud: 'Everyone',
        st: 'Draft',
        b: 'Short Wi-Fi downtime is planned on the main campus.',
        f: ''
    }
];

/* ---------- seed reports: figures are counted from the seed records above (as of the report date) ---------- */

const mkRep = (stu, fac, wl, reqs, anns) => {
    const cur = wl.filter(w =>
        w.ay === CURT.ay &&
        w.sem === CURT.sem
    );

    const ok = cur.filter(w => w.st === 'Approved');
    const enrolled = stu.filter(s => s.enr[0].st === 'Enrolled');
    const irr = enrolled.filter(s => s.st === 'Irregular').length;

    const n = s => reqs.filter(r => r.st === s).length;
    const a = s => anns.filter(x => x.st === s).length;

    const pend = cur
        .filter(w => w.st === 'Pending')
        .map(w => w.code + ' ' + w.sec)
        .join(' and ');

    return [
        [
            '1st Semester 2026–2027 Enrollment Summary',
            'Ana Dela Cruz',
            '07 Oct 2026',
            'Final',
            'Registrar',
            `${enrolled.length} of ${stu.length} students are enrolled (${enrolled.length - irr} regular, ${irr} irregular) with ${enrolled.reduce((t, s) => t + s.enr[0].units, 0)} registered units. ${stu.length - enrolled.length} enrollment is pending approval.`
        ],
        [
            'Service Request Review',
            'Ana Dela Cruz',
            '07 Oct 2026',
            'In review',
            'Operations',
            `${reqs.length} requests received since 25 Aug: ${n('Resolved')} resolved, ${n('Rejected')} rejected, ${n('In progress')} in progress and ${n('Pending')} pending.`
        ],
        [
            'Announcements and Student Support Summary',
            'Ana Dela Cruz',
            '07 Oct 2026',
            'Final',
            'Student Affairs',
            `${a('Published')} announcements published, ${a('Scheduled')} scheduled and ${a('Draft')} draft. Students filed ${reqs.filter(r => r.role === 'Student').length} service requests.`
        ],
        [
            'Faculty Workload Summary',
            'Ana Dela Cruz',
            '06 Oct 2026',
            'Final',
            'Registrar',
            `${fac.length} faculty hold ${ok.length} approved classes (${ok.reduce((t, w) => t + w.units, 0)} units) this term. ${pend} are awaiting approval.`
        ],
        [
            'Student Records Cleanup Plan',
            'Ana Dela Cruz',
            '05 Oct 2026',
            'Draft',
            'Drafts',
            'Plan to check that student and faculty profiles, enrollment records and service requests show the same information.'
        ],
        [
            'Room and Schedule Coordination Notes',
            'Ana Dela Cruz',
            '18 Sep 2026',
            'Archived',
            'Operations',
            'Notes on assigning rooms and schedules so that no faculty member, room or student has two classes at the same time.'
        ]
    ].map((r, i) => ({
        id: i + 1,
        n: r[0],
        o: r[1],
        d: r[2],
        st: r[3],
        f: r[4],
        b: r[5]
    }));
};

const seed = () => {
    const wl = mkWl();
    const fac = mkFac();
    const stu = mkStu(wl);
    const reqs = mkReqs(stu, fac);
    const anns = mkAnns();

    return {
        acc: [
            {
                u: 'admin@campus.edu',
                p: 'Admin@123',
                r: 'admin'
            }
        ],

        me: {
            admin: {
                name: 'Ana Dela Cruz',
                short: 'Ana Dela Cruz',
                email: 'admin@campus.edu',
                role: 'Administrator',
                dept: 'Administration Office',
                phone: '+63 919 555 0100',
                id: 'A-001'
            }
        },

        reqs,
        anns,

        read: {
            '2023-01482': [4],
            'F-0012': [3]
        },

        stu,
        fac,
        wl,

        rep: mkRep(stu, fac, wl, reqs, anns)
    };
};

let DB;

const load0 = () => {
    try {
        const d = JSON.parse(localStorage.getItem(LS));

        if (
            d &&
            [
                'acc',
                'me',
                'reqs',
                'anns',
                'stu',
                'fac',
                'wl',
                'rep',
                'read'
            ].every(k => d[k])
        ) {
            d.anns.forEach(a => {
                if (a.aud === 'All') {
                    a.aud = 'Everyone';
                }
            });

            return d;
        }
    } catch (e) { }

    return seed();
};

const save = () => {
    try {
        localStorage.setItem(LS, JSON.stringify(DB));
    } catch (e) { }
};
