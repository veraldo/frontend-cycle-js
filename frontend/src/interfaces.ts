import { Stream } from 'xstream';
import { DOMSource, VNode } from '@cycle/dom';
import { StateSource, Reducer } from '@cycle/state';
import { RouterSource, HistoryAction } from 'cyclic-router';
import { HTTPSource } from '@cycle/http';

export { Reducer } from '@cycle/state';

export type Component<State> = (s: Sources<State>) => Sinks<State>;

export interface Sources<State> {
    DOM: DOMSource;
    HTTP: HTTPSource;
    router: RouterSource;
    state: StateSource<State>;
}

export interface Sinks<State> {
    DOM?: Stream<VNode>;
    HTTP?: Stream<Partial<Request>>;
    router?: Stream<HistoryAction>;
    speech?: Stream<string>;
    state?: Stream<Reducer<State>>;
}

export interface User {
    name: string;
    website: string;
    email: string;
    id?: string;
}
