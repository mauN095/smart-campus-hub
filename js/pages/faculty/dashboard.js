
/* Faculty screen: Dashboard */
'use strict';

const facultyDashboard = () => {
    const ld = facLoad();

    return (
        hd('Faculty Dashboard') +

        `
        <div class="g3" style="margin-bottom:16px">
            ${[
                [
                    'Assigned workload',
                    ld.reduce((a, w) => a + w.units, 0) + ' units'
                ],
                [
                    'Active classes',
                    ld.length
                ],
                [
                    'Open requests',
                    myReqs().filter(r =>
                        r.st === 'Pending' ||
                        r.st === 'In progress'
                    ).length
                ]
            ].map(a => `
                <div class="c" style="margin:0">
                    <p class="eb">
                        ${a[0]}
                    </p>

                    <div class="big">
                        ${a[1]}
                    </div>
                </div>
            `).join('')}
        </div>

        <div class="g2" style="align-items:start">
            <div class="c">
                <h3>Class schedule</h3>

                ${(
                    ld.length
                        ? ld.slice(0, 4).map(w => [
                            w.sched,
                            w.code + ' · ' + w.title,
                            w.room
                        ])
                        : [
                            [
                                '',
                                'No classes assigned yet',
                                ''
                            ]
                        ]
                ).map(a => `
                    <div class="rs">
                        <span>
                            <b>${a[0]}</b>
                            &nbsp;${a[1]}
                        </span>

                        <span class="mu">
                            ${a[2]}
                        </span>
                    </div>
                `).join('')}
            </div>

            <div class="c">
                <h3>Latest announcements</h3>

                ${visAnn()
                    .slice(0, 3)
                    .map(a => annLine(a, 1))
                    .join('')}
            </div>
        </div>
        `
    );
};
