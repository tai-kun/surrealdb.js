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

export type ScopeUserAuth = {
  readonly ns: string;
  readonly db: string;
  readonly sc: string;
  readonly [p: string]: unknown;
};

export type UserAuth =
  | RootUserAuth
  | NamespaceUserAuth
  | DatabaseUserAuth;

export type Auth = UserAuth | ScopeUserAuth;
