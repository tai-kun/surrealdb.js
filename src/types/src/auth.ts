export type RootAccessAuth = {
  readonly ns?: undefined;
  readonly db?: undefined;
  readonly ac?: undefined;
  readonly user: string;
  readonly pass: string;
};

export type NamespaceAccessAuth = {
  readonly ns: string;
  readonly db?: undefined;
  readonly ac?: undefined;
  readonly user: string;
  readonly pass: string;
};

export type DatabaseAccessAuth = {
  readonly ns: string;
  readonly db: string;
  readonly ac?: undefined;
  readonly user: string;
  readonly pass: string;
};

export type RecordAccessAuth = {
  readonly ns: string;
  readonly db: string;
  readonly ac: string;
  readonly [p: string]: unknown;
};

// export type SystemAccessAuth =
//   | RootAccessAuth
//   | NamespaceAccessAuth
//   | DatabaseAccessAuth;

export type AccessAuth =
  | RootAccessAuth
  | NamespaceAccessAuth
  | DatabaseAccessAuth
  | RecordAccessAuth;
