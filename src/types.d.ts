import { PlatformConfig } from "homebridge";

type RuleSet = {
  path: string;
  value: string;
};

type Filter = RuleSet[];

export interface JellyfinSensor {
  name: string;
  filters: Filter[];

  // Added by extend config

  uuid: string;
  sn: string;
}

export interface JellyfinServer {
  port: number;
  address: string;
  api_key: string;
  checkInterval: number;
}

export interface JellyfinConfig extends PlatformConfig {
  server: JellyfinServer;
  sensors: JellyfinSensor[];
}

type RemoteTrailer = {
  Url: string;
  Name: string;
};

type ExternalUrl = {
  Url: string;
  Name: string;
};

type NowPlayingItem = {
  Name: string;
  ServerId: string;
  Id: string;
  DateCreated: string;
  HasSubtitles: boolean;
  Container: string;
  PremiereDate: string;
  ExternalUrls: ExternalUrl[];
  Path: string;
  EnableMediaSourceDisplay: boolean;
  Overview: string;
  Taglines: unknown[];
  Genres: unknown[];
  CommunityRating: number;
  RunTimeTicks: number;
  ProductionYear: number;
  IndexNumber: number;
  ParentIndexNumber: number;
  ProviderIds: {
    Tvdb: string;
    Imdb: string;
  };
  IsHD: boolean;
  IsFolder: boolean;
  ParentId: string;
  Type: "Episode" | string;
  Studios: unknown[];
  GenreItems: unknown[];
  ParentBackdropItemId: string;
  ParentBackdropImageTags: string[];
  LocalTrailerCount: number;
  SeriesName: string;
  SeriesId: string;
  SeasonId: string;
  SpecialFeatureCount: number;
  PrimaryImageAspectRatio: number;
  SeriesPrimaryImageTag: string;
  SeasonName: string;
  VideoType: "VideoFile" | string;
  ImageTags: {
    Primary: string;
  };
  BackdropImageTags: [];
  ScreenshotImageTags: [];
  ImageBlurHashes: {
    [key: string]: { [key: string]: string };
  };
  SeriesStudio: string;
  Chapters?: {
    StartPositionTicks: number;
    Name: string;
    ImageDateModified: string;
  }[];
  LocationType: "FileSystem" | string;
  MediaType: "Video" | string;
  Width: number;
  Height: number;
};

type FullNowPlayingItem = {
  SpecialFeatureIds: unknown[];
  LocalTrailerIds: unknown[];
  RemoteTrailerIds: unknown[];
  TmdbCollectionName?: string;
  AdditionalParts: unknown[];
  LocalAlternateVersions: unknown[];
  LinkedAlternateVersions: unknown[];
  SubtitleFiles: string[];
  HasSubtitles: boolean;
  IsPlaceHolder: boolean;
  DefaultVideoStreamIndex: 0 | number;
  VideoType: "VideoFile" | string;
  Size: number;
  Container: string;
  DateLastSaved: string;
  RemoteTrailers: RemoteTrailer[];
  IsHD: boolean;
  IsShortcut: boolean;
  Width: number;
  Height: number;
  ExtraIds: unknown[];
  SupportsExternalTransfer: boolean;
};

export type JellyfinSession = {
  PlayState: {
    CanSeek: boolean;
    IsPaused: boolean;
    IsMuted: boolean;
    RepeatMode: "RepeatNone" | string;
  };
  AdditionalUsers: unknown[];
  Capabilities: {
    PlayableMediaTypes: unknown[];
    SupportedCommands: unknown[];
    SupportsMediaControl: boolean;
    SupportsContentUploading: boolean;
    SupportsPersistentIdentifier: boolean;
    SupportsSync: boolean;
  };
  RemoteEndPoint: string;
  PlayableMediaTypes: unknown[];
  Id: string;
  Client: string;
  LastActivityDate: string;
  LastPlaybackCheckIn: string;
  DeviceName: string;
  DeviceId: string;
  ApplicationVersion: string;
  IsActive: boolean;
  SupportsMediaControl: boolean;
  SupportsRemoteControl: boolean;
  HasCustomDeviceName: boolean;
  ServerId: string;
  SupportedCommands: unknown[];
  FullNowPlayingItem?: FullNowPlayingItem;
  NowPlayingItem?: NowPlayingItem;
};
