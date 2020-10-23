export function characterSelectReducer(
  state: number[],
  action: { type: "add" | "remove" | "reset"; payload: number }
) {
  switch (action.type) {
    case "add":
      return [...state, action.payload];
    case "remove":
      return [
        ...state.slice(0, state.indexOf(action.payload)),
        ...state.slice(state.indexOf(action.payload) + 1),
      ];
    case "reset":
      return [];
    default:
      throw new Error();
  }
}
