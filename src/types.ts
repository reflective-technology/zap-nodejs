import type http from 'node:http';

type RequestWithStartAt = http.IncomingMessage & { _startAt?: [number, number] };
type ResponseWithStartAt = http.ServerResponse & { _startAt?: [number, number] };

export type { RequestWithStartAt, ResponseWithStartAt };