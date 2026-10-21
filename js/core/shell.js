
/* Shell: navigation, render(), login view */
'use strict';

/* ---------- shell ---------- */

const PAGES = () =>
    role === 'admin'
        ? {
            dash: 'dash',
            stu: 'stu',
            fac: 'fac',
            ann: 'annA',
            req: 'rq',
            rep: 'rep',
            mt: 'mt'
        }
        : {
            dash: 'dash',
            prof: 'prof',
            enr: 'enr',
            load: 'load',
            ann: 'ann',
            req: 'req'
        };

const navTo = k => {
    page = k;
    sub = null;

    Object.keys(TS).forEach(k => delete TS[k]);

    folder = 'All';
    closeNav();
    render();
};

function render() {
    closeMenu();
    closeModal();

    Object.keys(T).forEach(k => delete T[k]);

    document.body.classList.toggle('in-login', !role);
    document.body.dataset.role = role || '';
    document.body.classList.remove('nav');

    const root = $('#root');

    if (!role) {
        root.innerHTML = loginView();
        return;
    }

    const key = sub && sub.f
        ? 'annF'
        : sub && sub.sd
            ? 'stuD'
            : sub && sub.fd
                ? 'facD'
                : PAGES()[page] || 'dash';

    const cur = page;

    root.innerHTML = `
        <header class="tb">
            <button
                id="burger"
                aria-label="Toggle navigation"
                aria-expanded="false"
                data-a="burger"
            >☰</button>
            <span class="lg">${CAP}</span>
            <b>Smart Campus Hub</b>
        </header>

        <div class="app">
            <aside class="sb ${role}" id="sb">
                <small>${NAMES[role].toUpperCase()} PORTAL</small>

                <nav>
                    ${NAV[role].map(n => `
                        <button
                            class="${n[0] === cur ? 'on' : ''}"
                            data-a="nav"
                            data-v="${n[0]}"
                        >
                            ${ic(n[2])}${n[1]}
                        </button>
                    `).join('')}
                </nav>

                <button class="out" data-a="out">
                    ${ic('out')}Log Out
                </button>
            </aside>

            <div class="bd" data-a="burger"></div>

            <main class="${role}" id="main">
                ${P[key]()}
            </main>
        </div>
    `;

    drawAll();
    drawAnn();

    $$('[data-q]').forEach(i => {
        const t = TS[i.dataset.q.split(',')[0]];

        if (t && t.q) {
            i.value = t.q;
        }
    });
}

const closeNav = () => {
    document.body.classList.remove('nav');

    const b = $('#burger');

    if (b) {
        b.setAttribute('aria-expanded', 'false');
    }
};

const CAP = '<svg class="ic fl" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4 1.5 9.5 12 15l10.5-5.5z"/><path d="M6 13v4c0 1.6 2.7 3 6 3s6-1.4 6-3v-4l-6 3.2z"/><rect x="2.2" y="10" width="1.2" height="5" rx=".6"/></svg>';

const ART = '<svg viewBox="0 0 667 476" preserveAspectRatio="xMidYMax meet" aria-hidden="true"><rect x="-2000" y="360" width="4667" height="116" fill="#173B66"/><path d="M135 159 331 76l197 83z" fill="#1E3E7A"/><circle cx="331" cy="119" r="11" fill="#4562A0"/><rect x="154" y="159" width="354" height="172" fill="#1A3A66"/><rect x="181" y="171" width="21" height="142" fill="#4562A0"/><rect x="246" y="171" width="21" height="142" fill="#4562A0"/><rect x="310" y="171" width="21" height="142" fill="#4562A0"/><rect x="374" y="171" width="21" height="142" fill="#4562A0"/><rect x="439" y="171" width="21" height="142" fill="#4562A0"/><rect x="132" y="331" width="398" height="14" fill="#4562A0"/><rect x="111" y="345" width="441" height="15" fill="#4562A0"/><rect x="90" y="318" width="8" height="42" fill="#1E3E7A"/><ellipse cx="94" cy="265" rx="48" ry="53" fill="#1E3E7A"/><rect x="578" y="318" width="8" height="42" fill="#1E3E7A"/><ellipse cx="583" cy="259" rx="53" ry="59" fill="#1E3E7A"/></svg>';

function loginView() {
    const f = view === 'forgot';

    return `
        <header class="tb">
            <span class="lg">${CAP}</span>
            <b>Smart Campus Hub</b>
        </header>

        <div class="login">
            <div class="lb">
                <div class="lbr">
                    <span class="lg">${CAP}</span>
                    Smart Campus Hub
                </div>

                ${f
                    ? '<h2>Forgot your password?</h2><p>Enter your registered email address and we will help you reset it.</p>'
                    : '<h2>Welcome to your campus hub</h2><p>One place for records, workload, announcements and service requests.</p>'
                }

                <div class="lart">${ART}</div>
            </div>

            <div class="lf">
                <div class="lc">
                    ${f
                        ? `
                            <h2>Forgot password</h2>

                            <p class="mu">
                                Enter your campus email and we will send a reset link.
                            </p>

                            ${fld(
                                'Campus email',
                                'fe',
                                '',
                                'type="email" placeholder="name@campus.edu" autocomplete="email"'
                            )}

                            <div class="err" id="fm" role="alert"></div>

                            <button class="btn wide" data-a="forgot">
                                Send reset link
                            </button>

                            <p style="text-align:center">
                                <button
                                    class="lk"
                                    data-a="lv"
                                    data-v="login"
                                    style="text-decoration:none"
                                >
                                    ← Back to sign in
                                </button>
                            </p>
                        `
                        : `
                            <h2>Welcome back</h2>

                            <p class="mu">
                                Use your campus credentials. Access is tailored to your assigned role.
                            </p>

                            ${fld(
                                'Email or username',
                                'lu',
                                '',
                                'placeholder="name@campus.edu" autocomplete="username"'
                            )}

                            ${fld(
                                'Password',
                                'lp',
                                '',
                                'type="password" placeholder="••••••••" autocomplete="current-password"'
                            )}

                            <div class="err" id="le" role="alert"></div>

                            <button class="btn wide" data-a="login">
                                Sign in to portal
                            </button>

                            <p style="text-align:center">
                                <button class="lk" data-a="lv" data-v="forgot">
                                    Forgot password?
                                </button>
                            </p>

                            <div class="note">
                                Demo accounts (click to fill):
                                ${[
                                    ['student', 'Student'],
                                    ['faculty', 'Faculty'],
                                    ['admin', 'Admin']
                                ].map(a => `
                                    <button
                                        class="lk"
                                        data-a="fill"
                                        data-v="${a[0]}"
                                    >${a[1]}</button>
                                `).join(' · ')}
                            </div>
                        `
                    }
                </div>
            </div>
        </div>
    `;
}
