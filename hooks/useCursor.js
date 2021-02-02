import { useGlobalStateContext, useGlobalDispatchContext } from 'context/GlobalContext'

const useCursor = () => {
  const { cursorStyles } = useGlobalStateContext()
  const dispatch = useGlobalDispatchContext()
  
  const onCursor = (cursorType) => {
    cursorType = (cursorStyles.includes(cursorType) && cursorType) || false
    dispatch({ type: "CURSOR_TYPE", cursorType: cursorType })
  }

  return {
    onCursor
  }
}

export default useCursor
