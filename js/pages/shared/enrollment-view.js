
/* Shared: Enrollment Details View (Student + Admin) */
'use strict';

/* ---------- Enrollment Details Helper ---------- */

const enrView = (r, e, adm) => {
    const on = e.st === 'Enrolled';

    const msg = on
        ? (
            adm
                ? 'Officially enrolled for this term.'
                : 'You are officially enrolled for this term.'
        )
        : e.st === 'Pending'
            ? (
                adm
                    ? 'Enrollment is awaiting approval.'
                    : 'Your enrollment is awaiting approval.'
            )
            : 'No enrollment record is currently available for this term.';

    /* ---------- Subject Table Configuration ---------- */

    const cols = [
        {
            k: 'code',
            l: 'Subject Code',
            t: 'none',
            f: x => {
                const sj = mtSubjLive(x.title);

                return esc(
                    sj ? sj.code : x.code
                );
            }
        },
        {
            k: 'title',
            l: 'Subject',
            t: 'none',
            f: x => {
                const sj = mtSubjLive(x.title);

                return esc(x.title) +
                    unavail(!!sj && sj.on);
            }
        },
        {
            k: 'units',
            l: 'Units',
            t: 'none',
            f: x => {
                const sj = mtSubjLive(x.title);

                return esc(
                    String(sj ? sj.units : x.units)
                );
            }
        },
        {
            k: 'sched',
            l: 'Schedule',
            t: 'none',
            f: x => {
                const sc = mtSchedLive(
                    x.title,
                    x.sched
                );

                return esc(x.sched) +
                    unavail(!!sc && sc.on);
            }
        },
        {
            k: 'room',
            l: 'Room',
            t: 'none',
            f: x => {
                const rm = mtRoomLive(x.room);

                return esc(x.room) +
                    unavail(!!rm && rm.on);
            }
        }
    ];

    /* ---------- Admin Subject Actions ---------- */

    if (adm) {
        cols.push({
            k: 'act',
            l: 'Action',
            t: 'none',
            nw: 1,
            v: () => '',
            f: x => `
                <button
                    class="act"
                    data-a="ue"
                    data-v="${x.id}"
                >
                    Edit
                </button>

                ·

                <button
                    class="act"
                    data-a="ud"
                    data-v="${x.id}"
                >
                    Delete
                </button>
            `
        });
    }

    /* ---------- Enrollment Status ---------- */

    return (
        (
            adm
                ? `
                    <div class="c es adm${on ? ' okb' : ''}">
                        <p class="eb">
                            Enrollment status
                        </p>

                        <div class="big ${on ? 'ok' : 'wn'}">
                            ${e.st}
                        </div>
                    </div>
                `
                : `
                    <div class="c es">
                        <p class="eb">
                            Enrollment status
                        </p>

                        <div class="big ${on ? 'ok' : 'wn'}">
                            ${e.st}
                        </div>

                        <p class="mu" style="margin:0">
                            ${msg}
                        </p>
                    </div>
                `
        ) +

        (
            on
                ? `
                    <h3>Enrollment Details</h3>

                    <div class="c">
                        <div class="kg3">
                            ${kv([
                                [
                                    'Student Name',
                                    esc(r.name)
                                ],
                                [
                                    'Course/Program',
                                    esc(r.prog)
                                ],
                                [
                                    'Year Level',
                                    e.yl || r.yr
                                ],
                                [
                                    'Student ID',
                                    r.id
                                ],
                                [
                                    'Academic Year',
                                    e.ay
                                ],
                                [
                                    'Semester',
                                    e.sem
                                ],
                                [
                                    'Enrollment Reference',
                                    e.ref || '—'
                                ],
                                [
                                    'Registration Date',
                                    e.date || '—'
                                ],
                                [
                                    'Registered Units',
                                    e.units || 0
                                ]
                            ])}
                        </div>
                    </div>
                ` +

                (
                    adm && !e.nosub
                        ? `
                            <div class="top">
                                <h3 style="margin:0">
                                    Subjects
                                </h3>

                                ${bt('+ Add Subject', 'ua')}
                            </div>
                        `
                        : '<h3>Subjects</h3>'
                ) +

                (
                    e.nosub
                        ? `
                            <div class="c mu">
                                Subject list is archived for this term.
                            </div>
                        `
                        : tbl(
                            adm ? 'asub' : 'subs',
                            {
                                cols,

                                rows: () => e.subs || [],

                                empty: adm
                                    ? 'No subjects yet. Use “+ Add Subject”.'
                                    : 'No subjects have been assigned yet.'
                            }
                        )
                )
                : ''
        )
    );
};
