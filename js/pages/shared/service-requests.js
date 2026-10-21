
/* Shared screen (Student + Faculty): Service Requests */
'use strict';

/* ---------- Service Requests Screen ---------- */

const serviceRequestsScreen = () =>
    hd(
        'Service Requests',
        bt('+ Submit Request', 'rn')
    ) +

    search(
        'req',
        'Search requests…'
    ) +

    '<div style="height:14px"></div>' +

    tbl(
        'req',
        reqCfg(0)
    );
