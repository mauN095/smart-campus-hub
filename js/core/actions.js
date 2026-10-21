
/* Actions: handlers called via data-a attributes */
'use strict';

/* ---------- actions ---------- */

const A = {
    mtt(v) {
        mtTab = v.v;
        delete TS.mt;
        render();
    },

    mta() {
        mtForm();
    },

    mte(v) {
        const it = DB.mt[mtTab].find(x => x.id === +v.v);

        if (it) {
            mtForm(it);
        }
    },

    mts(v) {
        const k = mtTab;
        const id = +v.v;
        const ex = {};
        let n = val('m1');

        if (k === 'sched') {
            const sj = val('m8');
            const dy = val('m9');
            const t1 = val('m10');
            const t2 = val('m11');

            if (!sj) {
                return merr('Choose a subject.');
            }

            if (!dy || !t1 || !t2) {
                return merr('Enter the days, start time and end time.');
            }

            if (t1 >= t2) {
                return merr('End time must be after the start time.');
            }

            n = dy + ' ' + t1 + '–' + t2;
            ex.subj = sj;
        } else {
            if (!n) {
                return merr('Name is required.');
            }

            if (n.length > 60) {
                return merr('Name is too long (max 60 characters).');
            }

            if (k === 'sect') {
                ex.prog = val('m12');

                if (!ex.prog) {
                    return merr('Choose a program.');
                }
            }

            if (k === 'subj') {
                const c = val('m5');
                const un = +val('m6');

                if (!c) {
                    return merr('Subject code is required.');
                }

                if (!(un >= 1 && un <= 12)) {
                    return merr('Units must be between 1 and 12.');
                }

                if (
                    DB.mt.subj.some(x =>
                        x.id !== id &&
                        x.code.toLowerCase() === c.toLowerCase()
                    )
                ) {
                    return merr('That subject code already exists.');
                }

                Object.assign(ex, {
                    code: c,
                    units: un,
                    dept: val('m7')
                });
            }
        }

        if (
            DB.mt[k].some(x =>
                x.id !== id &&
                x.n.toLowerCase() === n.toLowerCase() &&
                (k !== 'sched' || x.subj === ex.subj)
            )
        ) {
            return merr(
                k === 'sched'
                    ? 'That schedule already exists for this subject.'
                    : 'That name already exists in this list.'
            );
        }

        let it = DB.mt[k].find(x => x.id === id);
        const isNew = !it;
        const old = it ? {...it} : null;

        if (
            old &&
            k === 'sched' &&
            old.subj !== ex.subj &&
            mtUse(k, old.n, old)
        ) {
            return merr(
                'This schedule is in use, so its subject cannot be changed.'
            );
        }

        if (isNew) {
            it = {
                id: Math.max(0, ...DB.mt[k].map(x => x.id)) + 1
            };

            DB.mt[k].push(it);
        }

        Object.assign(
            it,
            {
                n,
                on: val('m4') === 'Active' ? 1 : 0
            },
            ex
        );

        if (k === 'dept') {
            it.full = val('m2') || n;
        }

        if (k === 'req') {
            it.for = val('m3');
        }

        if (!mtOk(k)) {
            if (isNew) {
                DB.mt[k].pop();
            } else {
                Object.assign(it, old);
            }

            return merr(
                k === 'req'
                    ? 'Keep at least one active request type for Students and one for Faculty.'
                    : 'Keep at least one active item in this list.'
            );
        }

        let c = 0;

        if (old) {
            if (k === 'sched') {
                if (old.n !== n) {
                    schRecs(DB).forEach(x => {
                        if (x.title === old.subj && x.sched === old.n) {
                            x.sched = n;
                            c++;
                        }
                    });
                }
            } else if (k === 'subj') {
                if (old.n !== n) {
                    DB.mt.sched.forEach(x => {
                        if (x.subj === old.n) {
                            x.subj = n;
                        }
                    });
                }

                schRecs(DB).forEach(x => {
                    if (x.title === old.n) {
                        x.title = n;
                        x.code = it.code;
                        x.units = it.units;
                        c++;
                    }
                });

                DB.wl.forEach(w => {
                    if (w.title === n) {
                        w.dept = it.dept;
                    }
                });

                DB.stu.forEach(x =>
                    x.enr.forEach(e => {
                        if (
                            !e.nosub &&
                            (e.subs || []).some(y => y.title === n)
                        ) {
                            sumU(e);
                        }
                    })
                );
            } else if (old.n !== n) {
                const f = MTK[k][1];

                MTK[k][0](DB).forEach(x => {
                    if (x[f] === old.n) {
                        x[f] = n;

                        if (k === 'req') {
                            x.subj = n;
                        }

                        c++;
                    }
                });
            }
        }

        save();
        render();

        toast(
            isNew
                ? 'Item added'
                : c
                    ? `Updated · ${c} record(s) updated`
                    : 'Item updated'
        );
    },

    mtx(v) {
        const k = mtTab;
        const it = DB.mt[k].find(x => x.id === +v.v);

        if (!it) return;

        it.on = it.on ? 0 : 1;

        if (!mtOk(k)) {
            it.on = it.on ? 0 : 1;
            return toast('Keep at least one active item in this list');
        }

        save();
        render();
        toast(it.n + (it.on ? ' activated' : ' deactivated'));
    },

    mtd(v) {
        const it = DB.mt[mtTab].find(x => x.id === +v.v);

        if (!it) return;

        if (mtUse(mtTab, it.n, it)) {
            return toast('This item is in use and cannot be deleted');
        }

        confirmM(
            `Delete <b>${esc(it.n)}</b>? This cannot be undone.`,
            'mtc',
            v.v
        );
    },

    mtc(v) {
        const k = mtTab;
        const it = DB.mt[k].find(x => x.id === +v.v);

        if (!it || mtUse(k, it.n, it)) return;

        DB.mt[k] = DB.mt[k].filter(x => x !== it);

        if (!mtOk(k)) {
            DB.mt[k].push(it);
            render();

            return toast('Keep at least one active item in this list');
        }

        save();
        render();
        toast('Item deleted');
    },

    cm: closeModal,

    phk() {
        $('#photo').click();
    },

    phr() {
        delete U().photo;
        save();
        render();
        toast('Photo removed');
    },

    fd(v) {
        sub = {fd: v.v};
        render();
        scrollTo(0, 0);
    },

    fb() {
        sub = null;
        render();
    },

    wd(v) {
        confirmM('Delete this workload assignment?', 'wdc', v.v);
    },

    wdc(v) {
        DB.wl = DB.wl.filter(w => w.id !== +v.v);
        save();
        render();
        toast('Workload deleted');
    },

    burger() {
        const o = document.body.classList.toggle('nav');
        $('#burger').setAttribute('aria-expanded', o);
    },

    nav: v => navTo(v.v),

    go: v => navTo(v.v),

    out() {
        role = null;
        uid = null;
        term = 0;
        view = 'login';

        try {
            sessionStorage.removeItem('sch.role');
            sessionStorage.removeItem('sch.uid');
        } catch (e) { }

        render();
    },

    lv(v) {
        view = v.v;
        render();
    },

    eye(v, b) {
        const i = $('#lp');

        i.type = i.type === 'password' ? 'text' : 'password';
        b.textContent = i.type === 'password' ? 'Show' : 'Hide';
    },

    fill(v) {
        const a = accts().find(x =>
            x.r === v.v &&
            (v.v !== 'faculty' || x.id === 'F-0012')
        );

        $('#lu').value = a.u;
        $('#lp').value = a.p;
    },

    login() {
        const u = $('#lu').value.trim().toLowerCase();
        const p = $('#lp').value;
        const m = $('#le');

        if (!u || !p) {
            m.textContent = 'Enter your email or username and your password.';
            return;
        }

        const a = accts().find(x =>
            (
                x.u.toLowerCase() === u ||
                x.u.split('@')[0].toLowerCase() === u
            ) &&
            x.p === p
        );

        if (!a) {
            m.textContent = 'Invalid username or password.';
            return;
        }

        if (a.st === 'Inactive') {
            m.textContent =
                'This account is inactive. Please contact the Administration Office.';
            return;
        }

        role = a.r;
        uid = a.id;
        term = 0;
        page = 'dash';
        sub = null;

        try {
            sessionStorage.setItem('sch.role', role);
            sessionStorage.setItem('sch.uid', uid);
        } catch (e) { }

        render();
        toast('Signed in as ' + NAMES[role]);
    }
};
