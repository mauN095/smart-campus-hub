
/* Entry Point: Global Events + First Render (Must Load Last) */
'use strict';

/* ==================================================
   GLOBAL EVENT LISTENERS
   ================================================== */

/* ---------- Click Events ---------- */

document.addEventListener('click', e => {
    const mb = e.target.closest('[data-m]');

    if (mb) {
        e.stopPropagation();

        const open =
            $('#menu') &&
            mb.getAttribute('aria-expanded') === 'true';

        closeMenu();

        if (!open) {
            openMenu(mb);
            mb.setAttribute('aria-expanded', 'true');
        }

        return;
    }

    if (!e.target.closest('#menu')) {
        closeMenu();
    }

    if (e.target.closest('select')) {
        return;
    }

    const t = e.target.closest('[data-a]');

    if (!t) {
        return;
    }

    const fn = A[t.dataset.a];

    if (fn) {
        fn(t.dataset, t);
    }
});

/* ---------- Input Events ---------- */

document.addEventListener('input', e => {
    const q = e.target.dataset && e.target.dataset.q;

    /* ---------- Table Search ---------- */

    if (q) {
        q.split(',').forEach(id => {
            if (TS[id]) {
                TS[id].q = e.target.value;
                drawT(id);
            }
        });

        /* ---------- Announcement Search ---------- */

        if (q === 'ann') {
            TS.ann = TS.ann || {
                q: ''
            };

            TS.ann.q = e.target.value;

            drawAnn();
        }
    }

    /* ---------- Announcement Title Preview ---------- */

    if (e.target.id === 'at' && $('#pt')) {
        $('#pt').textContent =
            e.target.value || 'Your title appears here';
    }

    /* ---------- Announcement Content Preview ---------- */

    if (e.target.id === 'ab' && $('#pb')) {
        $('#pb').textContent =
            e.target.value || 'Your content appears here.';
    }
});

/* ---------- Change Events ---------- */

document.addEventListener('change', e => {
    const t = e.target;

    /* ---------- Modal Dependent Fields ---------- */

    if (t.closest && t.closest('#ov')) {
        depSel(t.id);
    }

    /* ---------- Profile Photo Upload ---------- */

    if (t.id === 'photo') {
        if (t.files[0]) {
            setPhoto(t.files[0]);
        }

        return;
    }

    /* ---------- Service Request Status Update ---------- */

    if (t.dataset.st) {
        const r = DB.reqs.find(x =>
            x.id === t.dataset.st
        );

        if (r) {
            r.st = t.value;

            save();
            drawT('req');

            toast(`${r.id} marked ${r.st}`);
        }
    }

    /* ---------- Student Academic Term ---------- */

    if (t.id === 'term') {
        term = +t.value;
        render();
    }

    /* ---------- Faculty Workload Term ---------- */

    if (t.id === 'fterm') {
        ftm = t.value;
        render();
    }

    /* ---------- Admin Faculty Workload Term ---------- */

    if (t.id === 'wterm') {
        sub.wt = t.value;
        render();
    }

    /* ---------- Admin Student Enrollment Term ---------- */

    if (t.id === 'aterm') {
        sub.t = +t.value;
        render();
    }

    /* ---------- Announcement Category Preview ---------- */

    if (t.id === 'ac' && $('#pc')) {
        $('#pc').textContent = t.value;
    }
});

/* ---------- Keyboard Events ---------- */

document.addEventListener('keydown', e => {
    /* ---------- Escape Key ---------- */

    if (e.key === 'Escape') {
        closeMenu();

        if ($('#ov')) {
            closeModal();
        } else {
            closeNav();
        }
    }

    /* ---------- Enter Key: Modal Forms ---------- */

    if (
        e.key === 'Enter' &&
        e.target.closest('#ov') &&
        e.target.tagName === 'INPUT' &&
        e.target.type !== 'file'
    ) {
        const b = $(
            '#ov .acts .btn:not(.sec):not(.dng)'
        );

        if (b) {
            b.click();
        }
    }

    /* ---------- Enter Key: Login Form ---------- */

    if (
        e.key === 'Enter' &&
        e.target.closest('.lc') &&
        e.target.tagName === 'INPUT'
    ) {
        const b = $('.lc .btn.wide');

        if (b) {
            b.click();
        }
    }
});

/* ---------- Window Resize Event ---------- */

addEventListener('resize', () => {
    if (innerWidth > 820) {
        closeNav();
    }
});

/* Application Initialization */

/* ---------- Load Saved Data ---------- */

DB = load();

/* ---------- Validate Current Session ---------- */

if (role && !sessOk()) {
    role = null;
}

/* ---------- Initial Application Render ---------- */

render();
