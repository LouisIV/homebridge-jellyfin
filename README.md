<p align="center" verticalAlign="middle">
<img src="https://github.com/homebridge/branding/raw/master/logos/homebridge-color-round.png" width="100">
<img src="https://raw.githubusercontent.com/jellyfin/jellyfin-ux/master/branding/SVG/icon-transparent.svg" width="100">
</p>

# Homebridge Jellyfin

This [Homebridge](https://github.com/homebridge/homebridge) plugin can expose occupancy sensor(s) in Home app what will trigger occupancy
whenever a session on a Jellyfin server meets your filtering requirements. Thanks to the unlimited filtering criterias, occupancy events
can be controlled based on several different attributes (e.g.: username, device names, media types, genres, clients).

## Installation

If you don't have a [Homebridge](https://github.com/homebridge/homebridge) installation yet, head over to the [project documentation](https://github.com/homebridge/homebridge) for
more information.

The best and easiest way to install and configure this plugin is through
[Homebridge UI](https://github.com/oznu/homebridge-config-ui-x).

However, if you would like to you can do it through terminal:

```
npm install homebridge-jellyfin
```

Or, you can install it for root but please be aware of the security risks:

```sh
sudo npm install -g --unsafe-perm homebridge-jellyfin
```

## Configuration

The easiest way to configure this plugin is through [Homebridge UI](https://github.com/oznu/homebridge-config-ui-x).

Available options:

| Property name          | Optional/Required | Type      | Description                                                                                                                                                                                                                                                       |
| ---------------------- | ----------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`                 | **required**      | `String`  | This is the name of the platform, doesn't really show up anywhere but it's required.                                                                                                                                                                              |
| `platform`             | **required**      | `String`  | Must be Jellyfin.                                                                                                                                                                                                                                                 |
| `sensors`              | **required**      | `Array`   | At least one sensor should be exposed.                                                                                                                                                                                                                            |
| `sensors.name`         | **required**      | `String`  | This is how the occupancy sensor will show up in Home app.                                                                                                                                                                                                        |
| `sensors.filters`      | optional          | `Array`   | Filter rulesets. For the specified sensor to be activated, all the given path-value pairs in the ruleset must found in Jellyfin's Session payload. In case multiple rulesets have been given, at least one ruleset of path-value pairs must found in the payload. |
| `server`               | **required**      | `Object`  | The configuration for you Jellyfin server                                                                                                                                                                                                                         |
| `server.api_key`       | **required**      | `String`  | The API key from your Jellyfin server                                                                                                                                                                                                                             |
| `server.address`       | **required**      | `String`  | The address of your Jellyfin server                                                                                                                                                                                                                               |
| `server.port`          | **required**      | `Number`  | The port of your Jellyfin server                                                                                                                                                                                                                                  |
| `server.checkInterval` | optional          | `Number`  | How often to check Jellyfin                                                                                                                                                                                                                                       |
| `verbose`              | optional          | `Boolean` | For debugging purposes. With verbose logging the plugin will log Jellyfin's payload and path-value pair matching information into the Homebridge logs.                                                                                                            |

Simple config with one filter:

```json
{
  "platforms": [
    {
      "name": "Jellyfin Platform",
      "platform": "Jellyfin",
      "server": {
        "api_key": "---------------------",
        "port": 8096,
        "address": "XXX.XXX.XXX.XXX",
        "checkInterval": 50
      },
      "sensors": [
        {
          "name": "Apple TV Watching",
          "filters": [
            [
              {
                "path": "DeviceName",
                "value": "Apple TV"
              }
            ]
          ]
        }
      ]
    }
  ]
}
```

Advanced config with multiple sensors and filters with verbose logging:

```json
{
  "platforms": [
    {
      "name": "Jellyfin Platform",
      "platform": "Jellyfin",
      "verbose": true,
      "server": {
        "api_key": "---------------------",
        "port": 8096,
        "address": "XXX.XXX.XXX.XXX",
        "checkInterval": 50
      },
      "sensors": [
        {
          "name": "LJ Watching",
          "filters": [
            [
              {
                "path": "UserName",
                "value": "LJ"
              }
            ]
          ]
        },
        {
          "name": "LJ Watching on Apple TV",
          "filters": [
            [
              {
                "path": "DeviceName",
                "value": "Apple TV"
              },
              [
                {
                  "path": "UserName",
                  "value": "LJ"
                }
              ]
            ]
          ]
        }
      ]
    }
  ]
}
```

## Credits

- I stole the filtering and the readme from [iharosi's plugin for Plex](https://github.com/iharosi/homebridge-plex-webhooks)
- I copied the structure of the code from [Marc Veen's plugin](https://github.com/marcveens/homebridge-website-change-check)
