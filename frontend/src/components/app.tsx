import xs, { Stream } from 'xstream';
import { extractSinks } from 'cyclejs-utils';
import isolate from '@cycle/isolate';

import { driverNames } from '../drivers';
import { Sources, Sinks, Component } from '../interfaces';

import { Rank, State as RankState } from './rank';

export interface State {
    rank?: RankState;
}

export function App(sources: Sources<State>): Sinks<State> {
    const match$ = sources.router.define({
        '/rank': isolate(Rank, 'rank')
    });

    const componentSinks$: Stream<Sinks<State>> = match$
        .filter(({ path, value }: any) => path && typeof value === 'function')
        .map(({ path, value }: { path: string; value: Component<any> }) => {
            return value({
                ...sources,
                router: sources.router.path(path)
            });
        });

    const redirect$: Stream<string> = sources.router.history$
        .filter((l: Location) => l.pathname === '/')
        .mapTo('/rank');

    const sinks = extractSinks(componentSinks$, driverNames);
    return {
        ...sinks,
        router: xs.merge(redirect$, sinks.router)
    };
}
