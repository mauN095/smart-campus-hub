
/* Admin screen: Student Management */
'use strict';

/* ---------- Student Table Configuration ---------- */

const stuCfg = () => ({
    cols: [
        {
            k: 'id',
            l: 'Student ID',
            t: 'none'
        },
        {
            k: 'name',
            l: 'Name',
            t: 'text'
        },
        {
            k: 'prog',
            l: 'Program',
            t: 'cat',
            o: () => mtAll('prog')
        },
        {
            k: 'yr',
            l: 'Year level',
            t: 'cat',
            o: () => YR
        },
        {
            k: 'st',
            l: 'Status',
            t: 'cat',
            o: () => OPT.stuSt,
            f: r => sx(r.st)
        },

        actCol('s')
    ],

    rows: () => DB.stu
});

/* ---------- Student Management Screen ---------- */

const adminStudents = () =>
    hd(
        'Student Management',
        bt('+ Add Student', 'sa')
    ) +

    search(
        'stu',
        'Search students…'
    ) +

    '<div style="height:14px"></div>' +

    tbl(
        'stu',
        stuCfg()
    );
