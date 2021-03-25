import { Provider as CellProvider } from "./cellContext";
import { Provider as ProjectProvider } from "./projectContext";
import { Provider as RowProvider } from "./rowContext";
const _providers = [CellProvider, ProjectProvider, RowProvider];

const SheetContext = ({ children }) => {
    let _render = children;
    for (const Provider of _providers) {
        _render = <Provider>{_render}</Provider>;
    }
    return _render;
};

export default SheetContext;
