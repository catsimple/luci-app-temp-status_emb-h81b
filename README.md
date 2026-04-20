# luci-app-temp-status

Temperature sensor data for the LuCI status page.

OpenWrt >= 19.07.

**Dependencies:** `lua`, `luci-lib-nixio`, `luci-lib-jsonc`

## Features / 功能

- Reads sensor definitions from `/etc/temp-status/*.conf`
- Displays temperature, fan speed, frequency, and voltage values
- Supports per-sensor scaling, offsets, thresholds, and custom units
- Supports multiple config files for different boards or layouts

- 从 `/etc/temp-status/*.conf` 自动读取传感器配置
- 显示温度、风扇转速、频率和电压
- 支持每个传感器独立配置换算、偏移、阈值和单位
- 支持多个配置文件，适合不同板型或不同布局

## Installation / 安装

### OpenWrt 23.05

```sh
wget --no-check-certificate -O /tmp/luci-app-temp-status_0.3-5_all.ipk https://github.com/gSpotx2f/packages-openwrt/raw/master/23.05/luci-app-temp-status_0.3-5_all.ipk
opkg install /tmp/luci-app-temp-status_0.3-5_all.ipk
rm /tmp/luci-app-temp-status_0.3-5_all.ipk
/etc/init.d/rpcd reload
```

### OpenWrt 21.02 / 22.03

```sh
wget --no-check-certificate -O /tmp/luci-app-temp-status_0.3-5_all.ipk https://github.com/gSpotx2f/packages-openwrt/raw/master/current/luci-app-temp-status_0.3-5_all.ipk
opkg install /tmp/luci-app-temp-status_0.3-5_all.ipk
rm /tmp/luci-app-temp-status_0.3-5_all.ipk
/etc/init.d/rpcd reload
```

### OpenWrt 19.07

```sh
wget --no-check-certificate -O /tmp/luci-app-temp-status_0.3-3_all.ipk https://github.com/gSpotx2f/packages-openwrt/raw/master/19.07/luci-app-temp-status_0.3-3_all.ipk
opkg install /tmp/luci-app-temp-status_0.3-3_all.ipk
rm /tmp/luci-app-temp-status_0.3-3_all.ipk
/etc/init.d/rpcd reload
```

## Configuration / 配置

The backend scans every `*.conf` file in `/etc/temp-status/`.

后端会扫描 `/etc/temp-status/` 下所有 `*.conf` 文件。

Each config file should return a Lua table:

每个配置文件都应该返回一个 Lua 表：

```lua
return {
    sensors = {
        {
            title = "CPU Vcore",
            kind = "voltage",
            unit = "V",
            path = "/sys/class/hwmon/hwmon2/in0_input",
            scale = 0.001,
            digits = 3,
            order = 10,
        },
        {
            title = "CPU Temperature",
            kind = "temp",
            path = "/sys/class/hwmon/hwmon2/temp2_input",
            scale = 0.001,
            warn = 55,
            critical = 75,
            order = 20,
        },
    }
}
```

Supported fields / 支持字段:

- `title` or `label`: display name / 显示名称
- `kind`: `temp`, `voltage`, `fan`, `frequency`, or `raw` / 类型
- `path`, `sysfs`, or `file`: source file path / 数据源路径
- `scale` and `offset`: numeric conversion / 数值换算
- `transform`: optional Lua function for custom calculation / 自定义 Lua 计算函数
- `digits`: decimal precision on the status page / 显示小数位数
- `unit`: display unit / 显示单位
- `warn` and `critical`: temperature thresholds / 温度阈值
- `base`, `baseVoltage`, or `base_voltage`: voltage reference value / 电压基准值
- `warn_percent` or `warnPercent`: voltage warning deviation percent / 电压告警偏差百分比
- `critical_percent` or `criticalPercent`: voltage critical deviation percent / 电压严重偏差百分比
- `order`: sort order / 排序顺序
- `enabled`: set to `false` to skip an entry / 设为 `false` 可禁用

Voltage alarm logic:

`abs(current - base) / base * 100`

- if the deviation reaches `warn_percent`, the row turns orange
- if the deviation reaches `critical_percent`, the row turns red

电压告警逻辑：

`abs(当前值 - 基准值) / 基准值 * 100`

- 偏差达到 `warn_percent` 时变橙色
- 偏差达到 `critical_percent` 时变红色

### Translation / 翻译

If you want a sensor label to be translated in LuCI, keep `title` stable and add the same string to the package translation files under `po/<lang>/temp-status.po`.

如果你希望某个传感器名在 LuCI 里可翻译，请保持 `title` 文本稳定，并把同样的字符串加入 `po/<lang>/temp-status.po`。

## Default board example / 默认板级示例

This repository includes a sample config for the current board:

本仓库提供了当前板子的示例配置：

- `root/etc/temp-status/h81b.conf`

You can copy it as a template and create additional `.conf` files for other boards.

你可以把它作为模板，为其他板子再创建新的 `.conf` 文件。

## Screenshots / 截图

![Screenshot](https://github.com/gSpotx2f/luci-app-temp-status/blob/master/screenshots/01.jpg)
