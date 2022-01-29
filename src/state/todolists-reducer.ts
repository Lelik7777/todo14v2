import {v1} from 'uuid';
import {todolistsAPI, TodolistType} from '../api/todolists-api'
import {ThunkDispatch} from 'redux-thunk';
import {AppRootStateType} from './store';

export type RemoveTodolistActionType = {
    type: 'REMOVE-TODOLIST',
    id: string
}
export type AddTodolistActionType = {
    type: 'ADD-TODOLIST',
    title: string
    todolistId: string
}
export type ChangeTodolistTitleActionType = {
    type: 'CHANGE-TODOLIST-TITLE',
    id: string
    title: string
}
export type ChangeTodolistFilterActionType = {
    type: 'CHANGE-TODOLIST-FILTER',
    id: string
    filter: FilterValuesType
}

type ActionsType = RemoveTodolistActionType
    | ReturnType<typeof addTodolistAC>
    | ChangeTodolistTitleActionType
    | ChangeTodolistFilterActionType
    | ReturnType<typeof setLists>

const initialState: Array<TodolistDomainType> = [
    /*{id: todolistId1, title: 'What to learn', filter: 'all', addedDate: '', order: 0},
    {id: todolistId2, title: 'What to buy', filter: 'all', addedDate: '', order: 0}*/
]

export type FilterValuesType = 'all' | 'active' | 'completed';
export type TodolistDomainType = TodolistType & {
    filter: FilterValuesType
}

export const todolistsReducer = (state: Array<TodolistDomainType> = initialState, action: ActionsType): Array<TodolistDomainType> => {
    switch (action.type) {
        case 'SET_LISTS':
            return action.lists.map(x => ({...x, filter: 'all'}));
        case 'REMOVE-TODOLIST': {
            return state.filter(tl => tl.id !== action.id)
        }
        case 'ADD-TODOLIST':
            return [{...action.list, filter: 'all'}, ...state]
        case 'CHANGE-TODOLIST-TITLE': {
            const todolist = state.find(tl => tl.id === action.id);
            if (todolist) {
                // если нашёлся - изменим ему заголовок
                todolist.title = action.title;
            }
            return [...state]
        }
        case 'CHANGE-TODOLIST-FILTER': {
            const todolist = state.find(tl => tl.id === action.id);
            if (todolist) {
                // если нашёлся - изменим ему заголовок
                todolist.filter = action.filter;
            }
            return [...state]
        }
        default:
            return state;
    }
}
export const setLists = (lists: TodolistType[]) => ({type: 'SET_LISTS', lists,} as const);

export const removeTodolistAC = (todolistId: string): RemoveTodolistActionType => ({
    type: 'REMOVE-TODOLIST',
    id: todolistId
} as const);

export const addTodolistAC = (list: TodolistType, idL: string) =>
    ({type: 'ADD-TODOLIST', list, idL} as const);
export const changeTodolistTitleAC = (id: string, title: string): ChangeTodolistTitleActionType => {
    return {type: 'CHANGE-TODOLIST-TITLE', id: id, title: title}as const;
};
export const changeTodolistFilterAC = (id: string, filter: FilterValuesType): ChangeTodolistFilterActionType => {
    return {type: 'CHANGE-TODOLIST-FILTER', id: id, filter: filter}
};


//thunks
export const getLists = () =>
    async (dispatch: ThunkDispatch<AppRootStateType, {}, ActionsType>) => {
        /* todolistsAPI.getTodolists().then(res => {
             console.log(res.data)
             dispatch(setLists(res.data))
         });*/
        const res = await todolistsAPI.getTodolists();
        dispatch(setLists(res.data));
    }
;
export const deleteList = (idL: string) =>
    async (dispatch: ThunkDispatch<AppRootStateType, {}, ActionsType>) => {
        const res = await todolistsAPI.deleteTodolist(idL);
        res.data.resultCode === 0 && dispatch(removeTodolistAC(idL));
    };
export const addList = (title: string) =>
    async (dispatch: ThunkDispatch<AppRootStateType, {}, ActionsType>) => {
        const res = await todolistsAPI.createTodolist(title);
        res.data.resultCode === 0 && dispatch(addTodolistAC(res.data.data.item, res.data.data.item.id))
    };

export const changeTitleList = (idL: string, title: string) =>
    async (dispatch: ThunkDispatch<AppRootStateType, {}, ActionsType>) => {
        const res = await todolistsAPI.updateTodolist(idL, title);
        res.data.resultCode === 0 && dispatch(changeTodolistTitleAC(idL, title));
    };
