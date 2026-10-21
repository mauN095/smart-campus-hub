
/* Student screen: Dashboard */
'use strict';

const studentDashboard = () => {
    const u = U();

    const e = u.enr[0];
    const rs = myReqs();

    return (
        hd('Good morning, ' + u.name.split(' ')[0]) +

        `
        <div class="g3" style="margin-bottom:16px">

            <!-- Student Information -->
            <div class="c" style="margin:0">
                <p class="eb">
                    Student
                </p>

                <div class="big">
                    ${esc(u.name)}
                </div>

                <p class="mu">
                    ${u.id} · ${esc(u.prog)}
                </p>

                <button
                    class="lk"
                    data-a="go"
                    data-v="prof"
                >
                    View profile →
                </button>
            </div>

            <!-- Enrollment Status -->
            <div class="c" style="margin:0">
                <p class="eb">
                    Enrollment
                </p>

                <div class="big ${e.st === 'Enrolled' ? 'ok' : 'wn'}">
                    ${e.st}
                </div>

                <p class="mu">
                    ${e.term} · ${e.units || 0} units
                </p>

                <button
                    class="lk"
                    data-a="go"
                    data-v="enr"
                >
                    View details →
                </button>
            </div>

            <!-- Service Requests -->
            <div class="c" style="margin:0">
                <p class="eb">
                    Service Requests
                </p>

                <div class="big">
                    ${rs.length}
                </div>

                <p class="mu">
                    ${rs.filter(r =>
                        r.st === 'In progress'
                    ).length} in progress ·

                    ${rs.filter(r =>
                        r.st === 'Resolved'
                    ).length} resolved
                </p>

                <button
                    class="lk"
                    data-a="go"
                    data-v="req"
                >
                    Track all requests →
                </button>
            </div>
        </div>

        <!-- Latest Announcements -->
        <div class="c">
            <h3>Latest announcements</h3>

            ${visAnn()
                .slice(0, 3)
                .map(a => annLine(a, 1))
                .join('')}
        </div>
        `
    );
};
