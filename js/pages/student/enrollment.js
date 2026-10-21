
/* Student screen: Enrollment Status */
'use strict';

/* ---------- Student Enrollment Screen ---------- */

const studentEnrollment = () => {
    const r = U();

    if (term >= r.enr.length) {
        term = 0;
    }

    const e = r.enr[term];

    return (
        hd('Enrollment Status') +

        `
        <div class="c">
            <label style="margin:0">
                Academic term

                <select
                    class="sel"
                    id="term"
                >
                    ${r.enr.map((x, i) => `
                        <option
                            value="${i}"
                            ${i === term ? ' selected' : ''}
                        >
                            ${x.term}
                        </option>
                    `).join('')}
                </select>
            </label>
        </div>
        ` +

        enrView(
            r,
            e,
            0
        )
    );
};
