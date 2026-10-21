
/* Admin screen: Dashboard (Administration Overview) */
'use strict';

const visAdmin = () =>
    DB.anns
        .filter(a => a.st === 'Published')
        .slice(0, 3);

const adminDashboard = () => {
    const rr = [...DB.reqs]
        .sort((a, b) => pd(b.date) - pd(a.date))
        .slice(0, 4);

    const open = DB.reqs.filter(r =>
        r.st === 'Pending' ||
        r.st === 'In progress'
    ).length;

    return (
        hd('Administration Overview') +

        `
        <div class="g4" style="margin-bottom:16px">
            ${[
                [
                    DB.stu.length,
                    'Students'
                ],
                [
                    DB.fac.length,
                    'Faculty'
                ],
                [
                    DB.stu.filter(x =>
                        (
                            x.enr.find(e =>
                                e.ay === CURT.ay &&
                                e.sem === CURT.sem
                            ) || {}
                        ).st === 'Enrolled'
                    ).length,
                    'Enrolled'
                ],
                [
                    open,
                    'Open requests'
                ]
            ].map(a => `
                <div class="c" style="margin:0">
                    <div class="big">
                        ${a[0]}
                    </div>

                    <span class="mu">
                        ${a[1]}
                    </span>
                </div>
            `).join('')}
        </div>

        <div class="g2" style="align-items:start">
            <div class="c">
                <h3>Recent service requests</h3>

                ${rr.map(r => `
                    <div class="rs">
                        <span>
                            <b>${r.id}</b>
                            ${esc(r.subj)}
                        </span>

                        ${sx(r.st)}
                    </div>
                `).join('')}

                <p>
                    <button
                        class="lk"
                        data-a="go"
                        data-v="req"
                    >
                        Open queue →
                    </button>
                </p>
            </div>

            <div class="c">
                <h3>Latest announcements</h3>

                ${visAdmin()
                    .map(a => annLine(a, 0))
                    .join('')}
            </div>
        </div>
        `
    );
};
