'use strict';
'require baseclass';
'require rpc';

return baseclass.extend({
    title: _('Temperature'),
    tempWarning: 55,
    tempCritical: 75,
    fanSpeedThreshold: 150,
    maxTempValue: 10000,
    callTempStatus: rpc.declare({
        object: 'luci.temp-status',
        method: 'getTempStatus',
        expect: { '': {} }
    }),
    load: function () {
        return L.resolveDefault(this.callTempStatus(), null);
    },
    render: function (tempData) {
        if (!tempData || !tempData[1]) {
            return;
        }

        let tempTable = E('table', { 'class': 'table' }, E('tr', { 'class': 'tr table-titles' }, [
            E('th', { 'class': 'th left', 'width': '33%' }, _('Sensor')),
            E('th', { 'class': 'th left' }, _('Temperature')),
        ]));

        for (let v of Object.values(tempData[1])) {
            let sources = Object.values(v.sources);
            if (sources.length === 0) {
                continue;
            }

            let value = sources[0].temp;
            let isFanSpeed = value > this.fanSpeedThreshold && value <= this.maxTempValue;
            let temp = (isFanSpeed) ? value : value / 1000;
            let name = v.title;
            let cellStyle = (isFanSpeed) ?
                null :
                (temp >= this.tempCritical) ?
                    'color:#f5163b !important; font-weight:bold !important' :
                    (temp >= this.tempWarning) ?
                        'color:#ff821c !important; font-weight:bold !important' :
                        null;

            tempTable.append(E('tr', { 'class': 'tr' }, [
                E('td', { 'class': 'td left', 'style': cellStyle, 'data-title': _('Sensor') }, name),
                E('td', { 'class': 'td left', 'style': cellStyle, 'data-title': _('Temperature') }, (temp === undefined) ? '-' : temp + (isFanSpeed ? ' RPM' : ' °C')),
            ]));
        }

        if (tempTable.childNodes.length === 1) {
            tempTable.append(E('tr', { 'class': 'tr placeholder' }, E('td', { 'class': 'td' }, E('em', {}, _('No temperature sensors available')))));
        }

        return tempTable;
    },
});
