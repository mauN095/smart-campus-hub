
/* Admin screen: Service Requests Queue */
'use strict';

const adminServiceRequests = () =>
    hd('Service Requests Queue') +

    search(
        'req',
        'Search requests…'
    ) +

    '<div style="height:14px"></div>' +

    tbl(
        'req',
        reqCfg(1)
    );
