/* Actions: handlers called via data-a attributes */
'use strict';

/* ---------- actions ---------- */
const A = {
    mtt(v) {mtTab = v.v; delete TS.mt; render()}, mta() {mtForm()}, mte(v) {const it = DB.mt[mtTab].find(x => x.id === +v.v); if (it) mtForm(it)},
    mts(v) {
        const k = mtTab, id = +v.v, ex = {}; let n = val('m1');
        if (k === 'sched') {
            const sj = val('m8'), dy = val('m9'), t1 = val('m10'), t2 = val('m11');
            if (!sj) return merr('Choose a subject.'); if (!dy || !t1 || !t2) return merr('Enter the days, start time and end time.'); if (t1 >= t2) return merr('End time must be after the start time.');
            n = dy + ' ' + t1 + '–' + t2; ex.subj = sj;
        } else {
            if (!n) return merr('Name is required.'); if (n.length > 60) return merr('Name is too long (max 60 characters).');
            if (k === 'sect') {ex.prog = val('m12'); if (!ex.prog) return merr('Choose a program.')}
            if (k === 'subj') {
                const c = val('m5'), un = +val('m6'); if (!c) return merr('Subject code is required.'); if (!(un >= 1 && un <= 12)) return merr('Units must be between 1 and 12.');
                if (DB.mt.subj.some(x => x.id !== id && x.code.toLowerCase() === c.toLowerCase())) return merr('That subject code already exists.');
                Object.assign(ex, {code: c, units: un, dept: val('m7')});
            }
        }
        if (DB.mt[k].some(x => x.id !== id && x.n.toLowerCase() === n.toLowerCase() && (k !== 'sched' || x.subj === ex.subj))) return merr(k === 'sched' ? 'That schedule already exists for this subject.' : 'That name already exists in this list.');
        let it = DB.mt[k].find(x => x.id === id); const isNew = !it, old = it ? {...it} : null;
        if (old && k === 'sched' && old.subj !== ex.subj && mtUse(k, old.n, old)) return merr('This schedule is in use, so its subject cannot be changed.');
        if (isNew) {it = {id: Math.max(0, ...DB.mt[k].map(x => x.id)) + 1}; DB.mt[k].push(it)}
        Object.assign(it, {n, on: val('m4') === 'Active' ? 1 : 0}, ex); if (k === 'dept') it.full = val('m2') || n; if (k === 'req') it.for = val('m3');
        if (!mtOk(k)) {if (isNew) DB.mt[k].pop(); else Object.assign(it, old); return merr(k === 'req' ? 'Keep at least one active request type for Students and one for Faculty.' : 'Keep at least one active item in this list.')}
        let c = 0;
        if (old) {
            if (k === 'sched') {if (old.n !== n) schRecs(DB).forEach(x => {if (x.title === old.subj && x.sched === old.n) {x.sched = n; c++}})}
            else if (k === 'subj') {
                if (old.n !== n) DB.mt.sched.forEach(x => {if (x.subj === old.n) x.subj = n});
                schRecs(DB).forEach(x => {if (x.title === old.n) {x.title = n; x.code = it.code; x.units = it.units; c++}});
                DB.wl.forEach(w => {if (w.title === n) w.dept = it.dept}); DB.stu.forEach(x => x.enr.forEach(e => {if (!e.nosub && (e.subs || []).some(y => y.title === n)) sumU(e)}));
            } else if (old.n !== n) {const f = MTK[k][1]; MTK[k][0](DB).forEach(x => {if (x[f] === old.n) {x[f] = n; if (k === 'req') x.subj = n; c++}})}
        }
        save(); render(); toast(isNew ? 'Item added' : c ? `Updated · ${c} record(s) updated` : 'Item updated')
    },
    mtx(v) {const k = mtTab, it = DB.mt[k].find(x => x.id === +v.v); if (!it) return; it.on = it.on ? 0 : 1; if (!mtOk(k)) {it.on = it.on ? 0 : 1; return toast('Keep at least one active item in this list')} save(); render(); toast(it.n + (it.on ? ' activated' : ' deactivated'))},
    mtd(v) {const it = DB.mt[mtTab].find(x => x.id === +v.v); if (!it) return; if (mtUse(mtTab, it.n, it)) return toast('This item is in use and cannot be deleted'); confirmM(`Delete <b>${esc(it.n)}</b>? This cannot be undone.`, 'mtc', v.v)},
    mtc(v) {const k = mtTab, it = DB.mt[k].find(x => x.id === +v.v); if (!it || mtUse(k, it.n, it)) return; DB.mt[k] = DB.mt[k].filter(x => x !== it); if (!mtOk(k)) {DB.mt[k].push(it); render(); return toast('Keep at least one active item in this list')} save(); render(); toast('Item deleted')},
    cm: closeModal, phk() {$('#photo').click()}, phr() {delete U().photo; save(); render(); toast('Photo removed')}, fd(v) {sub = {fd: v.v}; render(); scrollTo(0, 0)}, fb() {sub = null; render()}, wd(v) {confirmM('Delete this workload assignment?', 'wdc', v.v)}, wdc(v) {DB.wl = DB.wl.filter(w => w.id !== +v.v); save(); render(); toast('Workload deleted')}, burger() {const o = document.body.classList.toggle('nav'); $('#burger').setAttribute('aria-expanded', o)},
    nav: (v) => navTo(v.v), go: v => navTo(v.v),
    out() {role = null; uid = null; term = 0; view = 'login'; try {sessionStorage.removeItem('sch.role'); sessionStorage.removeItem('sch.uid')} catch (e) { } render()},
    lv(v) {view = v.v; render()}, eye(v, b) {const i = $('#lp'); i.type = i.type === 'password' ? 'text' : 'password'; b.textContent = i.type === 'password' ? 'Show' : 'Hide'},
    fill(v) {const a = accts().find(x => x.r === v.v && (v.v !== 'faculty' || x.id === 'F-0012')); $('#lu').value = a.u; $('#lp').value = a.p},
    login() {
        const u = $('#lu').value.trim().toLowerCase(), p = $('#lp').value, m = $('#le'); if (!u || !p) {m.textContent = 'Enter your email or username and your password.'; return }
        const a = accts().find(x => (x.u.toLowerCase() === u || x.u.split('@')[0].toLowerCase() === u) && x.p === p); if (!a) {m.textContent = 'Invalid username or password.'; return }
        if (a.st === 'Inactive') {m.textContent = 'This account is inactive. Please contact the Administration Office.'; return }
        role = a.r; uid = a.id; term = 0; page = 'dash'; sub = null; try {sessionStorage.setItem('sch.role', role); sessionStorage.setItem('sch.uid', uid)} catch (e) { } render(); toast('Signed in as ' + NAMES[role])
    },
    forgot() {const e = $('#fe').value.trim(), m = $('#fm'); if (!emailOk(e)) {m.className = 'err'; m.textContent = 'Enter a valid email address.'; return } m.className = 'okm'; m.textContent = 'If this email is registered, please contact the Administration Office to recover or reset your password. (Demo only: no email is sent.)'},
    rmf(v) {const [id, k] = v.v.split('|'); if (k === '~s') TS[id].s = null; else delete TS[id].f[k]; drawT(id)},
    clr(v) {TS[v.v] = {q: TS[v.v].q, f: {}, s: null}; drawT(v.v)},
    cat(v) {annCat = v.v; $$('.pl').forEach(b => b.classList.toggle('on', b.dataset.v === annCat)); drawAnn()},
    av(v) {
        const a = DB.anns.find(x => x.id === +v.v); if (!a) return; if (role !== 'admin' && !rdl().includes(a.id)) {rdl().push(a.id); save()}
        modal(`<h2>${esc(a.t)}</h2><p class="mu">${esc(a.o)} · ${esc(a.d)} · ${a.cat} · Audience: ${a.aud}${role === 'admin' ? ' · ' + sx(a.st) : ''}</p><p>${esc(a.b)}</p>${a.f ? `<p><button class="lk" data-a="att" data-v="${a.id}">📎 ${esc(a.f)}</button></p>` : ''}<div class="acts"><button class="btn sec" data-a="cm">Close</button></div>`); if (role !== 'admin') refreshKeep()
    },
    att(v) {const a = DB.anns.find(x => x.id === +v.v); if (!a || !a.f) return; const u = URL.createObjectURL(mkPdf(a.t, [a.o + ' - ' + a.d + ' - ' + a.cat, '', a.b])), l = document.createElement('a'); l.href = u; l.download = a.f; document.body.appendChild(l); l.click(); l.remove(); setTimeout(() => URL.revokeObjectURL(u), 4000); toast('Downloading ' + a.f)},
    /* profile */
    pw() {modal(`<h2>Your Password</h2><p class="mu">This is your current password. Keep it private.</p>${kv([['Current password', mono(U().pw)]])}<div class="acts"><button class="btn sec" data-a="cm">Close</button><button class="btn" data-a="pwe">Edit password</button></div>`)},
    pwe() {modal(`<h2>Edit Password</h2>${fld('New Password', 'p1', '', 'type="password" autocomplete="new-password"')}${fld('Confirm Password', 'p2', '', 'type="password" autocomplete="new-password"')}<p class="mu" style="font-size:12px">At least 8 characters with uppercase, lowercase and a number.</p>${acts('pws', 'Save password')}`)},
    pws() {const u = U(), n = val('p1'), c = val('p2'); if (!pwOk(n)) return merr('New password needs 8+ characters with uppercase, lowercase and a number.'); if (n === u.pw) return merr('New password must differ from the current one.'); if (n !== c) return merr('Passwords do not match.'); u.pw = n; save(); closeModal(); toast('Password updated')},
                ph() {modal(`<h2>Change Contact Number</h2>${fld('Contact Number', 'ph0', U().phone, 'type="tel"')}${acts('phs', 'Change Number')}`)},
    phs() {const p = val('ph0'); if (!phoneOk(p)) return merr('Enter a valid PH mobile number, e.g. +63 917 555 0184.'); U().phone = p; save(); closeModal(); render(); toast('Contact number updated')},
    pe() {const u = U(); modal(`<h2>Edit Profile</h2><div class="g2">${fld('Full Name', 'e1', u.name)}${fld('Admin ID · restricted', 'e2', u.id, 'disabled')}${fld('Email Address', 'e3', u.email, 'type="email"')}${fld('Contact Number', 'e4', u.phone)}${fld('Role', 'e5', u.role)}${fld('Password', 'e6', '', 'type="password" placeholder="Enter new password (optional)" autocomplete="new-password"')}${fld('Department', 'e7', u.dept)}</div>${acts('pes', 'Save changes')}`, 1)},
    pes() {const n = val('e1'), e = val('e3'), p = val('e4'); if (!n) return merr('Full name is required.'); if (!emailOk(e)) return merr('Enter a valid email address.'); if (emailTaken(e.toLowerCase(), 'A-001')) return merr('That email is already used by another account.'); if (!phoneOk(p)) return merr('Enter a valid PH mobile number.'); const ro = val('e5'), de = val('e7'), pw = val('e6'); if (!ro || !de) return merr('Role and department are required.'); if (pw && !pwOk(pw)) return merr('Password needs 8+ characters with uppercase, lowercase and a number.'); Object.assign(U(), {name: n, short: n, email: e, phone: p, role: ro, dept: de}); const ac = DB.acc.find(x => x.r === 'admin'); ac.u = e.toLowerCase(); if (pw) ac.p = pw; save(); closeModal(); render(); toast('Profile updated')},
    /* requests */
    rn() {modal(`<h2>Submit Service Request</h2><p class="mu">Tell the administrative office what you need.</p>${sel('Request type', 'rt', reqTypes(), reqTypes()[0])}<label>Description<textarea id="rd" rows="4" placeholder="Describe your request"></textarea></label>${fld('Attachment (optional)', 'rf', '', 'type="file"')}${acts('rns', 'Submit Request')}`)},
    rns() {
        const d = val('rd'); if (d.length < 10) return merr('Please describe your request (at least 10 characters).'); const n = Math.max(...DB.reqs.map(r => +r.id.slice(3))) + 1, t = val('rt');
        DB.reqs.push({id: 'SR-' + String(n).padStart(4, '0'), who: U().name, role: role === 'student' ? 'Student' : 'Faculty', uid, type: t, subj: t, desc: d, date: fd(new Date()), st: 'Pending'}); save(); closeModal(); render(); toast('Request submitted')
    },
    rq(v) {
        const r = DB.reqs.find(x => x.id === v.v); if (!r) return; const adm = role === 'admin';
        modal(`<h2>${esc(r.type)}</h2>${adm ? kv([['Requester', `${esc(reqWho(r))} (${r.role})`]]) : ''}${kv([['Description', esc(r.desc)], ['Date submitted', r.date], ['Status', sx(r.st)]])}<div class="acts"><button class="btn sec" data-a="cm">Close</button>${adm ? '' : `<button class="btn dng" data-a="rdl" data-v="${r.id}">Delete</button>`}</div>`)
    },
    rdl(v) {confirmM(`Delete request <b>${esc(v.v)}</b>? This cannot be undone.`, 'rdc', v.v)},
    rdc(v) {DB.reqs = DB.reqs.filter(r => r.id !== v.v); save(); render(); toast('Request deleted')},
    /* students */
    sa() {stuForm()}, sv(v) {const s = DB.stu.find(x => x.id === v.v); modal(`<h2>${esc(s.name)}</h2>${kv([['Student ID', s.id], ['Email', esc(s.email)], ['Program', s.prog], ['Year level', s.yr], ['Status', sx(s.st)]])}<div class="acts"><button class="btn sec" data-a="cm">Close</button><button class="btn" data-a="se" data-v="${s.id}">Edit</button></div>`)},
    se(v) {sub = {sd: v.v, t: 0}; render(); scrollTo(0, 0)}, sf(v) {stuForm(DB.stu.find(x => x.id === v.v))},
    sss(v) {
        const o = v.v, n = val('s1'), id = val('s2'), pr = val('s3'), y = val('s4'), st = val('s5'), e = val('s6').toLowerCase(), pw = val('s7'); if (!n) return merr('Name is required.'); if (!/^\d{4}-\d{5}$/.test(id)) return merr('Student ID must look like 2024-01234.'); if (DB.stu.some(s => s.id === id && s.id !== o)) return merr('That Student ID already exists.');
        if (!emailOk(e)) return merr('Enter a valid email address.'); if (emailTaken(e, o)) return merr('That email is already used by another account.'); if (!pwOk(pw)) return merr('Password needs 8+ characters with uppercase, lowercase and a number.');
        let s = DB.stu.find(x => x.id === o); const isNew = !s; if (isNew) {s = {phone: '', enr: mkEnr(st, y, id)}; DB.stu.push(s)}
        Object.assign(s, {name: n, id, prog: pr, yr: y, st, email: e, pw}); if (!isNew && o !== id) {reid(o, id); if (sub && sub.sd === o) sub.sd = id} if (s.enr[0]) s.enr[0].yl = y; save(); closeModal(); render(); toast(isNew ? 'Student added' : 'Student updated')
    },
    ee() {const s = curS(), e = curE(); modal(`<h2>Edit Enrollment</h2><p class="mu">${esc(s.name)} · ${esc(e.term)}</p>${sel('Enrollment status', 'n1', OPT.enrSt, e.st)}${fld('Registration date', 'n4', e.date || '', 'placeholder="10 Aug 2026"')}${fld('Enrollment reference', 'n5', e.ref || '')}${acts('ees', 'Save')}`, 1)},
    ees() {
        const s = curS(), t = sub.t || 0, e = s.enr[t], st = val('n1'), d = val('n4'), r = val('n5');
        if (st === 'Enrolled' && pd(d) == null) return merr('Enter the registration date like 10 Aug 2026.');
        Object.assign(e, {st, date: d, ref: r || (st === 'Enrolled' ? enrRef(d, s.id) : '')});
        if (t === 0) {if (st === 'Enrolled' && s.st === 'Pending') s.st = 'Enrolled'; if (st === 'Pending' && s.st === 'Enrolled') s.st = 'Pending'} save(); closeModal(); render(); toast('Enrollment updated')
    },
    ea() {const s = curS(); modal(`<h2>Add Enrollment</h2><p class="mu">${esc(s.name)}</p>${selx('Academic year', 'e1', OPT.ay, '', 'Select academic year')}${selx('Academic term', 'e2', [], '', 'Select academic year first', 1)}${sel('Enrollment status', 'e3', OPT.enrSt, 'Pending')}${acts('eas', 'Add enrollment')}`, 1)},
    eas() {
        const s = curS(), ay = val('e1'), sem = val('e2'), st = val('e3');
        if (!ay) return merr('Choose the academic year first.'); if (!sem) return merr('Choose the academic term.');
        if (s.enr.some(x => x.ay === ay && x.sem === sem)) return merr('This student already has an enrollment record for that term.');
        const rec = {term: ay + ' · ' + sem, ay, sem, st, units: 0, date: st === 'Enrolled' ? fd(new Date()) : '', ref: 'ENR-' + ay.slice(0, 4) + '-' + String(Math.floor(Math.random() * 900000) + 100000), yl: s.yr, subs: []};
        const key = x => parseInt(x.ay) * 10 + OPT.terms.indexOf(x.sem) + 1; let i = s.enr.findIndex(x => key(x) < key(rec)); if (i < 0) i = s.enr.length;
        s.enr.splice(i, 0, rec); sub.t = i; save(); closeModal(); render(); toast('Enrollment record added')
    },
    ua() {subForm()}, ue(v) {subForm(curE().subs.find(x => x.id === +v.v))}, ud(v) {confirmM('Remove this subject from the enrollment?', 'udc', v.v, 'Remove')},
    udc(v) {const e = curE(); e.subs = e.subs.filter(x => x.id !== +v.v); sumU(e); save(); render(); toast('Subject removed')},
    uss(v) {
        const e = curE(), o = +v.v, ti = val('u3'), sj = DB.mt.subj.find(x => x.n === ti), sc = val('u4'), rm = val('u5');
        if (!sj) return merr('Choose a subject title.'); if (!sc) return merr('Choose a schedule.'); if (!rm) return merr('Choose a room.');
        e.subs = e.subs || []; if (e.subs.some(x => x.id !== o && x.title === ti)) return merr('This subject is already in the enrollment.');
        if (e.subs.some(x => x.id !== o && ovl(x.sched, sc))) return merr('This schedule overlaps another subject of the student.');
        const rec = {id: o || Math.max(0, ...e.subs.map(x => x.id)) + 1, code: sj.code, title: sj.n, units: sj.units, sched: sc, room: rm}, i = e.subs.findIndex(x => x.id === o); i < 0 ? e.subs.push(rec) : e.subs[i] = rec; sumU(e); save(); closeModal(); render(); toast(i < 0 ? 'Subject added' : 'Subject updated')
    },
    apw(v) {const r = v.v === 's' ? curS() : curF(); modal(`<h2>Reset Password</h2><p class="mu">${esc(r.name)}</p>${kv([['Current password', mono(r.pw)]])}${fld('New password', 'ap1', '', 'autocomplete="off"')}<p class="mu" style="font-size:12px">At least 8 characters with uppercase, lowercase and a number.</p>${acts('apws', 'Save password').replace('data-a="apws"', `data-a="apws" data-v="${v.v}"`)}`)},
    apws(v) {const r = v.v === 's' ? curS() : curF(), n = val('ap1'); if (!pwOk(n)) return merr('Password needs 8+ characters with uppercase, lowercase and a number.'); r.pw = n; save(); closeModal(); render(); toast('Password updated')},
    aphr(v) {delete (v.v === 's' ? curS() : curF()).photo; save(); render(); toast('Photo removed')},
    /* faculty + workload */
    fa() {facForm()}, fv(v) {const f = DB.fac.find(x => x.no === v.v); modal(`<h2>${esc(f.name)}</h2>${kv([['Faculty No.', f.no], ['Email', esc(f.email)], ['Department', f.dept], ['Rank', f.rank], ['Position', f.pos], ['Assigned units', fUnits(f.no)], ['Status', sx(f.st)]])}<div class="acts"><button class="btn sec" data-a="cm">Close</button><button class="btn" data-a="fe" data-v="${f.no}">Edit</button></div>`)},
    fe(v) {A.fd(v)}, ff(v) {facForm(DB.fac.find(x => x.no === v.v))},
    fss(v) {
        const o = v.v, n = val('f1'), no = val('f2'), e = val('f7').toLowerCase(), pw = val('f8'); if (!n) return merr('Name is required.'); if (!/^F-\d{4}$/.test(no)) return merr('Faculty No. must look like F-0012.'); if (DB.fac.some(f => f.no === no && f.no !== o)) return merr('That Faculty No. already exists.');
        if (!emailOk(e)) return merr('Enter a valid email address.'); if (emailTaken(e, o)) return merr('That email is already used by another account.'); if (!pwOk(pw)) return merr('Password needs 8+ characters with uppercase, lowercase and a number.');
        let f = DB.fac.find(x => x.no === o); const isNew = !f; if (isNew) {f = {phone: ''}; DB.fac.push(f)}
        Object.assign(f, {name: n, no, dept: val('f3'), rank: val('f4'), pos: val('f5'), st: val('f6'), email: e, pw}); if (!isNew && o !== no) {DB.wl.forEach(w => {if (w.no === o) w.no = no}); reid(o, no); if (sub && sub.fd === o) sub.fd = no} save(); closeModal(); render(); toast(isNew ? 'Faculty added' : 'Faculty updated')
    },
                wa() {wlForm()}, wv(v) {const w = DB.wl.find(x => x.id === +v.v); modal(`<h2>${w.code} ${esc(w.title)}</h2>${kv([['Faculty', esc(facName(w.no)) + ' (' + w.no + ')'], ['Department', w.dept], ['Academic term', w.sem + ' ' + w.ay], ['Section · Room', w.sec + ' · ' + w.room], ['Schedule', w.sched], ['Units', w.units], ['Status', sx(w.st)]])}<div class="acts"><button class="btn sec" data-a="cm">Close</button><button class="btn" data-a="we" data-v="${w.id}">Edit</button></div>`)},
    we(v) {wlForm(DB.wl.find(x => x.id === +v.v))},
    wss(v) {
        const o = +v.v, old = DB.wl.find(w => w.id === o), no = old ? old.no : sub.fd, ay = val('w10'), sm = val('w11'), ti = val('w3'), sj = DB.mt.subj.find(x => x.n === ti), sc = val('w5'), sec = val('w8'), rm = val('w9'), st = val('w7');
        if (!ay) return merr('Choose the academic year first.'); if (!sm) return merr('Choose the academic term.');
        if (!sj) return merr('Choose a subject title.'); if (!sc) return merr('Choose a schedule.'); if (!sec) return merr('Choose a section.'); if (!rm) return merr('Choose a room.');
        if (st !== 'Rejected' && st !== 'Cancelled' && DB.wl.some(w => w.id !== o && w.no === no && w.ay === ay && w.sem === sm && w.st !== 'Rejected' && w.st !== 'Cancelled' && ovl(w.sched, sc))) return merr('This faculty member already has a class at an overlapping schedule in that term.');
        const rec = {id: o || Math.max(0, ...DB.wl.map(w => w.id)) + 1, no, code: sj.code, title: sj.n, dept: val('w6'), units: sj.units, sched: sc, st, sec, room: rm, ay, sem: sm}, i = DB.wl.findIndex(w => w.id === o); i < 0 ? DB.wl.push(rec) : DB.wl[i] = rec; if (sub) sub.wt = tkey(rec); save(); closeModal(); render(); toast(i < 0 ? 'Workload added' : 'Workload updated')
    },
    /* announcements admin */
    an() {sub = {f: 1, id: 0}; render()}, ae(v) {sub = {f: 1, id: +v.v}; render()},
    ad(v) {confirmM('Delete this announcement?', 'adc', v.v)}, adc(v) {DB.anns = DB.anns.filter(a => a.id !== +v.v); save(); render(); toast('Announcement deleted')},
    asv() {
        const t = $('#at').value.trim(), b = $('#ab').value.trim(), m = $('input[name=pm]:checked').value, d = $('#ad').value, e = $('#aerr');
        if (!t) return e.textContent = 'Title is required.'; if (!b) return e.textContent = 'Content is required.'; if (m === 'Scheduled' && !d) return e.textContent = 'Pick a date and time to schedule.'; if (m === 'Scheduled' && new Date(d) < new Date()) return e.textContent = 'Scheduled time must be in the future.';
        const dt = m === 'Published' ? fd(new Date(), 0) : m === 'Scheduled' ? fd(new Date(d), 0) : '—', f = ($('#afl').files[0] || {}).name || '';
        const rec = {t, cat: $('#ac').value, aud: $('#au').value, b, st: m, d: dt, o: U().name}; if (sub.id) {const a = DB.anns.find(x => x.id === sub.id); Object.assign(a, rec, {f: f || a.f})} else DB.anns.push({id: Math.max(0, ...DB.anns.map(a => a.id)) + 1, f, ...rec});
        save(); sub = null; page = 'ann'; render(); toast(m === 'Published' ? 'Announcement published' : m === 'Draft' ? 'Saved as draft' : 'Announcement scheduled')
    },
    /* reports */
    fo(v) {folder = v.v; render()}, ra() {repForm()}, rv(v) {const r = DB.rep.find(x => x.id === +v.v); modal(`<h2>${esc(r.n)}</h2>${kv([['Owner', esc(r.o)], ['Updated', r.d], ['Folder', r.f], ['Status', sx(r.st)], ['Summary', esc(r.b)]])}<div class="acts"><button class="btn sec" data-a="cm">Close</button><button class="btn" data-a="re" data-v="${r.id}">Edit</button></div>`)},
    re(v) {repForm(DB.rep.find(x => x.id === +v.v))},
    rss(v) {const o = +v.v, n = val('r1'); if (!n) return merr('Report name is required.'); const rec = {id: o || Math.max(0, ...DB.rep.map(r => r.id)) + 1, n, o: val('r2') || U().name, d: fd(new Date()), st: val('r3'), f: val('r4'), b: val('r5')}, i = DB.rep.findIndex(r => r.id === o); i < 0 ? DB.rep.push(rec) : DB.rep[i] = rec; save(); closeModal(); render(); toast(i < 0 ? 'Report created' : 'Report updated')}
};
const reqTypes = () => mtReq(role === 'student' ? 'Student' : 'Faculty');
const stuForm = s => {const o = s || {name: '', id: '', prog: mtD('prog', 'BS Information Technology'), yr: '1st Year', st: 'Enrolled', email: '', pw: 'Student@123'}; modal(`<h2>${s ? 'Edit' : 'Add'} Student</h2><div class="g2">${fld('Full name', 's1', o.name)}${fld('Student ID', 's2', o.id, 'placeholder="2024-01234"')}${fld('Email address', 's6', o.email, 'type="email"')}${fld('Password', 's7', o.pw)}${sel('Program', 's3', mtA('prog'), o.prog)}${sel('Year level', 's4', YR, o.yr)}${sel('Status', 's5', OPT.stuSt, o.st)}</div>${acts('sss', 'Save').replace('data-a="sss"', `data-a="sss" data-v="${s ? s.id : ''}"`)}`, 1)};
const facForm = f => {const o = f || {name: 'Prof. ', no: '', dept: mtD('dept', 'Computing'), rank: 'Instructor', pos: 'Full-time Faculty', st: 'Active', email: '', pw: 'Faculty@123'}; modal(`<h2>${f ? 'Edit' : 'Add'} Faculty</h2><div class="g2">${fld('Full name', 'f1', o.name)}${fld('Faculty No.', 'f2', o.no, 'placeholder="F-0000"')}${fld('Email address', 'f7', o.email, 'type="email"')}${fld('Password', 'f8', o.pw)}${sel('Department', 'f3', OPT.dept, o.dept)}${sel('Rank', 'f4', OPT.rank, o.rank)}${sel('Position', 'f5', OPT.pos, o.pos)}${sel('Status', 'f6', OPT.facSt, o.st)}</div>${acts('fss', 'Save').replace('data-a="fss"', `data-a="fss" data-v="${f ? f.no : ''}"`)}`, 1)};
const subForm = x => {
    const e = curE(), taken = (e.subs || []).filter(y => y !== x).map(y => y.title), o = x || {id: 0, code: '', title: '', units: '', sched: '', room: ''}; FSELF = x || null;
    const sc = o.title ? schedFor(o.title) : [], rs = o.title && o.sched ? roomsFree(o.title, o.sched, '', FSELF, curE()) : [];
    modal(`<h2>${x ? 'Edit' : 'Add'} Subject</h2>${selx('Subject title', 'u3', mtA('subj').filter(t => !taken.includes(t)), o.title, 'Select subject')}<div class="g2">${fld('Subject code', 'u1', o.code, 'disabled')}${fld('Units', 'u2', o.units, 'disabled')}</div>${selx('Schedule', 'u4', sc, o.sched, o.title ? (sc.length ? 'Select schedule' : 'No schedules available') : 'Select a subject first', !sc.length && !o.sched)}${selx('Room', 'u5', rs, o.room, o.sched ? (rs.length ? 'Select room' : 'No rooms available') : 'Select a schedule first', !rs.length && !o.room)}${acts('uss', 'Save').replace('data-a="uss"', `data-a="uss" data-v="${o.id}"`)}`)
};
const wlForm = w => {
    const no = w ? w.no : sub.fd, f = DB.fac.find(x => x.no === no) || {name: no}, t0 = splitT(sub && sub.wt ? sub.wt : tkey(CURT)), o = w || {id: 0, no, code: '', title: '', dept: mtD('dept', 'Computing'), units: '', sched: '', st: 'Pending', sec: '', room: '', ay: t0.ay, sem: t0.sem}; FSELF = w || null;
    const sc = o.title ? schedFor(o.title) : [], rs = o.title && o.sched ? roomsFree(o.title, o.sched, o.sec, FSELF, o) : [];
    modal(`<h2>${w ? 'Edit' : 'Add'} Workload</h2><p class="mu">${esc(f.name)} · ${no}</p><div class="g2">${selx('Academic year', 'w10', OPT.ay, o.ay, 'Select academic year')}${selx('Academic term', 'w11', o.ay ? OPT.terms : [], o.sem, o.ay ? 'Select academic term' : 'Select academic year first', !o.ay)}</div>${selx('Subject title', 'w3', mtA('subj'), o.title, 'Select subject')}<div class="g2">${fld('Subject code', 'w2', o.code, 'disabled')}${fld('Units', 'w4', o.units, 'disabled')}</div>${selx('Schedule', 'w5', sc, o.sched, o.title ? (sc.length ? 'Select schedule' : 'No schedules available') : 'Select a subject first', !sc.length && !o.sched)}<div class="g2">${sel('Department', 'w6', OPT.dept, o.dept)}${sel('Status', 'w7', OPT.wlSt, o.st)}${selx('Section', 'w8', mtA('sect'), o.sec, 'Select section')}${selx('Room', 'w9', rs, o.room, o.sched ? (rs.length ? 'Select room' : 'No rooms available') : 'Select a schedule first', !rs.length && !o.room)}</div>${acts('wss', 'Save').replace('data-a="wss"', `data-a="wss" data-v="${o.id}"`)}`, 1)
};
const repForm = r => {const o = r || {id: 0, n: '', o: U().name, st: 'Draft', f: 'Registrar', b: ''}; modal(`<h2>${r ? 'Edit' : 'Create'} Report</h2>${fld('Report name', 'r1', o.n)}${fld('Owner', 'r2', o.o)}<div class="g2">${sel('Status', 'r3', ['Draft', 'In review', 'Final', 'Archived'], o.st)}${sel('Folder', 'r4', ['Registrar', 'Student Affairs', 'Operations', 'Drafts'], o.f)}</div><label>Summary<textarea id="r5" rows="3">${esc(o.b)}</textarea></label>${acts('rss', 'Save').replace('data-a="rss"', `data-a="rss" data-v="${o.id}"`)}`)};
const mkPdf = (title, lines) => {
    const e = s => String(s).replace(/[^\x20-\x7E]/g, '-').replace(/[\\()]/g, '\\$&'), wr = s => String(s).match(/.{1,85}(\s|$)/g) || [''];
    let c = 'BT /F1 18 Tf 56 780 Td (' + e(title) + ') Tj ET\nBT /F1 11 Tf 56 750 Td 16 TL\n'; lines.forEach(l => wr(l).forEach(w => {c += '(' + e(w.trim()) + ') Tj T*\n'})); c += 'ET';
    const o = ['<</Type/Catalog/Pages 2 0 R>>', '<</Type/Pages/Kids[3 0 R]/Count 1>>', '<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 842]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>', '<</Length ' + c.length + '>>\nstream\n' + c + '\nendstream', '<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>'];
    let p = '%PDF-1.4\n'; const x = []; o.forEach((t, i) => {x.push(p.length); p += (i + 1) + ' 0 obj\n' + t + '\nendobj\n'}); const xr = p.length;
    p += 'xref\n0 ' + (o.length + 1) + '\n0000000000 65535 f \n' + x.map(n => String(n).padStart(10, '0') + ' 00000 n \n').join('') + 'trailer\n<</Size ' + (o.length + 1) + '/Root 1 0 R>>\nstartxref\n' + xr + '\n%%EOF'; return new Blob([p], {type: 'application/pdf'})
};
const refreshKeep = () => {if (page === 'ann') drawAnn()};
