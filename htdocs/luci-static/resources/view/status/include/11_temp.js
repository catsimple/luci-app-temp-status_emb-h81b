'use strict';
'require baseclass';
'require rpc';

return baseclass.extend({
    title: _('CPU Info'),
    tempWarning: 55,
    tempCritical: 75,
    callTempStatus: rpc.declare({
        object: 'luci.temp-status',
        method: 'getTempStatus',
        expect: { '': {} }
    }),
    load: function () {
        return L.resolveDefault(this.callTempStatus(), null);
    },
    formatValue: function (sensor, value) {
        let kind = sensor.kind || '';
        let unit = sensor.unit || '';
        let digits = (typeof sensor.digits === 'number') ? sensor.digits : null;

        if (kind === 'frequency') {
            return `${Math.round(value)} ${unit || 'MHz'}`;
        }

        if (kind === 'fan') {
            return `${Math.round(value)} ${unit || 'RPM'}`;
        }

        if (kind === 'temp') {
            return `${value.toFixed(digits !== null ? digits : 1)} ${unit || '\u00B0C'}`;
        }

        if (kind === 'voltage') {
            return `${value.toFixed(digits !== null ? digits : 3)} ${unit || 'V'}`;
        }

        if (unit) {
            return `${value.toFixed(digits !== null ? digits : 3)} ${unit}`;
        }

        return `${value}`;
    },
    getVoltageDeviation: function (sensor, value) {
        let base = (typeof sensor.base === 'number') ? sensor.base : null;
        if (base === null || base <= 0) {
            return null;
        }

        return Math.abs(value - base) / base * 100;
    },
    render: function (tempData) {
        if (!tempData || !tempData[1]) {
            return;
        }

        let tempTable = E('table', { 'class': 'table' }, E('tr', { 'class': 'tr table-titles' }, [
            E('th', { 'class': 'th left', 'width': '33%' }, _('Sensor')),
            E('th', { 'class': 'th left' }, _('Status')),
        ]));

        for (let v of Object.values(tempData[1])) {
            let sources = Object.values(v.sources);
            if (sources.length === 0) {
                continue;
            }

            let value = sources[0].temp;
            let displayValue = this.formatValue(v, value);
            let label = (v.title) ? _(v.title) : '-';
            let warn = (typeof v.warn === 'number') ? v.warn : this.tempWarning;
            let critical = (typeof v.critical === 'number') ? v.critical : this.tempCritical;
            let cellStyle = null;

            if (v.kind === 'temp') {
                cellStyle = (value >= critical) ?
                    'color:#f5163b !important; font-weight:bold !important' :
                    (value >= warn) ?
                        'color:#ff821c !important; font-weight:bold !important' :
                        null;
            }
            else if (v.kind === 'voltage') {
                let deviation = this.getVoltageDeviation(v, value);
                let warnPercent = (typeof v.warnPercent === 'number') ? v.warnPercent : null;
                let criticalPercent = (typeof v.criticalPercent === 'number') ? v.criticalPercent : null;

                if (deviation !== null) {
                    cellStyle = (criticalPercent !== null && deviation >= criticalPercent) ?
                        'color:#f5163b !important; font-weight:bold !important' :
                        (warnPercent !== null && deviation >= warnPercent) ?
                            'color:#ff821c !important; font-weight:bold !important' :
                            null;
                }
                else {
                    cellStyle = (value >= critical) ?
                        'color:#f5163b !important; font-weight:bold !important' :
                        (value >= warn) ?
                            'color:#ff821c !important; font-weight:bold !important' :
                            null;
                }
            }

            tempTable.append(E('tr', { 'class': 'tr' }, [
                E('td', { 'class': 'td left', 'style': cellStyle, 'data-title': _('Sensor') }, label),
                E('td', { 'class': 'td left', 'style': cellStyle, 'data-title': _('Status') }, (displayValue === undefined) ? '-' : displayValue),
            ]));
        }

        if (tempTable.childNodes.length === 1) {
            tempTable.append(E('tr', { 'class': 'tr placeholder' }, E('td', { 'class': 'td' }, E('em', {}, _('No temperature sensors available')))));
        }

        return tempTable;
    },
});
