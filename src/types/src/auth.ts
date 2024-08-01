export type RootUserAuth = {
  readonly ns?: undefined;
  readonly db?: undefined;
  readonly ac?: undefined;
  readonly user: string;
  readonly pass: string;
};

export type NamespaceUserAuth = {
  readonly ns: string;
  readonly db?: undefined;
  readonly ac?: undefined;
  readonly user: string;
  readonly pass: string;
};

export type DatabaseUserAuth = {
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

// export type SystemUserAuth =
//   | RootAccessAuth
//   | NamespaceAccessAuth
//   | DatabaseAccessAuth;

export type AccessAuth =
  | RootUserAuth
  | NamespaceUserAuth
  | DatabaseUserAuth
  | RecordAccessAuth;
