
/* Shared: Option Lists Used by Forms and Table Filters */
'use strict';

/*
 * Option lists:
 * Edit here once; forms and table filters both read from OPT.
 */

const OPT = {
    enrSt: [
        'Enrolled',
        'Pending',
        'Not Enrolled'
    ],

    aud: [
        'Everyone',
        'Students',
        'Faculty'
    ],

    get annCat() {
        return mtA('cat');
    },

    get dept() {
        return mtA('dept');
    },

    rank: [
        'Instructor',
        'Assistant Professor',
        'Associate Professor',
        'Professor'
    ],

    pos: [
        'Full-time Faculty',
        'Part-time Faculty'
    ],

    ay: [
        '2023–2024',
        '2024–2025',
        '2025–2026',
        '2026–2027',
        '2027–2028'
    ],

    terms: [
        '1st Semester',
        '2nd Semester',
        'Summer'
    ],

    facSt: [
        'Active',
        'On leave',
        'Inactive'
    ],

    wlSt: [
        'Approved',
        'Pending',
        'Rejected',
        'Cancelled'
    ],

    stuSt: [
        'Enrolled',
        'Pending',
        'Irregular',
        'Inactive'
    ],

    sched: SLOTS
};

/* ---------- Year Level Options ---------- */

const YR = [
    '1st Year',
    '2nd Year',
    '3rd Year',
    '4th Year'
];
