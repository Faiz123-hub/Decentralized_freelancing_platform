import { h } from "@stencil/core";
import "./resetStyles.css";
const widgetWrapperStyle = {
    fontFamily: '"Euclid Circular B", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
};
export const WidgetWrapper = ({ className, }, children) => {
    return (h("div", { style: widgetWrapperStyle, class: className }, children));
};
//# sourceMappingURL=widget-wrapper.js.map
