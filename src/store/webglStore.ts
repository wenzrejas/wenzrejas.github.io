import { create } from 'zustand'

const IS_FAILURE_PREVIEW = import.meta.env.DEV && window.location.hash.includes('no-webgl')

const canCreateWebglContext = () => document.createElement('canvas').getContext('webgl2') !== null

interface WebglState {
  hasFailed: boolean
}

export const useWebglStore = create<WebglState>(() => ({
  hasFailed: IS_FAILURE_PREVIEW || !canCreateWebglContext(),
}))

export const reportWebglFailure = () => useWebglStore.setState({ hasFailed: true })
