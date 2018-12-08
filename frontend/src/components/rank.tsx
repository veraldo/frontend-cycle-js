import xs, { Stream } from 'xstream';
import sampleCombine from 'xstream/extra/sampleCombine';
import {
    VNode,
    DOMSource,
    div,
    h2,
    textarea,
    button,
    h1,
    h4,
    a
} from '@cycle/dom';
import { Sources, Sinks, Reducer, User } from '../interfaces';
import { HTTPSource } from '@cycle/http';

export interface State {
    users: User[];
}
export const defaultState: State = { users: [] };

export interface DOMIntent {
    speech$: Stream<null>;
    link$: Stream<null>;
    updateText$: Stream<string>;
    startup$: Stream<null>;
}

export interface HTTPIntent {
    populateUsers$: Stream<User[]>;
}

export function Rank({ DOM, HTTP, state }: Sources<State>): Sinks<State> {
    const { startup$ }: DOMIntent = intent(DOM);
    const { populateUsers$ }: HTTPIntent = intentHTTP(HTTP);

    return {
        DOM: view(state.stream),
        state: model(populateUsers$),
        HTTP: getUsers(startup$)
    };
}

function model(populateUsers$: Stream<User[]>): Stream<Reducer<State>> {
    const init$ = xs.of<Reducer<State>>(() => defaultState);

    const update$ = populateUsers$.map(users => {
        console.log(users);
        return (state: State) => ({
            ...state,
            users
        });
    });

    return xs.merge(init$, update$);
}

function view(state$: Stream<State>): Stream<VNode> {
    return state$.map(({ users }) =>
        div('.users', [
            h2('Users'),
            div(
                '.user-list',
                users.map((user, index) =>
                    !user
                        ? null
                        : div('.user' + index, [
                              h1('.user-name', user.name),
                              h4('.user-email', user.email),
                              a(
                                  '.user-website',
                                  { attrs: { href: user.website } },
                                  user.website
                              )
                          ])
                )
            )
        ])
    );
}

function intent(DOM: DOMSource): DOMIntent {
    const updateText$ = DOM.select('#text')
        .events('input')
        .map((ev: any) => ev.target.value);

    const speech$ = DOM.select('[data-action="speak"]')
        .events('click')
        .mapTo(null);

    const link$ = DOM.select('[data-action="navigate"]')
        .events('click')
        .mapTo(null);

    const startup$ = xs.of(null);

    return { updateText$, speech$, link$, startup$ };
}

function intentHTTP(HTTP: HTTPSource): HTTPIntent {
    const populateUsers$ = HTTP.select('users')
        .flatten()
        .map(res => res.body);
    console.log(populateUsers$);
    return { populateUsers$ };
}

function getUsers(startup$: Stream<null>): Stream<Partial<Request>> {
    return startup$.map(() => ({
        url: 'https://jsonplaceholder.typicode.com/users',
        category: 'users',
        method: 'GET'
    }));
}
