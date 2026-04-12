import { Text, Input, ASCIIFont } from "@opentui/core"

type TestInput = {
    placeholder: string;
    text: string;
};

type TestText = {
    text: string;
    colour: string;
};

type TestAscii = {
    text: string;
    font: string;
};

type BlankLine = string;

type TestData = {
    root: {
        text: TestText;
        blank: BlankLine;
        ascii: TestAscii;
        input: TestInput;
        [key: string]: TestText | TestInput | TestAscii | BlankLine;
    };
};

export function CreateTestScreen(renderer: any, testscreenId: any, state: string, json: TestData) {
    Object.keys(json.root).forEach((key) => {
        if (key.startsWith("text")) {
            const textObj = json.root[key] as TestText | undefined;
            if (!textObj) return;
            renderer.root.add(
            Text({
                content: textObj.text,
                fg: textObj.colour,
            }),
            )
        } else if (key.startsWith("input")) {
            const inputObj = json.root[key] as TestInput | undefined;
            if (!inputObj) return;
            renderer.root.add(
            Input({
                placeholder: inputObj.placeholder,
                value: inputObj.text
            })
            )
        } else if (key.startsWith("ascii")) {
            const asciiObj = json.root[key] as TestAscii | undefined;
            if (!asciiObj) return;
            renderer.root.add(
                ASCIIFont({
                    text: asciiObj.text,
                    font: asciiObj.font as any
                })
            )
        } else if (key.startsWith("blank")) {
            renderer.root.add(
                Text({
                    content: "          "
                })
            )
        }
    });

    return "test";
}