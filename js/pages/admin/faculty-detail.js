
/* Admin screen: Faculty Detail (+ facName helper) */
'use strict';

const adminFacultyDetail = () => {
    const f = curF();

    if (!f) {
        sub = null;
        return P.fac();
    }

    const wts = facTerms(f.no);
    const wcur = wts.includes(sub.wt)
        ? sub.wt
        : tkey(CURT);

    const wt = splitT(wcur);

    return `
        <div class="top">
            <div class="l">
                <button
                    class="btn sec"
                    data-a="fb"
                >
                    ← Back
                </button>

                <h1>${esc(f.name)}</h1>
            </div>

            <button
                class="btn sec"
                data-a="ff"
                data-v="${f.no}"
            >
                Edit faculty
            </button>
        </div>

        <div class="c pf">
            ${avatar(f)}

            <div class="pi">
                <h2>${esc(f.name)}</h2>

                <span class="mu">
                    Faculty ID ${f.no} ·
                </span>

                ${pill(f.st)}

                ${f.photo ? `
                    <div class="pc">
                        <button
                            class="btn sec sm"
                            data-a="aphr"
                            data-v="f"
                        >
                            Remove photo
                        </button>
                    </div>
                ` : ''}
            </div>
        </div>

        <h3>Faculty Information</h3>

        <div class="c">
            <div class="kg3 d">
                ${kv([
                    [
                        'Full Name',
                        esc(f.name)
                    ],
                    [
                        'Faculty No.',
                        f.no
                    ],
                    [
                        'Email Address',
                        esc(f.email)
                    ],
                    [
                        'Rank',
                        f.rank
                    ],
                    [
                        'Position',
                        f.pos
                    ],
                    [
                        'Department',
                        esc(DEPTF(f.dept))
                    ],
                    [
                        'Total units',
                        fUnits(f.no, wt)
                    ],
                    [
                        'Status',
                        sx(f.st)
                    ],
                    [
                        'Password',
                        `
                            <span class="ev">
                                ${mono(f.pw)}

                                <button
                                    class="lk"
                                    data-a="apw"
                                    data-v="f"
                                >
                                    Reset
                                </button>
                            </span>
                        `
                    ]
                ])}
            </div>
        </div>

        <div class="top">
            <h3 style="margin:0">
                Workload assignments
            </h3>

            ${bt('+ Add Workload', 'wa')}
        </div>

        <div class="c">
            <label style="margin:0">
                Academic term

                <select
                    class="sel"
                    id="wterm"
                >
                    ${wts.map(x => `
                        <option${x === wcur ? ' selected' : ''}>
                            ${esc(x)}
                        </option>
                    `).join('')}
                </select>
            </label>
        </div>
    ` +

    tbl('wl', {
        cols: [
            {
                k: 'code',
                l: 'Code',
                t: 'none'
            },
            {
                k: 'title',
                l: 'Subject',
                t: 'text'
            },
            {
                k: 'sec',
                l: 'Section',
                t: 'none'
            },
            {
                k: 'sched',
                l: 'Schedule',
                t: 'cat',
                o: () => OPT.sched
            },
            {
                k: 'room',
                l: 'Room',
                t: 'none'
            },
            {
                k: 'units',
                l: 'Units',
                t: 'num'
            },
            {
                k: 'st',
                l: 'Status',
                t: 'cat',
                o: () => OPT.wlSt,
                f: r => sx(r.st)
            },

            actCol('w', 1)
        ],

        rows: () =>
            DB.wl.filter(w =>
                w.no === sub.fd &&
                w.ay === wt.ay &&
                w.sem === wt.sem
            ),

        empty: 'No workload assigned yet. Use “+ Add Workload”.'
    });
};

/* ---------- Faculty Name Helper ---------- */

const facName = no =>
    (
        DB.fac.find(f => f.no === no) ||
        {name: no}
    ).name;
