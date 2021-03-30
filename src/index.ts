import {
  API,
  DynamicPlatformPlugin,
  Logger,
  PlatformAccessory,
  Service,
  Characteristic,
  APIEvent,
  PlatformPluginConstructor,
} from "homebridge";

import { PKG_AUTHOR, PLATFORM_NAME, PLUGIN_NAME } from "./settings";
import { expandConfig } from "./utils";
import { JellyfinConfig, JellyfinSession } from "./types";
import fetch from "node-fetch";
import { updateAccessoriesHandler } from "./helpers/updateAccessories";
import { Cache } from "./cache";

let Accessory: typeof PlatformAccessory;

export = (api: API) => {
  Accessory = api.platformAccessory;
  api.registerPlatform(
    PLATFORM_NAME,
    (JellyfinPlatform as unknown) as PlatformPluginConstructor
  );
};

/**
 * HomebridgePlatform
 * This class is the main constructor for your plugin, this is where you should
 * parse the user config and discover/register accessories with Homebridge.
 */
class JellyfinPlatform implements DynamicPlatformPlugin {
  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic = this.api.hap
    .Characteristic;

  // this is used to track restored cached accessories
  public readonly accessories: PlatformAccessory[] = [];
  private readonly accessoriesToRemove: PlatformAccessory[] = [];
  private checkStateInterval: NodeJS.Timeout | null = null;
  private cache = new Cache();

  constructor(
    public readonly log: Logger,
    public config: JellyfinConfig,
    public readonly api: API
  ) {
    // Exapnd the config (create UUIDs)
    this.config = expandConfig(this.api, this.config);
    this.log.debug("Finished initializing platform:", this.config);

    // When this event is fired it means Homebridge has restored all cached accessories from disk.
    // Dynamic Platform plugins should only register new accessories after this event was fired,
    // in order to ensure they weren't added to homebridge already. This event can also be used
    // to start discovery of new accessories.
    this.api.on(APIEvent.DID_FINISH_LAUNCHING, () => {
      this.addNewDevices();
      this.removeOutdatedAccessories();

      this.startMonitoring();
    });

    this.api.on(APIEvent.SHUTDOWN, this.stopMoinitoring);
  }

  /*
   * This function is invoked when homebridge restores cached accessories from disk at startup.
   * It should be used to setup event handlers for characteristics and update respective values.
   */
  configureAccessory(accessory: PlatformAccessory): void {
    if (this.config.verbose) {
      this.log.info(
        `configureAccessory: ${
          accessory.displayName
        }, ${!this.accessoryRegisteredInConfig(accessory)}`
      );
    }
    if (!this.accessoryRegisteredInConfig(accessory)) {
      this.accessoriesToRemove.push(accessory);
    } else {
      this.accessories.push(accessory);
    }
  }

  /** Check if accessory is registered in the Homebridge config */
  accessoryRegisteredInConfig(accessory: PlatformAccessory) {
    return this.config.sensors.find((d) => d.name === accessory.displayName);
  }

  /** Check if accessory is registered in the Homebridge config */
  accessoryMissingInHomebridge(accessory: PlatformAccessory) {
    return this.config.sensors.find((d) => d.name === accessory.displayName);
  }

  /** Remove outdated accessories from Homebridge */
  removeOutdatedAccessories() {
    if (this.config.verbose) {
      this.log.info(
        `Remove outdated accessories: ${this.accessoriesToRemove
          .map((a) => a.displayName)
          .join(", ")}`
      );
    }
    this.api.unregisterPlatformAccessories(
      PLUGIN_NAME,
      PLATFORM_NAME,
      this.accessoriesToRemove
    );
  }

  /** Register unregistered devices to Homebridge */
  addNewDevices() {
    const hap = this.api.hap;
    const accessoriesToRegister = this.config.sensors.filter(
      (d) => !this.accessories.find((a) => a.displayName === d.name)
    );
    accessoriesToRegister.forEach((acc) => {
      const uuid = hap.uuid.generate(acc.name);
      const accessory = new Accessory(acc.name, uuid);
      accessory.context.sensor = acc;

      if (this.config.verbose) {
        this.log.info(`addNewDevices: ${acc.name}`);
      }

      accessory.addService(hap.Service.OccupancySensor, acc.name);

      accessory
        .getService(this.Service.AccessoryInformation)!
        .setCharacteristic(hap.Characteristic.Manufacturer, PKG_AUTHOR)
        .setCharacteristic(hap.Characteristic.Model, PLUGIN_NAME)
        .setCharacteristic(hap.Characteristic.SerialNumber, acc.sn);

      this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [
        accessory,
      ]);
      this.accessories.push(accessory);
    });
  }

  /**
   * Stop mointoring Jellyfin
   */
  stopMoinitoring() {
    if (this.checkStateInterval === null) {
      return;
    }

    clearInterval(this.checkStateInterval);
  }

  /**
   * Start monitoring Jellyfin
   */
  startMonitoring() {
    if (this.config.verbose) {
      this.log.info(`Accessories total: ${this.accessories.length}`);
    }

    this.checkStateInterval = setInterval(
      this.updateAccessories.bind(this),
      Math.max(500, this.config?.checkInterval || 60000) // default of 1 minute with a minimum of 5 seconds
    );
  }

  /**
   * Get the active sessions from Jellyfin
   * @returns The sessions from Jellyfin
   */
  async _getSessions() {
    // Get sessions from Jellyfin
    const server = `${this.config.server.address}:${this.config.server.port}`;
    const url = `http://${server}/Sessions?activeWithinSeconds=500&api_key=${this.config.server.api_key}`;
    const response = await fetch(url, {
      method: "get",
      headers: { "Content-Type": "application/json" },
    });
    const sessions = await response.json();
    return sessions;
  }

  /**
   * Update the accessories
   * @param sessions The active sessiosn to filter against
   */
  _updateAccessories(sessions: JellyfinSession[]) {
    const hap = this.api.hap;

    // Update accessories
    this.accessories.forEach((accessory) => {
      const service = accessory.getService(hap.Service.OccupancySensor);

      updateAccessoriesHandler({
        cache: this.cache,
        log: this.log,
        sensor: accessory.context.sensor,
        sessions: sessions,
        toggleUpdate: (state) => {
          if (state) {
            service?.updateCharacteristic(
              hap.Characteristic.OccupancyDetected,
              hap.Characteristic.OccupancyDetected.OCCUPANCY_DETECTED
            );
          } else {
            service?.updateCharacteristic(
              hap.Characteristic.OccupancyDetected,
              hap.Characteristic.OccupancyDetected.OCCUPANCY_NOT_DETECTED
            );
          }
        },
      });
    });
  }

  async updateAccessories() {
    // Get sessions
    const sessions = await this._getSessions();
    this._updateAccessories(sessions);
  }
}
