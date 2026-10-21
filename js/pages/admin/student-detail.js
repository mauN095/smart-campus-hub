
/* Admin screen: Student Detail */
'use strict';

const adminStudentDetail = () => {
    const x = curS();

    if (!x) {
        sub = null;
        return P.stu();
    }

    const t = sub.t || 0;
    const e = x.enr[t] || x.enr[0];

    return `
        <div class="top">
            <div class="l">
                <button
                    class="btn sec"
                    data-a="fb"
                >
                    ← Back
                </button>

                <h1>${esc(x.name)}</h1>
            </div>

            <button
                class="btn sec"
                data-a="sf"
                data-v="${x.id}"
            >
                Edit student info
            </button>
        </div>

        <div class="c pf">
            ${avatar(x)}

            <div class="pi">
                <h2>${esc(x.name)}</h2>

                <span class="mu">
                    Student ID ${x.id} ·
                </span>

                ${pill(x.st)}

                ${x.photo ? `
                    <div class="pc">
                        <button
                            class="btn sec sm"
                            data-a="aphr"
                            data-v="s"
                        >
                            Remove photo
                        </button>
                    </div>
                ` : ''}
            </div>
        </div>

        <h3>Student Information</h3>

        <div class="c">
            <div class="kg3 d">
                ${kv([
                    [
                        'Full Name',
                        esc(x.name)
                    ],
                    [
                        'Student ID',
                        x.id
                    ],
                    [
                        'Email Address',
                        esc(x.email)
                    ],
                    [
                        'Course/Program',
                        esc(x.prog)
                    ],
                    [
                        'Year Level',
                        x.yr
                    ],
                    [
                        'Status',
                        sx(x.st)
                    ],
                    [
                        'Password',
                        `
                            <span class="ev">
                                ${mono(x.pw)}

                                <button
                                    class="lk"
                                    data-a="apw"
                                    data-v="s"
                                >
                                    Reset
                                </button>
                            </span>
                        `
                    ]
                ])}
            </div>
        </div>

        <div class="top">
            <h3 style="margin:0">
                Enrollment
            </h3>

            <span class="eh">
                <button
                    class="btn sec"
                    data-a="ea"
                >
                    + Add enrollment
                </button>

                ${bt('Edit enrollment', 'ee')}
            </span>
        </div>

        <div class="c">
            <label style="margin:0">
                Academic term

                <select
                    class="sel"
                    id="aterm"
                >
                    ${x.enr.map((y, i) => `
                        <option
                            value="${i}"
                            ${i === t ? ' selected' : ''}
                        >
                            ${y.term}
                        </option>
                    `).join('')}
                </select>
            </label>
        </div>

        ${enrView(x, e, 1)}
    `;
};
