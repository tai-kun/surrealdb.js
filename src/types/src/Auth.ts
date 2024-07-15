/**
 * ルートユーザーの認証情報。
 */
export interface RootAuth {
  /** 認証する名前空間。 */
  readonly ns?: null | undefined;
  /** 認証するデータベース。 */
  readonly db?: null | undefined;
  /** 認証するスコープ。 */
  readonly sc?: null | undefined;
  /** 認証するユーザーの名前。 */
  readonly user: string;
  /** 認証するユーザーのパスワード */
  readonly pass: string;
}

/**
 * 名前空間ユーザーの認証情報。
 */
export interface NamespaceAuth {
  /** 認証する名前空間。 */
  readonly ns: string;
  /** 認証するデータベース。 */
  readonly db?: null | undefined;
  /** 認証するスコープ。 */
  readonly sc?: null | undefined;
  /** 認証するユーザーの名前。 */
  readonly user: string;
  /** 認証するユーザーのパスワード */
  readonly pass: string;
}

/**
 * データベースユーザーの認証情報。
 */
export interface DatabaseAuth {
  /** 認証する名前空間。 */
  readonly ns: string;
  /** 認証するデータベース。 */
  readonly db: string;
  /** 認証するスコープ。 */
  readonly sc?: null | undefined;
  /** 認証するユーザーの名前。 */
  readonly user: string;
  /** 認証するユーザーのパスワード */
  readonly pass: string;
}

/**
 * スコープユーザーの認証情報。
 */
export interface ScopeAuth {
  /** 認証する名前空間。 */
  readonly ns: string;
  /** 認証するデータベース。 */
  readonly db: string;
  /** 認証するスコープ。 */
  readonly sc: string;
  /** 認証に必要な値。 */
  readonly [key: string | number]: unknown; // RecordInputData
}

/**
 * システムユーザーの認証情報。
 */
export type SystemAuth = RootAuth | NamespaceAuth | DatabaseAuth;

/**
 * ユーザーの認証情報。
 */
export type Auth = SystemAuth | ScopeAuth;
