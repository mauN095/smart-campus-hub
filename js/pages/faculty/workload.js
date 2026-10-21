
/* Faculty screen: Faculty Workload (+ facLoad helper) */
'use strict';

/* ---------- Faculty Workload Helper ---------- */

const facLoad = (t = CURT) =>
    DB.wl.filter(w =>
        w.no === uid &&
        w.st === 'Approved' &&
        w.ay === t.ay &&
        w.sem === t.sem
    );

/* ---------- Faculty Workload Screen ---------- */

let ftm = '';

const facultyWorkload = () => {
    const ts = facTerms(uid);

    const cur = ts.includes(ftm)
        ? ftm
        : tkey(CURT);

    const t = splitT(cur);

    const ld = () => facLoad(t);

    return (
        hd('Faculty Workload') +

        `
        <div class="c">
            <label style="margin:0">
                Academic term

                <select
                    class="sel"
                    id="fterm"
                >
                    ${ts.map(x => `
                        <option${x === cur ? ' selected' : ''}>
                            ${esc(x)}
                        </option>
                    `).join('')}
                </select>
            </label>
        </div>

        <div class="c sum">
            <div>
                <p class="eb">
                    Total teaching load
                </p>

                <div class="big">
                    ${ld().reduce(
                        (a, w) => a + w.units,
                        0
                    )} units
                </div>
            </div>

            <div class="sum-meta">
                <b>
                    ${esc(t.sem)} ${esc(t.ay)}
                </b>

                <span>
                    ${esc(DEPTF(U().dept))}
                </span>
            </div>
        </div>
        ` +

        tbl('load', {
            cols: [
                {
                    k: 'code',
                    l: 'Code',
                    t: 'none'
                },
                {
                    k: 'title',
                    l: 'Subject',
                    t: 'none'
                },
                {
                    k: 'dept',
                    l: 'Department',
                    t: 'none'
                },
                {
                    k: 'sec',
                    l: 'Section',
                    t: 'none'
                },
                {
                    k: 'sched',
                    l: 'Schedule',
                    t: 'none'
                },
                {
                    k: 'room',
                    l: 'Room',
                    t: 'none'
                },
                {
                    k: 'units',
                    l: 'Units',
                    t: 'none'
                }
            ],

            rows: ld,

            empty: 'No approved workload for this term.'
        })
    );
};
