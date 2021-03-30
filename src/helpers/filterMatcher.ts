import { Logger } from "homebridge";
import get from "lodash.get";
import { Filter, JellyfinSession } from "../types";

export class FilterHelper {
  constructor(
    public readonly log: Logger,
    public readonly sessions: JellyfinSession[],
    public readonly filters: Filter[]
  ) {
    this.log = log;
    this.sessions = sessions || [];
    this.filters = filters || [];
  }

  _matchFilterPair(
    session: JellyfinSession,
    path: string,
    value: string
  ): boolean {
    const payloadValue = get(session, path, undefined);
    const isMatched = value === String(payloadValue);

    this.log.info(
      ` ${
        isMatched ? "+" : "-"
      } looking for "${value}" at "${path}", found "${payloadValue}"`
    );

    return isMatched;
  }

  _matchFilterArray(session: JellyfinSession, filterArr) {
    return filterArr
      .filter(
        (pathValuePair) =>
          pathValuePair && pathValuePair.path && pathValuePair.value
      )
      .map(({ path, value }) => this._matchFilterPair(session, path, value))
      .reduce((acc, cur) => {
        return acc && cur;
      }, true);
  }

  match(): JellyfinSession[] {
    let result: JellyfinSession[] = [];
    if (this.sessions.length < 1) {
      this.log.debug(" > no sessions given, not matching by default ...");
    }

    if (this.filters.length > 0) {
      result = this.sessions.filter((session, sessionIndex) => {
        this.log.debug(`> session #${sessionIndex}`);
        return this.filters
          .filter((filter) => Array.isArray(filter))
          .map((filterArr, key) => {
            const index = key + 1;
            this.log.debug(` > filter group #${index}`);
            return this._matchFilterArray(session, filterArr);
          })
          .reduce((acc, cur) => {
            return acc || cur;
          }, false);
      });
    }

    this.log.debug(` > Found ${result.length} matching sessions`);

    return result;
  }
}
