import xs, { Stream } from 'xstream';

import { VNode, DOMSource, div, h2, h1, h4, a } from '@cycle/dom';
import { Sources, Sinks, Reducer, User } from '../interfaces';
import { HTTPSource } from '@cycle/http';

export interface State {
    users: User[];
}
export const defaultState: State = { users: [] };

export interface DOMIntent {
    startup$: Stream<any>;
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
    return state$.map(({ users }) => (
        <div id="users">
            <h2>Users</h2>
            <div id="user-list">
                {users.map((user, index) =>
                    !user ? null : (
                        <div id={'user' + index}>
                            <h1 id="user-name">{user.name}</h1>
                            <h4 id="user-email">{user.email}</h4>
                            <a
                                id="user-website"
                                href={'http://' + user.website}
                            >
                                {user.website}
                            </a>
                        </div>
                    )
                )}
            </div>
        </div>
    ));
}

function intent(DOM: DOMSource): DOMIntent {
    const startup$ = xs.of(null);

    return { startup$ };
}

function intentHTTP(HTTP: HTTPSource): HTTPIntent {
    const populateUsers$ = HTTP.select('users')
        .flatten()
        .map(res => res.body);

    return { populateUsers$ };
}

function getUsers(startup$: Stream<null>): Stream<Partial<Request>> {
    return startup$.map(() => ({
        url: 'https://jsonplaceholder.typicode.com/users',
        category: 'users',
        method: 'GET'
    }));
}
