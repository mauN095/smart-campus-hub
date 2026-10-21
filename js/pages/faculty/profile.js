
/* Faculty screen: My Profile */
'use strict';

const facultyProfile = () => {
    const u = U();

    const it = (l, v, raw, cls = '') => `
        <div class="kv ${cls}">
            <span>${l}</span>
            <b>${raw ? v : esc(v)}</b>
        </div>
    `;

    const pwv = `
        <span class="ev">
            <button
                class="lk"
                data-a="pw"
            >
                Change password
            </button>

            <button
                class="ed"
                aria-label="Change password"
                data-a="pw"
            >
                ${ic('pen')}
            </button>
        </span>
    `;

    const phv = `
        <span class="ev">
            <button
                class="lk"
                data-a="ph"
            >
                ${esc(u.phone) || 'Add contact number'}
            </button>

            <button
                class="ed"
                aria-label="Change contact number"
                data-a="ph"
            >
                ${ic('pen')}
            </button>
        </span>
    `;

    const cols = [
        [
            it('Full Name · restricted', u.name),
            it('Email Address · restricted', u.email),
            it('Department · restricted', DEPTF(u.dept))
        ],
        [
            it('Rank · restricted', u.rank),
            it('Position · restricted', u.pos)
        ],
        [
            it('Password', pwv, 1, 'sec'),
            it('Contact Number', phv, 1, 'sec')
        ]
    ];

    return (
        hd('My Profile') +

        `
        <div class="c pf">
            ${avatar(u)}

            <div class="pi">
                <h2>${esc(u.name)}</h2>

                <span class="mu">
                    Faculty ID ${u.id || u.no} ·
                </span>

                ${pill(u.st)}

                ${photoCtl(u)}
            </div>
        </div>

        <h3>Faculty Information</h3>

        <div class="c">
            <div
                class="kcols pg"
                style="grid-template-columns:repeat(${cols.length},1fr)"
            >
                ${Array.from(
                    {
                        length: Math.max(...cols.map(k => k.length))
                    },
                    (_, r) =>
                        cols.map(k =>
                            k[r] || '<div></div>'
                        ).join('')
                ).join('')}
            </div>
        </div>
        `
    );
};
