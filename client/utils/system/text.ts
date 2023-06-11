export enum TextAlignment {
    Left,
    Center,
    Right
}

export interface TextState {
    text : string;
    alignment : TextAlignment;
    fontSize : number;
}
