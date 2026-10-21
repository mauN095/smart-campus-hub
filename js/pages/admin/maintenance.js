
/* Admin screen: System Maintenance (+ add/edit form) */
'use strict';

let mtTab = 'prog';

const MTT = {
    prog: ['Programs', 'Program'],
    dept: ['Departments', 'Department'],
    subj: ['Subjects', 'Subject'],
    sched: ['Schedules', 'Schedule'],
    room: ['Rooms', 'Room'],
    sect: ['Sections', 'Section'],
    req: ['Request Types', 'Request type'],
    cat: ['Announcement Categories', 'Category']
};

/* ---------- System Maintenance Screen ---------- */

const adminMaintenance = () => {
    const k = mtTab;

    const cols = k === 'subj'
        ? [
            {
                k: 'code',
                l: 'Subject code',
                t: 'text'
            },
            {
                k: 'n',
                l: 'Subject title',
                t: 'text'
            },
            {
                k: 'units',
                l: 'Units',
                t: 'num'
            },
            {
                k: 'dept',
                l: 'Department',
                t: 'cat',
                o: () => mtAll('dept')
            }
        ]
        : k === 'sched'
            ? [
                {
                    k: 'subj',
                    l: 'Subject',
                    t: 'cat',
                    o: () => mtAll('subj')
                },
                {
                    k: 'n',
                    l: 'Schedule',
                    t: 'text'
                },
                {
                    k: 'av',
                    l: 'Rooms available',
                    t: 'num',
                    v: r =>
                        roomsFree(
                            r.subj,
                            r.n,
                            '',
                            null,
                            CURT
                        ).length,
                    f: r =>
                        roomsFree(
                            r.subj,
                            r.n,
                            '',
                            null,
                            CURT
                        ).length +
                        ' of ' +
                        mtA('room').length
                }
            ]
            : k === 'sect'
                ? [
                    {
                        k: 'n',
                        l: 'Section',
                        t: 'text'
                    },
                    {
                        k: 'prog',
                        l: 'Program',
                        t: 'cat',
                        o: () => mtAll('prog')
                    }
                ]
                : [
                    {
                        k: 'n',
                        l: MTT[k][1],
                        t: 'text'
                    }
                ];

    if (k === 'dept') {
        cols.push({
            k: 'full',
            l: 'Full name',
            t: 'text'
        });
    }

    if (k === 'req') {
        cols.push({
            k: 'for',
            l: 'Applies to',
            t: 'cat',
            o: () => [
                'Student',
                'Faculty',
                'Both'
            ]
        });
    }

    cols.push(
        {
            k: 'use',
            l: 'In use',
            t: 'num',
            v: r => mtUse(k, r.n, r)
        },
        {
            k: 'on',
            l: 'Status',
            t: 'cat',
            v: r => r.on ? 'Active' : 'Inactive',
            f: r => sx(r.on ? 'Active' : 'Inactive'),
            o: () => [
                'Active',
                'Inactive'
            ]
        },
        {
            k: 'act',
            l: 'Action',
            t: 'none',
            nw: 1,
            v: () => '',
            f: r => `
                <button
                    class="act"
                    data-a="mte"
                    data-v="${r.id}"
                >
                    Edit
                </button>

                ·

                <button
                    class="act"
                    data-a="mtx"
                    data-v="${r.id}"
                >
                    ${r.on ? 'Deactivate' : 'Activate'}
                </button>

                ${mtUse(k, r.n, r) ? '' : `
                    ·

                    <button
                        class="act"
                        data-a="mtd"
                        data-v="${r.id}"
                    >
                        Delete
                    </button>
                `}
            `
        }
    );

    return (
        hd(
            'System Maintenance',
            bt('+ Add ' + MTT[k][1], 'mta')
        ) +

        `
        <p class="mu">
            Master lists used across the portal.
            Renaming updates every student, faculty, request
            and announcement record that uses it.
            Items in use cannot be deleted; deactivate them
            to hide them from new entries.

            ${k === 'sched'
                ? ' Schedules belong to a subject and appear as the schedule choices for it. “Rooms available” counts active rooms with no other class at that time.'
                : ''
            }

            ${k === 'subj'
                ? ' Choosing a subject title anywhere in the portal fills in its code and units from this list.'
                : ''
            }
        </p>

        <div class="bar">
            <div class="pills">
                ${Object.keys(MTT).map(t => `
                    <button
                        class="pl${t === k ? ' on' : ''}"
                        data-a="mtt"
                        data-v="${t}"
                    >
                        ${MTT[t][0]}
                    </button>
                `).join('')}
            </div>

            ${search('mt', 'Search…')}
        </div>
        ` +

        tbl('mt', {
            cols,

            rows: () => DB.mt[k],

            empty: 'No items yet.'
        })
    );
};

/* ---------- System Maintenance Add / Edit Form ---------- */

const mtForm = it => {
    const k = mtTab;

    const o = it || {
        n: '',
        full: '',
        for: 'Both',
        on: 1,
        code: '',
        units: 3,
        dept: mtD('dept', 'Computing'),
        subj: '',
        prog: ''
    };

    const u = it
        ? mtUse(k, o.n, o)
        : 0;

    let body;

    if (k === 'sched') {
        const m = String(o.n).match(
            /^([A-Za-z/]+)\s+(\d{1,2}):(\d{2})\s*[–-]\s*(\d{1,2}):(\d{2})/
        );

        const p2 = x =>
            String(x).padStart(2, '0');

        body =
            selx(
                'Subject',
                'm8',
                mtA('subj'),
                o.subj,
                'Select subject'
            ) +

            sel(
                'Days',
                'm9',
                [
                    'M/W',
                    'T/Th',
                    'M/Th',
                    'T/F',
                    'W/F',
                    'Mon',
                    'Tue',
                    'Wed',
                    'Thu',
                    'Fri',
                    'Sat'
                ],
                m ? m[1] : 'M/W'
            ) +

            `
            <div class="g2">
                ${fld(
                    'Start time',
                    'm10',
                    m
                        ? p2(m[2]) + ':' + m[3]
                        : '08:00',
                    'type="time"'
                )}

                ${fld(
                    'End time',
                    'm11',
                    m
                        ? p2(m[4]) + ':' + m[5]
                        : '09:30',
                    'type="time"'
                )}
            </div>
            `;

    } else if (k === 'subj') {
        body =
            fld(
                'Subject title',
                'm1',
                o.n
            ) +

            `
            <div class="g2">
                ${fld(
                    'Subject code',
                    'm5',
                    o.code
                )}

                ${fld(
                    'Units',
                    'm6',
                    o.units,
                    'type="number" min="1" max="12"'
                )}
            </div>
            ` +

            sel(
                'Department',
                'm7',
                mtA('dept'),
                o.dept
            );

    } else {
        body =
            fld(
                'Name',
                'm1',
                o.n
            ) +

            (
                k === 'dept'
                    ? fld(
                        'Full name',
                        'm2',
                        o.full || o.n
                    )
                    : ''
            ) +

            (
                k === 'req'
                    ? sel(
                        'Applies to',
                        'm3',
                        [
                            'Student',
                            'Faculty',
                            'Both'
                        ],
                        o.for
                    )
                    : ''
            ) +

            (
                k === 'sect'
                    ? sel(
                        'Program',
                        'm12',
                        mtA('prog'),
                        o.prog || mtA('prog')[0]
                    )
                    : ''
            );
    }

    modal(
        `
        <h2>
            ${it ? 'Edit' : 'Add'} ${MTT[k][1]}
        </h2>

        ${body}

        ${sel(
            'Status',
            'm4',
            [
                'Active',
                'Inactive'
            ],
            o.on ? 'Active' : 'Inactive'
        )}

        ${u ? `
            <p class="mu" style="font-size:12px">
                ${k === 'sched'
                    ? 'Changing this updates'
                    : 'Renaming updates'
                }
                the ${u} existing record(s) that use this item.
            </p>
        ` : ''}

        ${acts('mts', 'Save').replace(
            'data-a="mts"',
            `data-a="mts" data-v="${it ? it.id : 0}"`
        )}
        `,
        1
    );
};
