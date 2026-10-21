
/* Admin screen: Reports */
'use strict';

const adminReports = () => {
    const fs = [
        'All',
        ...new Set([
            'Registrar',
            'Student Affairs',
            'Operations',
            'Drafts'
        ])
    ];

    const cnt = f =>
        f === 'All'
            ? DB.rep.length
            : DB.rep.filter(r => r.f === f).length;

    return (
        hd(
            'Administrative Reports',
            bt('+ Create Report', 'ra')
        ) +

        `
        <div class="rep">
            <div class="c">
                <h3>Folders</h3>

                <div class="fold">
                    ${fs.map(f => `
                        <button
                            class="pl${f === folder ? ' on' : ''}"
                            data-a="fo"
                            data-v="${f}"
                        >
                            <span>
                                ${f === 'All' ? 'All reports' : f}
                            </span>

                            <b>${cnt(f)}</b>
                        </button>
                    `).join('')}
                </div>
            </div>

            <div>
                <div style="margin-bottom:12px">
                    ${search('rep', 'Search reports…')}
                </div>
        ` +

        tbl('rep', {
            cols: [
                {
                    k: 'n',
                    l: 'Report',
                    t: 'text'
                },
                {
                    k: 'o',
                    l: 'Owner',
                    t: 'none'
                },
                {
                    k: 'd',
                    l: 'Updated',
                    t: 'date'
                },
                {
                    k: 'st',
                    l: 'Status',
                    t: 'cat',
                    f: r => sx(r.st)
                },

                actCol('r')
            ],

            rows: () =>
                DB.rep.filter(r =>
                    folder === 'All' ||
                    r.f === folder
                )
        }) +

        `
            </div>
        </div>
        `
    );
};
