export type QueryResultOk<T = unknown> = {
  status: "OK";
  time: string;
  result: T;
};

export type QueryResultErr = {
  status: "ERR";
  time: string;
  result: string;
};

export type QueryResult<T = unknown> = QueryResultOk<T> | QueryResultErr;
