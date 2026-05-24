/**
 * AppContext.jsx
 * Global state management for the AI Agent for Data Scientists app.
 */
import { createContext, useContext, useReducer, useEffect } from 'react'
import { load as loadTheme, apply as applyTheme } from '../utils/themeManager.js'

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState = {
  dataset: null,
  cleaningSteps: [],
  selectedModel: null,
  trainingResults: null,
  theme: 'dark',
  accentColor: '#6366f1',
  notificationsEnabled: true,
}

// ─── Action Types ─────────────────────────────────────────────────────────────

export const ACTIONS = {
  SET_DATASET: 'SET_DATASET',
  ADD_CLEANING_STEP: 'ADD_CLEANING_STEP',
  CLEAR_CLEANING_STEPS: 'CLEAR_CLEANING_STEPS',
  SET_SELECTED_MODEL: 'SET_SELECTED_MODEL',
  SET_TRAINING_RESULTS: 'SET_TRAINING_RESULTS',
  SET_THEME: 'SET_THEME',
  SET_ACCENT_COLOR: 'SET_ACCENT_COLOR',
  SET_NOTIFICATIONS_ENABLED: 'SET_NOTIFICATIONS_ENABLED',
  RESET: 'RESET',
}

// ─── Reducer ──────────────────────────────────────────────────────────────────

function appReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_DATASET:
      return {
        ...state,
        dataset: action.payload,
        cleaningSteps: [], // Reset cleaning steps when new dataset is loaded
        selectedModel: null,
        trainingResults: null,
      }

    case ACTIONS.ADD_CLEANING_STEP:
      return {
        ...state,
        cleaningSteps: [...state.cleaningSteps, action.payload],
        dataset: action.dataset || state.dataset,
      }

    case ACTIONS.CLEAR_CLEANING_STEPS:
      return {
        ...state,
        cleaningSteps: [],
      }

    case ACTIONS.SET_SELECTED_MODEL:
      return {
        ...state,
        selectedModel: action.payload,
        trainingResults: null, // Reset training when model changes
      }

    case ACTIONS.SET_TRAINING_RESULTS:
      return {
        ...state,
        trainingResults: action.payload,
      }

    case ACTIONS.SET_THEME:
      return {
        ...state,
        theme: action.payload,
      }

    case ACTIONS.SET_ACCENT_COLOR:
      return {
        ...state,
        accentColor: action.payload,
      }

    case ACTIONS.SET_NOTIFICATIONS_ENABLED:
      return {
        ...state,
        notificationsEnabled: action.payload,
      }

    case ACTIONS.RESET:
      return initialState

    default:
      return state
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AppContext = createContext(null)

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  // Load theme from localStorage on mount
  useEffect(() => {
    const { theme, accentColor, notificationsEnabled } = loadTheme()
    dispatch({ type: ACTIONS.SET_THEME, payload: theme })
    dispatch({ type: ACTIONS.SET_ACCENT_COLOR, payload: accentColor })
    dispatch({ type: ACTIONS.SET_NOTIFICATIONS_ENABLED, payload: notificationsEnabled })
    applyTheme(theme, accentColor)
  }, [])

  // Apply theme whenever it changes
  useEffect(() => {
    applyTheme(state.theme, state.accentColor)
  }, [state.theme, state.accentColor])

  // ─── Action Creators ───────────────────────────────────────────────────────

  const setDataset = (dataset) => dispatch({ type: ACTIONS.SET_DATASET, payload: dataset })

  const addCleaningStep = (step, updatedDataset) =>
    dispatch({ type: ACTIONS.ADD_CLEANING_STEP, payload: step, dataset: updatedDataset })

  const clearCleaningSteps = () => dispatch({ type: ACTIONS.CLEAR_CLEANING_STEPS })

  const setSelectedModel = (model) => dispatch({ type: ACTIONS.SET_SELECTED_MODEL, payload: model })

  const setTrainingResults = (results) => dispatch({ type: ACTIONS.SET_TRAINING_RESULTS, payload: results })

  const setTheme = (theme) => dispatch({ type: ACTIONS.SET_THEME, payload: theme })

  const setAccentColor = (color) => dispatch({ type: ACTIONS.SET_ACCENT_COLOR, payload: color })

  const setNotificationsEnabled = (enabled) =>
    dispatch({ type: ACTIONS.SET_NOTIFICATIONS_ENABLED, payload: enabled })

  const reset = () => dispatch({ type: ACTIONS.RESET })

  const value = {
    ...state,
    setDataset,
    addCleaningStep,
    clearCleaningSteps,
    setSelectedModel,
    setTrainingResults,
    setTheme,
    setAccentColor,
    setNotificationsEnabled,
    reset,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAppContext() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider')
  }
  return context
}

export default AppContext
