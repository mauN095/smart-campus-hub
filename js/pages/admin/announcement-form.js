
/* Admin screen: Create / Edit Announcement */
'use strict';

const adminAnnouncementForm = () => {
    const a = sub.id
        ? DB.anns.find(x => x.id === sub.id)
        : null;

    const v = a || {
        t: '',
        cat: 'Academic',
        aud: 'Everyone',
        b: '',
        st: 'Published'
    };

    return `
        <div class="top">
            <div class="l">
                <button class="btn sec" data-a="go" data-v="ann">
                    ← Back
                </button>

                <h1>
                    ${a ? 'Edit' : 'Create'} Announcement
                </h1>
            </div>
        </div>

        <div
            class="g2"
            style="grid-template-columns: 1.5fr 1fr; align-items: start;"
        >
            <div class="c" id="af">
                <label>
                    Title
                    <input
                        id="at"
                        value="${esc(v.t)}"
                        placeholder="Announcement title"
                    >
                </label>

                <div class="g2">
                    ${sel('Category', 'ac', OPT.annCat, v.cat)}

                    ${sel('Target audience', 'au', OPT.aud, v.aud)}
                </div>

                <label>
                    Announcement content
                    <textarea id="ab" rows="5">${esc(v.b)}</textarea>
                </label>

                <div class="g2">
                    <label>
                        Date &amp; time (for scheduling)
                        <input
                            id="ad"
                            type="datetime-local"
                        >
                    </label>

                    <label>
                        Attachment
                        <input
                            id="afl"
                            type="file"
                        >
                    </label>
                </div>

                <p style="font-weight: 700; margin: 0 0 6px;">
                    Publishing options
                </p>

                <div class="radio">
                    ${[
                        ['Published', 'Publish now'],
                        ['Draft', 'Save as draft'],
                        ['Scheduled', 'Schedule']
                    ].map(([k, l]) => `
                        <label>
                            <input
                                type="radio"
                                name="pm"
                                value="${k}"
                                ${
                                    (
                                        v.st === k ||
                                        (!a && k === 'Published')
                                    )
                                        ? ' checked'
                                        : ''
                                }
                            >
                            ${l}
                        </label>
                    `).join('')}
                </div>

                <div
                    class="err"
                    id="aerr"
                    role="alert"
                ></div>

                <div class="acts">
                    <button
                        class="btn sec"
                        data-a="go"
                        data-v="ann"
                    >
                        Cancel
                    </button>

                    <button
                        class="btn"
                        data-a="asv"
                    >
                        ${a ? 'Save' : 'Publish'}
                    </button>
                </div>
            </div>

            <div class="c">
                <h3>Preview</h3>

                <span class="p b" id="pc">
                    ${v.cat}
                </span>

                <h2
                    id="pt"
                    style="margin-top: 10px;"
                >
                    ${esc(v.t) || 'Your title appears here'}
                </h2>

                <p class="mu">
                    ${esc(U().name)} · ${fd(new Date())}
                </p>

                <p id="pb">
                    ${esc(v.b) || 'Your content appears here.'}
                </p>
            </div>
        </div>
    `;
};
