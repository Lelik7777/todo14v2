import {TasksStateType} from '../App';
import {v1} from 'uuid';
import {addTodolistAC, AddTodolistActionType, RemoveTodolistActionType, setLists} from './todolists-reducer';
import {TaskPriorities, TaskStatuses, TaskType, todolistsAPI, UpdateTaskModelType} from '../api/todolists-api'
import {ThunkDispatch} from 'redux-thunk';
import {AppRootStateType} from './store';
import {log} from 'util';

export type RemoveTaskActionType = {
    type: 'REMOVE-TASK',
    todolistId: string
    taskId: string
}

export type AddTaskActionType = {
    type: 'ADD-TASK',
    todolistId: string
    title: string
}

export type ChangeTaskStatusActionType = {
    type: 'CHANGE-TASK-STATUS',
    todolistId: string
    taskId: string
    status: TaskStatuses
}

export type ChangeTaskTitleActionType = {
    type: 'CHANGE-TASK-TITLE',
    todolistId: string
    taskId: string
    title: string
}

type ActionsType = RemoveTaskActionType
    | ReturnType<typeof addTaskAC>
    | ChangeTaskStatusActionType
    | ChangeTaskTitleActionType
    | ReturnType<typeof addTodolistAC>
    | RemoveTodolistActionType
    | ReturnType<typeof setLists>
    | ReturnType<typeof setTasks>
const initialState: TasksStateType = {
    /*"todolistId1": [
        { id: "1", title: "CSS", status: TaskStatuses.New, todoListId: "todolistId1", description: '',
            startDate: '', deadline: '', addedDate: '', order: 0, priority: TaskPriorities.Low },
        { id: "2", title: "JS", status: TaskStatuses.Completed, todoListId: "todolistId1", description: '',
            startDate: '', deadline: '', addedDate: '', order: 0, priority: TaskPriorities.Low },
        { id: "3", title: "React", status: TaskStatuses.New, todoListId: "todolistId1", description: '',
            startDate: '', deadline: '', addedDate: '', order: 0, priority: TaskPriorities.Low }
    ],
    "todolistId2": [
        { id: "1", title: "bread", status: TaskStatuses.New, todoListId: "todolistId2", description: '',
            startDate: '', deadline: '', addedDate: '', order: 0, priority: TaskPriorities.Low },
        { id: "2", title: "milk", status: TaskStatuses.Completed, todoListId: "todolistId2", description: '',
            startDate: '', deadline: '', addedDate: '', order: 0, priority: TaskPriorities.Low },
        { id: "3", title: "tea", status: TaskStatuses.New, todoListId: "todolistId2", description: '',
            startDate: '', deadline: '', addedDate: '', order: 0, priority: TaskPriorities.Low }
    ]*/

}

export const tasksReducer = (state: TasksStateType = initialState, action: ActionsType): TasksStateType => {
    switch (action.type) {
        case 'SET_TASKS':
            return {...state, [action.idL]: action.tasks}
        case 'SET_LISTS':
            const copy = {...state};
            action.lists.forEach(x => copy[x.id] = []);
            return copy;
        case 'REMOVE-TASK':
            return {...state, [action.todolistId]: state[action.todolistId].filter(x => x.id !== action.taskId)}

        case 'ADD-TASK':
            return {...state, [action.task.todoListId]: [action.task, ...state[action.task.todoListId],]}
        case 'CHANGE-TASK-STATUS':
            return {
                ...state,
                [action.todolistId]: state[action.todolistId].map(x => x.id === action.taskId ? {
                    ...x,
                    status: action.status
                } : x)
            }
        case 'CHANGE-TASK-TITLE': {
            let todolistTasks = state[action.todolistId];
            // ???????????? ???????????? ??????????:
            let newTasksArray = todolistTasks
                .map(t => t.id === action.taskId ? {...t, title: action.title} : t);

            state[action.todolistId] = newTasksArray;
            return ({...state});
        }
        case 'ADD-TODOLIST': {
            return {
                ...state,
                [action.idL]: []
            }
        }
        case 'REMOVE-TODOLIST': {
            const {[action.id]: [], ...state1} = state;
            return state1;
        }
        default:
            return state;
    }
}
//action creators
export const setTasks = (idL: string, tasks: TaskType[]) => ({type: 'SET_TASKS', idL, tasks,} as const);
export const removeTaskAC = (taskId: string, todolistId: string): RemoveTaskActionType => {
    return {type: 'REMOVE-TASK', taskId: taskId, todolistId: todolistId}
}
export const addTaskAC = (task: TaskType) => ({type: 'ADD-TASK', task} as const);

export const changeTaskStatusAC = (taskId: string, status: TaskStatuses, todolistId: string): ChangeTaskStatusActionType => {
    return {type: 'CHANGE-TASK-STATUS', status, todolistId, taskId}
}
export const changeTaskTitleAC = (taskId: string, title: string, todolistId: string): ChangeTaskTitleActionType => {
    return {type: 'CHANGE-TASK-TITLE', title, todolistId, taskId}
}


//thunks
export const getTasks = (idL: string) =>
    async (dispatch: ThunkDispatch<AppRootStateType, {}, ActionsType>) => {
        const res = await todolistsAPI.getTasks(idL).catch(er => console.warn(er));
        res && dispatch(setTasks(idL, res.data.items));
    };

export const deleteTask = (idL: string, id: string) =>
    async (dispatch: ThunkDispatch<AppRootStateType, {}, ActionsType>) => {
        const res = await todolistsAPI.deleteTask(idL, id);
        res.data.resultCode === 0 && dispatch(removeTaskAC(id, idL));
    };
export const createTask = (idL: string, title: string) =>
    async (dispatch: ThunkDispatch<AppRootStateType, {}, ActionsType>) => {
        const res = await todolistsAPI.createTask(idL, title);
        res.data.resultCode === 0 && dispatch(addTaskAC(res.data.data.item));
    };

export const changeNameTask = (idL: string, id: string, title: string) =>
    async (dispatch: ThunkDispatch<AppRootStateType, {}, ActionsType>, getState: () => AppRootStateType) => {
        const task = getState().tasks[idL].find(x => x.id === id);
        if (task) {
            task.title = title;
            const res = await todolistsAPI.updateTask(idL, id, task);
            res.data.resultCode === 0 && dispatch(changeTaskTitleAC(id, res.data.data.item.title, idL));
        }
    };
export const changeStatusTask = (idL: string, id: string, status: TaskStatuses) =>
    async (dispatch: ThunkDispatch<AppRootStateType, {}, ActionsType>, getState: () => AppRootStateType) => {
        const task = getState().tasks[idL].find(x => x.id === id);
        if (task) {
            task.status = status;
            const res = await todolistsAPI.updateTask(idL, id, task);
            res.data.resultCode === 0 && dispatch(changeTaskStatusAC(id, res.data.data.item.status, idL));
        }
    };



