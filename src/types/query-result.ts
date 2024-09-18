export type QueryResultOk<TResult = unknown> = {
  status: "OK";
  time: string;
  result: TResult;
};

export type QueryResultErr = {
  status: "ERR";
  time: string;
  result: string;
};

export type QueryResult<TResult = unknown> =
  | QueryResultOk<TResult>
  | QueryResultErr;
