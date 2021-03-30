import { JellyfinConfig } from "./types";

export const expandConfig = (api, config: JellyfinConfig): JellyfinConfig => {
  const {
    hap: { uuid },
  } = api;
  const { sensors = [] } = config;

  const sensorsWithUuid = sensors.map((sensor) => {
    const sensorUuid = uuid.generate(JSON.stringify(sensor.name));
    const shortSensorUuid = uuid.toShortForm(sensorUuid);

    return {
      ...sensor,
      uuid: sensorUuid,
      sn: shortSensorUuid,
    };
  });

  return {
    ...config,
    sensors: sensorsWithUuid,
  };
};

export const diffDates = function (a: Date, b: Date): number {
  const utcThis = Date.UTC(
    a.getFullYear(),
    a.getMonth(),
    a.getDate(),
    a.getHours(),
    a.getMinutes(),
    a.getSeconds(),
    a.getMilliseconds()
  );
  const utcOther = Date.UTC(
    b.getFullYear(),
    b.getMonth(),
    b.getDate(),
    b.getHours(),
    b.getMinutes(),
    b.getSeconds(),
    b.getMilliseconds()
  );

  return utcThis - utcOther;
};
