
/* Shared screen (Student + Faculty): Announcements list */
'use strict';

/* ---------- Announcements Screen ---------- */

let annCat = 'All';

const announcementsScreen = () => {
    annCat = 'All';

    return (
        hd('Campus Announcements') +

        `
        <div class="bar">
            <div class="pills">
                ${[
                    'All',
                    ...mtPills()
                ].map(c => `
                    <button
                        class="pl${c === 'All' ? ' on' : ''}"
                        data-a="cat"
                        data-v="${c}"
                    >
                        ${c}
                    </button>
                `).join('')}
            </div>

            ${search('ann', 'Search announcements…')}
        </div>

        <div class="c" id="annl"></div>
        `
    );
};

/* ---------- Render Announcements ---------- */

function drawAnn() {
    const el = $('#annl');

    if (!el) {
        return;
    }

    const q = (
        TS.ann
            ? TS.ann.q
            : ''
    ).toLowerCase();

    const l = visAnn().filter(a =>
        (
            annCat === 'All' ||
            a.cat === annCat
        ) &&
        (
            !q ||
            (
                a.t +
                a.o +
                a.cat +
                a.b
            ).toLowerCase().includes(q)
        )
    );

    el.innerHTML = l.length
        ? l.map(a => `
            <button
                class="li"
                data-a="av"
                data-v="${a.id}"
            >
                <small>
                    ${rdl().includes(a.id) ? '' : '● '}
                    ${esc(a.o)} · ${esc(a.d)}
                </small>

                <b>${esc(a.t)}</b>

                <span class="mu">
                    · ${a.cat}
                </span>
            </button>
        `).join('')
        : `
            <p
                class="mu"
                style="text-align:center"
            >
                No announcements match your search.
            </p>
        `;
}
