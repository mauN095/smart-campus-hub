
/* Admin screen: My Profile */
'use strict';

const adminProfile = () => {
    const u = U();

    return (
        hd(
            'My Profile',
            bt('Edit Profile', 'pe')
        ) +

        `
        <div class="c pf">
            ${avatar(u)}

            <div class="pi">
                <h2>${esc(u.name)}</h2>

                <span class="mu">
                    ${u.role} · ${u.id} ·
                </span>

                ${pill('Active')}

                ${photoCtl(u)}
            </div>
        </div>

        <h3>Admin Information</h3>

        <div class="c">
            <div class="kg">
                ${kv([
                    [
                        'Full name',
                        esc(u.name)
                    ],
                    [
                        'Department',
                        esc(u.dept)
                    ],
                    [
                        'Email address',
                        esc(u.email)
                    ],
                    [
                        'Admin ID',
                        u.id
                    ],
                    [
                        'Role',
                        u.role
                    ],
                    [
                        'Contact number',
                        esc(u.phone)
                    ]
                ])}
            </div>
        </div>
        `
    );
};
