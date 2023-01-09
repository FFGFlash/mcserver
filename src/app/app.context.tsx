import { createContext, Dispatch, PropsWithChildren, useReducer } from 'react'

/** Enum containing all valid Actions that can be dispatched to the App Context */
export enum AppActions {
  SET_LOADING = 'SET_LOADING'
}

/** Type definition for all valid Actions that can be dispatched to the App Context */
export type AppAction =
  | { type: AppActions; payload: { status: number; message?: string } }
  | {
      type: AppActions.SET_LOADING
      payload: Exclude<AppActions, AppActions.SET_LOADING>
    }

/** Interface containing all the type definitions for the App Context */
export interface IAppContext {
  loading: { [actions: string]: boolean }
  status?: number
  message?: string
}

/** The Default State of App Context */
export const DefaultAppContext: IAppContext = {
  loading: {}
}

/**
 * React Reducer for App Context.
 * @param prevState - The previous state of App Context
 * @param action - The action to be performed to the App Context
 * @returns The new state of App Context
 */
export function AppReducer(
  prevState: IAppContext,
  action: AppAction
): IAppContext {
  const state = { ...prevState, status: undefined, message: undefined }

  if (typeof action.payload === 'object' && 'status' in action.payload)
    return {
      ...state,
      status: action.payload.status,
      message: action.payload.message
    }

  switch (action.type) {
    case AppActions.SET_LOADING:
      return {
        ...state,
        loading: { ...state.loading, [action.payload]: true }
      }
    default:
      throw new Error(
        `Unknown action type: ${(action as { type: string }).type}`
      )
  }
}

/** React Context Hook */
export const AppContext = createContext<
  IAppContext & { dispatch: Dispatch<AppAction> }
>({ ...DefaultAppContext, dispatch: () => undefined })

/** App Context Provider Component */
export function AppState({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(AppReducer, DefaultAppContext)
  return (
    <AppContext.Provider value={{ ...state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

export default AppContext
