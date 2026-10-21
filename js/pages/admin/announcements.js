
/* Admin screen: Announcements (manage) */
'use strict';

const adminAnnouncements = () =>
    hd(
        'Announcements',
        bt('+ Create Announcement', 'an')
    ) +
    search('annA', 'Search announcements…') +
    '<div style="height:14px"></div>' +
    tbl('annA', {
        cols: [
            {
                k: 't',
                l: 'Title',
                t: 'text'
            },
            {
                k: 'cat',
                l: 'Category',
                t: 'cat',
                o: () => mtAll('cat')
            },
            {
                k: 'aud',
                l: 'Audience',
                t: 'cat',
                o: () => OPT.aud
            },
            {
                k: 'd',
                l: 'Date',
                t: 'date'
            },
            {
                k: 'st',
                l: 'Status',
                t: 'cat',
                f: r => sx(r.st)
            },
            {
                k: 'act',
                l: 'Action',
                t: 'none',
                v: () => '',
                f: r => `
                    <button
                        class="act"
                        data-a="av"
                        data-v="${r.id}"
                    >
                        View
                    </button>
                    ·
                    <button
                        class="act"
                        data-a="ae"
                        data-v="${r.id}"
                    >
                        Edit
                    </button>
                    ·
                    <button
                        class="act"
                        data-a="ad"
                        data-v="${r.id}"
                    >
                        Delete
                    </button>
                `
            }
        ],

        rows: () => DB.anns
    });
