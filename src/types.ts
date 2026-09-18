import type http from 'node:http';

type TRequestWithStartAt = http.IncomingMessage & { _startAt?: [number, number] };
type TResponseWithStartAt = http.ServerResponse & { _startAt?: [number, number] };

export type { TRequestWithStartAt as RequestWithStartAt, TResponseWithStartAt as ResponseWithStartAt };
