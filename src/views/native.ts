import {
    Text,
    Input,
    ASCIIFont,
    type TextOptions,
    type InputRenderableOptions,
    type ASCIIFontOptions,
    type BoxRenderable,
    Box
} from "@opentui/core"

type InputComponent = {
    type: "input";
    children: object;
} & InputRenderableOptions;

type TextComponent = {
    type: "text";
    children: object;
} & TextOptions;

type AsciiComponent = {
    type: "ascii";
    children: object;
} & ASCIIFontOptions;

type SpacerComponent = {
    type: "spacer";
    children: object;
    size?: number;
};

type BoxComponent = {
    type: "box"
    children: object;
} & BoxRenderable

type Component = InputComponent | TextComponent | AsciiComponent | SpacerComponent | BoxComponent;

type ScreenData = {
    root: {
        components: Component[];
    };
};

function getChildComponents(component: Component): Component[] {
    return Array.isArray(component.children) ? (component.children as Component[]) : []
}

function checkAndMakeComponent(renderer: any, component: Component): any | null {
    if (component.type === "text") {
        return Text({
            content: component.content ?? "",
            fg: component.fg ?? "",
            bg: component.bg ?? "",
            attributes: component.attributes ?? 0,
        })
    } else if (component.type === "input") {
        return Input({
            placeholder: component.placeholder,
            value: component.value ?? "",
            width: component.width,
            maxLength: component.maxLength,
            backgroundColor: component.backgroundColor,
            focusedBackgroundColor: component.focusedBackgroundColor,
            textColor: component.textColor,
            focusedTextColor: component.focusedTextColor,
            placeholderColor: component.placeholderColor,
        })
    } else if (component.type === "ascii") {
        return ASCIIFont({
            text: component.text,
            font: component.font
        })
    } else if (component.type === "spacer") {
        return Text({
            content: "          ".repeat(component.size || 1)
        })
    } else if (component.type === "box") {
        const children: any[] = getChildComponents(component)
            .map((child) => checkAndMakeComponent(renderer, child))
            .filter(Boolean)

        return Box(
            {
                width: component.width,
                height: component.height,
                backgroundColor: component.backgroundColor,
                border: component.border,
                borderStyle: component.borderStyle,
                borderColor: component.borderColor,
                title: component.title,
                titleAlignment: component.titleAlignment,
                padding: component.padding ?? undefined,
                gap: component.gap,
                flexDirection: component.flexDirection ?? undefined,
                justifyContent: component.justifyContent ?? undefined,
                alignItems: component.alignItems ?? undefined,
            },
            ...children
        )
    }

    return null
}

export function CreateNativeScreen(renderer: any, testscreenId: any, _state: string, json: unknown) {
    const components = (json as ScreenData)?.root?.components ?? []

    if (testscreenId) {
        const createdComponents: any[] = components
            .map((component) => checkAndMakeComponent(renderer, component))
            .filter(Boolean)

        const screenRoot = Box(
            {
                id: testscreenId,
                width: "100%",
                height: "100%",
                flexDirection: "column",
            },
            ...createdComponents,
        )

        renderer.root.add(screenRoot)
        return "native"
    }

    components.forEach((component) => {
        const createdComponent = checkAndMakeComponent(renderer, component)
        if (createdComponent) {
            renderer.root.add(createdComponent)
        }
    });

    return "native";
}
