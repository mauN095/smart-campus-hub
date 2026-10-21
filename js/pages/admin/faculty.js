
/* Admin screen: Faculty & Workload */
'use strict';

const adminFaculty = () =>
    hd(
        'Faculty & Workload',
        bt('+ Add Faculty', 'fa')
    ) +

    search('fac', 'Search faculty…') +

    '<h3 style="margin:14px 0 12px">Faculty records</h3>' +

    tbl('fac', {
        cols: [
            {
                k: 'no',
                l: 'Faculty No.',
                t: 'none'
            },
            {
                k: 'name',
                l: 'Faculty',
                t: 'text'
            },
            {
                k: 'dept',
                l: 'Department',
                t: 'cat',
                o: () => mtAll('dept')
            },
            {
                k: 'rank',
                l: 'Rank',
                t: 'cat',
                nw: 1,
                o: () => OPT.rank
            },
            {
                k: 'pos',
                l: 'Position',
                t: 'cat',
                nw: 1,
                o: () => OPT.pos
            },
            {
                k: 'units',
                l: 'Units',
                t: 'num',
                v: r => fUnits(r.no)
            },
            {
                k: 'st',
                l: 'Status',
                t: 'cat',
                o: () => OPT.facSt,
                f: r => sx(r.st)
            },

            actCol('f')
        ],

        rows: () => DB.fac
    });
