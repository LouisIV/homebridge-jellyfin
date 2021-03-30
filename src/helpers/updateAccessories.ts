import { Logger } from "homebridge";
import { JellyfinSensor, JellyfinSession } from "../types";
import { diffDates } from "../utils";
import { Cache } from "../cache";
import { FilterHelper } from "./filterMatcher";

type HandlerProps = {
  sensor: JellyfinSensor;
  sessions: JellyfinSession[];
  cache: Cache;
  log: Logger;
  toggleUpdate: (state: boolean) => void;
};

const MS_PER_MINUTE = 60000;

export const updateAccessoriesHandler = (props: HandlerProps) => {
  const { cache, sessions, sensor, log, toggleUpdate } = props;
  const filterHelper = new FilterHelper(log, sessions, sensor.filters);
  const matchingSessions = filterHelper.match();

  const currentTime = new Date();
  const isPlaying = matchingSessions.some(
    (session) =>
      diffDates(currentTime, new Date(session.LastPlaybackCheckIn)) <
      2 * MS_PER_MINUTE
  );

  if (isPlaying) {
    props.log.info(
      `(${
        sensor.name
      }) Value found: "${isPlaying}". Old value: "${cache.getValue(
        sensor.name
      )}". Value changed? ${cache.getValue(sensor.name) !== isPlaying}`
    );
  }

  if (cache.getValue(sensor.name) !== isPlaying) {
    log.info(`Detected Occupancy on ${sensor.name}? ${isPlaying}`);
    cache.setValue(sensor.name, isPlaying);
    toggleUpdate(isPlaying);
  }
};
